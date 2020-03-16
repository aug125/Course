class Meca { 

    sendSettings() {
        if (meca.power.isChanged == true) {
            socket.emit("power", meca.power.value);
            meca.power.isChanged = false;
        }
        if (meca.weapon.isChanged == true) {
            socket.emit("weapon", meca.weapon.value);
            meca.weapon.isChanged = false;
        }
        if (meca.shield.isChanged == true) {
            socket.emit("shield", meca.shield.value);
            meca.shield.isChanged = false;
        }
        if (meca.repare.isChanged == true) {
            socket.emit("repare", meca.repare.value);
            meca.repare.isChanged = false;
        }    
    };


    preload (phaser)
    {

        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
        phaser.load.plugin('rexsliderplugin', url, true);
    
        phaser.load.image('manette', 'manette.png');
        
        // Nécessaire pour corriger le bug du slider
        phaser.scale.setGameSize(game.config.width, game.config.height);


    }

    create (phaser)
    {
        // Statistiques du vaisseau
        meca.baseShipStats = new Stats("meca");
        meca.energy = meca.baseShipStats.initialCharge;

        // Gestion du relachement du clic gauche
        phaser.input.on('pointerup', function (pointer) {        
            meca.sendSettings();        
        }, phaser);    

        // Ajout du texte de puissance restante
        meca.textEnergie = phaser.add.text(160,game.config.height *4.1/5, "ÉNERGIE RESTANTE").setStyle({
            fontSize: '35px',
            fontFamily: 'Arial',
            color: "#ffffff",
            align: 'center'
        });

        // Ajout du texte de puissance restante
        meca.textEnergieValue = phaser.add.text(200, game.config.height *4.4/5, meca.energy + " GW" ).setStyle({
            fontSize: '55px',
            fontFamily: 'Arial',
            color: "#44ff44",
            align: 'center'
        });

        // Ajout des sliders
        meca.power  = meca.createSlider(phaser, "PUISSANCE", game.config.width / 5, game.config.height * 3 /5, 1, '#ffaaaa');
        meca.weapon = meca.createSlider(phaser, "ARMEMENT", game.config.width* 2 / 5, game.config.height * 3 /5, 1, '#aaffaa');
        meca.shield = meca.createSlider(phaser, "BOUCLIER", game.config.width * 3 / 5, game.config.height * 3 /5, 1, '#aaaaff');
        meca.repare = meca.createSlider(phaser, "REPARATIONS", game.config.width * 4 / 5, game.config.height * 3 /5, 1, '#bbbbbb');
    
    }

    update (time, delta, phaser) {

    }	

   createSlider(game,  text, posX, posY, size, color) {



            // Création du slider de puissance
            let object = game.add.image(posX, posY, 'manette');
            object.originY = 1;        
            object.slider = game.plugins.get('rexsliderplugin').add(object, {
            endPoints: [{
                    x: object.x,
                    y: object.y - 100 * size
                },
                {
                    x: object.x,
                    y: object.y + 100 * size
                }
            ],
            value: 1
            });

            object.isChanged = false;

            // Trait
            game.add.graphics()
            .lineStyle(3, 0x888888, 1)
            .strokePoints(object.slider.endPoints);

            // Mettre la manette au premier plan
            object.setDepth(1);


            object.value = 0;
            object.textValue = game.add.text(object.x - 45,object.y + 40, object.value +" GW")
            .setStyle({
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#ffffff',
                align: 'center'
            });
            object.textName = game.add.text(object.x - 100,object.y + 80, text)
            .setStyle({
                fontSize: '38px',
                fontFamily: 'Arial',
                color: color,
                align: 'center'
            });
    
            object.slider.on('valuechange', function(newValue, prevValue){  
                    object.isChanged = true; 
                    object.value = (1-newValue); 
                    object.textValue.setText(Math.round(object.value * 100) + " GW");
                    meca.energy = Math.round(meca.baseShipStats.initialCharge - (meca.power.value + meca.weapon.value + meca.shield.value + meca.repare.value) * 100);
                    meca.textEnergieValue.setText(meca.energy + " GW");
                    if (meca.energy >= 0) {
                        meca.textEnergieValue.setColor("#44ff44");
                    }
                    else {
                        meca.textEnergieValue.setColor("#ff4444");
                    }

                }
            );

            game.cursorKeys = game.input.keyboard.createCursorKeys();
            return object;

    };
}

meca_preload = function() {
    meca.preload(this);
}

meca_create = function() {
    meca.create(this);
}

meca_update = function(time, delta) {
    meca.update(time, delta, this);
}