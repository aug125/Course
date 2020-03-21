class Meca { 

    constructor() {
        this.shipStats = new Stats("meca");

        // Statistiques initiales du vaisseau
        this.energy = this.shipStats.initialCharge;
        this.temperature = this.shipStats.initialTemperature;
    }

    sendSettings = function() {
        if (this.power.isChanged == true) {
            socket.emit("power", this.power.value);
            this.power.isChanged = false;
        }
        if (this.weapon.isChanged == true) {
            socket.emit("weapon", this.weapon.value);
            this.weapon.isChanged = false;
        }
        if (this.shield.isChanged == true) {
            socket.emit("shield", this.shield.value);
            this.shield.isChanged = false;
        }
        if (this.repare.isChanged == true) {
            socket.emit("repare", this.repare.value);
            this.repare.isChanged = false;
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
        this.textEnergie = phaser.add.text(160,game.config.height *4.1/5, "RESERVE").setStyle({
            fontSize: '35px',
            fontFamily: 'Arial',
            color: "#ffffff",
            align: 'center'
        });

        this.textEnergieValue = phaser.add.text(200, game.config.height *4.4/5, this.energy + " GW" ).setStyle({
            fontSize: '55px',
            fontFamily: 'Arial',
            color: "#44ff44",
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
        this.power  = this.createSlider(phaser, "PUISSANCE", game.config.width / 5, game.config.height * 3 /5, 1, '#ffaaaa');
        this.weapon = this.createSlider(phaser, "ARMEMENT", game.config.width* 2 / 5, game.config.height * 3 /5, 1, '#aaffaa');
        this.shield = this.createSlider(phaser, "BOUCLIER", game.config.width * 3 / 5, game.config.height * 3 /5, 1, '#aaaaff');
        this.repare = this.createSlider(phaser, "REPARATIONS", game.config.width * 4 / 5, game.config.height * 3 /5, 1, '#bbbbbb');
    
    }

    update (time, delta, phaser) {        
        
            // Modification de température
            this.temperature -= this.energy * this.shipStats.coefficientChaleur * (delta / 1000);
            this.temperature = Math.max(this.shipStats.initialTemperature, this.temperature); 
            this.temperature = Math.min(this.shipStats.maxTemperature, this.temperature);
            this.textTemperature.setText(Math.round(this.temperature) + "°C");

            // Couleur d'affichage de la température
            const color = Phaser.Display.Color.Interpolate.RGBWithRGB(0,70,204,204,0,0, 70, this.temperature - this.shipStats.initialTemperature );
            this.textTemperature.setColor(Phaser.Display.Color.RGBToString(Math.round(color.r), Math.round(color.g), Math.round(color.b)));
    }	

   createSlider(phaser,  text, posX, posY, size, color) {

        // Création du slider de puissance
        let object = phaser.add.image(posX, posY, 'manette');
        object.originY = 1;        
        object.slider = phaser.plugins.get('rexsliderplugin').add(object, {
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
        phaser.add.graphics()
        .lineStyle(3, 0x888888, 1)
        .strokePoints(object.slider.endPoints);

        // Mettre la manette au premier plan
        object.setDepth(1);


        object.value = 0;
        object.textValue = phaser.add.text(object.x - 45,object.y + 40, object.value +" GW")
        .setStyle({
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        });
        object.textName = phaser.add.text(object.x - 100,object.y + 80, text)
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
            meca.onValueChanged();
        });

        game.cursorKeys = phaser.input.keyboard.createCursorKeys();
        return object;

    }
    onValueChanged(newValue) {
        const initialCharge = this.shipStats.initialCharge;
        const sumEnegyUsed = this.power.value + this.weapon.value + this.shield.value + this.repare.value;        
        this.energy = Math.round(initialCharge - (sumEnegyUsed * 100));
        this.textEnergieValue.setText(Math.abs(this.energy) + " GW");
        if (this.energy >= 0) {
            this.textEnergie.setText("RESERVE");
            this.textEnergieValue.setColor("#44ff44");
        }
        else {
            this.textEnergie.setText("SURCHARGE");
            this.textEnergieValue.setColor("#ff4444");
        }
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