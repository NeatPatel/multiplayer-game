var ItemBox = pc.createScript('itemBox');

ItemBox.attributes.add('itemCost', {
   type: 'number',
   default: 50 
});
ItemBox.attributes.add('itemID', {
   type: 'string'
});

const green = new pc.Color().fromString('#7eee91');
const red = new pc.Color().fromString('#ee7e7e');
let notice;

ItemBox.prototype.initialize = function() {
   this.network = this.app.root.children[0].script.network;
   this.itemBox = this.entity.findByName('Item Box BG');

   this.playerScriptComponent = this.app.root.findByName('Player').script;
   this.playerScriptComponent.score.on('attr:score', this.updateScore, this);
   this.updateScore(this.playerScriptComponent.score.score); // set colors initially
   this.entity.findByName('Item Box Button').button.on('pressedend', this.press, this);
   
   if (!notice) notice = this.app.root.findByPath('Root/2D Screen/Shop/Notice');
};

ItemBox.prototype.updateScore = function(value) {
   this.itemBox.element.color = value >= this.itemCost ? green : red;
};

ItemBox.prototype.press = function() {
   if (notice) {
      if (this.playerScriptComponent.score.score < this.itemCost) {
         notice.findByName('Text').element.text = 'Cannot afford item!';
         notice.enabled = true;
         setTimeout(function() {
            notice.enabled = false;
         }, 1000);
         return;
      }
      if (this.playerScriptComponent.movement.heldItem && this.playerScriptComponent.movement.slotOne.script.inventorySlot.currentItem && this.playerScriptComponent.movement.slotTwo.script.inventorySlot.currentItem) {
         notice.findByName('Text').element.text = 'Weapon slots full!';
         notice.enabled = true;
         setTimeout(function() {
            notice.enabled = false;
         }, 1000);
         return;
      }
   }
   this.network.sendBuyItem(this.itemID);
};