function CircularAnimation(id, duration) {
    Animation.call(this, id, duration);
}

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;
