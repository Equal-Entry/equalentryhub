let id = 0
let closeObjects = []

const setWireframeZone = (e, color) => {
  const target = e.currentTarget;
  let rgb
  if (color === 'black') rgb = {r: 0, g:0, b:0};
  if (color === '#00FF00') rgb = {r: 0, g:1, b:0};
  if (e.target.hasAttribute("gltf-model")) {
    const selectionBox = e.target;
    selectionBox.object3D.traverse(function (object3D) {
      const mat = object3D.material;
      if (mat) {
        // modify material here
        mat.color.setRGB(rgb.r, rgb.g, rgb.b);
        mat.transparent = true;
        mat.opacity = 0.12;
        mat.wireframe = true;
        // mat.side = THREE.BackSide
        // mat = 'color: green; opacity: .3; wireframe: true'
      }
    });
  } else {
    target.setAttribute(
      "material",
      `color: ${color}; shader: flat; wireframe: true; opacity: 0.12`
    );
  }
};

// Setting objects
AFRAME.registerComponent("object", {
  schema: {
    label: { type: "string", default: "item" },
    backLabel: { type: "string", default: "back" },
    labelZ: { type: "string", default: "1.5" },
    labelY: { type: "string", default: "0" },
    labelX: { type: "string", default: "0" },
    labelSize: { type: "int", default: 7 },
    weight: { type: "string", default: 'not specified' },
    dimensions: { type: "string", default: 'not specified' },
    price: { type: "string", default: 'not specified' },
    tabindex: { type: 'int', default: 0 }
  },
  init: function () {
    const data = this.data; // Component property values.
    const el = this.el; // Reference to the component's entity.
    
    this.ogPos = new THREE.Vector3();
    this.ogPos.copy(this.el.object3D.position);
    
    // Get world position to selectionBox
    this.localpos = new THREE.Vector3();
    this.worldpos = new THREE.Vector3();
    
    // setting targets
    this.setObject(el);
    this.id = id;

    this.farFromObj = true;
    
    // checking if it works---------------------------------------------------
    this.el.addEventListener("collisions", function(e) {
      sayText(e.target.getAttribute('id'))
    })
  
  },
  tick: function () {
    //finding world position of the object
    this.localpos.copy(this.el.object3D.position);
    this.el.object3D.getWorldPosition(this.worldpos);
    this.container.object3D.position.set(
      this.worldpos.x,
      this.worldpos.y,
      this.worldpos.z
    );
    
    // rotating selection zone with object
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );

    const vector = new THREE.Vector3( 1, 0, 0 );
    vector.applyQuaternion( quaternion );
    
    this.selectionZone.object3D.setRotationFromQuaternion(this.el.object3D.getWorldQuaternion(quaternion))
    
    
    //calculating angles to display label on user line of sight
    const cameraRig = document.querySelector("#cameraRig");
    const camera = document.querySelector("#camera");
    const camRot = camera.getAttribute("rotation");
    const camPos = camera.getAttribute('position');
    const rigRot = cameraRig.getAttribute("rotation");
    const rigPos = cameraRig.getAttribute('position');
    

    // distance between user and target component
    this.distance = Math.sqrt(
      Math.pow(this.el.object3D.position.x - rigPos.x, 2) +
        Math.pow(this.el.object3D.position.z - rigPos.z, 2)
    );

    const heightDiff = rigPos.y + camPos.y - this.el.object3D.position.y;
    const angleRad = Math.atan(heightDiff / this.distance);
    const angleDeg = (180 / Math.PI) * angleRad;
    

    // rotating container to user line of sight
    this.labelContainer.setAttribute(
      "rotation",
      `${-angleDeg} ${camRot.y + rigRot.y} 0`
    );
    
    //Arrow
    if (this.selectionZone.classList.contains('on-focus')) {
      const arrow = document.getElementById('arrow');
      // checking left/right from camera
      const horizontalDiff = rigPos.x - this.el.object3D.position.x;
      const arrowXRad = Math.atan(horizontalDiff/ this.distance);
      const arrowXDeg = (180 / Math.PI) * arrowXRad;
      const finalXAngle = arrowXDeg - camRot.y;
      
      // checking vertical angle
      const finalYAngle = angleDeg + camRot.x
     
      
      if (finalXAngle > 20) { arrow.setAttribute('rotation', `0 0 -90`) } //right
      if (finalXAngle < -20) { arrow.setAttribute('rotation', `0 0 90`) } //left
      if (finalYAngle > 20) { arrow.setAttribute('rotation', '0 0 0')} //up
      if (finalYAngle < -20) { arrow.setAttribute('rotation', '0 0 180')} //down
      if (finalXAngle > 20 && finalYAngle > 20) { arrow.setAttribute('rotation', `0 0 -45`) } //up-right
      if (finalXAngle > 20 && finalYAngle < -20) { arrow.setAttribute('rotation', `0 0 -135`) } //down-right
      if (finalXAngle < -20 && finalYAngle > 20) { arrow.setAttribute('rotation', `0 0 45`) } //up-left
      if (finalXAngle < -20 && finalYAngle < -20) { arrow.setAttribute('rotation', `0 0 135`) } //down-left
      
      if (finalXAngle < 20 && finalXAngle > -20 && finalYAngle < 20 && finalYAngle > -20) {
        arrow.setAttribute('visible', false)
        arrow.setAttribute('rotation', `0 0 0`)
      } else {
        arrow.setAttribute('visible', true)
      }
      // console.log(finalYAngle);
    }
    
    let width
    let height
    
    // displaying back label
    if (this.el.object3D.rotation.z < -2 && this.data.backLabel != 'back') {
      this.textlabel.setAttribute(
        "value",
        `${this.data.backLabel}`
      );
      if (this.data.backLabel.length > 50) {
        width =
      this.data.backLabel.length *
      0.03;
      height = this.data.backLabel.length * .01
      } else {
        width =
        this.data.label.length;
        height = this.data.backLabel.length * .01
      }
    } else if (this.data.label.length > 50) {
      this.textlabel.setAttribute(
        "value",
        `${this.data.label}`
      );
      width =
      this.data.label.length *
      0.025;
      height = this.data.label.length *.007
    } else {
      this.textlabel.setAttribute(
        "value",
        `${this.data.label}`
      );
      width =
      this.data.label.length * .15;
      height = .4
    }
    
    
    // this.textlabel.setAttribute("wrap-count", "15");

    // adjusting label width by content size
    
    this.panel.setAttribute(
      "geometry",
      `primitive:plane; height: ${height}; width: ${width};`
    );

    let minScale = this.distance;
    // define limit sizes to label
    if (this.distance < 1) minScale = 1 * (this.data.labelSize / 10);
    // if (distFactorNew < .4) {
    //   distFactorNew = .4
    // } else if (distFactorNew < .7) {
    //   distFactorNew = .7;
    // } else if (distFactorNew > 2) {
    //   distFactorNew = 2;
    // }

    // adjusting scale based on distance
    this.panel.setAttribute(
      "scale",
      `${(minScale * this.data.labelSize) / 50} ${
        (minScale * this.data.labelSize) / 50
      } ${(minScale * this.data.labelSize) / 50}`
    );

    //rotating panel to be perpendicular to user camera
    
    if (this.distance < 0.75) {
      this.panel.setAttribute("rotation", `${camRot.x + angleDeg} 0 0`);
      // this.panel.setAttribute("rotation", `${camRot.x + angleDeg - 30} 0 0`);
    } else {
      this.panel.setAttribute("rotation", `${camRot.x + angleDeg} 0 0`);
    }

    // console.log(Math.abs(this.data.labelZ) >= this.distance)
    // console.log(Math.abs(this.data.labelZ), this.distance)

    //checking if object is closed to user
    if (this.farFromObj && 1 >= this.distance) {
      // closeObjects.push(this.id);
      // closeObjects = closeObjects.sort((a, b) => a - b)
      // console.log(closeObjects)
      this.selectionZone.setAttribute("tabindex", `${this.data.tabindex}`);
      this.selectionZone.classList.add('close')
      this.selectionZone.classList.add('clickable')
      this.farFromObj = false;
    } 
    if (this.distance > 1 && !this.farFromObj) {
      this.farFromObj = true;
      // closeObjects = closeObjects.filter(function(item) {
      //   item !== this.id
      // })
      // console.log(closeObjects)
      this.selectionZone.removeAttribute("tabindex");
      this.selectionZone.classList.remove('close')
      this.selectionZone.classList.remove('clickable')   
    }

  },
  remove: function () {
    // removing EventListeners
    this.el.removeEventListener("mouseenter", this.hoverIn);
    this.el.removeEventListener("mouseleave", this.hoverOut);
    this.el.removeEventListener("focus", this.hoverIn);
    this.el.removeEventListener("blur", this.hoverOut);
    // this.el.removeEventListener("keyup", function (e) {
    //   if (e.key === "Enter") e.target.click();
    // });
  },
  // Setting selection box
  setObject: function (el) {
    const elAriaLabel = this.data.label;
    this.container = document.createElement("a-entity");
    this.labelContainer = document.createElement('a-entity');
    this.selectionZone = document.createElement("a-entity");
    document.querySelector("a-scene").appendChild(this.container);
    
    // setting attributes
    if (el.hasAttribute("geometry")) {
      const elGeometry = el.getAttribute("geometry");
      this.selectionZone.setAttribute("geometry", elGeometry);
    }
    
    this.selectionZone.setAttribute('scale', '1 1 1');
    this.selectionZone.setAttribute('visible', false);
    this.selectionZone.setAttribute('id', id);
    // this.selectionZone.setAttribute('collision-filter', "collisionForces: false")
    this.container.appendChild(this.selectionZone);
    
    // el.classList.add("clickable");
    // this.selectionZone.setAttribute("class", "clickable"); ===
    this.selectionZone.setAttribute("aria-label", elAriaLabel);
    el.setAttribute("id", `object-${id}`);
    el.addEventListener("collide", () => { this.selectionZone.focus() })


    this.selectionZone.addEventListener("mouseenter", this.hoverIn);
    this.selectionZone.addEventListener("mouseleave", this.hoverOut);
    this.selectionZone.addEventListener("focus", this.hoverIn);
    this.selectionZone.addEventListener("blur", this.hoverOut);

    //setting Labels
    //label
    this.panel = document.createElement("a-entity");
    const width = this.data.label.length * 0.3;
    this.panel.setAttribute(
      "geometry",
      `primitive:plane; height: .4; width: ${width};`
    );
    this.panel.setAttribute("material", "color:#222; shader:flat;");
    this.panel.setAttribute(
      "position",
      `${this.data.labelX} ${this.data.labelY} ${this.data.labelZ}`
    );
    this.panel.setAttribute("class", "selection-label");
    this.panel.setAttribute("visible", false);
    this.panel.setAttribute('id', `panel-${id}`)
    this.labelContainer.appendChild(this.panel);
    this.container.appendChild(this.labelContainer);
    // el.appendChild(this.panel);

    this.textlabel = document.createElement("a-text");
    this.textlabel.setAttribute("value", this.data.label);
    this.textlabel.setAttribute("align", "center");
    this.textlabel.setAttribute("color", "#eee");
    this.textlabel.setAttribute("position", "0 0 0.01");
    // this.textlabel.setAttribute("scale", "0.5 0.5 0.5");
    
    this.panel.appendChild(this.textlabel);
    
    //load model
    if (this.el.hasAttribute("gltf-model")) {
      const model = this.el.getAttribute("gltf-model");
      this.selectionZone.setAttribute("gltf-model", model);
      this.selectionZone.addEventListener("model-loaded", this.set3DModel);
    }
   
    console.log(`${this.data.label.split(' ')[0]} set`);
    id += 1
  },
  hoverIn: function (e) {
    const target = e.currentTarget;
    // console.log(e.currentTarget, target);
    const id = target.getAttribute('id')
    const object = document.querySelector(`#object-${id}`)
    const label = document.querySelector(`#panel-${id}`)
    label.setAttribute("visible", true);
    target.setAttribute('visible', true);
    const previousSelection = document.querySelector(".on-focus");
    if (previousSelection) previousSelection.classList.remove("on-focus");
    target.classList.add("on-focus");
    
    if (e.type === "focus") {
      setWireframeZone(e, "black");
    } else {
      setWireframeZone(e, "#00FF00");
    }
    
    target.setAttribute('scale', '1.7 1.7 1.7')
    
    const inSnd = new window.Howl({
        src: `https://cdn.glitch.com/f2d55546-c372-4b99-b28f-91c8f8a3e2ed%2Fsblip.mp3?v=1610420175408`,
        autoplay: true,
        loop: false,
        volume: 0.9,
        onend: function() {

        }
      });
    inSnd.play();
    
    const objectName = label.firstElementChild.getAttribute('value');
    sayText(objectName);
  },
  hoverOut: function (e) {
    const target = e.currentTarget;
    const index = target.getAttribute('id')
    const outSnd = new window.Howl({
      src: `https://cdn.glitch.com/f2d55546-c372-4b99-b28f-91c8f8a3e2ed%2Fsblop.mp3?v=1610420150327`,
      autoplay: true,
      loop: false,
      volume: 0.9,
    });
    target.classList.remove("on-focus");
    outSnd.play();
    const label = document.querySelector(`#panel-${index}`)
    label.setAttribute("visible", false);
    
    target.setAttribute('visible', false);
    target.setAttribute('scale', '1 1 1')
    // stop voice when hover out
    responsiveVoice.cancel();
    
    // reset position try
    // const ogPos = new THREE.Vector3();
    // ogPos.copy(e.currentTarget.object3D.position);
    // const currentPos = e.currentTarget.object3D.position
    //     if (Math.round(currentPos.y * 10) / 10 < (Math.round(ogPos.y * 10) / 10) + .2 || Math.round(currentPos.y * 10) / 10 < (Math.round(ogPos.y * 10) / 10) - .2 || currentPos.y < .2) {
    //       console.log('wrong position', Math.round(currentPos.y * 10) / 10, (Math.round(ogPos.y * 10) / 10) + .2 || Math.round(currentPos.y * 10) / 10)
    //       e.currentTarget.object3D.position.set(
    //         ogPos.x,
    //         ogPos.y,
    //         ogPos.z
    //       );   
    //     }
  },
  set3DModel: function (e) {
    console.log("setting 3d");
    
    let object = e.detail.model.children;
    e.detail.model.children = [object[0]];
    // console.log(object);
  }
});