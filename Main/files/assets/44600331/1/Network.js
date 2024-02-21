var Network = pc.createScript('network');

Network.attributes.add('startingItemID', {
    type: 'number'
});

// initialize code called once per entity
Network.prototype.initialize = function() {
    // ws variable used for connections
    const ws = new WebSocket('wss://low-tangy-dibble.glitch.me');
    console.log('Connecting to wss://low-tangy-dibble.glitch.me...');
    this.joinGameStartTime = new Date();
    this.ws = ws;
    this.player = this.app.root.findByName('Player');
    this.other = this.app.root.findByName('Other');
    this.centerOverlay = this.app.root.findByPath('Root/2D Screen/Center Overlay');
    this.lb = [];
    // ping/fps stuff
    this.timer = 0;
    this.pingCounter = 0;
    this.fps = 0;
    this.prevFps = 0;
    this.isPinging = false;
    
    // this.score = 0;
    this.initialized = false;
    this.players = [];

    const listeners = [
        (event) => {
            let json = {cmd: 'playerData', name: this.app.nicknameToSend};
            ws.send(JSON.stringify(json));
        },
        (message) => {
            if (message.data == 'pong') {
                console.debug('pong message recieved')
                this.app.root.findByPath('Root/2D Screen/Status Counters/Ping Counter').element.text = `Ping: ${Math.floor(this.pingCounter * 1000)}`;
                this.isPinging = false;
                this.pingCounter = 0;
                return;
            }
            let json;
            try {
                json = JSON.parse(message.data);
            } catch(err) {
                console.error(`Unparsable message from server: ${message.data}\n`, err);
                return;
            }
            console.debug(json.cmd + ' message recieved')
            // console.log('basic data recieved: ', message.data);
            if (!this.initialized) {
                if (json.cmd == 'playerData') {
                    //The player's data and other players in the server
                    this.initializePlayers(json.data);
                }
            } else switch(json.cmd) {
                //The player has joined
                case 'playerJoined':
                    this.addPlayer(json.data);
                    break;
                //The player moved event
                case 'playerMoved':
                    this.movePlayer(json.data);
                    break;
                //The player left
                case 'playerLeft':
                    this.destroyUnit(json.data);
                    break;
                case 'updateItem':
                    this.findItemChanger(json.data);
                    break;
                case 'itemUse':
                    this.makeItemUse(json.data);
                    break;
                case 'scoreUpdated':
                    this.scoreAdder(json.data);
                    break;
                case 'updatePosition':
                    this.movePlayer(json.data);
                    // console.log('data recieved');
                    break;
                case 'rotate':
                    this.rotatePlayer(json.data);
                    break;
                case 'itemBuy_update':
                    this.itemBoughtUpdate(json.data);
                    break;
                case 'updateKeys':
                    this.keysUpdate(json.data);
                    break;
                case 'itemSold':
                    this.itemSoldUpdate(json.data);
                    break;
                case 'chatMessage':
                    this.createChatBubble(json.data);
                    break;
            }
            this.centerOverlay.element.enabled = false;
        },
        (event) => {
            event.preventDefault();
            event.returnValue = '';
        }
    ];
    
    ws.addEventListener('open', listeners[0]);
    
    ws.addEventListener('message', listeners[1]);
    
    ws.addEventListener('close', event => {
        console.log('Connection to server closed.\n', event);
        if (this.initialized) {
            if (event.reason == 'death') {
                this.centerOverlay.element.text = "You died";
                this.player.enabled = false;
                this.initialized = false;
                this.app.root.findByPath('Root/2D Screen/Hurt').script.enabled = false;
                this.app.root.findByPath('Root/2D Screen/Leaderboard').script.enabled = false;
                this.entity.findByName('Player Nickname').enabled = false;
            } else this.centerOverlay.element.text = "Waiting for server...";
            this.centerOverlay.element.enabled = true;
            this.app.root.findByPath('Root/2D Screen/Main Menu Button').enabled = true;
        }
    });

    window.addEventListener('beforeunload', listeners[2]);
    
    // window.addEventListener('unload', (event) => {
    //     if (this.initialized) {
    //         let json = {'cmd': 'playerLeft', 'id': this.id};
    //         ws.send(JSON.stringify(json));
    //     }
    // });

    this.once('destroy', function() {
        ws.removeEventListener('open', listeners[0]);
        ws.removeEventListener('message', listeners[1]);
        window.removeEventListener('beforeunload', listeners[2]);
        this.initialized = false;
        ws.close(1000, 'return to menu');
    });

    this.tempCtx = document.createElement('canvas').getContext('2d');
    this.tempCtx.font = 'Montserrat'; // need to import it
};

