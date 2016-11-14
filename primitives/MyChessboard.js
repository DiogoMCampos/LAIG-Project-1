/**
 * ChessBoard
 * @constructor
 */

function MyChessboard(scene, id, data) {
    this.scene = scene;

    this.data = data;

    this.createObject();
}

MyChessboard.prototype.createObject = function(){
    var object = new Plane(this.scene, 1.0, 1.0, this.du, this.dv);
};
