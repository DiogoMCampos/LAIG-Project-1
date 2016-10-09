/**
 * MyTriangle
 * @constructor
 */
function MyTriangle(scene, info, reader) {
    CGFobject.call(this, scene);
    this.scene = scene;
    this.reader = reader;
    this.id = info.id;
    this.parseAttributes(info.element);
    this.initBuffers();
}

MyTriangle.prototype = Object.create(CGFobject.prototype);
MyTriangle.prototype.constructor = MyTriangle;

MyTriangle.prototype.initBuffers = function() {
    this.vertices = [
        this.x1, this.y1, this.z1,
        this.x2, this.y2, this.z2,
        this.x3, this.y3, this.z3,
    ];

    this.indices = [
        0, 2, 1,
    ];

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyTriangle.prototype.parseAttributes = function(xmlNode) {
    this.x1 = this.reader.getFloat(xmlNode, "x1");
    this.y1 = this.reader.getFloat(xmlNode, "y1");
    this.z1 = this.reader.getFloat(xmlNode, "z1");
    this.x2 = this.reader.getFloat(xmlNode, "x2");
    this.y2 = this.reader.getFloat(xmlNode, "y2");
    this.z2 = this.reader.getFloat(xmlNode, "z2");
    this.x3 = this.reader.getFloat(xmlNode, "x3");
    this.y3 = this.reader.getFloat(xmlNode, "y3");
    this.z3 = this.reader.getFloat(xmlNode, "z3");
};
