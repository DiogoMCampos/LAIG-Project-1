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

    this.reader.open("scenes/" + filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function() {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    try {
        var dsxInfo = new DSXParser(rootElement, this.reader);
        this.createScene(dsxInfo.scene);
        this.createCameras(dsxInfo.perspectives);
        this.createElements(dsxInfo.primitives);
        this.createTransformations(dsxInfo.transformations);
        this.createComponents(dsxInfo.components);
    } catch (err) {
        this.onXMLError(err);
        return;
    }

    this.loadedOk = true;

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};




MySceneGraph.prototype.createScene = function(sceneNode) {
    this.scene.root = this.reader.getString(sceneNode, "root");
    this.scene.axisLength = this.reader.getFloat(sceneNode, "axis_length");
};

MySceneGraph.prototype.createCameras = function(perspectives) {
    var cameras = [];
    for (var i = 0; i < perspectives.length; i++) {
        var p = perspectives[i];
        fromVector = vec3.fromValues(p.from.x, p.from.y, p.from.z);
        toVector = vec3.fromValues(p.to.x, p.to.y, p.to.z);

        var camera = new CGFcamera(p.angle, p.near, p.far, fromVector, toVector);

        cameras.push(camera);
    }
};

MySceneGraph.prototype.createElements = function(primitivesNodes) {
    for (var types in primitivesNodes) {
        var elementArray = primitivesNodes[types];
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

MySceneGraph.prototype.createTransformations = function(transformationNodes) {
    for (var i = 0; i < transformationNodes.length; i++) {
        var collections = transformationNodes[i];
        this.scene.transformations[collections.id] = [];

        for (var j = 0; j < collections.elements.length; j++) {
            var t = this.getTransformationAttributes(collections.elements[j]);
            this.scene.transformations[collections.id].push(t);
        }
    }
};

MySceneGraph.prototype.getTransformationAttributes = function(node) {
    var result = {};
    result.name = node.tagName;
    switch (node.tagName) {
        case this.scene.TRANSFORMATIONS.ROTATE:
            result.axis = this.reader.getString(node, "axis");
            result.angle = this.reader.getFloat(node, "angle");
            break;

        case this.scene.TRANSFORMATIONS.TRANSLATE:
        case this.scene.TRANSFORMATIONS.SCALE:
            result.x = this.reader.getFloat(node, "x");
            result.y = this.reader.getFloat(node, "y");
            result.z = this.reader.getFloat(node, "z");
            break;
    }
    return result;
};

MySceneGraph.prototype.createComponents = function(componentNodes) {

    for (var i = 0; i < componentNodes.length; i++) {
        var component = {};
        var id = componentNodes[i].id;
        var data = componentNodes[i].element;

        var transformation = data.getElementsByTagName("transformation");
        var texture = data.getElementsByTagName("texture");
        var material = data.getElementsByTagName("material");
        var children = data.getElementsByTagName("children");

        var transformationNodes = transformation[0].children;
        component.transformations = [];
        for (var j = 0; j < transformationNodes.length; j++) {
            var t = {};
            if(transformationNodes[j].tagName === this.scene.TRANSFORMATIONS.REFERENCE) {
                t.id = this.reader.getString(transformationNodes[j], "id");
                t.name = this.scene.TRANSFORMATIONS.REFERENCE;
            }
            else {
                t = this.getTransformationAttributes(transformationNodes[j]);
            }
            component.transformations.push(t);
        }

        component.material = [];
        for (var j = 0; j < material.length; j++) {
            var materialID = this.reader.getString(material[j], "id");
            component.material.push(materialID);
        }

        var textID = this.reader.getString(texture[0], "id");
        component.textureID = textID;

        var child = children[0].children;
        component.children = {
            "componentref" : [],
            "primitiveref" : []
        };

        for (var j = 0; j < child.length; j++) {
            var tag = child[j].tagName;
            var id = this.reader.getString(child[j], "id");
            component.children[tag].push(id);
        }

        this.scene.components[id] = component;
      }
};

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
