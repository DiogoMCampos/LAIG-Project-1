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
    var details = {};
    try {
        var dsxInfo = new DSXParser(rootElement, this.reader);
        details.scene = this.createScene(dsxInfo.scene);
        details.cameras = this.createCameras(dsxInfo.perspectives);
        details.illumination = this.createIllumination(dsxInfo.illumination);
        details.lights = this.createLights(dsxInfo.lights);
        details.textures = this.createTextures(dsxInfo.textures);
        details.materials = this.createMaterials(dsxInfo.materials);
        details.materials = this.createTransformations(dsxInfo.transformations);
        details.primitives = this.createElements(dsxInfo.primitives);
        details.components = this.createComponents(dsxInfo.components);
    } catch (err) {
        this.onXMLError(err);
        return;
    }

    this.loadedOk = true;
    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded(details);
};

MySceneGraph.prototype.createScene = function(scene) {
    var s = {};
    s.root = scene.root;
    s.axisLength = scene.axisLength;
    return s;
};

MySceneGraph.prototype.createIllumination = function(illuminationNode) {
    var illumination = {};
    illumination.doublesided = illuminationNode.doublesided;
    illumination.local = illuminationNode.local;

    illumination.ambient = this.getRGBA(illuminationNode.data, "ambient");
    illumination.background = this.getRGBA(illuminationNode.data, "background");
    this.background = illumination.background;
    return illumination;
};

MySceneGraph.prototype.createCameras = function(perspectives) {

    var cameras = [];
    for (var i = 0; i < perspectives.length; i++) {
        var obj = {};
        var p = perspectives[i];

        obj.angle = p.angle;
        obj.near = p.near;
        obj.far = p.far;

        ;
        obj.from = this.getXYZ(p.from);
        obj.to = this.getXYZ(p.to);

        //obj.fromVector = vec3.fromValues(f.x, f.y, f.z);
        //obj.toVector = vec3.fromValues(to.x, to.y, to.z);

        //var camera = new CGFcamera(p.angle, p.near, p.far, fromVector, toVector);
        cameras.push(obj);
    }
    return cameras;
};

MySceneGraph.prototype.createLights = function(lightNodes) {
    var l = {
        "omni": {},
        "spot": {}
    };

    for (var type in lightNodes) {
        if (lightNodes.hasOwnProperty(type)) {
            var lights = lightNodes[type];
            switch (type) {
                case "spot":
                    for (var id in lights) {
                        if (lights.hasOwnProperty(id)) {
                            var definitions = {};
                            this.getLightAttributes(lights[id], definitions);
                            var locArray = lights[id].data.getElementsByTagName("location");
                            definitions.location = this.getXYZ(locArray[0]);
                            var tarArray = lights[id].data.getElementsByTagName("target");
                            definitions.target = this.getXYZ(tarArray[0]);
                            definitions.angle = lights[id].angle;
                            definitions.exponent = lights[id].exponent;
                            l.spot[definitions.id] = definitions;
                        }
                    }
                    break;
                case "omni":
                    for (var id in lights) {
                        if (lights.hasOwnProperty(id)) {
                            var definitions = {};
                            this.getLightAttributes(lights[id], definitions);
                            var locArray = lights[id].data.getElementsByTagName("location");
                            definitions.location = this.getXYZ(locArray[0]);
                            definitions.location.w = this.reader.getFloat(locArray[0], "w");
                            l.omni[definitions.id] = definitions;
                        }
                    }
                    break;
            }
        }
    }
    return l;
};

MySceneGraph.prototype.getLightAttributes = function(node, definitions) {
    definitions.enabled = node.enabled;
    definitions.id = node.id;

    definitions.ambient = this.getRGBA(node.data, "ambient");
    definitions.diffuse = this.getRGBA(node.data, "diffuse");
    definitions.specular = this.getRGBA(node.data, "specular");
};

MySceneGraph.prototype.createTextures = function(texturesArray) {
    var textures = [];
    for (var i = 0; i < texturesArray.length; i++) {
        var texture = texturesArray[i];
        var t = {};
        t.id = this.reader.getString(texture, "id");
        t.file = this.reader.getString(texture, "file");
        t.lengthS = this.reader.getFloat(texture, "length_s");
        t.lengthT = this.reader.getFloat(texture, "length_t");
        textures.push(t);
    }
    return textures;
};

MySceneGraph.prototype.createMaterials = function(materialsArray) {
    var materials = {};
    for (var i = 0; i < materialsArray.length; i++) {
        var m = materialsArray[i];
        var mat = {};
        mat.id = m.id;
        var shininess = m.data.getElementsByTagName("shininess");

        mat.ambient = this.getRGBA(m.data, "ambient");
        mat.diffuse = this.getRGBA(m.data, "diffuse");
        mat.specular = this.getRGBA(m.data, "specular");
        mat.emission = this.getRGBA(m.data, "emission");
        mat.shininess = this.reader.getFloat(shininess[0], "value");
        materials[mat.id] = mat;
    }
    return materials;
};

MySceneGraph.prototype.createElements = function(primitivesNodes) {
    for (var types in primitivesNodes) {
        if (primitivesNodes.hasOwnProperty(types)) {
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
            result = this.getXYZ(node);
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
            if (transformationNodes[j].tagName === this.scene.TRANSFORMATIONS.REFERENCE) {
                t.id = this.reader.getString(transformationNodes[j], "id");
                t.name = this.scene.TRANSFORMATIONS.REFERENCE;
            } else {
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
            "componentref": [],
            "primitiveref": []
        };

        for (var j = 0; j < child.length; j++) {
            var tag = child[j].tagName;
            var primitiveID = this.reader.getString(child[j], "id");
            component.children[tag].push(primitiveID);
        }

        this.scene.components[id] = component;
    }
};

MySceneGraph.prototype.getXYZ = function(node) {
    var dest = {};
    dest.x = this.reader.getFloat(node, "x");
    dest.y = this.reader.getFloat(node, "y");
    dest.z = this.reader.getFloat(node, "z");
    return dest;
};

MySceneGraph.prototype.getRGBA = function(node, tag) {
    var dest = {};
    var array = node.getElementsByTagName(tag);
    dest.r = this.reader.getFloat(array[0], "r");
    dest.g = this.reader.getFloat(array[0], "g");
    dest.b = this.reader.getFloat(array[0], "b");
    dest.a = this.reader.getFloat(array[0], "a");
    return dest;
};

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
