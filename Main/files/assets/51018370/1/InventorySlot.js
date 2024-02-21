var InventorySlot = pc.createScript('inventorySlot');

InventorySlot.attributes.add('currentItem', {
   type: 'entity' 
});

InventorySlot.attributes.add('slotImage', {
   type: 'entity' 
});

InventorySlot.attributes.add('blankImg', {
    type: 'asset',
    assetType: 'sprite'
});

// initialize code called once per entity
InventorySlot.prototype.initialize = function() {
    this.currentItem = null;
};

InventorySlot.prototype.itemSwap = function(newItem) {
    if (newItem) {
        this.slotImage.element.sprite = newItem.script.meleeWeapon.inventoryImg.resource;
        newItem.enabled = false;
    }
    else {
        this.slotImage.element.sprite = this.blankImg.resource;
    }
    let oldItem = this.currentItem;
    this.currentItem = newItem;
    return oldItem;
};