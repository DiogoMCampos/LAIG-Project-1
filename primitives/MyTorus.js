/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, id, data) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id = id;
    this.data = data;

    this.initBuffers();
}


MyTorus.prototype = Object.create(CGFobject.prototype);
MyTorus.prototype.constructor = MyTorus;

MyTorus.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var dist = (this.data.outerRadius + this.data.innerRadius) / 2;
    var tubeRadius = (this.data.outerRadius - this.data.innerRadius) /2;

    var innerAngle = 2 * Math.PI / this.data.slices;
    var outerAngle = 2 * Math.PI / this.data.loops;
    var n = 0;
    var tCoord = 1;
    var sPatch = 1 / this.data.slices;
    var tPatch = 1 / this.data.loops;

    //Vertices & Normals
    for (var ind = 0; ind < this.data.loops; ind++) {

        var sCoord = 0;

        for (var m = 0; m < this.data.slices; m++) {
            this.vertices.push((dist + tubeRadius * Math.cos(m * innerAngle)) * Math.cos(ind*outerAngle),
                (dist + tubeRadius * Math.cos(m * innerAngle)) * Math.sin(ind*outerAngle),
                tubeRadius * Math.sin(m * innerAngle));
            this.texCoords.push(sCoord, tCoord);
            this.normals.push(Math.cos(innerAngle * m) * Math.cos(ind*outerAngle),
                Math.cos(innerAngle * m) * Math.sin(ind*outerAngle),
                Math.sin(m * innerAngle));
            sCoord += sPatch;
        }
        tCoord -= tPatch;
    }

    //Indices
    for (var j = 0; j < this.data.loops; j++) {
        for (var i = 0; i < (this.data.slices); i++) {
            this.indices.push(((i + 0) % (this.data.slices) + (j + 0) * this.data.slices) % (this.data.slices * this.data.loops),
                ((i + 0) % (this.data.slices) + (j + 1) * this.data.slices) % (this.data.slices * this.data.loops),
                ((i + 1) % (this.data.slices) + (j + 0) * this.data.slices) % (this.data.slices * this.data.loops));

            this.indices.push(((i + 1) % (this.data.slices) + (j + 1) * this.data.slices) % (this.data.slices * this.data.loops),
                ((i + 1) % (this.data.slices) + (j + 0) * this.data.slices) % (this.data.slices * this.data.loops),
                ((i + 0) % (this.data.slices) + (j + 1) * this.data.slices) % (this.data.slices * this.data.loops));
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
