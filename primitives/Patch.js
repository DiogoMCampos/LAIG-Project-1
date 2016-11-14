function Patch(scene, id, data) {
    this.scene = scene;
    this.id = id;

    this.createSurface(data.orderU, data.orderV, data.controlVertexes, data.partsU, data.partsV);
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

Patch.prototype.createSurface = function(orderU, orderV, controlVertexes, partsU, partsV){
    var knots1 = this.getKnotsVector(orderU); // to be built inside webCGF in later versions ()
    var knots2 = this.getKnotsVector(orderV); // to be built inside webCGF in later versions

    var nurbsSurface = new CGFnurbsSurface(orderU, orderV, knots1, knots2, controlVertexes); // TODO  (CGF 0.19.3): remove knots1 and knots2 from CGFnurbsSurface method call. Calculate inside method.
    getSurfacePoint = function(u, v) {
        return nurbsSurface.getPoint(u, v);
    };
    CGFnurbsObject.call(this, this.scene, getSurfacePoint, partsU, partsV);
};
