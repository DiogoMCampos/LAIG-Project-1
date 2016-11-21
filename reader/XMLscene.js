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
    this.appearance = null;

    this.PRIMITIVES = {
        RECTANGLE: "rectangle",
        TRIANGLE: "triangle",
        CYLINDER: "cylinder",
        SPHERE: "sphere",
        TORUS: "torus",
        PLANE: "plane",
        PATCH: "patch",
        CHESSBOARD: "chessboard",
        VEHICLE: "vehicle",
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

    this.gl.clearDepth(10000.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.beginTime = -1;
    this.setUpdatePeriod(30);
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

    this.shader = new CGFshader(this.gl, "shaders/varying.vert", "shaders/varying.frag");
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

XMLscene.prototype.update = function(currTime) {
    //For relative time to the first update
    if (this.graph.loadedOk) //updating only starts when the XML is parsed!!
    {
        if (this.beginTime === -1) {
            this.beginTime = currTime;
        } else {
            this.currTime = currTime - this.beginTime;
        }
    }

    for (var id in this.primitives) {
        if (this.primitives[id].hasOwnProperty("data")) {
            if (this.primitives[id].data.hasOwnProperty("su") && this.primitives[id].data.hasOwnProperty("sv")) {
                this.primitives[id].data.su++;
                if (this.primitives[id].data.su >= this.primitives[id].data.du) {
                    this.primitives[id].data.su = 0;
                    this.primitives[id].data.sv++;
                    if (this.primitives[id].data.sv >= this.primitives[id].data.dv) {
                        this.primitives[id].data.sv = 0;
                    }
                }

            }
        }
    }
};

XMLscene.prototype.display = function() {
    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    if (this.graph.loadedOk) {

        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        //this.gl.clearColor(0.1, 0.1, 0.1, 1.0);
        //this.gl.enable(this.gl.DEPTH_TEST);

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
    this.applyMaterialTexture(matId, texId);

    this.pushMatrix();
    this.multMatrix(comp.transformations);
    this.applyAnimations(comp.animations);

    var primitiveArray = comp.children.primitiveref;
    for (var i = 0; i < primitiveArray.length; i++) {
        if (this.primitives[primitiveArray[i]].hasOwnProperty("data") &&
            this.primitives[primitiveArray[i]].data.hasOwnProperty("su") &&
            this.primitives[primitiveArray[i]].data.hasOwnProperty("sv")) {

            this.applyMaterialTexture(matId, this.primitives[primitiveArray[i]].data.textureref);
            this.setChessboardShading(this.primitives[primitiveArray[i]].data);
            this.setActiveShader(this.shader);
            this.primitives[primitiveArray[i]].display();
            this.applyMaterialTexture(matId, texId);
            this.setActiveShader(this.defaultShader);
        } else {

            this.primitives[primitiveArray[i]].display();
        }
    }

    var componentArray = comp.children.componentref;
    for (var j = 0; j < componentArray.length; j++) {
        this.recursiveDisplay(componentArray[j], matId, texId);
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
                console.warn("not recognized transformation tagName: " + t.name);
                break;
        }
    }
};

XMLscene.prototype.applyAnimations = function(animationArray) {
    var matrix = mat4.create();

    for (var i = 0; i < animationArray.length; i++) {
        var animation = animationArray[i];
        var animMatrix = animation.getTransformationMatrix(this.currTime);

        mat4.multiply(matrix, matrix, animMatrix);

        if (!animation.finished) {
            break;
        }
    }

    this.multMatrix(matrix);
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

XMLscene.prototype.setChessboardShading = function(data) {
    this.shader.setUniformsValues({
        du: data.du
    });
    this.shader.setUniformsValues({
        dv: data.dv
    });
    this.shader.setUniformsValues({
        su: data.su
    });
    this.shader.setUniformsValues({
        sv: data.sv
    });
    var color1 = vec4.fromValues(data.c1.r, data.c1.g, data.c1.b, data.c1.a);
    var color2 = vec4.fromValues(data.c2.r, data.c2.g, data.c2.b, data.c2.a);
    var colorS = vec4.fromValues(data.cs.r, data.cs.g, data.cs.b, data.cs.a);
    this.shader.setUniformsValues({
        c1: color1
    });
    this.shader.setUniformsValues({
        c2: color2
    });
    this.shader.setUniformsValues({
        cs: colorS
    });
};
