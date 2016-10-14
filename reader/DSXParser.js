function DSXParser(rootElement, reader) {
    this.reader = reader;
    var root = rootElement.children;
    this.parseScene(root[0]);
    this.parseViews(root[1]);
    this.parseIllumination(root[2]);
    this.parseLights(root[3]);
    this.parseTextures(root[4]);
    this.parseMaterials(root[5]);
    this.parseTransformations(root[6]);
    this.parsePrimitives(root[7]);
    this.parseComponents(root[8]);

    //console.log(this);
}

DSXParser.prototype.parseScene = function(scene) {
    this.scene = {};

    if (scene.tagName !== "scene") {
        throw "the main block order is wrong";
    }
    this.scene.root = this.reader.getString(scene, "root");
    this.scene.axisLength = this.reader.getFloat(scene, "axis_length");
};

DSXParser.prototype.parseViews = function(views) {

    this.defaultView = this.reader.getFloat(views, "default");

    var perspectives = views.getElementsByTagName("perspective");

    if (perspectives.length < 1) {
        throw "no 'perspective' element found.";
    }

    this.perspectives = [];

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

    object = {};
    object.id = this.reader.getString(perspective, "id");
    object.angle = this.reader.getFloat(perspective, "angle");
    object.near = this.reader.getFloat(perspective, "near");
    object.far = this.reader.getFloat(perspective, "far");
    object.from = fromElems[0];
    object.to = toElems[0];

    this.perspectives.push(object);
};

DSXParser.prototype.parseIllumination = function(illumination) {
    this.illumination = {};
    this.illumination.doublesided = this.reader.getBoolean(illumination, "doublesided");
    this.illumination.local = this.reader.getBoolean(illumination, "local");
    this.illumination.data = illumination;
};

DSXParser.prototype.parseLights = function (lights){

    var l = lights;
    this.lights = {};
    this.lights.omni = {};
    this.lights.spot = {};

    this.getLightData(l);

};

DSXParser.prototype.getLightData = function (lightArray){
    var omni = lightArray.getElementsByTagName("omni");
    var spot = lightArray.getElementsByTagName("spot");

    for (var i = 0; i < omni.length; i++) {
        var object = {};
        object.id = this.reader.getString(omni[i], "id");
        object.enabled = this.reader.getBoolean(omni[i], "enabled");
        object.data = omni[i];
        this.lights.omni[object.id] = object;
    }

    for (var i = 0; i < spot.length; i++) {
        var object = {};
        object.id = this.reader.getString(spot[i], "id");
        object.enabled = this.reader.getBoolean(spot[i], "enabled");
        object.data = spot[i];
        object.angle = this.reader.getFloat(spot[i], "angle");
        object.exponent = this.reader.getFloat(spot[i], "exponent");
        this.lights.spot[object.id] = object;
    }
};

DSXParser.prototype.parseTextures = function(textures){
    /*var elems = rootElement.getElementsByTagName("textures");

    if (elems.length !== 1) {
        throw "either zero or more than one 'transformations' element found.";
    }
    */
    var texturesArray = textures.getElementsByTagName("texture");
    this.textures = texturesArray;
};

DSXParser.prototype.parseMaterials = function(materials) {
    this.materials = [];
    var materialArray = materials.getElementsByTagName("material");

    for (var i = 0; i < materialArray.length; i++) {
        var m = {};
        m.id = this.reader.getString(materialArray[i], "id");
        m.data = materialArray[i];
        this.materials.push(m);
    }

};

DSXParser.prototype.parseTransformations = function(transformations) {
    /*var elems = rootElement.getElementsByTagName("transformations");

    if (!elems) {
        throw "transformations element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'transformations' element found.";
    }

    var transformations = elems[0];
    */
    this.transformations = [];

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

    var object = {};
    object.id = id;
    object.elements = [];

    for(var i = 0; i < elems.length; i++) {
        object.elements.push(elems[i]);
    }

    this.transformations.push(object);
};

DSXParser.prototype.parsePrimitives = function(primitives) {
    /*var elems = rootElement.getElementsByTagName("primitives");

    if (!elems) {
        throw "primitives element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'primitives' element found.";
    }*/

    this.primitives = {
        "rectangle": [],
        "triangle": [],
        "cylinder": [],
        "sphere": [],
        "torus": []
    };

    var nodes = primitives.getElementsByTagName("primitive");

    if (!nodes || nodes.length === 0) {
        console.warn("no primitives found");
        return;
    }

    for (var i = 0; i < nodes.length; i++) {
        this.getPrimitiveData(nodes[i], this.primitives);
    }
};

DSXParser.prototype.getPrimitiveData = function(nodes, primitives) {
    var children = nodes.children;

    if (children.length !== 1) {
        throw "either zero or more than one tag for a specific primitive.";
    }

    var element = children[0];

    var type = element.tagName;
    if (!primitives[type]) {
        console.warn(type + " is not a valid primitive tag. Proceeded without that primitive.");
        return;
    }

    var id = this.reader.getString(nodes, "id", false);
    if (!id) {
        console.warn("primitive without id (required). Proceeded without that primitive.");
        return;
    }

    var object = {};
    object.id = id;
    object.element = element;

    primitives[type].push(object);
};

DSXParser.prototype.parseComponents = function(components) {
    /*var comp = rootElement.getElementsByTagName("components");
    if (comp.length !== 1) {
        throw "either zero or more than one 'components' element found.";
    }
    */
    var componentArray = components.getElementsByTagName("component");
    this.components = [];
    for (var i = 0; i < componentArray.length; i++) {
        var object = {};
        object.id = this.reader.getString(componentArray[i], "id");
        object.element = componentArray[i];
        this.components.push(object);
    }
};
