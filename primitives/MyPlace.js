/**
 * MyPlace
 * @constructor
 */
function MyPlace(scene, column, line) {
    CGFplane.call(this, scene);
    this.column = column;
    this.line = line;
}

MyPlace.prototype = Object.create(CGFplane.prototype);
MyPlace.prototype.constructor = MyPlace;

MyPlace.prototype.display = function() {
    this.scene.pushMatrix();
        this.scene.scale(2, 2, 2);
        CGFplane.prototype.display.call(this);
    this.scene.popMatrix();

};
