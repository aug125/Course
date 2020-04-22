class Meca extends Phaser.Scene { 

    constructor() {
        super('Meca');
        this.shipStats = new Stats("meca");

        // Statistiques initiales du vaisseau
        this.sumEnergyUsed = 0;
        this.temperature = this.shipStats.initialTemperature;
        this.nextFailureVerification = Date.now();
        this.failuresPresent = [];
        this.failuresExisting = [];
        this.listBonus = [];
        this.listEquipmentLocation = [];
        this.listModules = new Map();
        this.listUpgrade = new Map();
        this.gameOver = false;
        this.timeLastAskScan = 0;
        this.isRadarReceived = false;
        this.timeLastReceiveScan = 0;

        // scène actuellement affichée.
        this.currentScene = "cockpit";

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

    createModule(scene, name, text, posX, posY, color, state = true, slider = true) {

        const colorSharp = color.replace("0x", "#");

        let module = {};
        module.name = name;
        module.isActivated = true;
        module.hasSlider = slider;
        module.hasState = state;
        module.state = 100;
        module.x = posX;
        module.y = posY;

        // Création de l'arrière plan
        this.graphicsCockpit.lineStyle(2, color, 1);
        this.graphicsCockpit.strokeRoundedRect(posX-225, posY-150, 450, 350, 32);

        module.disableGraphics = scene.add.graphics();
        module.disableGraphics.setDepth(-1);
        module.value = 0;

        // Consommation du module
        module.textEnergyUsed = scene.add.text(posX + 120, posY + 170, module.value +" GW")
        .setStyle({
            fontSize: '24px',
            fontFamily: 'Calibri',
            color: colorSharp,
            align: 'center'
        });

        if (slider == true) {

            // Création du slider de puissance
            module.manette = scene.add.image(posX, posY, 'manette');
            module.manette.setTint(color);
            module.manette.originY = 1;        
            module.slider = scene.plugins.get('rexsliderplugin').add(module.manette, {
            endPoints: [{
                    x: module.manette.x,
                    y: module.manette.y - 75 
                },
                {
                    x: module.manette.x,
                    y: module.manette.y + 130
                }
            ],
            value: 1
            });

            module.isChanged = false;

            // Trait
            this.graphicsCockpit
            .lineStyle(3, 0x888888, 1)
            .strokePoints(module.slider.endPoints);

            // Mettre la manette au premier plan
            module.manette.setDepth(1);

            let self = this;
            module.slider.on('valuechange', function(newValue, prevValue){  
                module.isChanged = true; 
                module.value = (1-newValue); 
                module.textEnergyUsed.setText(Math.round(module.value * 100) + " GW");
                self.onValueChanged();
            });            
        }

        // Affichage du nom du module
        module.textName = scene.add.text(posX, posY - 120, text)
        .setStyle({
            fontSize: '38px',
            fontFamily: 'Arial',
            color: colorSharp
        });
        module.textName.setOrigin(0.5);

        // Affichage de l'état du module
        if(state) {
            module.textState = scene.add.text(posX-200, posY+160, "ÉTAT : " + module.state + "%")
            .setStyle({
                fontSize: '24px',
                fontFamily: 'Arial',
                color: colorSharp,
                align: 'center'
            });
        }

        if (module.name == "principal") {
        // Ces ajouts sont mis manuellement dans la partie "système principal"

            module.textEnergie = this.add.text(posX  - 20 , posY - 60, "CONSOMMATION\nACTUELLE").setStyle({
                fontSize: '18px',
                fontFamily: 'Arial',
                color: "#ffffff",
                align: 'right'
            });

            module.textEnergie.setOrigin(1,0);

            // Ajout du texte de puissance utilisée
            module.textEnergieValue = this.add.text(posX + 20, posY - 60, this.sumEnergyUsed + " GW" ).setStyle({
                fontSize: '24px',
                fontFamily: 'Arial',
                color: "#00c815",
                align: 'center'
            });

            // Ajout du texte de la température
            module.textTemperature = this.add.text(posX, posY  + 40, this.temperature + "°C" ).setStyle({
                fontSize: '46px',
                fontFamily: 'Arial',
                color: "#0046cc",
                align: 'center'
            });
            module.textTemperature.setOrigin(0.5);


            // Ajout du texte de la température avant dégats
            module.textTemperatureMax = this.add.text(posX , posY + 100, "Température maximale\ntolérée : " + this.shipStats.dangerTemperature + "°C" ).setStyle({
                fontSize: '24px',
                fontFamily: 'Arial',
                color: "#eecccc",
                align: 'center'
            });
            module.textTemperatureMax.setOrigin(0.5);
        }

        return module;

    }

    enableModule(module, activate) {
        if (activate == false && module.isActivated == true) {
            // Désactivation du module
            module.disableGraphics.clear();
            module.disableGraphics.fillStyle(0x886666, 1);
            module.disableGraphics.fillRoundedRect(module.x-225, module.y-150, 450, 350, 32);
            module.state = 0;
            if (module.hasSlider == true) {
                module.slider.value = 1; // Valeur inversée...
                module.slider.setEnable(false);
                module.isChanged = true;
                this.sendSettings(); 
            }

            // Dans le cas du radar, supprimer les points affichés
            if (module.name == "radar") {
                this.radarDots.getChildren().forEach(dot => {
                    dot.setVisible(false);
                    dot.setActive(false);
                });
                this.radarDots.clear();
            }

        }
        else if (activate == true && module.isActivated == false) {
            // Réactivation du module
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
                this.scene.start('GameOver');
            }                        
        }
        else if (module.isActivated == true) {
        // Supprimer l'ancien rectangle de couleur
            module.disableGraphics.clear();
            module.disableGraphics.fillStyle(0x440000, 1 - module.state / 100);
            module.disableGraphics.fillRoundedRect(module.x-225, module.y-150, 450 * module.size, 350, 32);    
        }
    }

    // Fonctions socket

    onValueChanged(newValue) {

        this.sumEnergyUsed = 0;
        this.listModules.forEach(module => {
            this.sumEnergyUsed += module.value;
        });
        this.sumEnergyUsed *= 100;
        this.listModules.get("principal").textEnergieValue.setText(Math.round(this.sumEnergyUsed ) + " GW");
        const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,200,20,200,0,0, this.shipStats.consommationMaxTemperature, Math.round(Math.min(this.sumEnergyUsed, this.shipStats.consommationMaxTemperature)));
        this.listModules.get("principal").textEnergieValue.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));
        
    }

    // Received from pilote
    onDamageReceived(damage) {
        console.log("degats");
        this.camera.shake(200,0.02);
        this.soundChocs[Math.floor(Math.random()*2)].play();
        let module;
        const modules = Array.from(this.listModules.values());
        // Prendre un module au hasard       
        do {
            module = modules[Math.floor(Math.random()*modules.length)];
        } while (module.hasState == false);
        this.damageModule(module, damage);        
    }

    onDataScanRadarReceived(scene, posJoueurX, posJoueurY, listEnnemis, portal) {

        // Le radar ne fonctionne qu'au cockpit
        if (this.currentScene != "cockpit") {
            return;
        }

        let minDistanceEnnemi = -1;

        scene.radarDots.getChildren().forEach(dot => {
            dot.setVisible(false);
            dot.setActive(false);
        });
        scene.radarDots.clear();
        
        const PosRadarX = game.config.width / 2;
        const PosRadarY = 680;

        // La taille du cercle du radar.
        const radarSize = 145;


        // Afficher un point pour chaque ennemi
        listEnnemis.forEach(ennemi => {

            if (!ennemi.visible) {
                return;
            }

            let offsetX = (ennemi.x - posJoueurX) / (this.shipStats.porteeRadar / radarSize);
            let offsetY = (ennemi.y - posJoueurY) / (this.shipStats.porteeRadar / radarSize);

            // On affiche pas le point s'il est trop éloigné du radar
            const distanceEnnemi = Math.sqrt((offsetX * offsetX)+(offsetY * offsetY));
            if ( distanceEnnemi > radarSize){
                return;
            }

            if (minDistanceEnnemi == -1 || distanceEnnemi < minDistanceEnnemi) {
                minDistanceEnnemi = distanceEnnemi;
            }

            scene.radarDots.add(scene.add.image(this.radar.x + offsetX, this.radar.y + offsetY , 'dot').setTint(0xff0000));
        });

        // Afficher le point pour le portail
        if (portal.visible) {
            let offsetX = (portal.x - posJoueurX) / (this.shipStats.porteeRadar / radarSize);
            let offsetY = (portal.y - posJoueurY) / (this.shipStats.porteeRadar / radarSize);
            // On affiche pas le point s'il est trop éloigné du radar

            const distanceRadar = Math.sqrt((offsetX * offsetX)+(offsetY * offsetY));
            if (distanceRadar <= radarSize){
                scene.radarDots.add(scene.add.image(this.radar.x + offsetX, this.radar.y + offsetY , 'dot').setTint(0x0022ee));
            }
            if (minDistanceEnnemi == -1 || distanceRadar < minDistanceEnnemi) {
                minDistanceEnnemi = distanceRadar;
            }
           
        }

        this.isRadarReceived = true;

        // Jouer son radar
        if (minDistanceEnnemi != -1) {
            minDistanceEnnemi = Math.max(50, minDistanceEnnemi);
            scene.soundRadar.setRate(1 + 5 / minDistanceEnnemi);
            scene.soundRadar.setVolume(0.4);
            scene.soundRadar.play();
            this.playSoundRadar  = true;
        }

    }

    onBonusReceived(bonus) {

      
        const numBonus = this.listBonus.length;
        // Dessiner bonus reçu


        const posOffsetX = (numBonus % 4) * 150;
        const posOffsetY = Math.floor((numBonus / 4)) * 150;

        const baseColor = bonus.getBaseColor();
        this.groupBonusImages.add(this.add.image(50 + posOffsetX, 50 + posOffsetY, "baseBonus").setScale(0.6).setTint(baseColor).setVisible(this.currentScene == "equipment"));

        const color = bonus.getColor();
        const colorHex = color.replace("#", "0x");
        this.groupBonusImages.add(this.add.image(50 + posOffsetX, 50 + posOffsetY, bonus.imageName).setScale(0.5).setTint(colorHex).setVisible(this.currentScene == "equipment"));
        
        this.listBonus.push(bonus);
        

    }


    // Fonctions phaser

    preload () {

        let url = 'rexsliderplugin.min.js';
        this.load.plugin('rexsliderplugin', url, true);    
        this.load.image('manette', 'manette.png');
        this.load.image('radar', 'radar.png');
        this.load.image('dot', 'point.png');
        this.load.image('squelette', 'squelette.png');

        // Icones bonus
        this.load.image('baseBonus', 'baseBonus.png');
        this.load.image('surchargeur', 'surchargeur.png');

        this.load.audio('soundCockpit', "cockpit.ogg");
        this.load.audio('soundClavier', "clavier.ogg");
        this.load.audio('soundRadar', "radar.ogg");

        this.load.audio('soundChoc2', "choc2.ogg");
        this.load.audio('soundChoc3', "choc3.ogg");

        // Nécessaire pour corriger le bug du slider
        this.scale.setGameSize(game.config.width, game.config.height);

    }

    create () {
        // Enregistrement de la caméra...
        this.camera = this.cameras.main;

        const config = {
            classType: Phaser.GameObjects.Image,
            defaultKey: null,
            defaultFrame: null,
            active: true,
            maxSize: -1,
            runChildUpdate: false,
            createCallback: null,
            removeCallback: null,
            createMultipleCallback: null
        }

        this.graphicsCockpit = this.add.graphics();
        this.graphicsEquipment = this.add.graphics();


        // Liste des points affichés sur le radar.
        this.radarDots = this.add.group(config);
        this.groupBonusImages = this.add.group(config);

        // Sons
        this.soundClavier = this.sound.add("soundClavier");
        this.soundClavier.setLoop(true);
        this.soundClavier.setVolume(0);
        this.soundClavier.play();
        let self = this;
        this.soundClavier.on('looped', function() {
            if (self.soundClavier.volume == 0) {
                self.soundClavier.setVolume(0.2);
            }
            else {
                self.soundClavier.setVolume(0);
            }
        });


        // Sons
        this.soundCockpit = this.sound.add("soundCockpit");
        this.soundCockpit.setLoop(true);
        this.soundCockpit.setVolume(0.4);
        this.soundCockpit.play();



        this.soundRadar = this.sound.add("soundRadar");
        
        this.soundChocs = [this.sound.add("soundChoc2"), this.sound.add("soundChoc3")];


        // Gestion du relachement du clic gauche
        this.input.on('pointerup', function (pointer) {        
            self.sendSettings();        
        }, this);    



        // Ajout manuel du radar
        this.radar = this.add.image(game.config.width / 2, 700, 'radar');


        // Ajout des boutons du cockpit
        this.equipmentButton = this.add.image(800, 450, 'squelette')
        .setInteractive()
        .on('pointerdown', () => this.showPlace("equipment"));
        this.equipmentButton.setScale(0.1);

        // Ajout des boutons du cockpit
        this.cockpitButton = this.add.image(800, 450, 'squelette')
        .setVisible(false)
        .setInteractive()
        .on('pointerdown', () => this.showPlace("cockpit"));
        this.cockpitButton.setScale(0.1);


        // Ajout des éléments de la section personnalisation vaisseau
        this.squelette = this.add.image(1200, game.config.height / 2, 'squelette').setDepth(-1);


        // Placer un emplacement à chaque endroit où l'on peut mettre sur le vaisseau
        this.listEquipmentLocation.push(new EquipmentLocation(this, "weapon", -100, -200));
        this.listEquipmentLocation.push(new EquipmentLocation(this, "weapon", 100, -200));

        this.listEquipmentLocation.push(new EquipmentLocation(this, "weapon_upgrade", 0, -120));

        this.listEquipmentLocation.push(new EquipmentLocation(this, "shield_upgrade", 0, 0));
        
        this.listEquipmentLocation.push(new EquipmentLocation(this, "system_upgrade", 0, 120));

        this.listEquipmentLocation.push(new EquipmentLocation(this, "power_upgrade", -100, 220));        
        this.listEquipmentLocation.push(new EquipmentLocation(this, "power_upgrade", 100, 220));



        // Ajout des modules
        this.listModules.set("power", this.createModule(this, "power",  "PUISSANCE", game.config.width * 1 / 5, game.config.height * 1 /5, '0xff5500'));
        this.listModules.set("weapon", this.createModule(this, "weapon", "ARMEMENT", game.config.width* 4 / 5, game.config.height * 1 / 5, '0xffdd00'));
        this.listModules.set("shield", this.createModule(this, "shield", "BOUCLIER", game.config.width * 1 / 5, 650, '0x0055ff'));
        this.listModules.set("radar", this.createModule(this, "radar", "RADAR", game.config.width / 2, 650, '0x00ff22', true, false));
        this.listModules.set("repare", this.createModule(this, "repare", "REPARATIONS", game.config.width * 4 / 5, 650, '0xee21dd', false));
        this.listModules.set("principal", this.createModule(this, "principal", "SYSTÈME PRINCIPAL", game.config.width  / 2 , game.config.height  * 1 /5, '0xffffff', true, false));
    
        //Sockets
        socket.on("damage",  function(damage) {
            self.onDamageReceived(damage);
        });	

        socket.on("sendRadarScan",  function(posJoueurX, posJoueurY, listEnnemis, portal) {
            self.onDataScanRadarReceived(self, posJoueurX, posJoueurY, listEnnemis, portal);
        });

        socket.on("bonus", function(bonus) {
            //Recommandé par lymke
            let bonusObject = new Bonus();
            Object.assign(bonusObject, bonus);
            self.onBonusReceived(bonusObject);
        });

        this.showPlace("cockpit");

    }

    update (time, delta) {        
        
        if (this.gameOver == true) {
            return;
        }

        // Définir la température à atteindre
        const targetTemperature = this.shipStats.initialTemperature + (this.sumEnergyUsed * (this.shipStats.maxTemperature-this.shipStats.initialTemperature) / this.shipStats.consommationMaxTemperature);
        const diffTemperature = targetTemperature - this.temperature;
        
        // Modifier la température
        this.temperature += diffTemperature * this.shipStats.coefficientChaleur * delta / 1000;
        this.temperature = Math.min(this.shipStats.maxTemperature, this.temperature);
        this.temperature = Math.max(this.shipStats.initialTemperature, this.temperature);


        // Couleur d'affichage de la température
        const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,70,204,204,0,0, this.shipStats.maxTemperature-this.shipStats.initialTemperature, this.temperature - this.shipStats.initialTemperature );

        this.listModules.get("principal").textTemperature.setText(Math.round(this.temperature) + "°C");
        this.listModules.get("principal").textTemperature.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));

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
                    this.camera.shake(200,0.02);
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



        // Lancer une demande de scan radar
        if (time > this.timeLastAskScan + this.shipStats.tempsRadarEntreScans && this.listModules.get("radar").isActivated == true) {
            socket.emit("askRadarScan");
            this.timeLastAskScan = time;
        }


        // Mettre à jour le timer de quand on a reçu les infos du radar
        if (this.isRadarReceived == true) {
            this.isRadarReceived = false;
            this.timeLastReceiveScan = time;
        }

        // Mettre à jour la luminosité des points sur le radar
        this.radarDots.setAlpha(1 - (time - this.timeLastReceiveScan) /  this.shipStats.tempsRadarEntreScans);

    }	

    // Afficher ou non une scène
    showPlace(sceneName) {
        this.currentScene = sceneName;

        // Cockpit
        let isVisible = (sceneName == "cockpit") 

        this.graphicsCockpit.setVisible(isVisible);
        this.radar.setVisible(isVisible);
        this.equipmentButton.setVisible(isVisible);
        
        this.radarDots.getChildren().forEach(dot => {
            dot.setVisible(isVisible);
            dot.setActive(isVisible);
        });

        this.listModules.forEach(module => {
            
            module.textName.setVisible(isVisible);
            module.disableGraphics.setVisible(isVisible);
            
            module.textEnergyUsed.setVisible(isVisible);
            if (module.hasState) {
                module.textState.setVisible(isVisible);
            }

            if (module.hasSlider) {
                module.manette.setVisible(isVisible);
            }

            if (module.name == "principal") {
                module.textEnergie.setVisible(isVisible);
                module.textEnergieValue.setVisible(isVisible);
                module.textTemperature.setVisible(isVisible);
                module.textTemperatureMax.setVisible(isVisible);
            }
        });

        // Equipement du vaisseau
        isVisible = (sceneName == "equipment") 

        this.cockpitButton.setVisible(isVisible);
        this.squelette.setVisible(isVisible);
        this.graphicsEquipment.setVisible(isVisible);
        this.groupBonusImages.setVisible(isVisible);
    }

}