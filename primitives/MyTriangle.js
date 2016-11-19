/**
 * MyTriangle
 * @constructor
 */
function MyTriangle(scene, id, coords) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.id = id;
    this.coordinates = coords;
    this.initBuffers();
}

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {
    var coords = this.coordinates;
    this.vertices = [
        coords.x1, coords.y1, coords.z1,
        coords.x2, coords.y2, coords.z2,
        coords.x3, coords.y3, coords.z3,
    ];

    this.indices = [
        0, 1, 2,
    ];

    var a = Math.sqrt(Math.pow(coords.x1-coords.x2, 2) + Math.pow(coords.y1-coords.y2, 2) + Math.pow(coords.z1-coords.z2, 2));
    var b = Math.sqrt(Math.pow(coords.x2-coords.x3, 2) + Math.pow(coords.y2-coords.y3, 2) + Math.pow(coords.z2-coords.z3, 2));
    var c = Math.sqrt(Math.pow(coords.x3-coords.x1, 2) + Math.pow(coords.y3-coords.y1, 2) + Math.pow(coords.z3-coords.z1, 2));

    var cosA = (-Math.pow(a,2) + Math.pow(b,2) + Math.pow(c,2)) / (2*b*c);
    var cosB = (Math.pow(a,2) - Math.pow(b,2) + Math.pow(c,2)) / (2*c*a);
    var cosC = (Math.pow(a,2) + Math.pow(b,2) - Math.pow(c,2)) / (2*a*b);

    var sinC = Math.sqrt(1- Math.pow(cosC,2));

    this.texCoords = [a-b*cosC, b*sinC,
        0,0,
        a,0];

    var vec1 = {}, vec2 = {}, vecf = {};
    vec1.x = (coords.x3-coords.x1) / c; vec1.y = (coords.y3-coords.y1) / c; vec1.z = (coords.z3-coords.z1) / c;
    vec2.x = (coords.x2-coords.x1) / a; vec2.y = (coords.y2-coords.y1) / a; vec2.z = (coords.z2-coords.z1) / a;

    vecf.x = vec1.y*vec2.z - vec1.z*vec2.y;
    vecf.y = vec1.z*vec2.x - vec1.x*vec2.z;
    vecf.z = vec1.x*vec2.y - vec1.y*vec2.x;

    this.normals = [
        vecf.x, vecf.y, vecf.z,
        vecf.x, vecf.y, vecf.z,
        vecf.x, vecf.y, vecf.z
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
