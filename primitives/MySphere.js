/**
 * MySphere
 * @constructor
 */
 function MySphere(scene, xmlNode) {
    CGFobject.call(this, scene);

    this.parseAttributes(xmlNode);
    this.initBuffers();
 }

function MySphere(scene, radius, slices, stacks) {
   CGFobject.call(this, scene);

   this.slices = slices;
   this.stacks = stacks;
   this.radius = radius;
   this.initBuffers();
}

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function() {

  this.vertices = [];
  this.indices = [];
  this.normals = [];
  this.texCoords = [];
  this.textS = 1.0 / this.slices;
  this.textT = 1.0 / this.stacks;

  var angLat = 2 * Math.PI / this.slices;
  var angVert =  Math.PI/ this.stacks;
  var s=0;
  var t=1;
   //Vertices & Normals
   for (var ind = this.stacks; ind >=0; ind--) {

     s=0;

      for (var m = 0; m < this.slices; m++) {
         this.vertices.push(Math.cos(angLat * m) *Math.sin(angVert * ind) * this.radius ,
                              Math.sin(angLat * m) *Math.sin(angVert * ind) * this.radius,
                              Math.cos(angVert * ind) * this.radius);
         this.normals.push (Math.cos(angLat * m) *Math.sin(Math.PI-angVert * ind) ,
                              Math.sin(angLat * m) *Math.sin(Math.PI-angVert * ind) ,
                              Math.sin(angVert * ind));
         s +=this.textS;
         this.texCoords.push(s,t);

      }
      t -=this.textT;
   }

   //Indices
   for (var j = 0; j < this.stacks; j++) {
      for (var i = 0; i < (this.slices); i += 1) {
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
