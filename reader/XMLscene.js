function XMLscene() {
    CGFscene.call(this);
    this.primitives = {};
    this.transformations = {};
    this.components = {};
    this.cameras = [];
    this.textures = {};
    this.materials = {};
    this.cameraIndex = 0;

    this.PRIMITIVES = {
        RECTANGLE: "rectangle",
        TRIANGLE: "triangle",
        CYLINDER: "cylinder",
        SPHERE: "sphere",
        TORUS: "torus"
    };

    this.TRANSFORMATIONS = {
        ROTATE: "rotate",
        TRANSLATE: "translate",
        SCALE: "scale",
        REFERENCE: "transformationref"
    };
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function(lights) {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.axis = new CGFaxis(this, this.axisLength);
    this.enableTextures(true);
    //this.initCameras(details.cameras);
    //this.initLights(lights);
    //console.log(this.primitives);
};

XMLscene.prototype.initLights = function(info) {

};

XMLscene.prototype.initCameras = function(cameras) {

};

XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

XMLscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();

    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();

    // Draw axis

    this.setDefaultAppearance();

    //this.primitives["sas"].display();
    //this.primitives["sasphe"].display();

    // ---- END Background, camera and axis setup

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) {
        this.recursiveDisplay(this.root);
        this.axis.display();
        for (var j = 0; j < this.lights.length; j++) {
            this.lights[j].update();
        }
    }
};

XMLscene.prototype.recursiveDisplay = function(componentId) {
    var comp = this.components[componentId];

    this.pushMatrix();
    this.applyTransformations(comp.transformations);
    this.applyMaterialTexture(comp.materialsIndex, comp.materials, comp.textureID);

    var primitiveArray = comp.children.primitiveref;
    for (var i = 0; i < primitiveArray.length; i++) {
        this.primitives[primitiveArray[i]].display();
    }

    var componentArray = comp.children.componentref;
    for (var j = 0; j < componentArray.length; j++) {
        this.recursiveDisplay(componentArray[j]);
    }

    this.popMatrix();
};

XMLscene.prototype.applyTransformations = function(transformationsArray) {
    for (var i = 0; i < transformationsArray.length; i++) {
        var t = transformationsArray[i];
        switch (t.name) {
            case this.TRANSFORMATIONS.TRANSLATE:
                this.translate(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.SCALE:
                this.scale(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.ROTATE:
                this.rotate(t.angle * 2 * Math.PI / 360,
                    t.axis === "x" ? 1 : 0,
                    t.axis === "y" ? 1 : 0,
                    t.axis === "z" ? 1 : 0);
                break;
            case this.TRANSFORMATIONS.REFERENCE:
                this.applyTransformations(this.transformations[t.id]);
                break;
            default:
                break;
        }
    }
};

XMLscene.prototype.applyMaterialTexture = function(materialsIndex, materials, textureID) {
    var materialID = materials[materialsIndex];

    if (textureID === "none") {
        if (materialID !== "inherit") {
            var material = this.materials[materialID];
            material.apply();
        }
    } else if (textureID !== "inherit") {
        var texture = this.textures[textureID];
        texture.apply();
    }
};

XMLscene.prototype.switchPerspective = function() {
    this.cameraIndex++;
    if (this.cameraIndex === this.cameras.length) {
        this.cameraIndex = 0;
    }
    this.camera = this.cameras[this.cameraIndex];
};

XMLscene.prototype.incrementMaterials = function() {
    for (var comp in this.components) {
        var component = this.components[comp];

        component.materialIndex++;
        if (component.materialsIndex >= component.materials.length) {
            component.materialsIndex = 0;
        }
    }

}
