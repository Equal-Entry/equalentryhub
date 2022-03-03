import { paths } from "../systems/userinput/paths";
import { goToGivenObject, getMyself } from "../utils/accessbility";

AFRAME.registerComponent("description-media-button", {
  init() {
    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.targetEl = networkedEl;
    });

    this.onClick = () => {
      this.el.parentNode.emit("action_toggle_show_description", this.targetEl);
    };
  },

  tick: function() {
    const scene = this.el.sceneEl;
    const userinput = scene.systems.userinput;
    const toggleSpeechDesc = userinput.get(paths.actions.speechDesc);
    if (toggleSpeechDesc) {
      const interaction = AFRAME.scenes[0].systems.interaction;

      const hoveredEl = interaction.state.rightRemote.hovered || interaction.state.leftRemote.hovered;
      if (!!hoveredEl) {
        const name = hoveredEl.components["media-loader"].data.mediaName;
        const role = hoveredEl.components["media-loader"].data.role;
        var contentToSpeech = `${role} ${name}: `;
        try {
          const desc = JSON.parse(hoveredEl.components["media-loader"].data.description);
          for (let key in desc) {
            contentToSpeech = contentToSpeech + ` ${key}: ${desc[key]}.`;
          }
        } catch (e) {}
        responsiveVoice.speak(contentToSpeech);
      }
    }
    const toggleMoveToObj = userinput.get(paths.actions.moveToObj);
    if (toggleMoveToObj) {
      const interaction = AFRAME.scenes[0].systems.interaction;

      const hoveredEl = interaction.state.rightRemote.hovered || interaction.state.leftRemote.hovered;
      if (!!hoveredEl) {
        const characterController = getMyself().sceneEl.systems["hubs-systems"].characterController;
        console.log(hoveredEl.components["media-loader"]);
        goToGivenObject(scene, hoveredEl, characterController, !!hoveredEl.components["player-info"] ? 0.5 : 1.5);
      }
    }
  },

  play() {
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  pause() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  }
});
