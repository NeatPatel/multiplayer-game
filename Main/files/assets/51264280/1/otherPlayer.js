var OtherPlayer = pc.createScript('otherPlayer');

OtherPlayer.attributes.add('otherHeldItem', {
    type: 'entity'
});

OtherPlayer.attributes.add('blankItem', {
    type: 'asset',
    assetType: 'template'
});

OtherPlayer.attributes.add('realPlayer', {
    type: 'entity'
});

OtherPlayer.attributes.add('isTouchingItem', {
    type: 'boolean',
    default: false
});
OtherPlayer.attributes.add('ID', {
    type: 'number',
});

OtherPlayer.prototype.changeHeldItem = function(heldItem) {
    if (this.otherHeldItem) this.otherHeldItem.enabled = false;
    var instance = this.entity.children.find(value => value.script && value.script.has('meleeWeapon') && heldItem && value.script.meleeWeapon.assetID == heldItem.assetId); //heldItem ? this.app.assets.get(heldItem.assetId).resource.instantiate() : this.blankItem.resource.instantiate();
    if (instance) instance.enabled = true;
};

OtherPlayer.prototype.useHeldItem = function() {
    if(this.otherHeldItem) {
        this.otherHeldItem.script.meleeWeapon.useItem();
    }
};