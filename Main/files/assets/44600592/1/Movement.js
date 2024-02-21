var Movement = pc.createScript('movement');

Movement.attributes.add('playerSpeed', {
    type: 'number',
    default: 300
});

Movement.attributes.add('dashTimer', {
    type: 'number',
    default: 100,
    max: 100,
    min: 0
});

Movement.attributes.add('cameraEntity', {
    type: 'entity'
});

Movement.attributes.add('progressEntity', {
   type: 'entity' 
});

Movement.attributes.add('slotOne', {
   type: 'entity' 
});

Movement.attributes.add('slotTwo', {
   type: 'entity' 
});

Movement.attributes.add('heldItem', {
   type: 'entity' 
});

Movement.attributes.add('rootEntity', {
   type: 'entity' 
});

Movement.attributes.add('wasImpulse', {
    type: 'boolean',
    default: false
});

Movement.attributes.add('dash', {
    type: 'boolean',
    default: false
});

Movement.attributes.add('cameraInert', {
    type: 'number',
    default: 0.05, // higher value = faster camera movement, must be between 0 (no movement) and 1 (sharp movement)
    min: 0,
    max: 1
});

// initialize code called once per entity
Movement.prototype.initialize = function() {
    const app = this.app;

    this.mousePosition = [0, 0];
    this.entityPos = this.entity.getPosition();
    this.cameraPos = this.cameraEntity.getPosition();
    
    app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
       
    /* var templateAsset = app.assets.get(51172161);
    var instance = templateAsset.resource.instantiate();
    this.entity.addChild(instance);
    this.heldItem = instance; */
    this.shopOpen = false;
    this.chatBoxOpen = false;
    
    const onkeyup = function (e) {
        if (e.key == pc.KEY_W || e.key == pc.KEY_UP) this.rootEntity.script.network.sendKeyUp(0);      
        if (e.key == pc.KEY_A || e.key == pc.KEY_LEFT) this.rootEntity.script.network.sendKeyUp(1);
        if (e.key == pc.KEY_S || e.key == pc.KEY_DOWN) this.rootEntity.script.network.sendKeyUp(2);
        if (e.key == pc.KEY_D || e.key == pc.KEY_RIGHT) this.rootEntity.script.network.sendKeyUp(3);    
        
        if (e.key == pc.KEY_SPACE) this.rootEntity.script.network.sendKeyUp(4);
        if (e.key == pc.MOUSEBUTTON_LEFT) this.rootEntity.script.network.sendKeyUp(7);
        e.event.preventDefault(); // Use original browser event to prevent browser action.
    };
    const onmouseup = function (e) {
        if (e.button == pc.MOUSEBUTTON_LEFT) this.rootEntity.script.network.sendKeyUp(7);
        e.event.preventDefault(); // Use original browser event to prevent browser action.
    };
    app.keyboard.on(pc.EVENT_KEYUP, onkeyup, this);
    app.mouse.on(pc.EVENT_MOUSEUP, onmouseup, this);
    this.keysPressed = [false, false, false, false, false]; // intended interpolation delay
    this.timer = 0;

    this.once('destroy', function() {
        // clear event listeners
        app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        app.keyboard.off(pc.EVENT_KEYUP, onkeyup, this);
        app.mouse.off(pc.EVENT_MOUSEUP, onmouseup, this);
        app.chatMessageBox.remove();
    });
};

