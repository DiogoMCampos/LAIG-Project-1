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
        this.createScene(dsxInfo.scene, dsxInfo.components);
        this.createCameras(dsxInfo.views);
        this.createIllumination(dsxInfo.illumination);
        this.createLights(dsxInfo.lights);
        this.createTextures(dsxInfo.textures);
        this.createMaterials(dsxInfo.materials);
        this.createTransformations(dsxInfo.transformations);
        this.createElements(dsxInfo.primitives);
        this.createComponents(dsxInfo.components);
    } catch (err) {
        this.onXMLError(err);
        return;
    }

    this.loadedOk = true;
    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
};

MySceneGraph.prototype.createScene = function(scene, components) {
    if (!components.hasOwnProperty(scene.root)) {
        throw "The specified root is not a valid component."
    }

    this.scene.root = scene.root;
    this.scene.axisLength = scene.axisLength;
};

MySceneGraph.prototype.createIllumination = function(illuminationNode) {
    var doublesided = illuminationNode.doublesided;
    var local = illuminationNode.local;

    var amb = this.getRGBA(illuminationNode.data, "ambient");
    var back = this.getRGBA(illuminationNode.data, "background");
    this.background = [];
    this.background.push(back.r, back.g, back.b, back.a);
    this.scene.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
};

MySceneGraph.prototype.createCameras = function(views) {
    var perspectives = views.perspectives;
    for (var id in perspectives) {
        if (perspectives.hasOwnProperty(id)) {
            var p = perspectives[id];

            var f = this.getXYZ(p.from, id);
            var to = this.getXYZ(p.to, id);
            var fromVector = vec3.fromValues(f.x, f.y, f.z);
            var toVector = vec3.fromValues(to.x, to.y, to.z);

            var camera = new CGFcamera(p.angle * 2 * Math.PI / 360, p.near, p.far, fromVector, toVector);
            camera.id = id;

            this.scene.cameras.push(camera);
            if (views.defaultView == id) {
                this.scene.camera = camera;
                this.scene.cameraIndex = this.scene.cameras.length - 1;
            }
        }
    }
};

