function DSXParser(rootElement, reader) {
    this.reader = reader;
    var root = rootElement.children;

    if (root.length !== 9) {
        throw "dsx file has incorrect number of main categories";
    }
    this.parseScene(root[0]);
    this.parseViews(root[1]);
    this.parseIllumination(root[2]);
    this.parseLights(root[3]);
    this.parseTextures(root[4]);
    this.parseMaterials(root[5]);
    this.parseTransformations(root[6]);
    this.parsePrimitives(root[7]);
    this.parseComponents(root[8]);

}

DSXParser.prototype.parseScene = function(scene) {
    this.scene = {};

    if (scene.tagName !== "scene") {
        throw "the main block order is wrong";
    }
    this.scene.root = this.reader.getString(scene, "root");
    this.scene.axisLength = this.reader.getFloat(scene, "axis_length");
    if(this.scene.axisLength === null || isNaN(this.scene.axisLength) || this.scene.axisLength <= 0){
        this.scene.axisLength = 10;
        console.warn("Axis length value not recognized. Assigning default value 10");
    }
};

DSXParser.prototype.parseViews = function(views) {

    if (views.tagName !== "views") {
        throw "the main block order is wrong";
    }

    this.defaultView = this.reader.getFloat(views, "default");
    var perspectives = views.getElementsByTagName("perspective");

    if (perspectives.length < 1) {
        throw "no 'perspective' element found.";
    }

    this.perspectives = {};

    for (var i = 0; i < perspectives.length; i++) {
        this.getPerspectiveData(perspectives[i]);
    }
};

DSXParser.prototype.getPerspectiveData = function(perspective) {
    var fromElems = perspective.getElementsByTagName("from");
    if (fromElems.length !== 1) {
        throw "either zero or more than one 'from' element found.";
    }

    var toElems = perspective.getElementsByTagName("to");
    if (toElems.length !== 1) {
        throw "either zero or more than one 'to' element found.";
    }

    var object = {};
    object.id = this.reader.getString(perspective, "id");

    if (this.perspectives.hasOwnProperty(object.id)) {
        console.warn("Repeated perspective id: " + object.id);
        return;
    }
    object.angle = this.reader.getFloat(perspective, "angle");
    object.near = this.reader.getFloat(perspective, "near");
    object.far = this.reader.getFloat(perspective, "far");
    object.from = fromElems[0];
    object.to = toElems[0];

    this.perspectives[object.id] = object;
};

DSXParser.prototype.parseIllumination = function(illumination) {
    if (illumination.tagName !== "illumination") {
        throw "the main block order is wrong";
    }

    this.illumination = {};
    this.illumination.doublesided = this.reader.getBoolean(illumination, "doublesided");
    this.illumination.local = this.reader.getBoolean(illumination, "local");
    this.illumination.data = illumination;
};

DSXParser.prototype.parseLights = function(lightNode) {

    if (lightNode.tagName !== "lights") {
        throw "the main block order is wrong";
    }
    this.lights = {};

    var all = lightNode.children;

    for (var i = 0; i < all.length; i++) {
        var object = {};
        object.id = this.reader.getString(all[i], "id");

        if (this.lights.hasOwnProperty(object.id)) {
            console.warn("Repeated light id: " + object.id);
            continue;
        }
        object.enabled = this.reader.getBoolean(all[i], "enabled");
        object.type = all[i].tagName;
        object.data = all[i];

        switch (object.type) {
            case "spot":
                object.angle = this.reader.getFloat(all[i], "angle");
                if(object.angle === null || isNaN(object.angle) || object.angle <= 0){
                    object.angle = 22.5;
                    console.warn("Angle value not recognized. Assigning default value 22.5 DEG");
                }
                object.exponent = this.reader.getFloat(all[i], "exponent");
                if(object.exponent === null || isNaN(object.exponent) || object.exponent <= 0){
                    object.exponent = 1;
                    console.warn("Angle value not recognized. Assigning default value 1");
                }
                break;
            case "omni":
                break;
        }
        this.lights[object.id] = object;
    }
};

