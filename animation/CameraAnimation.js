function CameraAnimation(distance, height) {
    this.distance = distance;
    this.height = height;

    this.on = false;

    this.startAngle = Math.PI / 2;
    this.angleDistance = Math.PI;
    this.finalAngle = this.startAngle + this.angleDistance;
    this.midPoint = (this.startAngle + this.finalAngle) / 2;

    this.currTime = -1;
    this.currAngle = this.startAngle;

    this.currPosition = vec3.fromValues(0, this.height, this.distance);
    this.rotationSpeed = 100;
    this.duration = 3000; // in ms
    this.angleSpeed = this.finalAngle / this.duration;
}

// Gets current camera position, given the current time
CameraAnimation.prototype.getPosition = function(time) {
    if (!this.on) {
        return this.currPosition;
    }

    var timeVar;

    if (this.currTime === -1) {
        timeVar = 0;
    } else {
        timeVar = time - this.currTime;
    }

    this.currTime = time;

    var angleDiff = timeVar * this.angleSpeed * (this.rotationSpeed/100);
    this.currAngle += angleDiff;

    if (this.currAngle >= this.finalAngle) {
        this.currTime = -1;
        this.on = false;

        this.startAngle = this.finalAngle;
        this.finalAngle += this.angleDistance;
        this.currAngle = this.startAngle;

        this.currPosition = vec3.fromValues(0, this.height, this.distance * Math.sin(this.currAngle));
    } else {
        var angle = this.currAngle;
        this.currPosition = vec3.fromValues(this.distance * Math.cos(angle), this.height, this.distance * Math.sin(angle));
    }

    return this.currPosition;
};
