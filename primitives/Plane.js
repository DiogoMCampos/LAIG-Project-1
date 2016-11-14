/**
 * Plane
 * @constructor
 */

function Plane(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;
    this.parseAttributes(info.data);
    this.initBuffers();

}

function Plane(scene, dimX, dimY, partsX, partsY) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;

    this.coordinates = {};
    this.coordinates.dimX = dimX;
    this.coordinates.dimY = dimY;
    this.coordinates.partsX = partsX;
    this.coordinates.partsY = partsY;

    this.initBuffers();

}

Plane.prototype = Object.create(CGFobject.prototype);
Plane.prototype.constructor = Plane;


Plane.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];

    var coords = this.coordinates;
    var yI = 0-coords.dimY/2;

    for (var i = 0; i <= coords.partsY; i++) {
        var xI = 0-coords.dimX/2;

        for (var j = 0; j <= coords.partsX; j++) {
            this.vertices.push(xI, yI);
            xI += (coords.dimX / coords.partsX);
        }
        yI += (coords.dimY / coords.partsY);
    }

    for (var j = 0; j < coords.partsY; j++) {
        for (var i = 0; i < coords.partsX; i++) {
            this.indices.push((i + 1) + (j + 0) * (coords.partsX),
                (i + 0)  + (j + 1) * (coords.partsX),
                (i + 0)  + (j + 0) * (coords.partsX));

            this.indices.push((i + 0)  + (j + 1) * (coords.partsX),
                (i + 1)  + (j + 0) * (coords.partsX),
                (i + 1)  + (j + 1) * (coords.partsX));
        }

    }

    /*this.texCoords = [0,1,
                    1,1,
                    0,0,
                    1,0
    ];*/

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};


Plane.prototype.parseAttributes = function(xmlNode) {
    this.coordinates = {};
    this.coordinates.dimX = this.reader.getFloat(xmlNode, "dimX");
    this.coordinates.dimY = this.reader.getFloat(xmlNode, "dimY");
    this.coordinates.partsX = this.reader.getInteger(xmlNode, "partsX");
    this.coordinates.partsY = this.reader.getInteger(xmlNode, "partsY");

    for (var coord in this.coordinates) {
        if (this.coordinates.hasOwnProperty(coord)) {
            if(this.coordinates[coord] === null || isNaN(this.coordinates[coord])){
                throw "primitive id: " + this.id + " has " + coord + " value not recognized";
            }
        }
    }
};
