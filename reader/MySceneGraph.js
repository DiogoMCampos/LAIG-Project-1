function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */

    this.reader.open('scenes/' + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function() {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    try {
        this.parseDSX(rootElement);
    } catch (err) {
        this.onXMLError(err);
        return;
    }
    this.createCameras(this.dsxInfo.perspectives);
    this.createElements();
    this.createTransformations();
    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};

MySceneGraph.prototype.parseDSX = function(rootElement) {
    this.dsxInfo = new DSXParser(rootElement, this.reader);
};

MySceneGraph.prototype.createCameras = function(perspectives) {
    var cameras = [];
    for (var i = 0; i < perspectives.length; i++) {
        var p = perspectives[i];
        fromVector = vec3.fromValues(p.from.x, p.from.y, p.from.z)
        toVector = vec3.fromValues(p.to.x, p.to.y, p.to.z)

        var camera = new CGFcamera(p.angle, p.near, p.far, fromVector, toVector);

        cameras.push(camera);
    }
}

MySceneGraph.prototype.createElements = function() {
    for (var types in this.dsxInfo.primitives) {
        var elementArray = this.dsxInfo.primitives[types];
        switch (types) {
            case this.scene.PRIMITIVES.RECTANGLE:
                for (var i = 0; i < elementArray.length; i++) {
                    var obj = new MyRectangle(this.scene, elementArray[i], this.reader);
                    this.scene.primitives[obj.id] = obj;
                }
                break;

            case this.scene.PRIMITIVES.TRIANGLE:
                for (var i = 0; i < elementArray.length; i++) {
                    var obj = new MyTriangle(this.scene, elementArray[i], this.reader);
                    this.scene.primitives[obj.id] = obj;
                }
                break;

            case this.scene.PRIMITIVES.CYLINDER:
                for (var i = 0; i < elementArray.length; i++) {
                    var obj = new MyCylinder(this.scene, elementArray[i], this.reader);
                    this.scene.primitives[obj.id] = obj;
                }
                break;

            case this.scene.PRIMITIVES.SPHERE:
                for (var i = 0; i < elementArray.length; i++) {
                    var obj = new MySphere(this.scene, elementArray[i], this.reader);
                    this.scene.primitives[obj.id] = obj;
                }
                break;

            case this.scene.PRIMITIVES.TORUS:
                for (var i = 0; i < elementArray.length; i++) {
                    //var obj = new MyTorus(this, elementArray[i], this.reader);
                    //this.scene.primitives[obj.id] = obj;
                }
                break;
            default:
                break;
        }
    }
};

MySceneGraph.prototype.createTransformations = function() {
    for (var i = 0; i < this.dsxInfo.transformations.length; i++) {
        var collections = this.dsxInfo.transformations[i];
        this.scene.transformations[collections.id] = [];

        for (var j = 0; j < collections.elements.length; j++) {
            var t = this.getTransformationAttributes(collections.elements[j]);
            this.scene.transformations[collections.id].push(t);
        }
    }
};

MySceneGraph.prototype.getTransformationAttributes = function(trans) {
    var result = {};
    result.name = trans.tagName;
    switch (trans.tagName) {
        case this.scene.TRANSFORMATIONS.ROTATE:
            result.axis = this.reader.getString(trans, "axis");
            result.angle = this.reader.getFloat(trans, "angle");
            break;

        case this.scene.TRANSFORMATIONS.TRANSLATE:
        case this.scene.TRANSFORMATIONS.SCALE:
            result.x = this.reader.getFloat(trans, "x");
            result.y = this.reader.getFloat(trans, "y");
            result.z = this.reader.getFloat(trans, "z");
            break;
    }
    return result;
};

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
