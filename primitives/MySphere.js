/**
 * MySphere
 * @constructor
 */
function MySphere(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;
    this.parseAttributes(info.data);
    this.initBuffers();
}


MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];
    this.textS = 1.0 / this.slices;
    this.textT = 1.0 / this.stacks;

    var angLat = 2 * Math.PI / this.slices;
    var angVert = Math.PI / this.stacks;
    var s = 0;
    var t = 1;

    //Vertices & Normals
    for (var ind = this.stacks; ind >= 0; ind--) {

        s = 0;

        for (var m = 0; m < this.slices; m++) {

            var nX = Math.cos(angLat * m) * Math.sin(angVert * ind);
            var nY = Math.sin(angLat * m) * Math.sin(angVert * ind);
            var nZ = Math.cos(angVert * ind);
            this.vertices.push(nX * this.radius,
                nY * this.radius,
                nZ * this.radius);
            this.normals.push(nX, nY, nZ);

            this.texCoords.push(Math.asin(nX)/ Math.PI + 0.5, Math.asin(nY)/ Math.PI + 0.5);

        }
        t -= this.textT;
    }

    //Indices
    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < (this.slices); i++) {
            this.indices.push((i + 1) % (this.slices) + (j + 0) * this.slices,
                (i + 0) % (this.slices) + (j + 1) * this.slices,
                (i + 0) % (this.slices) + (j + 0) * this.slices);

            this.indices.push((i + 0) % (this.slices) + (j + 1) * this.slices,
                (i + 1) % (this.slices) + (j + 0) * this.slices,
                (i + 1) % (this.slices) + (j + 1) * this.slices);
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MySphere.prototype.parseAttributes = function(xmlNode) {

    this.radius = this.reader.getFloat(xmlNode, "radius");
    this.slices = this.reader.getInteger(xmlNode, "slices");
    this.stacks = this.reader.getInteger(xmlNode, "stacks");

    if(this.radius === null || isNaN(this.radius) || this.radius <= 0){
        console.warn();
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