MySceneGraph.prototype.createLights = function(lightNodes) {
    var lightsIndex = 0;
    this.scene.lightsOn = [];
    this.scene.lightsInfo = [];

    for (var id in lightNodes) {
        if (lightNodes.hasOwnProperty(id)) {
            var light = lightNodes[id];
            var l = this.scene.lights[lightsIndex];
            var def = this.getLightAttributes(light);
            var locArray = light.data.getElementsByTagName("location");
            def.location = this.getXYZ(locArray[0], id);

            l.setAmbient(def.ambient.r, def.ambient.g, def.ambient.b, def.ambient.a);
            l.setDiffuse(def.diffuse.r, def.diffuse.g, def.diffuse.b, def.diffuse.a);
            l.setSpecular(def.specular.r, def.specular.g, def.specular.b, def.specular.a);

            if (def.enabled) {
                l.enable();
            }
            l.setVisible(true);

            switch (light.type) {
                case "spot":
                    var tarArray = light.data.getElementsByTagName("target");
                    if (tarArray.length !== 1) {
                        throw ("Spot light " + id + " has zero or more than one targets.");
                    }

                    var direction = this.getXYZ(tarArray[0], id);
                    direction.x -= def.location.x;
                    direction.y -= def.location.y;
                    direction.z -= def.location.z;

                    l.setPosition(def.location.x, def.location.y, def.location.z);
                    l.setSpotDirection(direction.x, direction.y, direction.z);
                    l.setSpotCutOff(light.angle * 2 * Math.PI / 360);
                    l.setSpotExponent(light.exponent);
                    break;
                case "omni":
                    def.location.w = this.reader.getFloat(locArray[0], "w");
                    if (!def.location.w && def.location.w !== 0) {
                        def.location.w = 1;
                        console.warn("Omni light " + id + " doesn't have a valid w value. Assigning default value 1.");
                    }
                    l.setPosition(def.location.x, def.location.y, def.location.z, def.location.w);
                    break;
            }

            lightsIndex++;
            this.scene.lightsOn.push(def.enabled);
            this.scene.lightsInfo.push({
                'id': def.id,
                'type': light.type
            });
        }
    }
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

MySceneGraph.prototype.createTextures = function(textures) {
    for (var id in textures) {
        if (textures.hasOwnProperty(id)) {
            var t = textures[id];

            var tex = new CGFtexture(this.scene, t.file);
            tex.lengthS = t.lengthS;
            tex.lengthT = t.lengthT;
            this.scene.textures[t.id] = tex;
        }
    }
};

MySceneGraph.prototype.createMaterials = function(materialsArray) {
    for (var id in materialsArray) {
        if (materialsArray.hasOwnProperty(id)) {
            var mat = materialsArray[id];
            var shininess = mat.data.getElementsByTagName("shininess");
            if (shininess.length !== 1) {
                console.warn("Material " + id + " has zero or more than one shininess elements. Assigning default value 1.");
                var shi = 1;
            } else {
                var shi = this.reader.getFloat(shininess[0], "value");
                if (!shi && shi !== 0) {
                    console.warn("Material " + id + " doesn't have a valid shininess value. Assigning default value 1.");
                    shi = 1;
                }
            }

            var amb = this.getRGBA(mat.data, "ambient");
            var dif = this.getRGBA(mat.data, "diffuse");
            var spe = this.getRGBA(mat.data, "specular");
            var emi = this.getRGBA(mat.data, "emission");

            var m = new CGFappearance(this.scene);
            m.setAmbient(amb.r, amb.g, amb.b, amb.a);
            m.setDiffuse(dif.r, dif.g, dif.b, dif.a);
            m.setSpecular(spe.r, spe.g, spe.b, spe.a);
            m.setEmission(emi.r, emi.g, emi.b, emi.a);
            m.setShininess(shi);
            this.scene.materials[mat.id] = m;
        }
    }
};

MySceneGraph.prototype.createTransformations = function(transformationNodes) {
    for (var id in transformationNodes) {
        if (transformationNodes.hasOwnProperty(id)) {
            var collections = transformationNodes[id];
            this.scene.transformations[collections.id] = [];
            for (var j = 0; j < collections.data.length; j++) {
                var t = this.getTransformationAttributes(collections.data[j], id);
                this.scene.transformations[collections.id].push(t);
            }
        }
    }
};

MySceneGraph.prototype.getTransformationAttributes = function(node, id) {
    var result = {};
    switch (node.tagName) {
        case this.scene.TRANSFORMATIONS.ROTATE:
            result.axis = this.reader.getString(node, "axis");
            if (!axis || !(axis === "x" || axis === "y" || axis ==="z")) {
                throw "Invalid rotation axis. Pick one of {x, y, z}";
            }

            result.angle = this.reader.getFloat(node, "angle");
            if (!angle && angle !== 0) {
                throw "Invalid rotation angle";
            }
            break;
        case this.scene.TRANSFORMATIONS.TRANSLATE:
            result = this.getXYZ(node, id);
            break;
        case this.scene.TRANSFORMATIONS.SCALE:
            result = this.getXYZ(node, id);
            break;
    }
    result.name = node.tagName;
    return result;
};

MySceneGraph.prototype.createElements = function(primitivesNodes) {
    for (var id in primitivesNodes) {
        if (primitivesNodes.hasOwnProperty(id)) {
            var p = primitivesNodes[id];
            var obj;
            switch (p.type) {
                case this.scene.PRIMITIVES.RECTANGLE:
                    obj = new MyRectangle(this.scene, p, this.reader);
                    break;

                case this.scene.PRIMITIVES.TRIANGLE:
                    obj = new MyTriangle(this.scene, p, this.reader);
                    break;

                case this.scene.PRIMITIVES.CYLINDER:
                    obj = new MyCylinder(this.scene, p, this.reader);
                    break;

                case this.scene.PRIMITIVES.SPHERE:
                    obj = new MySphere(this.scene, p, this.reader);
                    break;

                case this.scene.PRIMITIVES.TORUS:
                    obj = new MyTorus(this.scene, p, this.reader);
                    break;
                default:
                    console.warn("tagName " + p.type + " is not recognized");
                    continue;
            }
            this.scene.primitives[obj.id] = obj;
        }
    }
};

MySceneGraph.prototype.createComponents = function(componentNodes) {
    for (var id in componentNodes) {
        if (componentNodes.hasOwnProperty(id)) {
            var component = {};
            var data = componentNodes[id].data;

            var transformation = data.getElementsByTagName("transformation");
            if (transformation.length !== 1) {
                throw "Component " + id + " has zero or more than one transformation groups";
            }

            var transformationNodes = transformation[0].children;
            component.transformations = [];
            for (var j = 0; j < transformationNodes.length; j++) {

                var t = {};
                if (transformationNodes[j].tagName === this.scene.TRANSFORMATIONS.REFERENCE) {
                    t.name = this.scene.TRANSFORMATIONS.REFERENCE;
                    t.id = this.reader.getString(transformationNodes[j], "id");
                    if (!this.scene.transformations.hasOwnProperty(t.id)) {
                        throw ("transformations id: " + t.id + " used in componentref id: " + id + " is not recognized");
                    }
                } else {
                    t = this.getTransformationAttributes(transformationNodes[j]);
                }
                component.transformations.push(t);
            }

            this.setComponentAppearance(component, data);

            var children = data.getElementsByTagName("children");
            if (children.length !== 1) {
                throw "Component " + id + " has zero or more than one children groups";
            }

            var child = children[0].children;
            component.children = {
                "componentref": [],
                "primitiveref": []
            };

            for (var ind = 0; ind < child.length; ind++) {
                var tag = child[ind].tagName;
                var primitiveID = this.reader.getString(child[ind], "id");
                component.children[tag].push(primitiveID);
            }

            this.scene.components[id] = component;
        }
    }
    this.checkChildren();
};

MySceneGraph.prototype.setComponentAppearance = function(component, data) {

    var material = data.getElementsByTagName("material");
    component.materials = [];
    for (var matID = 0; matID < material.length; matID++) {
        var materialID = this.reader.getString(material[matID], "id");
        if (this.scene.materials.hasOwnProperty(materialID) || materialID === "inherit") {
            component.materials.push(materialID);
        } else {
            throw ("material id: " + materialID + " used in componentref id: " + id + " is not recognized");
        }
    }
    component.materialsIndex = 0;

    var texture = data.getElementsByTagName("texture");
    var textID = this.reader.getString(texture[0], "id");
    if (!this.scene.textures.hasOwnProperty(textID) & (textID !== "none") & textID !== "inherit") {
        throw ("texture id: " + textID + " used in componentref id: " + id + " is not recognized");
    }
    component.textureID = textID;
};

MySceneGraph.prototype.checkChildren = function() {

    for (var compID in this.scene.components) {
        if (this.scene.components.hasOwnProperty(compID)) {
            var comp = this.scene.components[compID];
            for (var i = 0; i < comp.children.primitiveref.length; i++) {
                var primref = comp.children.primitiveref[i];
                if (!this.scene.primitives.hasOwnProperty(primref)) {
                    throw ("primitiveref id: " + primref + " used in componentref id: " + compID + " is not recognized");
                }
            }

            for (var h = 0; h < comp.children.componentref.length; h++) {
                var compref = comp.children.componentref[h];
                if (!this.scene.components.hasOwnProperty(compref)) {
                    throw ("componentref id: " + compref + " used in componentref id: " + compID + " is not recognized");
                }
            }
        }
    }
};

MySceneGraph.prototype.getXYZ = function(node, id) {
    var dest = {};
    dest.x = this.reader.getFloat(node, "x");
    dest.y = this.reader.getFloat(node, "y");
    dest.z = this.reader.getFloat(node, "z");

    for (var coord in dest) {
        if (dest.hasOwnProperty(coord)) {
            if(dest[coord] === null || isNaN(dest[coord])){
                throw "ID: " + id + " has node " + node.tagName + " with " + coord + " value not recognized";
            }
        }
    }
    return dest;
};

MySceneGraph.prototype.getRGBA = function(node, tag) {
    var dest = {};
    var array = node.getElementsByTagName(tag);
    dest.r = this.reader.getFloat(array[0], "r");
    dest.g = this.reader.getFloat(array[0], "g");
    dest.b = this.reader.getFloat(array[0], "b");
    dest.a = this.reader.getFloat(array[0], "a");

    for (var value in dest) {
        if (dest.hasOwnProperty(value)) {
            if(dest[value] === null || isNaN(dest[value]) || dest[value] < 0 || dest[value] > 1){
                var id = this.reader.getString(node, "id");
                dest[value] = 0.1;
                console.warn(tag + " id: " + id + " has " + value + " value not recognized. Assuming default value 0.1");
            }
        }
    }

    return dest;
};

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
