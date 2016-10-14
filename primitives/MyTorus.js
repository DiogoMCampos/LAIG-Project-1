/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;
    this.parseAttributes(info.element);

    this.initBuffers();
}

function MyTorus(scene, inner, out, slices, stacks) {
    CGFobject.call(this, scene);
    this.scene = scene;

    this.innerRadius = inner;
    this.outerRadius = out;
    this.slices = slices;
    this.stacks = stacks;
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
    var outerAngle = 2 * Math.PI / this.stacks;
    var n = 0;
    var tCoord = 1;
    var sPatch = 1 / this.slices;
    var tPatch = 1 / this.stacks;

    //Vertices & Normals
    for (var ind = 0; ind < this.stacks; ind++) {

        var sCoord = 0;

        for (var m = 0; m < this.slices; m++) {
            this.vertices.push((dist + tubeRadius * Math.cos(m * innerAngle)) * Math.cos(ind*outerAngle),
                (dist + tubeRadius * Math.cos(m * innerAngle)) * Math.sin(ind*outerAngle),
                tubeRadius * Math.sin(m * innerAngle));
            this.texCoords.push(sCoord, tCoord);
            this.normals.push(Math.cos(innerAngle * m), Math.sin(innerAngle * m), Math.sin(m * innerAngle));
            sCoord += sPatch;
        }
        tCoord -= tPatch;
    }

    //Indices
    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < (this.slices); i++) {
            this.indices.push(((i + 1) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.stacks),
                ((i + 0) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.stacks),
                ((i + 0) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.stacks));

            this.indices.push(((i + 0) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.stacks),
                ((i + 1) % (this.slices) + (j + 0) * this.slices) % (this.slices * this.stacks),
                ((i + 1) % (this.slices) + (j + 1) * this.slices) % (this.slices * this.stacks));
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
};
