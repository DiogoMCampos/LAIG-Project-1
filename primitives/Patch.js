function Patch(scene, info, reader) {
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;

    this.parseAttributes(info.data);

    this.createSurface(this.orderU, this.orderV, this.controlVertexes);
}

Patch.prototype = Object.create(CGFnurbsObject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.getKnotsVector = function(degree) { // TODO (CGF 0.19.3): add to CGFnurbsSurface

	var v = [];
	for (var i = 0; i <= degree; i++) {
		v.push(0);
	}
	for (var j = 0; j <= degree; j++) {
		v.push(1);
	}
	return v;
};

Patch.prototype.createSurface = function(orderU, orderV, controlVertexes){
    var knots1 = this.getKnotsVector(orderU); // to be built inside webCGF in later versions ()
    var knots2 = this.getKnotsVector(orderV); // to be built inside webCGF in later versions

    var nurbsSurface = new CGFnurbsSurface(orderU, orderV, knots1, knots2, controlVertexes); // TODO  (CGF 0.19.3): remove knots1 and knots2 from CGFnurbsSurface method call. Calculate inside method.
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };
    CGFnurbsObject.call(this, this.scene, getSurfacePoint, this.partsU, this.partsV);
};

Patch.prototype.getControlVertexes = function(orderU, orderV, controlPoints){
    //<controlpoint x=2.0 y=1.0 z=0.0 />
    var vertexes = [];
    for (var i = 0; i <= orderU; i++) {
        var pitStop = [];
        for (var j = 0; j <= orderV; j++) {
            var point = {};

            var index = i * (orderU+1) + j;
            var coordinates = [];
            point.x = this.reader.getFloat(controlPoints[index], "x");
            point.y = this.reader.getFloat(controlPoints[index], "y");
            point.z = this.reader.getFloat(controlPoints[index], "z");

            for (var coord in point) {
                if(point[coord] === null || isNaN(point[coord])){
                    throw "point id: " + this.id + " has " + coord + " value in control point " + index + "not recognized";
                }
            }
            coordinates.push(point.x,point.y,point.z, 1);
            pitStop.push(coordinates);
        }
        vertexes.push(pitStop);
    }
    console.log(vertexes);
    return vertexes;
};

Patch.prototype.parseAttributes = function(xmlNode) {
    //orderU="2" orderV="3" partsU="7" partsV="9"

    this.orderU = this.reader.getInteger(xmlNode, "orderU");
    this.orderV = this.reader.getInteger(xmlNode, "orderV");
    this.partsU = this.reader.getInteger(xmlNode, "partsU");
    this.partsV = this.reader.getInteger(xmlNode, "partsV");

    if(this.orderU === null || isNaN(this.orderU) || this.orderU < 0){
        throw "primitive id: " + this.id + " has orderU value not recognized";
    }
    if(this.orderV === null || isNaN(this.orderV) || this.orderV < 0){
        throw "primitive id: " + this.id + " has orderV value not recognized";
    }
    if(this.partsU === null || isNaN(this.partsU) || this.partsU <= 0){
        this.partsU = 20;
        console.warn("primitive id: " + this.id + " has partsU value not recognized. Assigning default value 20");
    }
    if(this.partsV === null || isNaN(this.partsV) || this.partsV <= 0) {
        this.partsV = 20;
        console.warn("primitive id: " + this.id + " has partsV value not recognized. Assigning default value 20");
    }

    var controlNodes = xmlNode.children;
    this.controlVertexes = this.getControlVertexes(this.orderU, this.orderV, controlNodes);
};
