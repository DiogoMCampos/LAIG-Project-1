function CircularAnimation(animationInfo) {
    Animation.call(this, animationInfo.id, animationInfo.duration);

    this.center = vec3.fromValues(animationInfo.centerx, animationInfo.centery, animationInfo.centerz);
    this.radius = animationInfo.radius;

    this.startAng = animationInfo.startang * Math.PI / 180;
    this.rotAng = animationInfo.rotang * Math.PI / 180;

    if (this.rotAng > 0) {
      this.direction = Math.PI * 0.5;
    } else {
      this.direction = - Math.PI * 0.5;
    }

    this.currAng = this.startAng;
    this.finalAng = this.startAng + this.rotAng;

    this.angVar = this.rotAng / this.duration;

    this.currTime = -1;
    this.finished = false;
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.getTransformationMatrix = function(time) {
    var timeVar;

    if (this.finished === true || time === undefined) {
        return this.matrix;
    }

    if (this.currTime === -1) {
        timeVar = 0;
    } else {
        timeVar = time - this.currTime;
    }

    this.currTime = time;

    var angle = this.currAng + (this.angVar * timeVar / 1000);

    var matrix = mat4.create();
    mat4.translate(matrix, matrix, this.center);
    mat4.rotateY(matrix, matrix, angle);
    mat4.translate(matrix, matrix, vec3.fromValues(this.radius, 0, 0));
    mat4.rotateY(matrix, matrix, this.direction);

    this.currAng = angle;

    if (this.currAng >= this.finalAng && this.rotAng >= 0 || this.currAngle <= this.finalAng && this.rotAng < 0) {
        this.finished = true;
        this.matrix = matrix;
    }

    return matrix;
};
