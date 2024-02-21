var MenuCameraBouncy = pc.createScript('menuCameraBouncy');

MenuCameraBouncy.prototype.initialize = function() {
    this.movementVec = new pc.Vec3(0.05, 0.05, 0); // the speed of the camera
    this.entity.setPosition(Math.random() * 100 - 50, Math.random() * 100 - 50, 500.05); // initial position scramble
    this.posVec = this.entity.getPosition();
};

MenuCameraBouncy.prototype.update = function() {
    this.entity.setPosition(this.posVec.add(this.movementVec));
    if (Math.abs(this.posVec.x) > 50) {
        this.movementVec.set(-this.movementVec.x, this.movementVec.y, 0);
    }
    if (Math.abs(this.posVec.y) > 50) {
        this.movementVec.set(this.movementVec.x, -this.movementVec.y, 0);
    }
};