DSXParser.prototype.parseTextures = function(textures) {

    if (textures.tagName !== "textures") {
        throw "the main block order is wrong";
    }
    this.textures = {};
    var texturesArray = textures.getElementsByTagName("texture");

    for (var i = 0; i < texturesArray.length; i++) {
        var texture = texturesArray[i];

        var t = {};
        t.id = this.reader.getString(texture, "id");

        if(this.textures.hasOwnProperty(t.id)){
            console.warn("Repeated texture id: " + t.id);
            continue;
        }
        t.file = this.reader.getString(texture, "file");
        t.lengthS = this.reader.getFloat(texture, "length_s");
        t.lengthT = this.reader.getFloat(texture, "length_t");

        this.textures[t.id] = t;
    }
};

DSXParser.prototype.parseMaterials = function(materials) {

    if (materials.tagName !== "materials") {
        throw "the main block order is wrong";
    }
    this.materials = {};
    var materialArray = materials.getElementsByTagName("material");

    for (var i = 0; i < materialArray.length; i++) {
        var m = {};

        m.id = this.reader.getString(materialArray[i], "id");
        if(this.materials.hasOwnProperty(m.id)){
            console.warn("Repeated material id: " + m.id);
            continue;
        }
        m.data = materialArray[i];
        this.materials[m.id] = m;
    }
};

DSXParser.prototype.parseTransformations = function(transformations) {

    if (transformations.tagName !== "transformations") {
        throw "the main block order is wrong";
    }
    this.transformations = {};

    var transformationList = transformations.getElementsByTagName("transformation");

    for (var i = 0; i < transformationList.length; i++) {
        this.getTransformationData(transformationList[i]);
    }
};

DSXParser.prototype.getTransformationData = function(transformation) {
    var elems = transformation.children;

    var id = this.reader.getString(transformation, "id", false);
    if (!id) {
        console.warn("transformation without id (required). Proceeded without that transformation.");
        return;
    }
    if (this.transformations.hasOwnProperty(id)) {
        console.warn("Repeated transformation id: " + id);
        return;
    }

    var object = {};
    object.id = id;
    object.data = [];

    for (var i = 0; i < elems.length; i++) {
        object.data.push(elems[i]);
    }

    this.transformations[id] = object;
};

DSXParser.prototype.parsePrimitives = function(primitives) {

    if (primitives.tagName !== "primitives") {
        throw "the main block order is wrong";
    }
    this.primitives = {};

    var nodes = primitives.getElementsByTagName("primitive");

    if (!nodes || nodes.length === 0) {
        console.warn("no primitives found");
        return;
    }

    for (var i = 0; i < nodes.length; i++) {
        this.getPrimitiveData(nodes[i]);
    }
};

DSXParser.prototype.getPrimitiveData = function(nodes, primitives) {
    var children = nodes.children;

    if (children.length !== 1) {
        throw "either zero or more than one tag for a specific primitive.";
    }

    var data = children[0];
    var id = this.reader.getString(nodes, "id", false);
    if (!id) {
        console.warn("primitive without id (required). Proceeded without that primitive.");
        return;
    }
    if (this.primitives.hasOwnProperty(id)) {
        console.warn("repeated primitive id: " + id);
        return;
    }

    var object = {};
    object.id = id;
    object.type = data.tagName;
    object.data = data;

    this.primitives[id] = object;
};

DSXParser.prototype.parseComponents = function(components) {

    if (components.tagName !== "components") {
        throw "the main block order is wrong";
    }
    var componentArray = components.getElementsByTagName("component");
    this.components = {};
    for (var i = 0; i < componentArray.length; i++) {
        var object = {};
        object.id = this.reader.getString(componentArray[i], "id");
        if (this.components.hasOwnProperty(object.id)) {
            console.warn("Repeated component id: " + object.id);
            continue;
        }
        object.data = componentArray[i];
        this.components[object.id] = object;
    }
};
