/**
 * MySphere
 * @constructor
 */
function MySphere(scene, id, data) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id = id;
    this.data = data;
    this.initBuffers();
}


MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];
    this.data.textS = 1.0 / this.data.slices;
    this.data.textT = 1.0 / this.data.stacks;

    var angLat = 2 * Math.PI / this.data.slices;
    var angVert = Math.PI / this.data.stacks;
    var s = 0;
    var t = 1;

    //Vertices & Normals
    for (var ind = this.data.stacks; ind >= 0; ind--) {

        s = 0;

        for (var m = 0; m < this.data.slices; m++) {

            var nX = Math.cos(angLat * m) * Math.sin(angVert * ind);
            var nY = Math.sin(angLat * m) * Math.sin(angVert * ind);
            var nZ = Math.cos(angVert * ind);
            this.vertices.push(nX * this.data.radius,
                nY * this.data.radius,
                nZ * this.data.radius);
            this.normals.push(nX, nY, nZ);

            this.texCoords.push(Math.asin(nX)/ Math.PI + 0.5, Math.asin(nY)/ Math.PI + 0.5);

        }
        t -= this.data.textT;
    }

    //Indices
    for (var j = 0; j < this.data.stacks; j++) {
        for (var i = 0; i < (this.data.slices); i++) {
            this.indices.push((i + 1) % (this.data.slices) + (j + 0) * this.data.slices,
                (i + 0) % (this.data.slices) + (j + 1) * this.data.slices,
                (i + 0) % (this.data.slices) + (j + 0) * this.data.slices);

            this.indices.push((i + 0) % (this.data.slices) + (j + 1) * this.data.slices,
                (i + 1) % (this.data.slices) + (j + 0) * this.data.slices,
                (i + 1) % (this.data.slices) + (j + 1) * this.data.slices);
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
