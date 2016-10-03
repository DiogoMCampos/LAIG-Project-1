/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, xmlNode) {
   CGFobject.call(this, scene);

    this.parseAttributes(xmlNode);

   this.baseCircle = new MyCircle(this.scene, slices, baseRadius);
   this.topCircle = new MyCircle(this.scene, slices, topRadius);

   this.initBuffers();
}

function MyCylinder(scene, base, top, height, slices, stacks) {
   CGFobject.call(this, scene);

   this.baseRadius = base;
   this.topRadius = top;
   this.heightCylinder = height;
   this.slices = slices;
   this.stacks = stacks;

   this.baseCircle = new MyCircle(this.scene, slices, this.baseRadius);
   this.topCircle = new MyCircle(this.scene, slices, this.topRadius);

   this.initBuffers();
}

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function() {

   this.vertices = [];
   this.indices = [];
   this.normals = [];
   this.texCoords = [];

   var diff = (this.baseRadius - this.topRadius) / this.stacks;

   var ang = 2 * Math.PI / this.slices;
   var n=0;
   var tCoord = 1;
   var sPatch = 1/this.slices;
   var tPatch = 1/this.stacks;

   //Vertices & Normals
   for (var ind = 0; ind <= this.stacks; ind++) {

      var sCoord = 0;

      for (var m = 0; m < this.slices; m++) {
         this.vertices.push(Math.cos(ang * m) * (this.baseRadius - diff*ind),
                              Math.sin(ang * m) * (this.baseRadius - diff*ind),
                              n);
         this.texCoords.push(sCoord, tCoord);
         this.normals.push(Math.cos(ang * m), Math.sin(ang * m), 0);
         sCoord += sPatch;
      }
      tCoord -= tPatch;
      n += this.heightCylinder/this.stacks;
   }

   //Indices
   for (var j = 0; j < this.stacks; j++) {
      for (var i = 0; i <= (this.slices); i += 1) {
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

MyCylinder.prototype.display = function() {

   CGFobject.prototype.display.call(this);
    this.baseCircle.display();
    this.scene.rotate(Math.PI,1,0,0);
    this.scene.translate(0,0,-this.heightCylinder);
    this.topCircle.display();
};

MyCylinder.prototype.parseAttributes = function (xmlNode){
  this.baseRadius = this.scene.reader.getFloat(xmlNode, 'base');
  this.topRadius = this.scene.reader.getFloat(xmlNode, 'top');
  this.heightCylinder = this.scene.reader.getFloat(xmlNode, 'height');
  this.slices = this.scene.reader.getFloat(xmlNode, 'slices');
  this.stacks = this.scene.reader.getFloat(xmlNode, 'stacks');
};
