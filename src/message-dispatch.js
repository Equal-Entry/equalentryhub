import "./utils/configs";
import { getAbsoluteHref } from "./utils/media-url-utils";
import { isValidSceneUrl } from "./utils/scene-url-utils";
import { spawnChatMessage } from "./react-components/chat-message";
import { SOUND_CHAT_MESSAGE, SOUND_QUACK, SOUND_SPECIAL_QUACK } from "./systems/sound-effects-system";
import ducky from "./assets/models/DuckyMesh.glb";
import { EventTarget } from "event-target-shim";
import { ExitReason } from "./react-components/room/ExitedRoomScreen";
import { LogMessageType } from "./react-components/room/ChatSidebar";
import { getAvatarFromName } from "./utils/accessbility";
import { SOUND_TELEPORT_END } from "./systems/sound-effects-system";

let uiRoot;
// Handles user-entered messages
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
          var myself_el;
          var el;
          for (let p of window.APP.componentRegistry["player-info"]) {
            if (p.el.id == "avatar-rig") {
              myself_el = getAvatarFromName(p.displayName);
            }
            if (String(args).toLowerCase() == p.displayName.toLowerCase()) {
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
            targetMatrix.copy(el.object3D.matrix);
            targetMatrix.multiply(
              new THREE.Matrix4()
                .makeRotationY(myself_el.object3D.position.angleTo(el.object3D.position))
                .makeTranslation(0, 0, 1)
            );

            characterController.travelByWaypoint(targetMatrix, true, true);

            var camera = document.querySelector("#avatar-pov-node").object3D;
            const targetHead = new THREE.Vector3();
            el.object3D.getWorldPosition(targetHead);
            targetHead.setComponent(1, targetHead.y + 1.6);
            camera.lookAt(targetHead);

            characterController.enqueueInPlaceRotationAroundWorldUp(Math.PI);
            characterController.sfx.playSoundOneShot(SOUND_TELEPORT_END);

            this.log(LogMessageType.moveSucssful);
          }
        }
        break;
      case "describe":
        {
          if (args.length != 0) {
            var fullName = "";
            for (var arg of args) fullName = fullName + ` ${arg}`;
            fullName = fullName.trimStart();

            var info = "";

            const avatarEl = getAvatarFromName(fullName);

            if (!!avatarEl) {
              this.log(LogMessageType.avatarInfo, {
                avatar: fullName,
                info: avatarEl.components["player-info"].data.description
              });
            } else {
              const objects = this.scene.systems["listed-media"].els;
              for (let o of objects) {
                if (o.object3D.name == fullName) {
                  const descJson = JSON.parse(o.components["media-loader"].data.description);
                  for (let key in descJson) info = info + `${key} : ${descJson[key]}; `;

                  this.log(LogMessageType.objectInfo, { object: fullName, info: info });
                }
              }
            }
          } else {
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
          var msg = "";
          var index = 1;
          if (args == "avatars") {
            for (let a of document.querySelectorAll("[networked-avatar]")) {
              if (a.id !== "avatar-rig") {
                msg =
                  msg +
                  ` [ ${index} - ${document.querySelector("#" + a.id).components["player-info"].displayName.trim()}] `;
                index++;
              }
            }

            if (msg == "") {
              this.log(LogMessageType.noAvatars);
            } else {
              this.log(LogMessageType.listAvatars, { msg: msg });
            }
          } else if (args == "objects") {
            const objects = this.scene.systems["listed-media"].els;
            for (let o of objects) {
              msg = msg + ` [ ${index} - ${o.components["media-loader"].data.mediaName}] `;
              index++;
            }

            if (msg == "") {
              this.log(LogMessageType.noObjects);
            } else {
              this.log(LogMessageType.listObjects, { msg: msg });
            }
          }
        }
        break;
    }
  };
}
