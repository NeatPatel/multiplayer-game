var Back2mainMenu = pc.createScript('back2mainMenu');

Back2mainMenu.prototype.initialize = function() {
    const app = this.app;
    this.entity.button.on('pressedend', function() {
        if (confirm('Are you sure you want to leave the game and return to menu?')) {
            // Get a reference to the scene's root object
            var oldHierarchy = app.root.findByName('Root');
            
            // Get the path to the scene
            var scene = app.scenes.find('Menu');
            
            // Load the scenes entity hierarchy
            var progress = 0;
            var transitionLoading = setInterval(function() {
                progress++;
                app.setProgress(progress/32);
            }, 10);

            app.scenes.loadSceneHierarchy(scene.url, function (err, parent) {
                if (err) console.error('Error switching scenes\n', err);
                clearInterval(transitionLoading);
                app.hideSplash();
                oldHierarchy.destroy();
                app.fire('start'); // trigger menu to show again
            });
            
            app.showSplash();
            // oldHierarchy.destroy();
        }
    }, this);
};