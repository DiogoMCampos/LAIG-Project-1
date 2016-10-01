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


DSXParser.prototype.parsePrimitive = function(primitives) {
    var rectangle = {}, triangle = {}, cylinder = {}, sphere = {}, torus = {};

    var somewhereOverTheRainbow = {};

    var rec = primitives.getElementsByTagName('rectangle');
    if (!rec) {
        throw "'rectangle' primitive is missing.";
    }
    if (rec.length !== 4) {
        throw "rectangle coordinates: x1 y1 x2 y2.";
    }

    var tri = primitives.getElementsByTagName('triangle');
    if (!tri) {
        throw "'triangle' primitive is missing.";
    }
    if (tri.length !== 9) {
        throw "triangle coordinates: x1 y1 z1 x2 y2 z2 x3 y3 z3.";
    }

    var cyl = primitives.getElementsByTagName('cylinder');
    if (!cyl) {
        throw "'cylinder' primitive is missing.";
    }
    if (cyl.length !== 5) {
        throw "cylinder details: base top height slices stacks.";
    }

    var sph = primitives.getElementsByTagName('sphere');
    if (!sph) {
        throw "'sphere' primitive is missing.";
    }
    if (sph.length !== 3) {
        throw "sphere details: radius slices stacks.";
    }

    var tor = primitives.getElementsByTagName('torus');
    if (!tor) {
        throw "'torus' primitive is missing.";
    }
    if (tor.length !== 4) {
        throw "torus details: inner outer slices loops.";
    }

    rectangle.x1 = this.reader.getFloat(rec, 'x1');
    rectangle.y1 = this.reader.getFloat(rec, 'y1');
    rectangle.x2 = this.reader.getFloat(rec, 'x2');
    rectangle.y2 = this.reader.getFloat(rec, 'y2');

    somewhereOverTheRainbow.push(rectangle);

    triangle.x1 = this.reader.getFloat(tri, 'x1');
    triangle.y1 = this.reader.getFloat(tri, 'y1');
    triangle.z1 = this.reader.getFloat(tri, 'z1');
    triangle.x2 = this.reader.getFloat(tri, 'x2');
    triangle.y2 = this.reader.getFloat(tri, 'y2');
    triangle.z2 = this.reader.getFloat(tri, 'z2');
    triangle.x3 = this.reader.getFloat(tri, 'x3');
    triangle.y3 = this.reader.getFloat(tri, 'y3');
    triangle.z3 = this.reader.getFloat(tri, 'z3');

    somewhereOverTheRainbow.push(triangle);

    cylinder.base = this.reader.getFloat(cyl, 'base');
    cylinder.top = this.reader.getFloat(cyl, 'top');
    cylinder.height = this.reader.getFloat(cyl, 'height');
    cylinder.slices = this.reader.getFloat(cyl, 'slices');
    cylinder.stacks = this.reader.getFloat(cyl, 'stacks');

    somewhereOverTheRainbow.push(cylinder);

    sphere.radius = this.reader.getFloat(sph, 'radius');
    sphere.slices = this.reader.getFloat(sph, 'slices');
    sphere.stacks = this.reader.getFloat(sph, 'stacks');

    somewhereOverTheRainbow.push(sphere);

    torus.inner = this.reader.getFloat(tor, 'inner');
    torus.outer = this.reader.getFloat(tor, 'outer');
    torus.slices = this.reader.getFloat(tor, 'slices');
    torus.loops = this.reader.getFloat(tor, 'loops');

    somewhereOverTheRainbow.push(torus);

    this.primitives.push(somewhereOverTheRainbow);
};