// update code called every frame
Movement.prototype.update = function(dt) {
    const app = this.app;
    const chatBoxFocused = app.chatMessageBox.is(':focus');
    // this.x = 0;
    // this.y = 0; 
    
    this.cameraEntity.setPosition(
        pc.math.lerp(this.cameraPos.x, this.entityPos.x, this.cameraInert),
        pc.math.lerp(this.cameraPos.y, this.entityPos.y, this.cameraInert),
        500.05
    );

    /*
    // da interpolation
    if((app.keyboard.isPressed(pc.KEY_D)) || (app.keyboard.isPressed(pc.KEY_RIGHT)) || (app.keyboard.isPressed(pc.KEY_W)) || (app.keyboard.isPressed(pc.KEY_UP)) || (app.keyboard.isPressed(pc.KEY_A)) || (app.keyboard.isPressed(pc.KEY_LEFT)) || (app.keyboard.isPressed(pc.KEY_S)) || (app.keyboard.isPressed(pc.KEY_DOWN))) {
        this.x = +(app.keyboard.isPressed(pc.KEY_D) || app.keyboard.isPressed(pc.KEY_RIGHT));
        this.y = +(app.keyboard.isPressed(pc.KEY_W) || app.keyboard.isPressed(pc.KEY_UP));
        this.x -= +(app.keyboard.isPressed(pc.KEY_A) || app.keyboard.isPressed(pc.KEY_LEFT));
        this.y -= +(app.keyboard.isPressed(pc.KEY_S) || app.keyboard.isPressed(pc.KEY_DOWN));
    } 
    // the + converts the booleans to numbers (true = 1, false = 0)
    */

    if (app.keyboard.wasPressed(pc.KEY_ENTER)) {
        if (this.chatBoxOpen && chatBoxFocused) {
            const msg = app.chatMessageBox.val(); // get message, if they typed one in
            if (msg) {
                this.rootEntity.script.network.sendChatMessage(msg);
            }
            app.chatMessageBox.hide();
            app.chatMessageBox.val(''); // clear chat box
            this.chatBoxOpen = false;
        } else {
            app.chatMessageBox.show();
            app.chatMessageBox.focus();
            this.chatBoxOpen = true;
        }
        // app.root.findByPath('Root/2D Screen/Chat Box').enabled = this.chatBoxOpen;
    }
    if (app.keyboard.wasPressed(pc.KEY_ESCAPE)) {
        if (this.chatBoxOpen) {
            this.chatBoxOpen = false;
            app.chatMessageBox.hide();
            // app.root.findByPath('Root/2D Screen/Chat Box').enabled = false;
        } else if (this.shopOpen) {
            this.shopOpen = false;
            app.root.findByPath('Root/2D Screen/Shop').enabled = false;
        } else {
            const btn = app.root.findByPath('Root/2D Screen/Main Menu Button');
            btn.enabled = !btn.enabled;
        }
    }
    
    if (!this.chatBoxOpen || !chatBoxFocused) {
        if ((app.keyboard.wasPressed(pc.KEY_W) || app.keyboard.wasPressed(pc.KEY_UP))) {
            this.rootEntity.script.network.sendKeyDown(0);
        }
        if ((app.keyboard.wasPressed(pc.KEY_A) || app.keyboard.wasPressed(pc.KEY_LEFT))) {
            this.rootEntity.script.network.sendKeyDown(1);
        }
        if ((app.keyboard.wasPressed(pc.KEY_S) || app.keyboard.wasPressed(pc.KEY_DOWN))) {
            this.rootEntity.script.network.sendKeyDown(2);
        }
        if ((app.keyboard.wasPressed(pc.KEY_D) || app.keyboard.wasPressed(pc.KEY_RIGHT))) {
            this.rootEntity.script.network.sendKeyDown(3); 
        }
        if (app.keyboard.wasPressed(pc.KEY_SPACE)) {
            this.rootEntity.script.network.sendKeyDown(4);
        }
        if (app.mouse.wasPressed(pc.MOUSEBUTTON_LEFT)) {
            this.rootEntity.script.network.sendKeyDown(7);
        }
        if (app.keyboard.wasPressed(pc.KEY_G)) this.rootEntity.script.network.itemSell();
        if(app.keyboard.wasPressed(pc.KEY_B)) {
            this.shopOpen = !this.shopOpen;
            app.root.findByPath('Root/2D Screen/Shop').enabled = this.shopOpen;
        }
        const oldItem = this.heldItem;
        if(app.keyboard.wasPressed(pc.KEY_Q)) {
            this.heldItem = this.slotOne.script.inventorySlot.itemSwap(this.heldItem);
            if(this.heldItem) this.heldItem.enabled = true;
            if(this.heldItem && oldItem && this.heldItem.script.meleeWeapon.inventoryImg !== oldItem.script.meleeWeapon.inventoryImg) {
                this.rootEntity.script.network.sendKeyDown(5);
            }
            else if(!this.heldItem || !oldItem) {
                if(this.heldItem !== oldItem) {
                    this.rootEntity.script.network.sendKeyDown(5);
                }
            }
        }
        if(app.keyboard.wasPressed(pc.KEY_E)) {
            this.heldItem = this.slotTwo.script.inventorySlot.itemSwap(this.heldItem);
            if(this.heldItem) this.heldItem.enabled = true;
            if(this.heldItem && oldItem && this.heldItem.script.meleeWeapon.inventoryImg !== oldItem.script.meleeWeapon.inventoryImg) {
                this.rootEntity.script.network.sendKeyDown(6);
            }
            else if(!this.heldItem || !oldItem) {
                if(this.heldItem !== oldItem) {
                    this.rootEntity.script.network.sendKeyDown(6);
                }
            }
        }
    }

    let angle = Math.atan2(this.mousePosition[0] - window.innerWidth / 2, this.mousePosition[1] - window.innerHeight / 2) + 3.14159;
    angle = Math.round(angle * 100) / 100;
    const network = this.rootEntity.script.network;
    if (angle != network.players[network.id].angle) {
        network.player.setEulerAngles(0, 0, angle * 180 / 3.14159);
        network.rotate(angle);
    }


    this.dash = !chatBoxFocused && this.dashTimer > 0 && app.keyboard.isPressed(pc.KEY_SPACE);
    if (this.dash) {
        // this.entity.script.p2Body.body.applyForce([up.x * 3000 * dt, up.y * 3000 * dt]); // was multiplied by 50 before dt added in calculation
        if (this.dashTimer > 1) {
            // this.rootEntity.script.network.sendKeyDown(4);
            this.dashTimer -= 120 * dt;
        }
    }
    else if(!this.dash && this.dashTimer < 100) {
        this.dashTimer += 20 * dt;
    }
    else {
        this.dash = false;
    }
    this.progressEntity.script.progressBar.setProgress(this.dashTimer);
    

    var maxCooldown;
    var canAttack = false;
    if(this.heldItem) {
        maxCooldown = this.heldItem.script.meleeWeapon.itemCooldown; // max cooldown in seconds
        
        if(this.timer >= maxCooldown) {
            if(!canAttack) canAttack = true;
        } else {
            this.timer += dt;
            canAttack = false;
        }

        this.entity.script.score.holdingItem = this.heldItem.name;
    } else {
        this.entity.script.score.holdingItem = '';
    }
    if(canAttack && app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        if(this.heldItem) {
            this.heldItem.script.meleeWeapon.useItem();
            // this.rootEntity.script.network.sendKeyDown(7);
            canAttack = false;
            this.timer = 0;
        }
    }
    
    // interpolation movement
    /* if (this.x !== 0 || this.y !== 0) {
        this.x *= dt * this.playerSpeed;
        this.y *= dt * this.playerSpeed;
        if (this.dash) {
            this.x += Math.cos(this.entity.script.p2Body.body.angle + 1.571) * 20;
            this.y += Math.sin(this.entity.script.p2Body.body.angle + 1.571) * 20;
        }
        
    
        this.entity.script.p2Body.body.velocity = this.x != 0 && this.y != 0 ? [this.x * 0.95, this.y * 0.95] : [this.x, this.y];
        
    } */
    if (!this.dash && !this.wasImpulse)
    {
        // this.entity.script.p2Body.body.velocity = [0, 0];
    }
    // else if(this.wasImpulse) {
    //     this.dash = false;
    //     this.wasImpulse = false;
    // }
};

Movement.prototype.onMouseMove = function (event) {
    this.mousePosition[0] = event.x;
    this.mousePosition[1] = event.y;
};
