function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    // File reading
    this.reader = new CGFXMLreader();

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the this.reader calls onXMLReady on this object.
     * If any error occurs, the this.reader calls onXMLError on this object, with an error message
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
        //this.createAnimations(dsxInfo.animations);
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
        throw "The specified root is not a valid component.";
    }

    this.scene.root = scene.root;
    this.scene.axisLength = scene.axisLength;
};

MySceneGraph.prototype.createIllumination = function(illuminationNode) {
    var doublesided = illuminationNode.doublesided;
    var local = illuminationNode.local;

    var amb = getRGBA(this.reader, illuminationNode.data, "ambient");
    var back = getRGBA(this.reader, illuminationNode.data, "background");
    this.background = [];
    this.background.push(back.r, back.g, back.b, back.a);
    this.scene.setGlobalAmbientLight(amb.r, amb.g, amb.b, amb.a);
};

MySceneGraph.prototype.createCameras = function(views) {
    var perspectives = views.perspectives;
    for (var id in perspectives) {
        if (perspectives.hasOwnProperty(id)) {
            var p = perspectives[id];

            var f = getXYZ(this.reader, p.from, id);
            var to = getXYZ(this.reader, p.to, id);
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
            if (locArray.length !== 1) {
                throw ("Light " + id + " has zero or more than one locations.");
            }
            def.location = getXYZ(this.reader,locArray[0], id);

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

                    var direction = getXYZ(this.reader, tarArray[0], id);
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

    result.ambient = getRGBA(this.reader, node.data, "ambient");
    result.diffuse = getRGBA(this.reader, node.data, "diffuse");
    result.specular = getRGBA(this.reader, node.data, "specular");
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
            var shi;

            if (shininess.length !== 1) {
                console.warn("Material " + id + " has zero or more than one shininess elements. Assigning default value 1.");
                shi = 1;
            } else {
                shi = this.reader.getFloat(shininess[0], "value");
                if (!shi && shi !== 0) {
                    console.warn("Material " + id + " doesn't have a valid shininess value. Assigning default value 1.");
                    shi = 1;
                }
            }

            var amb = getRGBA(this.reader, mat.data, "ambient");
            var dif = getRGBA(this.reader, mat.data, "diffuse");
            var spe = getRGBA(this.reader, mat.data, "specular");
            var emi = getRGBA(this.reader, mat.data, "emission");

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
            if (!result.axis || !(result.axis === "x" || result.axis === "y" || result.axis === "z")) {
                throw "Invalid rotation axis. Pick one of {x, y, z}";
            }

            result.angle = this.reader.getFloat(node, "angle");
            if (!result.angle && result.angle !== 0) {
                throw "Invalid rotation angle";
            }
            break;
        case this.scene.TRANSFORMATIONS.TRANSLATE:
            result = getXYZ(this.reader, node, id);
            break;
        case this.scene.TRANSFORMATIONS.SCALE:
            result = getXYZ(this.reader, node, id);
            break;
    }
    result.name = node.tagName;
    return result;
};

MySceneGraph.prototype.createAnimations = function(animationNodes) {
    this.scene.animations = {};

    for (var i = 0; i < animationNodes.length; i++) {
        this.getAnimationData(animationNodes[i]);
    }
};

MySceneGraph.prototype.getAnimationData = function(node) {
    var id = this.reader.getString(node, "id", false);
    if (!id) {
        console.warn("animation without id (required). Proceeded without that animation.");
        return;
    }

    if (this.scene.animations.hasOwnProperty(id)) {
        console.warn("repeated animation id: " + id);
        return;
    }

    var span = this.reader.getFloat(node, "span");
    if (!span) {
        console.warn("animation " + id + " without span (required). Proceeded without that animation.");
        return;
    }

    var type = this.reader.getString(node, "type");
    if (!type) {
        console.warn("animation " + id + " without type (required). Proceeded without that animation.");
        return;
    }

    var animation = {};
    animation.id = id;
    animation.type = type;
    animation.duration = span;

    if (type === "linear") {
        this.getLinearAnimation(animation, node);
    } else if (type === "circular") {
        this.getCircularAnimation(animation, node);
    } else {
        console.warn("animation " + id + " with wrong type (should be either \"linear\" or \"circular\". Proceeded without that animation.");
        return;
    }
};

MySceneGraph.prototype.getLinearAnimation = function(animation, node) {
    var children = node.children;
    if (children.length <= 1) {
        throw "less than two control points for animation id: " + id + ". Proceeded without that animation.";
    }

    var controlPoints = [];
    for (var i = 0; i < children.length; i++) {
        controlPoints.push(this.getControlPoint(children[i]));
    }

    animation.controlPoints = controlPoints;
    this.scene.animations[animation.id] = animation;
};

MySceneGraph.prototype.getCircularAnimation = function(animation, node) {
    var animationAttributes = ["centerx", "centery", "centerz", "radius", "startang", "rotang"];

    for (var i = 0; i < animationAttributes.length; i++) {
        var attribute = animationAttributes[i];
        animation[attribute] = this.reader.getFloat(node, attribute);
        if (animation[attribute] === null || isNaN(animation[attribute])) {
            console.warn("animation " + animation.id + " without " + attribute + " (required). Proceeded without that animation.");
            return;
        }
    }

    this.scene.animations[animation.id] = animation;
};

MySceneGraph.prototype.getControlPoint = function(controlPoint) {
    var point = {};

    var coordinates = [];
    point.x = this.reader.getFloat(controlPoint, "xx");
    point.y = this.reader.getFloat(controlPoint, "yy");
    point.z = this.reader.getFloat(controlPoint, "zz");

    for (var coord in point) {
        if (point[coord] === null || isNaN(point[coord])) {
            throw "Coord " + coord + " value not recognized";
        }
    }

    return point;
};

MySceneGraph.prototype.createElements = function(primitivesNodes) {
    for (var id in primitivesNodes) {
        if (primitivesNodes.hasOwnProperty(id)) {
            var p = primitivesNodes[id];
            var obj, data;
            switch (p.type) {
                case this.scene.PRIMITIVES.RECTANGLE:
                    data = parseRectangle(this.reader, id, p.data);
                    obj = new MyRectangle(this.scene, id, data);
                    break;

                case this.scene.PRIMITIVES.TRIANGLE:
                    data = parseTriangle(this.reader, id, p.data);
                    obj = new MyTriangle(this.scene, id, data);
                    break;

                case this.scene.PRIMITIVES.CYLINDER:
                    data = parseCylinder(this.reader, id, p.data);
                    obj = new MyCylinder(this.scene, id, data);
                    break;

                case this.scene.PRIMITIVES.SPHERE:
                    data = parseSphere(this.reader, id, p.data);
                    obj = new MySphere(this.scene, id, data);
                    break;

                case this.scene.PRIMITIVES.TORUS:
                    data = parseTorus(this.reader, id, p.data);
                    obj = new MyTorus(this.scene, id, data);
                    break;
                case this.scene.PRIMITIVES.PLANE:
                    data = parsePlane(this.reader, id, p.data);
                    obj = new Plane(this.scene, id, data);
                    break;
                case this.scene.PRIMITIVES.PATCH:
                    data = parsePatch(this.reader, id, p.data);
                    obj = new Patch(this.scene, id, data);
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
                throw ("Component " + id + " has zero or more than one transformation groups");
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

            this.setComponentAppearance(id, component, data);

            var children = data.getElementsByTagName("children");
            if (children.length !== 1) {
                throw ("Component " + id + " has zero or more than one children groups");
            }

            var child = children[0].children;
            component.children = {
                "componentref": [],
                "primitiveref": []
            };

            for (var ind = 0; ind < child.length; ind++) {
                var tag = child[ind].tagName;
                var primitiveID = this.reader.getString(child[ind], "id");
                if (!primitiveID) {
                    throw ("Component " + id + " has a primitive with an invalid id.");
                }
                component.children[tag].push(primitiveID);
            }

            this.scene.components[id] = component;
        }
    }
    this.checkChildren();
};

MySceneGraph.prototype.setComponentAppearance = function(id, component, data) {

    var materialNode = data.getElementsByTagName("materials");
    if (materialNode.length !== 1) {
        throw ("Component " + id + " has zero or more than one material categories.");
    }
    var material = materialNode[0].getElementsByTagName("material");
    if(material.length < 1){
        throw ("Component " + id + " has zero material tags.");
    }

    component.materials = [];
    for (var matID = 0; matID < material.length; matID++) {
        var materialID = this.reader.getString(material[matID], "id");
        if (!materialID) {
            throw ("Component " + id + " has a material with an invalid id.");
        }
        if (this.scene.materials.hasOwnProperty(materialID) || materialID === "inherit") {
            component.materials.push(materialID);
        } else {
            throw ("material id: " + materialID + " used in componentref id: " + id + " is not recognized");
        }
    }
    component.materialsIndex = 0;

    var texture = data.getElementsByTagName("texture");
    if (texture.length !== 1) {
        throw ("Component " + id + " has zero or more texture tags.");
    }
    var textID = this.reader.getString(texture[0], "id");
    if (!textID) {
        throw ("Component " + id + " has a texture with an invalid id.");
    }

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

/*
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};
