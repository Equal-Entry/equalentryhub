export function getAvatarFromName(name) {
  for (let a of document.querySelectorAll("[networked-avatar]")) {
    var el = document.querySelector("#" + a.id);
    if (name.toLowerCase().trim() == el.components["player-info"].displayName.toLowerCase().trim()) return el;
  }
  return null;
}
