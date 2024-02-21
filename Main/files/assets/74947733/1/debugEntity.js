// attach this script to entities in the scene that are for debug only

var DebugEntity = pc.createScript('debugEntity');

DebugEntity.prototype.initialize = function() {
    if (!this.app.debugMode) this.entity.destroy();
};