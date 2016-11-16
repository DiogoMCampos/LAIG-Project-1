function XMLscene(inter) {
    CGFscene.call(this);
    this.primitives = {};
    this.transformations = {};
    this.components = {};
    this.cameras = [];
    this.textures = {};
    this.materials = {};
    this.cameraIndex = 0;
    this.interface = inter;
    this.selectedShader = 0;
    this.appearance = null;

    this.PRIMITIVES = {
        RECTANGLE: "rectangle",
        TRIANGLE: "triangle",
        CYLINDER: "cylinder",
        SPHERE: "sphere",
        TORUS: "torus",
        PLANE: "plane",
        PATCH: "patch",
        CHESSBOARD: "chessboard"
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

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.setUpdatePeriod(250);

    this.gl.clearDepth(10000.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

    this.axis = new CGFaxis(this, this.axisLength);
    this.enableTextures(true);
    this.interface.setActiveCamera(this.camera);
    this.interface.addScene(this);
    this.initShaders();
    this.setDefaultAppearance();
};

XMLscene.prototype.initShaders = function() {

    this.shaders=[
		// new CGFshader(this.gl, "shaders/flat.vert", "shaders/flat.frag"),
		// new CGFshader(this.gl, "shaders/uScale.vert", "shaders/uScale.frag"),
		new CGFshader(this.gl, "shaders/varying.vert", "shaders/varying.frag"),
		// new CGFshader(this.gl, "shaders/texture1.vert", "shaders/texture1.frag"),
		// new CGFshader(this.gl, "shaders/texture2.vert", "shaders/texture2.frag"),
		// new CGFshader(this.gl, "shaders/texture3.vert", "shaders/texture3.frag"),
		// new CGFshader(this.gl, "shaders/texture3.vert", "shaders/sepia.frag"),
		// new CGFshader(this.gl, "shaders/texture3.vert", "shaders/convolution.frag")
	];
    /*this.shade = new CGFshader(this.gl,  "../lib/CGF/shaders/picking/vertex.glsl",  "../lib/CGF/shaders/picking/fragment.glsl");
    /*this.shaders=[
        new CGFshader(this.gl, "../lib/CGF/shaders/Gouraud/textured/multiple_light-vertex.glsl",  "../lib/CGF/shaders/Gouraud/textured/Gouraud/textured/fragment.glsl"),
        new CGFshader(this.gl, "../lib/CGF/shaders/Gouraud/multiple_light-vertex.glsl", "../lib/CGF/shaders/Gouraud/fragment.glsl"),
        new CGFshader(this.gl, "../lib/CGF/shaders/Gouraud/lambert-vertex.glsl", "../lib/CGF/shaders/Gouraud/fragment.glsl"),
        new CGFshader(this.gl, "../lib/CGF/shaders/Phong/multiple_light-vertex.glsl", "../lib/CGF/shaders/Phong/multiple_light-phong-fragment.glsl"),
        new CGFshader(this.gl, "../lib/CGF/shaders/Phong/phong-vertex.glsl", "../lib/CGF/shaders/Phong/phong-fragment.glsl"),
        new CGFshader(this.gl,  "../lib/CGF/shaders/picking/vertex.glsl",  "../lib/CGF/shaders/picking/fragment.glsl")
    ];*/
};

XMLscene.prototype.initCameras = function(cameras) {

};

XMLscene.prototype.setDefaultAppearance = function() {
    this.appearance = new CGFappearance(this);
	this.appearance.setAmbient(0.3, 0.3, 0.3, 1);
	this.appearance.setDiffuse(0.7, 0.7, 0.7, 1);
	this.appearance.setSpecular(0.0, 0.0, 0.0, 1);
	this.appearance.setShininess(120);
};

XMLscene.prototype.display = function() {
    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    if (this.graph.loadedOk) {

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        for (var j = 0; j < this.lightsOn.length; j++) {
            if (!this.lightsOn[j]) {
                this.lights[j].enabled = false;
            } else {
                this.lights[j].enabled = true;
            }
            this.lights[j].update();
        }
        // Draw axis
        this.axis.display();


        // ---- END Background, camera and axis setup
        // this.setActiveShader(this.shaders[this.selectedShader]);
        var root = this.components[this.root];
        this.recursiveDisplay(this.root, root.materials[root.materialsIndex], root.textureID);
        // this.setActiveShader(this.defaultShader);
    }
};


/**
 *      Predecessor arguments are the last ID !==inherit
 */
XMLscene.prototype.recursiveDisplay = function(componentId, predecessorMatID, predecessorTextID) {
    var comp = this.components[componentId];
    var matId, texId;

    if (comp.textureID === "inherit") {
        texId = predecessorTextID;
    } else {
        texId = comp.textureID;
    }

    if (comp.materials[comp.materialsIndex] === "inherit") {
        matId = predecessorMatID;
    } else {
        matId = comp.materials[comp.materialsIndex];
    }

    this.pushMatrix();
    this.applyTransformations(comp.transformations);
    this.applyMaterialTexture(matId, texId);

    var primitiveArray = comp.children.primitiveref;
    for (var i = 0; i < primitiveArray.length; i++) {
        if (this.primitives[primitiveArray[i]].hasOwnProperty('data')){
            if (this.primitives[primitiveArray[i]].data.hasOwnProperty('su') &&
                    this.primitives[primitiveArray[i]].data.hasOwnProperty('sv')) {

                this.setChessboardShading(this.primitives[primitiveArray[i]].data);
                this.setActiveShader(this.shaders[this.selectedShader]);
                var a = this.shaders[this.selectedShader].getUniformsValues();
                console.log(a);
                this.primitives[primitiveArray[i]].display();
                this.setActiveShader(this.defaultShader);
            }
        } else{
            this.primitives[primitiveArray[i]].display();
        }
    }

    var componentArray = comp.children.componentref;
    for (var j = 0; j < componentArray.length; j++) {
        this.recursiveDisplay(componentArray[j], matId, texId);
    }

    this.popMatrix();
};

XMLscene.prototype.update = function(currTime) {

    /*for (var id in this.primitives) {
        if (this.primitives[id].hasOwnProperty('data')){
            if (this.primitives[id].data.hasOwnProperty('su') && this.primitives[id].data.hasOwnProperty('sv')) {
                this.primitives[id].data.su++;
                if(this.primitives[id].data.su >= this.primitives[id].data.du){
                    this.primitives[id].data.su = 0;
                    this.primitives[id].data.sv++;
                    if(this.primitives[id].data.sv >= this.primitives[id].data.dv){
                        this.primitives[id].data.sv = 0;
                    }
                }

            }
        }
    }*/
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
                console.warn("not recognized transformation tagName: " + t.name);
                break;
        }
    }
};

