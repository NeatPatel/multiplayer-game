var Score = pc.createScript('score');

Score.attributes.add('score', {
    type: 'number',
    default: 0
});

Score.attributes.add('holdingItem', {
    type: 'string'
});

Score.prototype.initialize = function() {
    this.attributeUI = this.app.root.findByPath('Root/2D Screen/Attribute Holder/Score Attribute');
    this.on('attr', this.updateText, this);
    this.displayNames = {
        beastBlade: 'Beast Blade',
        dualKatana: 'Dual Katana',
        midnightShriek: 'Midnight Shriek',
        ultraSpear: 'Ultra Spear',
        axe: 'AXE',
        boomerang: 'Boomerang',
        kingSword: 'Kings Sword',
        masterSword: 'Master Sword',
        theBoot: 'The BOOT'
    };
};

Score.prototype.updateText = function() {
    this.attributeUI.element.text = this.holdingItem ? `Score: ${this.score}\n${this.displayNames[this.holdingItem]}` : 'Score: '+this.score;
};