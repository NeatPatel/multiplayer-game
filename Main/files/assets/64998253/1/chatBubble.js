var ChatBubble = pc.createScript('chatBubble');

ChatBubble.prototype.initialize = function() {
    this.timer = 0;
    this.textEntity = this.entity.findByName('Text');
};

ChatBubble.prototype.update = function(dt) {
    this.timer += dt;
    if (this.timer > 5) {
        if (this.timer > 6) {
            this.entity.destroy();
        } else {
            this.entity.element.opacity = this.textEntity.element.opacity = (6 - this.timer) * 0.385;
        }
    }
};