// update code called every frame
Network.prototype.update = function(dt) {
    if (!this.initialized) return;
    // PING COUNTER
    if (this.isPinging) this.pingCounter += dt;

    this.timer += dt;
    this.fps++;
    if(this.timer >= 1) {
        if (!this.isPinging) {
            if(this.ws.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            } else this.centerOverlay.element.text = "Waiting for server...";
            this.isPinging = true;
            this.pingCounter = 0;
        }
        this.app.root.findByPath('Root/2D Screen/Status Counters/FPS Counter').element.text = `FPS: ${this.fps}`;
        this.prevFps = this.fps;
        this.timer = 0;
        this.fps = 0;
    }

    for (var e of this.players) {
        if (!e) continue; // skip if the value is null
        let x = e.keysPressed[3] - e.keysPressed[1];
        let y = e.keysPressed[0] - e.keysPressed[2];

        if (e.keysPressed[4] && e.dashTimer && e.dashTimer > 0) {
            x += Math.cos(e.angle + 1.571) * 3;
            y += Math.sin(e.angle + 1.571) * 3;
        }

        if (x || y) {
            // const val = 256 / (this.prevFps || 30);
            // x *= val;
            // y *= val;
            x *= 4;
            y *= 4;
        }// else if (!this.player.script.movement.dash && !this.player.script.movement.wasImpulse && e.entity) e.entity.script.p2Body.body.velocity = [0, 0];//P2::MARKME get back to me later!
        if (e.entity) {
            const pos = e.entity.getPosition();
            pos.x += x / 48;
            pos.y += y / 48;
            // e.entity.setPosition(pos);
            if (!e.cspSleep) {
                if (e.serverPosition.distance(pos) > 0.2) {
                    console.log('lerping player', e.id);
                    e.entity.setPosition(new pc.Vec3().lerp(pos, e.serverPosition, 0.1));
                } else e.cspSleep = true;
            } else e.entity.setPosition(pos);
        }
        // ^^^^^^^^^ prevents error when player leaves
    }
};

Network.prototype.initializePlayers = function(data) {
    this.players = data.players;
    // Create a player array and populate it with the currently connected players.

    this.id = data.id;
    // Keep track of what ID number you are.

    const lbList = [];
    for(var id in this.players) { // For every player already connected, create a new entity.
        if(this.players[id]) {
            lbList.push(this.players[id]);
            if (id != this.id) {
                this.players[id].entity = this.createPlayerEntity(this.players[id]);
                this.players[id].serverPosition = this.players[id].entity.getPosition().clone();
                this.players[id].cspSleep = true;
            }
        }
    }
    this.scoreAdder(lbList);

    this.player.enabled = true;
    this.player.setPosition(data.position.x, data.position.y, 1);
    this.players[this.id].entity = this.player;
    this.players[this.id].serverPosition = this.player.getPosition().clone();
    this.players[this.id].cspSleep = true;
    this.centerOverlay.element.enabled = false; // Hide "Waiting for server" text
    this.initialized = true; // Mark that the client has received data from the server.
    this.app.root.findByPath('Root/2D Screen/Main Menu Button').enabled = false;

    var playerNick = this.app.root.findByName('Nickname').clone();
    playerNick.script.nickname.ownerEntity = this.player;
    playerNick.element.text = this.players[this.id].nickname;
    this.entity.addChild(playerNick);
    playerNick.enabled = true;
    playerNick.name = 'Player Nickname';

    this.app.root.findByPath('Root/2D Screen/Hurt').script.enabled = true;
    this.app.root.findByPath('Root/2D Screen/Leaderboard').script.enabled = true;

    console.log(`Joined game in ${new Date() - this.joinGameStartTime} ms`);
};

Network.prototype.createPlayerEntity = function(data) {
    var newPlayer = this.other.clone();
    // Create a new player entity.

    newPlayer.enabled = true;
    // Enable the newly created player.

    this.other.parent.addChild(newPlayer);
    // Add the entity to the entity hierarchy.

    newPlayer.setPosition(data.position.x, data.position.y, 1);
    newPlayer.setEulerAngles(0, 0, data.angle * 180 / 3.14159);
    // If a location was given, teleport the new entity to the position of the connected player.
    
    if(data.holdingItem) {
        var instance = this.app.assets.get(data.holdingItem.assetId).resource.instantiate();
        newPlayer.addChild(instance);
        newPlayer.script.otherPlayer.otherHeldItem = instance;
    }
    // console.log('createPlayerEntity called', data);
    for (var e of newPlayer.children) {
        if (data.holdingItem) {
            if (e.script && e.script.has('meleeWeapon') && e.script.meleeWeapon.assetID != data.holdingItem.assetId) e.enabled = false;
        } else e.enabled = false;
        
    }

    var newNick = this.app.root.findByName('Nickname').clone();
    newNick.script.nickname.ownerEntity = newPlayer;
    newNick.element.text = data.nickname;
    this.entity.addChild(newNick);
    newNick.enabled = true;
    // add nickname to the new player

    return newPlayer;
    // Return the new entity.
};

