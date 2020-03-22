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

        let url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
        phaser.load.plugin('rexsliderplugin', url, true);    
        phaser.load.image('manette', 'manette.png');
        
        // Nécessaire pour corriger le bug du slider
        phaser.scale.setGameSize(game.config.width, game.config.height);


    }

    create (phaser) {


        // Gestion du relachement du clic gauche
        phaser.input.on('pointerup', function (pointer) {        
            meca.sendSettings();        
        }, phaser);    

        // Ajout du texte de puissance restante
        this.textEnergie = phaser.add.text(160,game.config.height *4.1/5, "CONSOMMATION DU VAISSEAU").setStyle({
            fontSize: '35px',
            fontFamily: 'Arial',
            color: "#ffffff",
            align: 'center'
        });

        this.textEnergieValue = phaser.add.text(200, game.config.height *4.4/5, this.sumEnergyUsed + " GW" ).setStyle({
            fontSize: '55px',
            fontFamily: 'Arial',
            color: "#00c815",
            align: 'center'
        });

        // Ajout du texte de la température
        this.textTemperature = phaser.add.text(700, game.config.height *4.4/5, this.temperature + "°C" ).setStyle({
            fontSize: '55px',
            fontFamily: 'Arial',
            color: "#0046cc",
            align: 'center'
        });



        // Ajout des sliders
        this.listModules.set("power", this.createModule(phaser, "PUISSANCE", game.config.width * 1 / 5, game.config.height * 1 /5, 1, '0xff5500'));
        this.listModules.set("weapon", this.createModule(phaser, "ARMEMENT", game.config.width* 4 / 5, game.config.height * 1 /5, 1, '0x55ff00'));
        this.listModules.set("shield", this.createModule(phaser, "BOUCLIER", game.config.width * 1 / 5, game.config.height * 3 /5, 1, '0x0055ff'));
        this.listModules.set("repare", this.createModule(phaser, "REPARATIONS", game.config.width * 4 / 5, game.config.height * 3 /5, 1, '0xffffff'));
    
    }

    update (time, delta, phaser) {        
        
            // Définir la température à atteindre
            let targetTemperature = this.shipStats.initialTemperature + (this.sumEnergyUsed * (this.shipStats.maxTemperature-this.shipStats.initialTemperature) / this.shipStats.consommationMaxTemperature);
            const diffTemperature = targetTemperature - this.temperature;
            
            // Modifier la température
            this.temperature += diffTemperature * this.shipStats.coefficientChaleur * delta / 1000;

            this.temperature = Math.min(this.shipStats.maxTemperature, this.temperature);
            this.temperature = Math.max(this.shipStats.initialTemperature, this.temperature);

            this.textTemperature.setText(Math.round(this.temperature) + "°C");

            // Couleur d'affichage de la température
            const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,70,204,204,0,0, 70, this.temperature - this.shipStats.initialTemperature );
            this.textTemperature.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));

            // Gestion des pannes

            // Vérifier s'il s'est  écoulé suffisemment de temps.
            if (Date.now() < this.nextFailureVerification){
                return;
            }

            // Définir la prochaine vérification
            const min = this.shipStats.dureeMinimaleEntrePannes;
            const max = this.shipStats.dureeMaximaleEntrePannes;
            const nextFailureVerificationInterval = Math.random() * (max - min) + min
            this.nextFailureVerification = Date.now() + nextFailureVerificationInterval * 1000;

            // Une température trop élevée inflige des dégâts à un (ou plusieurs) module(s) au hasard
            const probaFailure = (this.temperature - this.shipStats.dangerTemperature) / (this.shipStats.maxTemperature - this.shipStats.dangerTemperature); 

            this.listModules.forEach(module => {

                const rand = Math.random();
                if (rand < probaFailure) {
                    // On met des dégats au module
                    const randDamage = Math.random() * this.shipStats.degatsMaxSurchauffe;
                    module.state -= randDamage;
                    module.textState.setText("État : " + Math.round(module.state) + "%"); 
                }

            });

        }	

   createModule(phaser, text, posX, posY, size, color) {

        const colorSharp = color.replace("0x", "#");

        let graphics = phaser.add.graphics();
        let module = {};


        module.state = 100;

        // Création de l'arrière plan
        graphics.lineStyle(2, color, 1);
        graphics.strokeRoundedRect(posX-250, posY-150, 500, 300, 32);

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


        module.value = 0;
        module.textValue = phaser.add.text(posX-200, posY-50, module.value +" GW")
        .setStyle({
            fontSize: '32px',
            fontFamily: 'Arial',
            color: colorSharp,
            align: 'center'
        });
        module.textName = phaser.add.text(posX-200, posY-120, text)
        .setStyle({
            fontSize: '38px',
            fontFamily: 'Arial',
            color: colorSharp,
            align: 'center'
        });

        module.textState = phaser.add.text(posX-200, posY+60, "État : " + module.state + "%")
        .setStyle({
            fontSize: '38px',
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

        game.cursorKeys = phaser.input.keyboard.createCursorKeys();
        return module;

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