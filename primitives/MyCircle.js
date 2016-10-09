/**
 * MyCircle
 * @constructor
 */
function MyCircle(scene, slices, radius) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.radius = radius;
    this.initBuffers();
}

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var ang = 2 * Math.PI / this.slices;
    var x;
    var y;

    for (var m = 0; m <= this.slices; m++) {
        x = Math.cos(ang * m) * this.radius;
        y = Math.sin(ang * m) * this.radius;
        this.vertices.push(x, y, 0);
        this.normals.push(x, y, 0);
        this.texCoords.push(0.5 - 0.5 * x, 0.5 - 0.5 * y);

    }

    this.vertices.push(0, 0, 0);
    this.normals.push(0, 0, 1);

    for (var i = 0; i < this.slices; i++) {
        this.indices.push(i + 1, i, this.slices);
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
