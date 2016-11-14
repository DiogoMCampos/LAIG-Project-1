/**
 * ChessBoard
 * @constructor
 */

function MyChessboard(scene, du, dv, textureRef, su, sv) {
    this.scene = scene;

    this.du = du;
    this.dv = dv;
    this.textureRef = textureRef;
    this.su = su;
    this.sv = sv;

    this.createObject();
}

MyChessboard.prototype.createObject = function(){
    var object = new Plane(this.scene, 1.0, 1.0, this.du, this.dv);
};