Network.prototype.addPlayer = function(data) {
    if(data.id != this.id && this.players[data.id] !== null) {
        this.players[data.id] = data;
        this.players[data.id].entity = this.createPlayerEntity(this.players[data.id]);
        this.players[data.id].serverPosition = new pc.Vec3(data.position.x, data.position.y, this.player.getPosition().z);
        this.players[data.id].cspSleep = true;
        this.scoreAdder([data]);
    }
    // this.updateScore(); // when a player joins, all players will updateScore and send their scores to the player, and the player will updateScore and send its score to the others
};

Network.prototype.movePlayer = function(data) {
    if(this.initialized && this.players[data.id] !== null && this.players[data.id].entity !== null) {
        this.players[data.id].serverPosition.x = data.position.x;
        this.players[data.id].serverPosition.y = data.position.y;
        this.players[data.id].cspSleep = false;
        if (this.app.debugMode && this.id == data.id) this.entity.findByName('Server Position').setPosition(data.position.x, data.position.y, 0.5);
    }
};
Network.prototype.keysUpdate = function(data) {
    this.players[data.id].keysPressed = data.keys;
    this.players[data.id].dashTimer = data.dashTimer;
};
Network.prototype.rotatePlayer = function(data) {
    if(this.initialized && data.id != this.id && this.players[data.id] !== null && this.players[data.id].entity !== null) {
        this.players[data.id].entity.setEulerAngles(0, 0, data.angle * 180 / 3.14159);
        this.players[data.id].angle = data.angle;
    }
};

Network.prototype.destroyUnit = function(data) {
    if(this.players[data.id] && this.players[data.id].entity) {
        this.players[data.id].entity.destroy();
        delete this.players[data.id];
    }
    // sync players with server players
    data.players.forEach((player, id) => {
        if (player) {
            if (!this.players[id]) { // if the client's player array is somehow missing a player that the server's player array has
                this.players[id] = player;
                player.entity = this.createPlayerEntity(player);
                player.serverPosition = player.entity.getPosition().clone();
                player.cspSleep = true;
            } else for (const i in player) {
                this.players[id][i] = player[i];
            }
        }
    });
};

