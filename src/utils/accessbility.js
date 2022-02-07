import React from "react";
import { affixToWorldUp, rotateInPlaceAroundWorldUp } from "./three-utils";
import { FormattedMessage } from "react-intl";
import { SOUND_TELEPORT_END } from "./../systems/sound-effects-system";

export function getAvatarFromName(name) {
  for (let a of document.querySelectorAll("[networked-avatar]")) {
    var el = document.querySelector("#" + a.id);
    if (name.toLowerCase().trim() == el.components["player-info"].displayName.toLowerCase().trim()) return el;
  }
  return null;
}

export function getObjectByName(scene, name) {
  const objects = scene.systems["listed-media"].els;
  for (let o of objects) {
    if (o.components["media-loader"].data.mediaName.toLowerCase() == name.toLowerCase()) {
      return o;
    }
  }
  return null;
}

export function getMyself() {
  for (let p of window.APP.componentRegistry["player-info"]) {
    if (p.el.id == "avatar-rig") {
      return getAvatarFromName(p.displayName);
    }
  }
  return null;
}

export function goToGivenObject(scene, targetObject, characterController, offset) {
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;

  cameraSystem.inspect(targetObject, offset, false);

  const viewingCamera = document.getElementById("viewing-camera");
  const targetMatrix = new THREE.Matrix4();
  const translation = new THREE.Matrix4();
  viewingCamera.object3DMap.camera.updateMatrices();
  targetMatrix.copy(viewingCamera.object3DMap.camera.matrixWorld);
  affixToWorldUp(targetMatrix, targetMatrix);
  translation.makeTranslation(0, -1.6, 0.15);
  targetMatrix.multiply(translation);
  rotateInPlaceAroundWorldUp(targetMatrix, Math.PI, targetMatrix);

  characterController.enqueueWaypointTravelTo(targetMatrix, true, {
    willDisableMotion: false,
    willDisableTeleporting: false,
    snapToNavMesh: false,
    willMaintainInitialOrientation: false
  });

  cameraSystem.uninspect();
  characterController.sfx.playSoundOneShot(SOUND_TELEPORT_END);
}

export function a11yCommandListMsg() {
  let messageContainer = [];
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.move-command-desc"
        defaultMessage="/move - move to specific avatar or object"
      />
      <br />
    </b>
  );
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.describe-command-desc"
        defaultMessage="/describe - describe media object, avatar or room information"
      />
      <br />
    </b>
  );
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.list-command-desc"
        defaultMessage="/list - list media objects or avatars in this room"
      />
      <br />
    </b>
  );
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.nearby-command-desc"
        defaultMessage="/nearby - list nearby media object from user avatar's current location"
      />
      <br />
    </b>
  );
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.pov-command-desc"
        defaultMessage="/fov - list media objects in user avatar's current field of view"
      />
      <br />
    </b>
  );
  messageContainer.push(
    <b>
      <FormattedMessage
        id="chat-sidebar.system-message.view-command-desc"
        defaultMessage="/view - check whether a given media object is in in user avatar's current field of view"
      />
      <br />
    </b>
  );
  return messageContainer;
}

export function formatListMsg(msgArray) {
  if (msgArray.length == 0) return "There is no object in this room or no matching object";
  let messageContainer = [];
  msgArray.forEach((value, index) => {
    messageContainer.push(
      <b>
        {value}
        <br />
      </b>
    );
  });
  return messageContainer;
}

export function parseDescription(object) {
  const info = new Array();
  if (!!object.components["player-info"]) {
    info.push(object.components["player-info"].data.description);
    return info;
  }

  try {
    const descJson = JSON.parse(object.components["media-loader"].data.description);
    for (let key in descJson) info.push(`${key} : ${descJson[key]}`);
  } catch (e) {
    info.push("No such object or no info.");
  }
  return info;
}

export function setupCameraFrustum() {
  const camera = document.getElementById("viewing-camera").components.camera.camera;
  var frustum = new THREE.Frustum();
  frustum.setFromProjectionMatrix(
    new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  );
  return frustum;
}
