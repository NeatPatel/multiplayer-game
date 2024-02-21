var ProgressBar = pc.createScript('progressBar');

// The entity that shows the fill image 
ProgressBar.attributes.add('progressImage', {type: 'entity'});
// The maximum width of the fill image
ProgressBar.attributes.add('progressImageMaxWidth', {type: 'number'});
ProgressBar.attributes.add('attributeMaxValue', {
    type: 'number',
    default: 100
});

ProgressBar.prototype.setProgress = function (value) {
    // set the width of the fill image element
    this.progressImage.element.width = value / this.attributeMaxValue * this.progressImageMaxWidth;
};