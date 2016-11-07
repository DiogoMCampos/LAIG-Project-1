function LinearAnimation(id, duration) {
    Animation.call(this, id, duration);
}

LinearAnimation.prototype = Object.create(Animation.prototype);
LinearAnimation.prototype.constructor = LinearAnimation;
