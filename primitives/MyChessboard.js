/**
 * ChessBoard
 * @constructor
 */

function MyChessboard(scene, id, data) {
    this.scene = scene;
    this.id = id;
    this.data = data;
    this.createObject();
}

MyChessboard.prototype = Object.create(CGFnurbsObject.prototype);
MyChessboard.prototype.constructor = MyChessboard;

MyChessboard.prototype.createObject = function(){
    var specs = {};
    specs.dimX = this.data.dimX;
    specs.dimY = this.data.dimY;
    specs.partsX = this.data.du*10;
    specs.partsY = this.data.dv*10;
    Plane.call(this,this.scene, this.id, specs);
};
