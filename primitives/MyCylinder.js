/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;

    this.parseAttributes(info.data);

    this.baseCircle = new MyCircle(this.scene, this.slices, this.baseRadius);
    this.topCircle = new MyCircle(this.scene, this.slices, this.topRadius);

    this.initBuffers();
}

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var diff = (this.baseRadius - this.topRadius) / this.stacks;

    var ang = 2 * Math.PI / this.slices;
    var n = 0;
    var tCoord = 1;
    var sPatch = 1 / this.slices;
    var tPatch = 1 / this.stacks;

    //Vertices & Normals
    for (var ind = 0; ind <= this.stacks; ind++) {

        var sCoord = 0;

        for (var m = 0; m <= this.slices; m++) {
            var nX = Math.cos(ang * m);
            var nY = Math.sin(ang * m);
            this.vertices.push(nX * (this.baseRadius - diff * ind),
                nY * (this.baseRadius - diff * ind),
                n);
            this.normals.push(nX, nY, 0);
            this.texCoords.push(sCoord, tCoord);
            sCoord += sPatch;
        }

        tCoord -= tPatch;
        n += this.heightCylinder / this.stacks;
    }

    //Indices
    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < (this.slices); i++) {
            this.indices.push((i + 1) + (j + 0) * (this.slices + 1),
                (i + 0)  + (j + 1) * (this.slices + 1),
                (i + 0)  + (j + 0) * (this.slices + 1));

            this.indices.push((i + 0)  + (j + 1) * (this.slices + 1),
                (i + 1)  + (j + 0) * (this.slices + 1),
                (i + 1)  + (j + 1) * (this.slices + 1));
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCylinder.prototype.display = function() {

    CGFobject.prototype.display.call(this);
    this.baseCircle.display();
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.scene.translate(0, 0, -this.heightCylinder);
    this.topCircle.display();
};

MyCylinder.prototype.parseAttributes = function(xmlNode) {
    this.baseRadius = this.reader.getFloat(xmlNode, "base");
    this.topRadius = this.reader.getFloat(xmlNode, "top");
    this.heightCylinder = this.reader.getFloat(xmlNode, "height");
    this.slices = this.reader.getInteger(xmlNode, "slices");
    this.stacks = this.reader.getInteger(xmlNode, "stacks");

    if(this.baseRadius === null || isNaN(this.baseRadius) || this.baseRadius <= 0){
        throw "primitive id: " + this.id + " has base value not recognized";
    }
    if(this.topRadius === null || isNaN(this.topRadius) || this.topRadius <= 0){
        throw "primitive id: " + this.id + " has top value not recognized";
    }
    if(this.heightCylinder === null || isNaN(this.heightCylinder) || this.heightCylinder <= 0){
        throw "primitive id: " + this.id + " has height value not recognized";
    }
    if(this.slices === null || isNaN(this.slices) || this.slices <= 0){
        this.slices = 10;
        console.warn("primitive id: " + this.id + " has slices value not recognized. Assigning default value 10");
    }
    if(this.stacks === null || isNaN(this.stacks) || this.stacks <= 0) {
        this.stacks = 10;
        console.warn("primitive id: " + this.id + " has stacks value not recognized. Assigning default value 10");
    }
};
