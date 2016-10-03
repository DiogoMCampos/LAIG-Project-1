/**
 * MyTriangle
 * @constructor
 */
function MyTriangle(scene) {
   CGFobject.call(this, scene);

   this.parseAttributes(xmlNode);
   this.initBuffers();
}

function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
   CGFobject.call(this, scene);

   this.x1 = x1;
   this.y1 = y1;
   this.z1 = z1;
   this.x2 = x2;
   this.y2 = y2;
   this.z2 = z2;
   this.x3 = x3;
   this.y3 = y3;
   this.z3 = z3;

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

MyTriangle.prototype.parseAttributes = function (xmlNode){
  this.x1 = this.scene.reader.getFloat(xmlNode, 'x1');
  this.y1 = this.scene.reader.getFloat(xmlNode, 'y1');
  this.z1 = this.scene.reader.getFloat(xmlNode, 'z1');
  this.x2 = this.scene.reader.getFloat(xmlNode, 'x2');
  this.y2 = this.scene.reader.getFloat(xmlNode, 'y2');
  this.z2 = this.scene.reader.getFloat(xmlNode, 'z2');
  this.x3 = this.scene.reader.getFloat(xmlNode, 'x3');
  this.y3 = this.scene.reader.getFloat(xmlNode, 'y3');
  this.z3 = this.scene.reader.getFloat(xmlNode, 'z3');
};