XMLscene.prototype.applyMaterialTexture = function(materialId, textureID) {
    var material = this.materials[materialId];
    if (textureID === "none") {
        material.setTexture(null);
    } else {
        material.setTexture(this.textures[textureID]);
        material.setTextureWrap(this.textures[textureID].lengthS, this.textures[textureID].lengthT);
    }
    material.apply();
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
        if (this.components.hasOwnProperty(comp)) {
            var component = this.components[comp];
            component.materialsIndex++;
            if (component.materialsIndex >= component.materials.length) {
                component.materialsIndex = 0;
            }
        }
    }
};

XMLscene.prototype.setChessboardShading = function(data){
    this.shaders[this.selectedShader].setUniformsValues({du: data.du});
    this.shaders[this.selectedShader].setUniformsValues({dv: data.dv});
    this.shaders[this.selectedShader].setUniformsValues({su: data.su});
    this.shaders[this.selectedShader].setUniformsValues({sv: data.sv});
    var color1 = vec4.fromValues(data.c1.r, data.c1.g, data.c1.b, data.c1.a);
    var color2 = vec4.fromValues(data.c2.r, data.c2.g, data.c2.b, data.c2.a);
    var colorS = vec4.fromValues(data.cs.r, data.cs.g, data.cs.b, data.cs.a);
    this.shaders[this.selectedShader].setUniformsValues({c1: color1});
    this.shaders[this.selectedShader].setUniformsValues({c2: color2});
    this.shaders[this.selectedShader].setUniformsValues({cs: colorS});
};
