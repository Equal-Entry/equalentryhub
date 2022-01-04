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
