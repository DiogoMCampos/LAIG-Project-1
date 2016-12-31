function LinearAnimation(scene, id, duration, controlPoints, rotateFlag) {
    Animation.call(this, id, duration);
    
    this.scene = scene;

    this.controlPoints = controlPoints;
    this.currTime = -1;
    this.finished = false;
    this.matrix = mat4.create();

    if (rotateFlag !== undefined && rotateFlag) {
        this.rotateFlag = true;
    } else {
        this.rotateFlag = false;
    }

    this.calculateDistance();
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.calculateDistance = function() {
    this.totalDistance = 0;
    this.movementVectors = [];
    this.movementDistance = [];
    this.movementAngles = [];
    this.intermediateDistance = [];

    var initialMove = [];
    var initialPoint = this.controlPoints[0];

    initialMove.push(
        initialPoint.x,
        initialPoint.y,
        initialPoint.z
    );

    var initialAngle = Math.atan2(
        this.controlPoints[1].z - this.controlPoints[0].z,
        - this.controlPoints[1].x + this.controlPoints[0].x
    );

    this.movementVectors.push(initialMove);
    this.movementDistance.push(0);
    this.movementAngles.push(initialAngle);
    this.intermediateDistance.push(0);

    for (var i = 1; i < this.controlPoints.length; i++) {
        var movement = [];

        var origin = this.controlPoints[i - 1];
        var destination = this.controlPoints[i];

        movement.push(
            destination.x - origin.x,
            destination.y - origin.y,
            destination.z - origin.z
        );

        var distance = Math.sqrt(
            Math.pow(movement[0], 2) +
            Math.pow(movement[1], 2) +
            Math.pow(movement[2], 2)
        );

        var angle = Math.atan2(movement[2], movement[0]);

        this.movementVectors.push(movement);
        this.movementDistance.push(distance);
        this.movementAngles.push(angle);
        this.intermediateDistance.push(0);
        this.totalDistance += distance;
    }

    this.speed = this.totalDistance / this.duration;

    this.currMove = 0;
};

LinearAnimation.prototype.getTransformationMatrix = function(time) {
    var timeVar, translation, angle;

    if (this.finished === true || time === undefined) {
        return this.matrix;
    }

    if (this.currTime === -1) {
        this.currTime = time;
    }

    timeVar = time - this.currTime;

    var dist = timeVar / 1000 * this.speed * (this.scene.animationSpeed / 100);

    this.intermediateDistance[this.currMove] += dist;

    if (Math.abs(this.intermediateDistance[this.currMove]) >= Math.abs(this.movementDistance[this.currMove])) {
        this.intermediateDistance[this.currMove] = this.movementDistance[this.currMove];
        this.currMove++;
    }

    this.currTime = time;

    this.matrix = mat4.identity(this.matrix);

    if (this.currMove >= this.movementVectors.length) {
        this.finished = true;

        mat4.identity(this.matrix);
        var lastControlPoint = this.controlPoints.length - 1;
        translation = vec3.fromValues(
            this.controlPoints[lastControlPoint].x,
            this.controlPoints[lastControlPoint].y,
            this.controlPoints[lastControlPoint].z
        );

        angle = this.movementAngles[lastControlPoint];
    } else {
        var x = 0, y = 0, z = 0;

        for (var i = 0; i <= this.currMove; i++) {
            var distPerc;
            if (this.movementDistance[i] === 0) {
                distPerc = 1;
            } else {
                distPerc = this.intermediateDistance[i] / this.movementDistance[i];
            }

            x += this.movementVectors[i][0] * distPerc;
            y += this.movementVectors[i][1] * distPerc;
            z += this.movementVectors[i][2] * distPerc;
        }

        translation = vec3.fromValues(x, y, z);

        angle = this.movementAngles[this.currMove];
    }

    mat4.translate(this.matrix, this.matrix, translation);

    if (!this.rotateFlag) {
        mat4.rotateY(this.matrix, this.matrix, -angle);
    }

    return this.matrix;
};
