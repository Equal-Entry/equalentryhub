import "./utils/configs";
import { getAbsoluteHref } from "./utils/media-url-utils";
import { isValidSceneUrl } from "./utils/scene-url-utils";
import { spawnChatMessage } from "./react-components/chat-message";
import { SOUND_CHAT_MESSAGE, SOUND_QUACK, SOUND_SPECIAL_QUACK } from "./systems/sound-effects-system";
import ducky from "./assets/models/DuckyMesh.glb";
import { EventTarget } from "event-target-shim";
import { ExitReason } from "./react-components/room/ExitedRoomScreen";
import { LogMessageType } from "./react-components/room/ChatSidebar";
import {
  getAvatarFromName,
  getObjectByName,
  findTargetMartix,
  lookAtTarget,
  getMyself,
  parseObjectDescription
} from "./utils/accessbility";
import { SOUND_TELEPORT_END } from "./systems/sound-effects-system";
let uiRoot;
// Handles user-entered messages

const avatarMap = new Map();
var resultNearbyMap = new Map();
var closestObject;

export default class MessageDispatch extends EventTarget {
  constructor(scene, entryManager, hubChannel, remountUI, mediaSearchStore) {
    super();
    this.scene = scene;
    this.entryManager = entryManager;
    this.hubChannel = hubChannel;
    this.remountUI = remountUI;
    this.mediaSearchStore = mediaSearchStore;
    this.presenceLogEntries = [];
  }

  addToPresenceLog(entry) {
    entry.key = Date.now().toString();

    this.presenceLogEntries.push(entry);
    this.remountUI({ presenceLogEntries: this.presenceLogEntries });
    if (entry.type === "chat" && this.scene.is("loaded")) {
      this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_CHAT_MESSAGE);
    }

