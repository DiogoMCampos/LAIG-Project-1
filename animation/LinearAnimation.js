function LinearAnimation(id, duration, controlPoints) {
    Animation.call(this, id, duration);
    this.controlPoints = controlPoints;

    calculateDistance();
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.calculateDistance = function() {
    this.totalDistance = 0;
    this.movementVectors = [];
    this.movementDistance = [];

    for (var i = 1; i < this.controlPoints.length; i++) {
        var movement = [];
        var origin = this.controlPoints[i - 1];
        var destination = this.controlPoints[i];

        movement.push(
            destination[0] - origin[0],
            destination[1] - origin[1],
            destination[2] - origin[2]
        );

        this.movementVectors.push(movement);

        var distance = Math.sqrt(
            Math.pow(movement[0], 2) +
            Math.pow(movement[1], 2) +
            Math.pow(movement[2], 2));

        this.totalDistance += distance;
        this.movementDistance,push(distance);
    }
};
