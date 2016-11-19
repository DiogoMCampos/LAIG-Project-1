/**
 * MyRectangle
 * @constructor
 */

function MyRectangle(scene, id, coords) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id = id;
    this.coordinates = coords;
    this.initBuffers();

}

MyRectangle.prototype = Object.create(CGFobject.prototype);
MyRectangle.prototype.constructor = MyRectangle;


MyRectangle.prototype.initBuffers = function() {
    var coords = this.coordinates;
    this.vertices = [
        coords.x1, coords.y1, 0,
        coords.x2, coords.y1, 0,
        coords.x1, coords.y2, 0,
        coords.x2, coords.y2, 0
    ];

    this.indices = [
        0, 1, 2,
        3, 2, 1
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.texCoords = [0,1,
                    1,1,
                    0,0,
                    1,0
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
