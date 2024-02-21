var MeleeWeapon = pc.createScript('meleeWeapon');

MeleeWeapon.attributes.add('knockback', {
    type: 'number',
    default: 5
});

MeleeWeapon.attributes.add('itemCooldown', {
    type: 'number',
    default: 1
});

MeleeWeapon.attributes.add('sellAmount', {
    type: 'number'
});

//assetID is for the template's ID
MeleeWeapon.attributes.add('assetID', {
    type: 'number'
});

MeleeWeapon.attributes.add('inventoryImg', {
    type: 'asset',
    assetType: 'sprite'
});

MeleeWeapon.attributes.add('hitBoxPos', {
    type: 'vec2'
});

MeleeWeapon.attributes.add('itemHitBox', {
    type: 'entity'
});

MeleeWeapon.prototype.useItem = function() {
    this.entity.sprite.play('itemUsed');
};