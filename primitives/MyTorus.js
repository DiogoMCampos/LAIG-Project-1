/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;
    this.parseAttributes(info.data);

    this.initBuffers();
}


MyTorus.prototype = Object.create(CGFobject.prototype);
MyTorus.prototype.constructor = MyTorus;

MyTorus.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];

    var dist = (this.outerRadius + this.innerRadius) / 2;
    var tubeRadius = (this.outerRadius - this.innerRadius) /2;

    var innerAngle = 2 * Math.PI / this.slices;
    var outerAngle = 2 * Math.PI / this.loops;
    var n = 0;
    var tCoord = 1;
    var sPatch = 1 / this.slices;
    var tPatch = 1 / this.loops;

    //Vertices & Normals
    for (var ind = 0; ind < this.loops; ind++) {

        var sCoord = 0;

        for (var m = 0; m < this.slices; m++) {
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
    for (var j = 0; j < this.loops; j++) {
        for (var i = 0; i < (this.slices); i++) {
            this.indices.push(((i + 0) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.loops),
                ((i + 0) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.loops),
                ((i + 1) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.loops));

            this.indices.push(((i + 1) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.loops),
                ((i + 1) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.loops),
                ((i + 0) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.loops));
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTorus.prototype.parseAttributes = function(xmlNode) {
    this.innerRadius = this.reader.getFloat(xmlNode, "inner");
    this.outerRadius = this.reader.getFloat(xmlNode, "outer");
    this.slices = this.reader.getInteger(xmlNode, "slices");
    this.loops = this.reader.getInteger(xmlNode, "loops");

    if(this.innerRadius === null || isNaN(this.innerRadius) || this.innerRadius <= 0){
        throw "primitive id: " + this.id + " has inner value not recognized";
    }
    if(this.outerRadius === null || isNaN(this.outerRadius) || this.outerRadius <= 0){
        throw "primitive id: " + this.id + " has outer value not recognized";
    }
    if(this.slices === null || isNaN(this.slices) || this.slices <= 0){
        this.slices = 10;
        console.warn("primitive id: " + this.id + " has slices value not recognized. Assigning default value 10");
    }
    if(this.loops === null || isNaN(this.loops) || this.loops <= 0) {
        this.loops = 10;
        console.warn("primitive id: " + this.id + " has loops value not recognized. Assigning default value 10");
    }
};
