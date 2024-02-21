var Nickname = pc.createScript('nickname');

Nickname.attributes.add('ownerEntity', {
    type: 'entity'
});

Nickname.attributes.add('yOffset', {
    type: 'number',
    default: 1
});

Nickname.prototype.initialize = function() {
    this.ownerEntity.on('destroy', function() {
        this.entity.destroy();
    }, this);
    this.targetPosition = this.ownerEntity.getPosition();
};

Nickname.prototype.update = function() {
    if (this.targetPosition) this.entity.setPosition(this.targetPosition.x, this.targetPosition.y + this.yOffset, 2);
};