/**
 * MyPlace
 * @constructor
 */
function MyPlace(scene, column, line) {
    CGFplane.call(this, scene);
    this.column = column;
    this.line = line;
    this.id = "place";
    this.active = false;
}

MyPlace.prototype = Object.create(CGFplane.prototype);
MyPlace.prototype.constructor = MyPlace;

MyPlace.prototype.display = function() {
    this.scene.pushMatrix();
    this.scene.scale(0.833333, 0, 0.833333);
    if (this.scene.pickMode) {
        CGFplane.prototype.display.call(this);
    }
    this.scene.popMatrix();
};
