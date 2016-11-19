/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, id, data) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id = id;

    this.data = data;

    this.data.baseCircle = new MyCircle(this.scene, this.data.slices, this.data.baseRadius);
    this.data.topCircle = new MyCircle(this.scene, this.data.slices, this.data.topRadius);

    this.initBuffers();
}

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var diff = (this.data.baseRadius - this.data.topRadius) / this.data.stacks;

    var ang = 2 * Math.PI / this.data.slices;
    var n = 0;
    var tCoord = 1;
    var sPatch = 1 / this.data.slices;
    var tPatch = 1 / this.data.stacks;

    //Vertices & Normals
    for (var ind = 0; ind <= this.stacks; ind++) {

        var sCoord = 0;

        for (var m = 0; m <= this.data.slices; m++) {
            var nX = Math.cos(ang * m);
            var nY = Math.sin(ang * m);
            this.data.vertices.push(nX * (this.data.baseRadius - diff * ind),
                nY * (this.data.baseRadius - diff * ind),
                n);
            this.normals.push(nX, nY, 0);
            this.texCoords.push(sCoord, tCoord);
            sCoord += sPatch;
        }

        tCoord -= tPatch;
        n += this.data.heightCylinder / this.data.stacks;
    }

    //Indices
    for (var j = 0; j < this.data.stacks; j++) {
        for (var i = 0; i < (this.data.slices); i++) {
            this.indices.push((i + 1) + (j + 0) * (this.data.slices + 1),
                (i + 0)  + (j + 1) * (this.data.slices + 1),
                (i + 0)  + (j + 0) * (this.data.slices + 1));

            this.indices.push((i + 0)  + (j + 1) * (this.data.slices + 1),
                (i + 1)  + (j + 0) * (this.data.slices + 1),
                (i + 1)  + (j + 1) * (this.data.slices + 1));
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCylinder.prototype.display = function() {

    CGFobject.prototype.display.call(this);
    this.data.baseCircle.display();
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.scene.translate(0, 0, -this.data.heightCylinder);
    this.data.topCircle.display();
};
