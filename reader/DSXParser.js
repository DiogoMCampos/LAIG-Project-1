function DSXParser(rootElement, reader) {
    this.reader = reader;

    this.parseScene(rootElement);
    this.parseViews(rootElement);
    this.parseTransformations(rootElement);
    this.parsePrimitives(rootElement);

    //console.log(this);
}

DSXParser.prototype.parseScene = function(rootElement) {
    var elems = rootElement.getElementsByTagName('scene');

    if (!elems) {
        throw "scene element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'scene' element found.";
    }

    this.scene = elems[0];
};

DSXParser.prototype.parseViews = function(rootElement) {
    var elems = rootElement.getElementsByTagName('views');

    if (!elems) {
        throw "views element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'views' element found.";
    }

    var views = elems[0];

    this.defaultView = this.reader.getFloat(views, 'default');

    var perspectives = views.getElementsByTagName('perspective');

    if (perspectives.length < 1) {
        throw "no 'perspective' element found.";
    }

    this.perspectives = [];

    for (var i = 0; i < perspectives.length; i++) {
        this.parsePerspective(perspectives[i]);
    }
};


DSXParser.prototype.parsePerspective = function(perspective) {
    var fromElems = perspective.getElementsByTagName('from');

    if (!fromElems) {
        throw "from element is missing.";
    }

    if (fromElems.length !== 1) {
        throw "either zero or more than one 'from' element found.";
    }

    var toElems = perspective.getElementsByTagName('to');

    if (!toElems) {
        throw "to element is missing.";
    }

    if (toElems.length !== 1) {
        throw "either zero or more than one 'to' element found.";
    }

    object = {};
    object.angle = this.reader.getFloat(perspective, "angle");
    object.near = this.reader.getFloat(perspective, "near");
    object.far = this.reader.getFloat(perspective, "far");
    object.from = {};
    object.from.x = this.reader.getFloat(fromElems[0], "x");
    object.from.y = this.reader.getFloat(fromElems[0], "y");
    object.from.z = this.reader.getFloat(fromElems[0], "z");
    object.to = {};
    object.to.x = this.reader.getFloat(toElems[0], "x");
    object.to.y = this.reader.getFloat(toElems[0], "y");
    object.to.z = this.reader.getFloat(toElems[0], "z");

    this.perspectives.push(object);
};

DSXParser.prototype.parseTransformations = function(rootElement) {
    var elems = rootElement.getElementsByTagName('transformations');

    if (!elems) {
        throw "transformations element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'transformations' element found.";
    }

    var transformations = elems[0];

    this.transformations = [];

    var transformationList = transformations.getElementsByTagName('transformation');
    if (!elems || elems.length === 0) {
        console.warn("no transformations found");
        return;
    }

    for (var i = 0; i < transformationList.length; i++) {
        this.parseTransformation(transformationList[i]);
    }
};

DSXParser.prototype.getTransformationData = function(transformation) {
    var elems = transformation.children;

    var id = this.reader.getString(transformation, 'id', false);
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


DSXParser.prototype.parsePrimitives = function(rootElement) {
    var elems = rootElement.getElementsByTagName('primitives');

    if (!elems) {
        throw "primitives element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'primitives' element found.";
    }

    this.primitives = {
        "rectangle": [],
        "triangle": [],
        "cylinder": [],
        "sphere": [],
        "torus": []
    };

    var nodes = elems[0].getElementsByTagName('primitive');

    if (!nodes || nodes.length === 0) {
        console.warn("no primitives found");
        return;
    }

    for (var i = 0; i < nodes.length; i++) {
        this.parsePrimitive(nodes[i], this.primitives);
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

    var id = this.reader.getString(nodes, 'id', false);
    if (!id) {
        console.warn("primitive without id (required). Proceeded without that primitive.");
        return;
    }

    var object = {};
    object.id = id;
    object.element = element;

    primitives[type].push(object);
};
