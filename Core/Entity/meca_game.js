class Meca { 

    constructor() {
        this.shipStats = new Stats("meca");

        // Statistiques initiales du vaisseau
        this.sumEnergyUsed = 0;
        this.temperature = this.shipStats.initialTemperature;
        this.nextFailureVerification = Date.now();
        this.failuresPresent = [];
        this.failuresExisting = [];
        this.listModules = new Map();
        this.gameOver = false;


        this.initializeFailures();
    }

    initializeFailures() {
        this.failuresExisting.push(new Failure("DIRECTION_GAUCHE_BLOQUEE", 50));
    }

    sendSettings = function() {
        if (this.listModules.get("power").isChanged == true) {
            socket.emit("power", this.listModules.get("power").value);
            this.listModules.get("power").isChanged = false;
        }
        if (this.listModules.get("weapon").isChanged == true) {
            socket.emit("weapon", this.listModules.get("weapon").value);
            this.listModules.get("weapon").isChanged = false;
        }
        if (this.listModules.get("shield").isChanged == true) {
            socket.emit("shield", this.listModules.get("shield").value);
            this.listModules.get("shield").isChanged = false;
        }
        if (this.listModules.get("repare").isChanged == true) {
            socket.emit("repare", this.listModules.get("repare").value);
            this.listModules.get("repare").isChanged = false;
        }    
    };


    preload (phaser) {

        this.phaser = phaser;

        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
        phaser.load.plugin('rexsliderplugin', url, true);    
        phaser.load.image('manette', 'manette.png');
        
        // Nécessaire pour corriger le bug du slider
        phaser.scale.setGameSize(game.config.width, game.config.height);


    }

    create (phaser) {
        // Enregistrement de la caméra...
        this.camera = phaser.cameras.main;

        // Gestion du relachement du clic gauche
        phaser.input.on('pointerup', function (pointer) {        
            meca.sendSettings();        
        }, phaser);    


        this.textEnergie = phaser.add.text(game.config.width /2 - 30  ,game.config.height /2 - 20, "CONSOMMATION TOTALE").setStyle({
            fontSize: '18px',
            fontFamily: 'Arial',
            color: "#ffffff",
            align: 'center'
        });

        // Ajout du texte de puissance restante
        this.textEnergieValue = phaser.add.text(game.config.width /2 + 100,game.config.height /2, this.sumEnergyUsed + " GW" ).setStyle({
            fontSize: '24px',
            fontFamily: 'Arial',
            color: "#00c815",
            align: 'center'
        });

        // Ajout du texte de la température
        this.textTemperature = phaser.add.text(game.config.width /2 - 50  ,game.config.height /2 + 200, this.temperature + "°C" ).setStyle({
            fontSize: '46px',
            fontFamily: 'Arial',
            color: "#0046cc",
            align: 'center'
        });



        // Ajout des sliders
        this.listModules.set("power", this.createModule(phaser, "power",  "PUISSANCE", game.config.width * 1 / 5, game.config.height * 1 /5, 1, '0xff5500'));
        this.listModules.set("weapon", this.createModule(phaser, "weapon", "ARMEMENT", game.config.width* 4 / 5, game.config.height * 1 / 5, 1, '0x55ff00'));
        this.listModules.set("shield", this.createModule(phaser, "shield", "BOUCLIER", game.config.width * 1 / 5, 600, 1, '0x0055ff'));
        this.listModules.set("repare", this.createModule(phaser, "repare", "REPARATIONS", game.config.width * 4 / 5, 600, 1, '0xee21dd', false));
        this.listModules.set("principal", this.createModule(phaser, "principal", "SYSTÈME PRINCIPAL", game.config.width  / 2 , game.config.height  / 2, 1, '0xffffff', true, false));
    
        let self = this;

        //Sockets
        socket.on("damage",  function(damage) {
            self.onDamageReceived(damage);
        });	

    }

    update (time, delta, phaser) {        
            
            if (this.gameOver == true) {
                return;
            }

            // Définir la température à atteindre
            let targetTemperature = this.shipStats.initialTemperature + (this.sumEnergyUsed * (this.shipStats.maxTemperature-this.shipStats.initialTemperature) / this.shipStats.consommationMaxTemperature);
            const diffTemperature = targetTemperature - this.temperature;
            
            // Modifier la température
            this.temperature += diffTemperature * this.shipStats.coefficientChaleur * delta / 1000;

            this.temperature = Math.min(this.shipStats.maxTemperature, this.temperature);
            this.temperature = Math.max(this.shipStats.initialTemperature, this.temperature);

            this.textTemperature.setText(Math.round(this.temperature) + "°C");

            // Couleur d'affichage de la température
            const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,70,204,204,0,0, this.shipStats.maxTemperature-this.shipStats.initialTemperature, this.temperature - this.shipStats.initialTemperature );
            this.textTemperature.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));

            // Gestion de la surchauffe

            // Vérifier s'il s'est  écoulé suffisemment de temps avant un accident de surchauffe
            if (Date.now() >= this.nextFailureVerification){
 
                // Définir la prochaine vérification
                const min = this.shipStats.dureeMinimaleEntrePannes;
                const max = this.shipStats.dureeMaximaleEntrePannes;
                const nextFailureVerificationInterval = Math.random() * (max - min) + min
                this.nextFailureVerification = Date.now() + nextFailureVerificationInterval * 1000;

                // Une température trop élevée inflige des dégâts à un (ou plusieurs) module(s) au hasard
                const probaFailure = (this.temperature - this.shipStats.dangerTemperature) / (this.shipStats.maxTemperature - this.shipStats.dangerTemperature); 

                this.listModules.forEach(module => {
                    if (module.hasState == false) {
                        // le module ne peut pas casser
                        return;
                    }
                    const rand = Math.random();
                    if (rand < probaFailure) {
                        const randDamage = Math.random() * this.shipStats.degatsMaxSurchauffe;
                        this.damageModule(module, randDamage);
                    }

                });
            }

            // Réparations
            // Priorité de réparation au système
            let modulePrincipal = this.listModules.get("principal");
            if (modulePrincipal.state < 100) {
                modulePrincipal.state += this.listModules.get("repare").value * this.shipStats.vitesseReparation * delta / 1000;
                modulePrincipal.state = Math.min(modulePrincipal.state, 100);

            }
            else {
                // Compter le nombre de modules à - de 100%
                let nbBrokenModules = 0;
                this.listModules.forEach(module => {
                    if (module.hasState == false) {
                        return;
                    }
                    if (module.state < 100  && module.name != "principal") {
                        nbBrokenModules++;
                    }
                });


                // Réparer les modules cassés
                this.listModules.forEach(module => {
                    if (module.hasState == false) {
                        return;
                    }
                    if (module.state < 100 && module.name != "principal") {
                        module.state += this.listModules.get("repare").value / nbBrokenModules * this.shipStats.vitesseReparation * delta / 1000;
                        module.state = Math.min(module.state, 100);
                    }
                    else {
                        this.enableModule(module, true);
                    }
                });                
            }

            // Mettre à jour les états
            this.listModules.forEach(module => {
                if (module.hasState == false) {
                    return;
                }
                module.textState.setText("État : " + Math.round(module.state) + "%"); 
            });
            
        }	

   createModule(phaser, name, text, posX, posY, size, color, state = true, slider = true) {

        const colorSharp = color.replace("0x", "#");

        let module = {};
        module.name = name;
        module.isActivated = true;
        module.hasSlider = slider;
        module.hasState = state;
        module.state = 100;
        module.x = posX;
        module.y = posY;
        module.size = size;

        let graphics = phaser.add.graphics();        

        // Création de l'arrière plan
        graphics.lineStyle(2, color, 1);
        graphics.strokeRoundedRect(posX-250, posY-150, 450 * size, 400, 32);

        module.disableGraphics = phaser.add.graphics();

        module.value = 0;

        if (slider == true) {

            // Création du slider de puissance
            module.manette = phaser.add.image(posX, posY, 'manette');
            module.manette.originY = 1;        
            module.slider = phaser.plugins.get('rexsliderplugin').add(module.manette, {
            endPoints: [{
                    x: module.manette.x + 80,
                    y: module.manette.y - 100 
                },
                {
                    x: module.manette.x + 80,
                    y: module.manette.y + 100
                }
            ],
            value: 1
            });

            module.isChanged = false;

            // Trait
            phaser.add.graphics()
            .lineStyle(3, 0x888888, 1)
            .strokePoints(module.slider.endPoints);

            // Mettre la manette au premier plan
            module.manette.setDepth(1);


            module.textValue = phaser.add.text(posX-200, posY-50, module.value +" GW")
            .setStyle({
                fontSize: '32px',
                fontFamily: 'Arial',
                color: colorSharp,
                align: 'center'
            });

            module.slider.on('valuechange', function(newValue, prevValue){  
                module.isChanged = true; 
                module.value = (1-newValue); 
                module.textValue.setText(Math.round(module.value * 100) + " GW");
                meca.onValueChanged();
            });            
        }

        module.textName = phaser.add.text(posX-200, posY-120, text)
        .setStyle({
            fontSize: '38px',
            fontFamily: 'Arial',
            color: colorSharp,
            align: 'center'
        });

        if(state) {
            module.textState = phaser.add.text(posX-200, posY+60, "ÉTAT : " + module.state + "%")
            .setStyle({
                fontSize: '24px',
                fontFamily: 'Arial',
                color: colorSharp,
                align: 'center'
            });
        }

        return module;

    }

    enableModule(module, activate) {
        if (activate == false && module.isActivated == true) {
            module.disableGraphics.fillStyle(0x886666, 1);
            module.disableGraphics.fillRoundedRect(module.x-250, module.y-150, 450 * module.size, 400, 32);
            module.state = 0;
            if (module.hasSlider == true) {
                module.slider.value = 1; // Valeur inversée...
                module.slider.setEnable(false);
                module.isChanged = true;
                meca.sendSettings(); 
            }
        }
        else if (activate == true && module.isActivated == false) {
            module.disableGraphics.clear();
            if (module.hasSlider == true) {
                module.slider.setEnable(true);
            }
        }
        
        module.isActivated = activate;
    }

    damageModule(module, damage) {

        // On met des dégats au module
        module.state -= damage;
        module.state = Math.max(module.state, 0);
        
        // Vérifier si le module est HS
        if (module.state < 1) {
            this.enableModule(module, false);
            if (module.name == "principal" && this.gameOver == false) {
                // Game over. On supprime tout, on affiche le game over, on envoie l'info au pilote
                socket.emit("gameOver");
                this.gameOver = true;                
                // Passage à l'état game over 
                this.phaser.scene.start('GameOver');
            }                        
        }
    }

    onValueChanged(newValue) {

        this.sumEnergyUsed = 0;
        this.listModules.forEach(module => {
            this.sumEnergyUsed += module.value;
        });
        this.sumEnergyUsed *= 100;
        this.textEnergieValue.setText(Math.round(this.sumEnergyUsed ) + " GW");
        const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,200,20,200,0,0, this.shipStats.consommationMaxTemperature, Math.round(Math.min(this.sumEnergyUsed, this.shipStats.consommationMaxTemperature)));
        this.textEnergieValue.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));
    }

    // Received from pilote
    onDamageReceived(damage) {
        this.camera.shake(200,0.02);
        let module;
        const modules = Array.from(this.listModules.values());
        // Prendre un module au hasard       
        do {
            module = modules[Math.floor(Math.random()*modules.length)];
        } while (module.hasState == false);
        this.damageModule(module, damage);        
    }

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