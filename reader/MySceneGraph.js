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
        console.log("parsing?");
        this.createScene(dsxInfo.scene);
        this.createCameras(dsxInfo.perspectives);
        console.log("nixon");
        this.createIllumination(dsxInfo.illumination);
        var lights = this.createLights(dsxInfo.lights);
        console.log("all of the lights");
        this.createTextures(dsxInfo.textures);
        this.createMaterials(dsxInfo.materials);
        console.log("wood");
        this.createTransformations(dsxInfo.transformations);
        this.createElements(dsxInfo.primitives);
        console.log("primas");
        this.createComponents(dsxInfo.components);
    } catch (err) {
        this.onXMLError(err);
        return;
    }

    this.loadedOk = true;
    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded(lights);
};

MySceneGraph.prototype.createScene = function(scene) {

    //scene.root;
    this.scene.axisLength = scene.axisLength;
};

MySceneGraph.prototype.createIllumination = function(illuminationNode) {
    var illumination = {};
    illumination.doublesided = illuminationNode.doublesided;
    illumination.local = illuminationNode.local;

    var amb = this.getRGBA(illuminationNode.data, "ambient");
    var back = this.getRGBA(illuminationNode.data, "background");
    this.background = [];
    this.background.push(back.r, back.g, back.b, back.a)
    this.scene.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
};

MySceneGraph.prototype.createCameras = function(perspectives) {

    for (var i = 0; i < perspectives.length; i++) {
        var p = perspectives[i];

        var angle = p.angle;
        var near = p.near;
        var far = p.far;
        var f = this.getXYZ(p.from);
        var to = this.getXYZ(p.to);
        var fromVector = vec3.fromValues(f.x, f.y, f.z);
        var toVector = vec3.fromValues(to.x, to.y, to.z);

        var camera = new CGFcamera(angle, near, far, fromVector, toVector);
        this.scene.cameras.push(camera);
    }
    this.scene.camera = this.scene.cameras[0];
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
                            var definitions = this.getLightAttributes(lights[id]);
                            var locArray = lights[id].data.getElementsByTagName("location");
                            definitions.location = this.getXYZ(locArray[0]);
                            var tarArray = lights[id].data.getElementsByTagName("target");
                            definitions.direction = this.getXYZ(tarArray[0]);
                            definitions.direction.x -= definitions.location.x;
                            definitions.direction.y -= definitions.location.y;
                            definitions.direction.z -= definitions.location.z;
                            definitions.angle = lights[id].angle;
                            definitions.exponent = lights[id].exponent;
                            l.spot[definitions.id] = definitions;
                        }
                    }
                    break;
                case "omni":
                    for (var id in lights) {
                        if (lights.hasOwnProperty(id)) {
                            var definitions = this.getLightAttributes(lights[id]);
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

MySceneGraph.prototype.getLightAttributes = function(node) {
    var result = {};
    result.enabled = node.enabled;
    result.id = node.id;

    result.ambient = this.getRGBA(node.data, "ambient");
    result.diffuse = this.getRGBA(node.data, "diffuse");
    result.specular = this.getRGBA(node.data, "specular");
    return result;
};

MySceneGraph.prototype.createTextures = function(texturesArray) {
    for (var i = 0; i < texturesArray.length; i++) {
        var texture = texturesArray[i];
        var t = {};
        t.id = this.reader.getString(texture, "id");
        t.file = this.reader.getString(texture, "file");
        t.lengthS = this.reader.getFloat(texture, "length_s");
        t.lengthT = this.reader.getFloat(texture, "length_t");

        var tex = new CGFappearance(this.scene);
        tex.loadTexture(t.file);
        tex.setTextureWrap(t.lengthS, t.lengthT);
        this.scene.textures[t.id] = tex;
    }
};

MySceneGraph.prototype.createMaterials = function(materialsArray) {
    for (var i = 0; i < materialsArray.length; i++) {
        var mat = materialsArray[i];

        var shininess = mat.data.getElementsByTagName("shininess");
        var amb = this.getRGBA(mat.data, "ambient");
        var dif = this.getRGBA(mat.data, "diffuse");
        var spe = this.getRGBA(mat.data, "specular");
        var emi = this.getRGBA(mat.data, "emission");
        var shi = this.reader.getFloat(shininess[0], "value");

        var m = new CGFappearance(this.scene);
        m.setAmbient(amb.r, amb.g, amb.b, amb.a);
        m.setDiffuse(dif.r, dif.g, dif.b, dif.a);
        m.setSpecular(spe.r, spe.g, spe.b, spe.a);
        m.setEmission(emi.r, emi.g, emi.b, emi.a);
        m.setShininess(shi);
        this.scene.materials[mat.id] = m;
    }
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
                        var obj = new MyTorus(this.scene, elementArray[i], this.reader);
                        this.scene.primitives[obj.id] = obj;
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
    switch (node.tagName) {
        case this.scene.TRANSFORMATIONS.ROTATE:
            result.axis = this.reader.getString(node, "axis");
            result.angle = this.reader.getFloat(node, "angle");
            break;
        case this.scene.TRANSFORMATIONS.TRANSLATE:
            result = this.getXYZ(node);
            break;
        case this.scene.TRANSFORMATIONS.SCALE:
            result = this.getXYZ(node);
            break;
    }
    result.name = node.tagName;
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
                t.name = this.scene.TRANSFORMATIONS.REFERENCE;
                t.id = this.reader.getString(transformationNodes[j], "id");
            } else {
                t = this.getTransformationAttributes(transformationNodes[j]);
            }
            component.transformations.push(t);
        }

        component.materials = [];
        for (var j = 0; j < material.length; j++) {
            var materialID = this.reader.getString(material[j], "id");
            component.materials.push(materialID);
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
