/**
 * MyRectangle
 * @constructor
 */

 function MyRectangle(scene, xmlNode){
   CGFobject.call(this,scene);

   this.parseAttributes(xmlNode);
   this.initBuffers();

 }

 function MyRectangle(scene, x1, y1, x2, y2){
   CGFobject.call(this,scene);


     this.x1 = x1;
     this.y1 = y1;
     this.x2 = x2;
     this.y2 = y2;

   this.initBuffers();

 }



 MyRectangle.prototype = Object.create(CGFobject.prototype);
 MyRectangle.prototype.constructor = MyRectangle;


 MyRectangle.prototype.initBuffers = function() {
   this.vertices = [
  	this.x1, this.y1, 0,
  	this.x2, this.y1, 0,
  	this.x1, this.y2, 0,
  	this.x2, this.y2, 0
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

   this.primitiveType = this.scene.gl.TRIANGLES;
   this.initGLBuffers();
};


MyRectangle.prototype.parseAttributes = function (xmlNode){
  this.x1 = this.scene.reader.getFloat(xmlNode, 'x1');
  this.y1 = this.scene.reader.getFloat(xmlNode, 'y1');
  this.x2 = this.scene.reader.getFloat(xmlNode, 'x2');
  this.y2 = this.scene.reader.getFloat(xmlNode, 'y2');
};