Network.prototype.changeItem = function() {
    if(this.initialized) {
        let heldItem = this.player.script.movement.heldItem || null;
        let json = {'cmd': 'changeOtherItem', 'id': this.id, 'heldItem': heldItem ? heldItem.script.meleeWeapon.assetID : null};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};

Network.prototype.sendKeyDown = function(key) {
    if(this.initialized) {
        this.players[this.id].keysPressed[key] = true;
        json = {'cmd': 'keyDown', 'key': key}; // , 'id': this.id, 'knockback': returnVal, 'idArray': idArray};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};

Network.prototype.sendChatMessage = function(msg) {
    if(this.initialized) {
        let json = {cmd: 'chatMessage', text: msg};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};

Network.prototype.sendBuyItem = function(ID) {
    if(this.initialized) {
        json = {'cmd': 'buyItem', 'ID': ID};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};
Network.prototype.itemBoughtUpdate = function(data) {
    if(this.initialized && this.players[data.id] !== null && this.players[data.id].entity !== null) {
        // var templateAsset = this.app.assets.get(data.itemID);
        // var instance = templateAsset.resource.instantiate();
        // this.entity.addChild(instance);

        // let slotEntity = this.other.children.find(value => value.script && value.script.has('meleeWeapon') && value.script.meleeWeapon.assetID == data.itemID);
        this.scoreAdder([data]);
        // this.players[data.id].score = data.score;
        /* if (this.id == data.id) {
            this.player.addChild(instance);
            this.player.script.score.score = data.score;
        } else {
            this.players[data.id].entity.addChild(instance);
        } */
        var slotEntity;
        if(this.id == data.id) {
            var templateAsset = this.app.assets.get(data.itemID);
            var instance = templateAsset.resource.instantiate();
            this.player.addChild(instance);
            slotEntity = instance;
            slotEntity.enabled = false;
        } else slotEntity = this.players[data.id].entity.children.find(value => value.script && value.script.has('meleeWeapon') && value.script.meleeWeapon.assetID == data.itemID);

        if(this.id == data.id) {
            let itemSlot;
            if (slotEntity) switch(data.slot) {
                // held item
                case 1:
                    if(this.player.script.movement.heldItem) this.player.script.movement.heldItem.enabled = false;
                    slotEntity.enabled = true;
                    this.player.script.movement.heldItem = slotEntity;
                    break;
                // first inventory slot
                case 2:
                    itemSlot = this.player.script.movement.slotOne;
                    itemSlot.findByName('Item').element.sprite = slotEntity.script.meleeWeapon.inventoryImg.resource;
                    itemSlot.script.inventorySlot.currentItem = slotEntity;
                    break;
                // second inventory slot
                case 3:
                    itemSlot = this.player.script.movement.slotTwo;
                    itemSlot.findByName('Item').element.sprite = slotEntity.script.meleeWeapon.inventoryImg.resource;
                    itemSlot.script.inventorySlot.currentItem = slotEntity;
                    break;
            }
        } else if(data.slot == 1) {
            // let slotEntity = this.other.children.find(value => value.script.meleeWeapon.assetID == data.itemID);
            if (this.players[data.id].entity.script.otherPlayer.otherHeldItem) this.players[data.id].entity.script.otherPlayer.otherHeldItem.enabled = false;
            this.players[data.id].entity.script.otherPlayer.otherHeldItem = slotEntity;
            slotEntity.enabled = true;
        }
    }
};
Network.prototype.itemSoldUpdate = function(data) {
    if(this.initialized && this.players[data.id] !== null && this.players[data.id].entity !== null) {
        this.scoreAdder([data]);
        // this.players[data.id].score = data.score;
        if(this.id == data.id) {
            if(this.player.script.movement.heldItem) {
                this.player.script.movement.heldItem.destroy();
                this.player.script.movement.heldItem = null;
            }
        } else if (this.players[data.id].entity.script.otherPlayer.otherHeldItem) {
            this.players[data.id].entity.script.otherPlayer.otherHeldItem.enabled = false;
            this.players[data.id].entity.script.otherPlayer.otherHeldItem = null;

        }
    }
};

Network.prototype.sendKeyUp = function(key) {
    if(this.initialized) {
        this.players[this.id].keysPressed[key] = false;
        json = {'cmd': 'keyUp', 'key': key}; // , 'id': this.id, 'knockback': returnVal, 'idArray': idArray};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};
Network.prototype.itemSell = function() {
    if(this.initialized) {
        json = {'cmd': 'sellItem'};
        if(this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(json));
        } else this.centerOverlay.element.text = "Waiting for server...";
    }
};

Network.prototype.findItemChanger = function(data) {
    if(this.players[data.id] && this.players[data.id].entity && data.id != this.id)
        this.players[data.id].entity.script.otherPlayer.changeHeldItem(data.holdingItem);
};

Network.prototype.makeItemUse = function(data) {
    if(data.id != this.id && this.players[data.id]) {
        this.players[data.id].entity.script.otherPlayer.useHeldItem();
        // if(data.knockback > 0) {
        //     for(var i = 0; i < data.idArray.length; i++) {
        //         if(parseInt(data.idArray[i]) === this.id) {
        //             this.players[data.id].entity.script.otherPlayer.useHeldItem();
        //             break;
        //         }
        //     }
        // }
    }
};

Network.prototype.scoreAdder = function(data) {
    /* if(this.initialized && this.players[data.id] !== null && this.players[data.id].entity !== null) {
        this.lb.push([data.id, data.entScore]);
        console.log(this.lb);
    } */
    
    for (let i = 0; i < data.length; i++) {
        // if ID already exists, change the score. If ID doesnt exist, add it to array.
        let lbValue = this.lb.find(value => value.ID == data[i].id);
        if (lbValue) {
            lbValue.score = data[i].score;
        } else this.lb.push({'ID': data[i].id, 'score': data[i].score}); 
        // stores score value (used visually for UI and can't manipulate game)
        if (this.id == data[i].id) {
            this.player.script.score.score = data[i].score;
        }
    }
};

Network.prototype.rotate = function(angle) {
    this.players[this.id].angle = angle;
    let json = {'cmd': 'rotate', 'angle': angle}; // , 'id': this.id, 'knockback': returnVal, 'idArray': idArray};
    if(this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(json));
    } else this.centerOverlay.element.text = "Waiting for server...";
};

Network.prototype.createChatBubble = function(data) {
    if (this.players[data.id] && this.players[data.id].entity && data.text) {
        const clone = this.app.root.findByName('Chat Bubble').clone();
        clone.script.nickname.ownerEntity = this.players[data.id].entity;
        clone.script.nickname.yOffset = 2;
        this.entity.addChild(clone);
        clone.enabled = true;
        clone.script.chatBubble.textEntity.element.text = data.text;
        // clone.element.width = clone.script.chatBubble.textEntity.element.width + 0.5;
        // clone.element.width = data.text.length / 2;
        clone.element.width = this.tempCtx.measureText(data.text).width / 16;
    }
};