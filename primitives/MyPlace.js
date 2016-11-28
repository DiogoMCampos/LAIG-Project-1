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
};
