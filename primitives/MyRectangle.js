/**
 * MyRectangle
 * @constructor
 */

 function MyRectangle(scene, info, reader){
   CGFobject.call(this,scene);
   this.scene = scene;
   this.reader = reader;
   this.id = info.id;
   this.parseAttributes(info.element);
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

    this.x1 = this.reader.getFloat(xmlNode, 'x1');
    this.y1 = this.reader.getFloat(xmlNode, 'y1');
    this.x2 = this.reader.getFloat(xmlNode, 'x2');
    this.y2 = this.reader.getFloat(xmlNode, 'y2');
};
