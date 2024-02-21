 pc.script.createLoadingScreen(function (app) {
    //show "Dominationz.io" as the tab name [doesn't work inside frame]
    document.title = "Dominationz.io";

    var favicon = document.querySelector("link[rel='icon']");
    if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        document.head.appendChild(favicon);
    }
    favicon.href = 'https://cdn.discordapp.com/attachments/796149410643443783/926249831402446879/dominationz_logo_1.png';

    var i = window.location.href.indexOf('?');
    app.debugMode = (i != -1 && new URLSearchParams(window.location.href.slice(i)).get('debug') == 'true');

    app.showSplash = function () {
        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        // splash
        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        splash.style.display = 'block';//'none';

        // var logo = document.createElement('img');
        // logo.src = 'https://cdn.discordapp.com/attachments/796149410643443783/926249831402446879/dominationz_logo_1.png';//'https://playcanvas.com/static-assets/images/play_text_252_white.png';
        // splash.appendChild(logo);
        // logo.onload = function () {
        //     splash.style.display = 'block';
        // };

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        splash.appendChild(container);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);
    };

    app.hideSplash = function() {
        var splash = document.getElementById('application-splash-wrapper');
        if (splash) splash.parentElement.removeChild(splash);
    };

    app.setProgress = function (value) {
        var bar = document.getElementById('progress-bar');
        if(bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }
    };

    var preload = function() {
        var asset = app.assets.get(64392090);
        var menuCss = pc.createStyle(asset.resource || '');
        document.head.appendChild(menuCss);
        if (!asset.loaded) {
            asset.on('load', function() {
                menuCss.innerHTML = asset.resource;
            });
            app.assets.load(asset);
        }

        var bootstrap = document.createElement('link');
        bootstrap.rel = 'stylesheet';
        bootstrap.href = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css';
        document.head.appendChild(bootstrap);

        var jquery = document.createElement('script');
        jquery.addEventListener('load', function() {
            var bootstrapjs = document.createElement('script');
            bootstrapjs.src = 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/js/bootstrap.bundle.min.js';
            document.head.appendChild(bootstrapjs);
        });
        jquery.src = 'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.slim.min.js';
        document.head.appendChild(jquery);

        var popper = document.createElement('script');
        popper.src = 'https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js';
        document.head.appendChild(popper);
    };

    var appStart = function () {
        if (app.root.children[0].name == "Menu") { // if the current scene is menu, not main
            var asset = app.assets.get(64364375);
            var div = document.createElement('div');
            div.id = 'dominationz-menu';
            div.style.position = 'absolute';
            div.style.margin = 'auto';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.overflow = 'auto';
            document.body.appendChild(div);

            var addMenuEvents = function() {
                document.getElementById('controls').addEventListener('click', function() {
                    $('#credits').removeClass("active");
                    $('#credits').addClass("text-white");
                    $('#credits').parent().removeClass("bg-white rounded-top");
                    $(this).removeClass("text-white"); // in an event handler, 'this' refers to the element that triggered the event
                    $(this).addClass("active");
                    $(this).parent().addClass("bg-white rounded-top");

                    document.getElementById('controlsText').style.display = 'block';
                    document.getElementById('creditsText').style.display = 'none';
                });
                document.getElementById('credits').addEventListener('click', function() {
                    $('#controls').removeClass("active");
                    $('#controls').addClass("text-white");
                    $('#controls').parent().removeClass("bg-white rounded-top");
                    $(this).removeClass("text-white");
                    $(this).addClass("active");
                    $(this).parent().addClass("bg-white rounded-top");

                    document.getElementById('controlsText').style.display = 'none';
                    document.getElementById('creditsText').style.display = 'block';
                });
                document.getElementById('play').addEventListener('click', function() {
                    app.nicknameToSend = document.getElementById('nickname').value || 'Dominator'; // store somewhere that other scripts can access
                    var oldHierarchy = app.root.findByName('Menu');
                    var scene = app.scenes.find('Main');

                    var progress = 0;
                    var transitionLoading = setInterval(function() {
                        progress++;
                        app.setProgress(progress/32);
                    }, 10);
                    
                    app.scenes.loadSceneHierarchy(scene.url, function(err, newRoot) {
                        if (err) console.error('Error switching scenes\n', err);
                        clearInterval(transitionLoading);
                        app.hideSplash();
                    });
                    app.showSplash();
                    oldHierarchy.destroy();
                    asset.off('load');
                    div.remove();
                });
                 document.getElementById('nickname').addEventListener('keyup', function(event) {
                    // trigger play button when pressing enter on input
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        document.getElementById('play').click();
                    }
                });
            };

            if (asset.loaded) {
                div.innerHTML = asset.resource;
                addMenuEvents();
            } else {
                asset.on('load', function() {
                    div.innerHTML = asset.resource;
                    addMenuEvents();
                });
                app.assets.load(asset);
            }
        }

        var el = $('<input type="text" class="form-control" placeholder="Enter chat message" maxlength="50" />');
        el.css({
            position: 'absolute',
            width: 'auto',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }).hide();
        // el.on('input', function(event) {});
        $('body').append(el);
        app.chatMessageBox = el;

        app.hideSplash();
    };

    app.on('preload:start', preload);
    app.on('preload:progress', app.setProgress);
    app.on('preload:end', function () {
        app.off('preload:progress');
    });
    app.on('start', appStart);

    var style = pc.createStyle([
        'body {',
        '    background-color: #283538;',
        '}',
        '',
        '#application-splash-wrapper {',
        '    position: absolute;',
        '    top: 0;',
        '    left: 0;',
        '    height: 100%;',
        '    width: 100%;',
        '    background: url(https://cdn.discordapp.com/attachments/796149410643443783/926249832199364628/dominationzio_classic.png) top/cover no-repeat;',
        '    background-color: #283538;',
        '}',
        '',
        '#application-splash {',
        '    position: absolute;',
        '    top: calc(50% - 28px);',
        '    width: 264px;',
        '    left: calc(50% - 132px);',
        '}',
        '',
        '#application-splash img {',
        '    width: 100%;',
        '}',
        '',
        '#progress-bar-container {',
        '    margin: 20px auto 0 auto;',
        '    height: 10px;',
        '    width: 100%;',
        '    background-color: #1d292c;',
        '}',
        '',
        '#progress-bar {',
        '    width: 0%;',
        '    height: 100%;',
        '    background-color: #f60;',
        '}',
        '',
        '@media (max-width: 480px) {',
        '    #application-splash {',
        '        width: 170px;',
        '        left: calc(50% - 85px);',
        '    }',
        '}'
    ].join('\n'));
    document.head.appendChild(style);
    app.showSplash();
});