function DSXParser(rootElement, reader){
    this.reader = reader;
    this.parseScene(rootElement);
    this.parseViews(rootElement);

}

DSXParser.prototype.parseScene = function(rootElement) {
    var elems = rootElement.getElementsByTagName('scene');

    if (!elems) {
        throw "scene element is missing.";
    }

    if (elems.length !== 1) {
        throw "either zero or more than one 'scene' element found.";
    }

    var scene = elems[0];

    this.root = this.reader.getString(scene, 'root');
    this.axisLength = this.reader.getFloat(scene, 'axis_length');

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
    var p = {};

    var fromElems = perspective.getElementsByTagName('from');

    if (!fromElems) {
        throw "from element is missing.";
    }

    if (fromElems.length !== 1) {
        throw "either zero or more than one 'from' element found.";
    }

    var fromCoor = fromElems[0];

    var toElems = perspective.getElementsByTagName('to');

    if (!toElems) {
        throw "to element is missing.";
    }

    if (toElems.length !== 1) {
        throw "either zero or more than one 'to' element found.";
    }

    var toCoor = toElems[0];

    p.id = this.reader.getString(perspective, 'id');
    p.near = this.reader.getFloat(perspective, 'near');
    p.far = this.reader.getFloat(perspective, 'far');
    p.angle = this.reader.getFloat(perspective, 'angle');

    p.from = {};
    p.from.x = this.reader.getFloat(fromCoor, 'x');
    p.from.y = this.reader.getFloat(fromCoor, 'y');
    p.from.z = this.reader.getFloat(fromCoor, 'z');

    p.to = {};
    p.to.x = this.reader.getFloat(toCoor, 'x');
    p.to.y = this.reader.getFloat(toCoor, 'y');
    p.to.z = this.reader.getFloat(toCoor, 'z');

    this.perspectives.push(p);
};
