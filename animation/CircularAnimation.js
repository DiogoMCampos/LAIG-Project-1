function CircularAnimation(id, duration, centerX, centerY, centerZ, radius, startAng, rotAng) {
    Animation.call(this, id, duration);

    this.center = vec3.fromValues(this.centerX, this.centerY, this.centerZ);
    this.radius = radius;

    this.startAng = startAng * 180 / Math.PI;
    this.rotAng = rotAng * 180 / Math.PI;

    this.currAng = startAng;
    this.finalAng = this.startAng + this.rotAng;

    this.angVar = this.rotAng / this.duration;

    this.currTime = -1;
    this.finished = false;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getTransformationMatrix = function(time) {
    var timeVar;

    if (this.currTime === -1) {
        timeVar = 0;
    } else {
        timeVar = time - this.currTime;
    }

    this.currTime = timeVar;

    var angle = this.startAng + (this.angVar * timeVar);

    var matrix = mat4.create();
    mat4.translate(matrix, matrix, this.center);
    mat4.rotate(matrix, matrix, ver3.fromValues(0, -angle, 0));
    mat4.translate(matrix, matrix, vec3.fromValues(this.radius, 0, 0));

    this.currAng += angle;
    if (this.currAng >= this.finalAng) {
        this.finished = true;
    }

    return matrix;
};