    // Fade out and then remove
    setTimeout(() => {
      entry.expired = true;
      this.remountUI({ presenceLogEntries: this.presenceLogEntries });

      setTimeout(() => {
        this.presenceLogEntries.splice(this.presenceLogEntries.indexOf(entry), 1);
        this.remountUI({ presenceLogEntries: this.presenceLogEntries });
      }, 5000);
    }, 20000);
  }

  receive(message) {
    this.addToPresenceLog(message);
    this.dispatchEvent(new CustomEvent("message", { detail: message }));
  }

  log = (messageType, props) => {
    this.receive({ type: "log", messageType, props });
  };

  dispatch = message => {
    if (message.startsWith("/")) {
      const commandParts = message.substring(1).split(/\s+/);
      this.dispatchCommand(commandParts[0], ...commandParts.slice(1));
      document.activeElement.blur(); // Commands should blur
    } else {
      this.hubChannel.sendMessage(message);
    }
  };

  formatArgs(args) {
    var fullName = "";
    for (var arg of args) fullName = fullName + ` ${arg}`;
    return fullName.trimStart();
  }

  dispatchCommand = async (command, ...args) => {
    const entered = this.scene.is("entered");
    uiRoot = uiRoot || document.getElementById("ui-root");
    const isGhost = !entered && uiRoot && uiRoot.firstChild && uiRoot.firstChild.classList.contains("isGhost");

    // TODO: Some of the commands below should be available without requiring room entry.
    if (!entered && (!isGhost || command === "duck")) {
      this.log(LogMessageType.roomEntryRequired);
      return;
    }

    const avatarRig = document.querySelector("#avatar-rig");
    const scales = [0.0625, 0.125, 0.25, 0.5, 1.0, 1.5, 3, 5, 7.5, 12.5];
    const curScale = avatarRig.object3D.scale;
    let err;
    let physicsSystem;
    const captureSystem = this.scene.systems["capture-system"];

    switch (command) {
      case "fly":
        if (this.scene.systems["hubs-systems"].characterController.fly) {
          this.scene.systems["hubs-systems"].characterController.enableFly(false);
          this.log(LogMessageType.flyModeDisabled);
        } else {
          if (this.scene.systems["hubs-systems"].characterController.enableFly(true)) {
            this.log(LogMessageType.flyModeEnabled);
          }
        }
        break;
      case "grow":
        for (let i = 0; i < scales.length; i++) {
          if (scales[i] > curScale.x) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }

        break;
      case "shrink":
        for (let i = scales.length - 1; i >= 0; i--) {
          if (curScale.x > scales[i]) {
            avatarRig.object3D.scale.set(scales[i], scales[i], scales[i]);
            avatarRig.object3D.matrixNeedsUpdate = true;
            break;
          }
        }

        break;
      case "leave":
        this.entryManager.exitScene();
        this.remountUI({ roomUnavailableReason: ExitReason.left });
        break;
      case "duck":
        spawnChatMessage(getAbsoluteHref(location.href, ducky));
        if (Math.random() < 0.01) {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPECIAL_QUACK);
        } else {
          this.scene.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_QUACK);
        }
        break;
      case "debug":
        physicsSystem = document.querySelector("a-scene").systems["hubs-systems"].physicsSystem;
        physicsSystem.setDebug(!physicsSystem.debugEnabled);
        break;
      case "vrstats":
        document.getElementById("stats").components["stats-plus"].toggleVRStats();
        break;
      case "scene":
        if (args[0]) {
          if (await isValidSceneUrl(args[0])) {
            err = this.hubChannel.updateScene(args[0]);
            if (err === "unauthorized") {
              this.log(LogMessageType.unauthorizedSceneChange);
            }
          } else {
            this.log(LogMessageType.inalidSceneUrl);
          }
        } else if (this.hubChannel.canOrWillIfCreator("update_hub")) {
          this.mediaSearchStore.sourceNavigateWithNoNav("scenes", "use");
        }

        break;
      case "rename":
        err = this.hubChannel.rename(args.join(" "));
        if (err === "unauthorized") {
          this.log(LogMessageType.unauthorizedRoomRename);
        }
        break;
      case "capture":
        if (!captureSystem.available()) {
          this.log(LogMessageType.captureUnavailable);
          break;
        }
        if (args[0] === "stop") {
          if (captureSystem.started()) {
            captureSystem.stop();
            this.log(LogMessageType.captureStopped);
          } else {
            this.log(LogMessageType.captureAlreadyStopped);
          }
        } else {
          if (captureSystem.started()) {
            this.log(LogMessageType.captureAlreadyRunning);
          } else {
            captureSystem.start();
            this.log(LogMessageType.captureStarted);
          }
        }
        break;
      case "audioNormalization":
        {
          if (args.length === 1) {
            const factor = Number(args[0]);
            if (!isNaN(factor)) {
              const effectiveFactor = Math.max(0.0, Math.min(255.0, factor));
              window.APP.store.update({
                preferences: { audioNormalization: effectiveFactor }
              });
              if (factor) {
                this.log(LogMessageType.setAudioNormalizationFactor, { factor: effectiveFactor });
              } else {
                this.log(LogMessageType.audioNormalizationDisabled);
              }
            } else {
              this.log(LogMessageType.audioNormalizationNaN);
            }
          } else {
            this.log(LogMessageType.invalidAudioNormalizationRange);
          }
        }
        break;
      case "move":
        {
          const myself_el = getMyself();

          if (args[0] == "a") {
            args.shift();
            const fullName = this.formatArgs(args);

            var el;
            for (let p of window.APP.componentRegistry["player-info"]) {
              if (fullName.toLowerCase() == p.displayName.toLowerCase()) {
                el = getAvatarFromName(p.displayName);
              }
            }

            if (el == null) {
              this.log(LogMessageType.moveFailed);
            } else if (
              el.components["player-info"].displayName.trim() == myself_el.components["player-info"].displayName.trim()
            ) {
              this.log(LogMessageType.moveToMyself);
            } else {
              var characterController = myself_el.sceneEl.systems["hubs-systems"].characterController;

              const targetMatrix = new THREE.Matrix4();
              findTargetMartix(targetMatrix, el);

              characterController.travelByWaypoint(targetMatrix, true, true);

              var camera = document.querySelector("#avatar-pov-node").object3D;
              lookAtTarget(camera, 1.6, el);
            }
          } else if (args[0] == "o") {
            args.shift();
            var targetObject;
            if (!isNaN(args[0])) {
              targetObject = this.scene.systems["listed-media"].els[parseInt(args[0]) - 1];
            } else {
              const fullName = this.formatArgs(args);
              targetObject = getObjectByName(this.scene, fullName);
            }

            if (targetObject == null) {
              this.log(LogMessageType.moveFailed);
            } else {
              var characterController = myself_el.sceneEl.systems["hubs-systems"].characterController;

              const targetMatrix = new THREE.Matrix4();
              findTargetMartix(targetMatrix, targetObject);

              characterController.travelByWaypoint(targetMatrix, true, true);

              var camera = document.querySelector("#avatar-pov-node").object3D;
              lookAtTarget(camera, 0, targetObject);
            }
          }

          characterController.enqueueInPlaceRotationAroundWorldUp(Math.PI);
          characterController.sfx.playSoundOneShot(SOUND_TELEPORT_END);

          this.log(LogMessageType.moveSucssful);
        }
        break;
      case "describe":
        {
          if (args.length != 0) {
            if (args[0] == "a") {
              //handle avatar description
              var info = "";
              args.shift();
              var fullName;
              if (!isNaN(args[0])) {
                fullName = avatarMap.get(args[0]);
              } else {
                fullName = this.formatArgs(args);
              }

              try {
                const avatarEl = getAvatarFromName(fullName);

                if (!!avatarEl) {
                  const info = avatarEl.components["player-info"].data.description;
                  this.receive({
                    type: "avatar_info",
                    avatar: fullName,
                    info: info ? info : "This avatar has no description."
                  });
                } else {
                  this.receive({
                    type: "avatar_info",
                    avatar: fullName,
                    info: info ? info : "No such avatar."
                  });
                }
              } catch (e) {
                this.log(LogMessageType.commandError);
              }
            } else if (args[0] == "o") {
              //handle object description
              args.shift();
              var targetObject;
              var fullName;
              if (!isNaN(args[0])) {
                targetObject = this.scene.systems["listed-media"].els[parseInt(args[0]) - 1];
                fullName = targetObject.components["media-loader"].data.mediaName;
              } else {
                targetObject = getObjectByName(this.scene, fullName);
                fullName = this.formatArgs(args);
              }
              this.receive({
                type: "object_info",
                object: fullName,
                info: parseObjectDescription(targetObject)
              });
            } else if (args[0] == "n") {
              //handle describe nearby objects
              if (!args[1]) {
                //if there is no input i.e. /descirbe n
                this.receive({
                  type: "object_info",
                  object: closestObject.components["media-loader"].data.mediaName,
                  info: parseObjectDescription(closestObject)
                });
              } else {
                //if there is input radius
                const targetObject = Array.from(resultNearbyMap.values())[Number(args[1]) - 1];
                this.receive({
                  type: "object_info",
                  object: targetObject.components["media-loader"].data.mediaName,
                  info: parseObjectDescription(targetObject)
                });
              }
            }
          } else {
            //no args stands for describe the room
            if (window.APP.hub.description == null) {
              this.log(LogMessageType.noRoomInfo);
            } else {
              this.log(LogMessageType.roomInfo, { info: window.APP.hub.description });
            }
          }
        }
        break;
      case "list":
        {
          var msg = new Array();
          var index = 1;
          if (args == "a") {
            avatarMap.clear();
            for (let a of document.querySelectorAll("[networked-avatar]")) {
              if (a.id !== "avatar-rig") {
                const name = document.querySelector("#" + a.id).components["player-info"].displayName.trim();
                avatarMap.set(index.toString(), name);
                msg.push(`${index} - ${name}`);
                index++;
              }
            }

            if (msg == "") {
              this.log(LogMessageType.noAvatars);
            } else {
              this.receive({
                type: "list_avatars",
                msg: msg
              });
            }
          } else if (args == "o") {
            const objects = this.scene.systems["listed-media"].els;

            for (let o of objects) {
              msg.push(`${index} - ${o.components["media-loader"].data.mediaName}`);
              index++;
            }

            if (msg == "") {
              this.log(LogMessageType.noObjects);
            } else {
              this.receive({
                type: "list_objects",
                msg: msg
              });
            }
          } else {
            this.log(LogMessageType.commandError);
          }
        }
        break;
      case "nearby":
        {
          const myself = getMyself();
          const myPosition = myself.object3D.position;

          const objects = this.scene.systems["listed-media"].els;

          if (!!args[0]) {
            const radius = args[0];
            resultNearbyMap.clear();

            for (let object of objects) {
              const currentDistance = object.object3D.position.distanceTo(myPosition);
              if (currentDistance < radius) {
                resultNearbyMap.set(Number.parseFloat(currentDistance).toFixed(2), object);
              }
            }
            //sort the map with distance from close to far
            var resultNearbyArray = Array.from(resultNearbyMap);
            resultNearbyArray.sort(function(a, b) {
              return a[0] - b[0];
            });
            resultNearbyMap = new Map(resultNearbyArray.map(i => [i[0], i[1]]));
            closestObject = [...resultNearbyMap][0];

            var result = new Array();
            var index = 1;
            resultNearbyMap.forEach((key, value) => {
              result.push(`${index} - ${key.components["media-loader"].data.mediaName} - ${value}m away`);
              index++;
            });

            this.receive({
              type: "list_nearby_objects",
              result: result
            });
          } else {
            closestObject = null;
            var closestObjectDistance = Number.MAX_VALUE;

            for (let object of objects) {
              const currentDistance = object.object3D.position.distanceTo(myPosition);
              if (currentDistance < closestObjectDistance) {
                closestObjectDistance = currentDistance;
                closestObject = object;
              }
            }
            var msg = "There is no object in this room";
            if (!!closestObject) {
              msg = `${closestObject.components["media-loader"].data.mediaName} - ${Number.parseFloat(
                closestObjectDistance
              ).toFixed(2)}m away`;
            }
            this.receive({
              type: "closest_object",
              msg: msg
            });
          }
        }
        break;
      case "a11y":
        {
        }
        break;
    }
  };
}
