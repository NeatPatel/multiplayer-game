var Hurt = pc.createScript('hurt');

Hurt.prototype.initialize = function() {
    this.network = this.app.root.children[0].script.network;
    this.centerOverlay = this.app.root.findByPath('Root/2D Screen/Center Overlay');
    this.hurtTimer = 0;
};

Hurt.prototype.update = function(dt) {
    var serverPosition = this.network.players[this.network.id].serverPosition;
    if (Math.abs(serverPosition.x) > 60 || Math.abs(serverPosition.y) > 60) {
        this.entity.element.enabled = true;
        this.centerOverlay.element.enabled = true;
        if (this.hurtTimer < 5) {
            this.hurtTimer += dt;
            this.entity.element.opacity += (this.hurtTimer / 5 + 0.3 - this.entity.element.opacity) / 5;
            this.centerOverlay.element.text = this.network.ws.readyState !== WebSocket.OPEN ? "Waiting for server..." : "Return to the map! " + (5-Math.floor(this.hurtTimer));
        }
    } else {
        this.centerOverlay.element.enabled = this.centerOverlay.element.text == "Waiting for server..." && this.network.ws.readyState !== WebSocket.OPEN;
        if (this.hurtTimer > 0) {
            this.hurtTimer -= dt * 2;
            this.entity.element.opacity += (this.hurtTimer / 5 - this.entity.element.opacity) / 5;
        } else {
            this.entity.element.enabled = false;
        }
    }
};