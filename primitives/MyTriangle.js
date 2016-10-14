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
        0, 1, 2,
    ];

    var a = Math.sqrt(Math.pow(this.x1-this.x2, 2) + Math.pow(this.y1-this.y2, 2) + Math.pow(this.z1-this.z2, 2));
    var b = Math.sqrt(Math.pow(this.x2-this.x3, 2) + Math.pow(this.y2-this.y3, 2) + Math.pow(this.z2-this.z3, 2));
    var c = Math.sqrt(Math.pow(this.x3-this.x1, 2) + Math.pow(this.y3-this.y1, 2) + Math.pow(this.z3-this.z1, 2));

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
