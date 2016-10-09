function XMLscene() {
    CGFscene.call(this);
    this.primitives = {};
    this.transformations = {};
    this.components = {};

    this.PRIMITIVES = {
        RECTANGLE : "rectangle",
        TRIANGLE : "triangle",
        CYLINDER : "cylinder",
        SPHERE : "sphere",
        TORUS : "torus"
    };

    this.TRANSFORMATIONS = {
        ROTATE : "rotate",
        TRANSLATE : "translate",
        SCALE : "scale",
        REFERENCE : "transformationref"
    };
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.initCameras();

    this.initLights();

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.axis = new CGFaxis(this);

};

XMLscene.prototype.initLights = function() {

    this.lights[0].setPosition(2, 3, 3, 1);
    this.lights[0].setDiffuse(1.0, 1.0, 1.0, 1.0);
    this.lights[0].update();
};

XMLscene.prototype.initCameras = function() {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};

// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    //this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
    // this.lights[0].setVisible(true);
    // this.lights[0].enable();
    //console.log(this.components);
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
    this.axis.display();

    this.setDefaultAppearance();


    for(var comp in this.components){
        var value = this.components[comp];
        //console.log(value.transformations);
        for (var i = 0; i < value.children.primitiveref.length; i++) {
            var idArray = value.children.primitiveref;

            this.pushMatrix();
                this.applyTransformations(value.transformations);
                this.primitives[idArray[i]].display();
            this.popMatrix();
        }
    }



    // ---- END Background, camera and axis setup

    // it is important that things depending on the proper loading of the graph
    // only get executed after the graph has loaded correctly.
    // This is one possible way to do it
    if (this.graph.loadedOk) {
        this.lights[0].update();
    }
};

XMLscene.prototype.applyTransformations = function(transformationsArray){

    for (var i = 0; i < transformationsArray.length; i++) {
        var t = transformationsArray[i];
        //console.log(t);
        switch(t.name){
            case this.TRANSFORMATIONS.TRANSLATE:
                this.translate(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.SCALE:
                this.scale(t.x, t.y, t.z);
                break;
            case this.TRANSFORMATIONS.ROTATE:
                this.rotate(t.angle * 2*Math.PI / 360,
                            t.axis == 'x'? 1 : 0,
                            t.axis == 'y'? 1 : 0,
                            t.axis == 'z'? 1 : 0 );
                break;
            case this.TRANSFORMATIONS.REFERENCE:
                this.applyTransformations(this.transformations[t.id]);
                break;
            default :
                break;
        }
    }
};
