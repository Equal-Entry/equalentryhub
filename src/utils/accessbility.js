import React from "react";
import { affixToWorldUp } from "./three-utils";

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

export function findTargetMartix(targetMatrix, el) {
  const translation = new THREE.Matrix4();
  targetMatrix.copy(el.object3D.matrix);
  affixToWorldUp(targetMatrix, targetMatrix);
  translation.makeTranslation(0, -1.6, 0.5);
  targetMatrix.multiply(translation);
}

export function lookAtTarget(camera, offset, el) {
  const targetHead = new THREE.Vector3();
  el.object3D.getWorldPosition(targetHead);
  targetHead.setComponent(1, targetHead.y + offset);
  camera.lookAt(targetHead);
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

export function parseObjectDescription(object) {
  const info = new Array();
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
