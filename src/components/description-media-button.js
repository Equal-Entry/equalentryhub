import { paths } from "../systems/userinput/paths";

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
        var contentToSpeech = `The description for object ${name}: `;
        try {
          const desc = JSON.parse(hoveredEl.components["media-loader"].data.description);
          for (let key in desc) {
            contentToSpeech = contentToSpeech + ` ${key}: ${desc[key]}.`;
          }
        } catch (e) {
          contentToSpeech = contentToSpeech + ` no description.`;
        }
        responsiveVoice.speak(contentToSpeech);
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
