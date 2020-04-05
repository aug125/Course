
class Pilote extends Phaser.Scene{ 

    constructor(){
        super('Pilote');
        this.lastFired = 0;
        this.lastEnnemiApparu = 0;
        this.score = 0;
        this.scoreText;
        this.gameOver = false;
        this.player;

        // Statistiques données par l'autre joueur. Compris entre 0 et 1
        this.meca_power = 0;
        this.meca_weapon = 0;
        this.meca_shield = 0;
    
        this.realShield = 0;
        
    }

    setGameOver() {
        socket.emit("score", this.score);
        console.log("gameOver");
        // Arrêt du joueur
        this.player.setVelocity(0,0);
        this.player.setAccelerationX (0);
        this.player.setAccelerationY (0);
        this.player.setAngularVelocity(0);
        this.player.setVisible(false);
        this.player.shield.setAlpha(0);

        this.gameOver = true;
        this.this.scene.start('GameOver', { score: this.score});
    };

    joueurTouche = function(player, tir) {
        if (tir.isPlayer == false)
        {

            // Le bouclier encaisse en premier
            this.realShield -= tir.damage;
            if (this.realShield <= 0)
            {
                this.camera.shake(200,0.02);
                socket.emit("damage", tir.damage);
                //  You can set your own intensity and duration
                
            }
            tir.remove();
        }
    };

    ennemiTouche = function(ennemi, tir){
        if (tir.isPlayer == true && ennemi.active == true)
        {
            ennemi.remove();
            this.score++;
            this.scoreText.setText('Score: ' + this.score);
        }
    };

    onGameOverReceived() {
        this.setGameOver();
    };

    onPowerChanged (newPowerValue){
        // Changement de puissance
        this.meca_power = newPowerValue;
        this.setWarningTint(this.powerWarning, newPowerValue);        
    };

    onWeaponChanged = function(newWeaponValue){
        // Changement d'armement
        this.meca_weapon = newWeaponValue;
        this.setWarningTint(this.weaponWarning, newWeaponValue);        
    };

    onShieldChanged = function(newShieldValue){
        // Changement de bouclier
        this.meca_shield = newShieldValue;
        this.setWarningTint(this.shieldWarning, newShieldValue);        
    };

    setWarningTint(image, value) {
        let red = 0, green = 0, blue = 0;
        let state = "";
        if (value < 0.1) {
            red = 255;
            green = 0;
            blue = 0;
            state = "NONE";          
        }
        else if (value < 0.5) {
            red = 255;
            green = 200;
            blue = 0;
            state = "LOW";         
        }
        else {
            red = 0;
            green = 200;
            blue = 150;                            
            state = "HIGH";         
        }
        image.setTint(red*256*256 + green*256 + blue);

        // Prévenir si l'état a changé
        if (state != image.state) {
            image.timeChanged = new Date().getTime();
            image.state = state;
        }
    }

    createWarningImage(image) {
        image.initialPositionX = image.x;
        image.initialPositionY = image.y;
        image.timeChanged = 0;
        image.setScale(0.3);
        image.state = "NONE";
        this.setWarningTint(image, 0);
    }

    preload()
    {

        // Parait que c'est mieux avec ça...
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;


        // Charger les images
        this.load.image('vaisseau', 'vaisseau.png');
        this.load.image('star', 'star.png');
        this.load.image('tir', 'tir.png');
        this.load.image('bouclier', 'bouclier.png');
        this.load.image('powerImg', 'power.png');
        this.load.image('weaponImg', 'weapon.png');
        this.load.image('shieldImg', 'shield.png');

        this.this = this;
    };

    create()
    {
        
        // Création du joueur !
        this.player = this.physics.add.image(0, 0, 'vaisseau');

        // Création des images de warning
        this.powerWarning = this.add.image(game.config.width - 100, 350, 'powerImg');
        this.weaponWarning = this.add.image(game.config.width - 100, 475, 'weaponImg');
        this.shieldWarning = this.add.image(game.config.width - 100, 600, 'shieldImg');
 
        this.createWarningImage(this.powerWarning);        
        this.createWarningImage(this.weaponWarning);        
        this.createWarningImage(this.shieldWarning);        
 
        this.setWarningTint(this.powerWarning,0);
        this.setWarningTint(this.weaponWarning,0);
        this.setWarningTint(this.shieldWarning,0);

        this.powerWarning.setScrollFactor(0);
        this.weaponWarning.setScrollFactor(0);
        this.shieldWarning.setScrollFactor(0);


        // Statistiques du vaisseau
        this.baseShipStats = new Stats("player"); 

        // Créations du bouclier
        this.player.shield = this.physics.add.image(0, 0, 'bouclier').setAlpha(this.realShield).setScale(0.6);
        // Mettre le bouclier au premier plan
        this.player.shield.setDepth(1);
        // Création des "tirs"			
        this.tirs = this.physics.add.group({
            classType: Tir,
            maxSize: 500,
            runChildUpdate: true
        });


        // Création des ennemis			
        this.ennemis = this.physics.add.group({
            classType: Ennemi,
            maxSize: 500,
            runChildUpdate: true
        });

        this.scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '64px', fill: '#FFF' });
        this.scoreText.setScrollFactor(0);

        // Créer les callbacks en cas de tir 
        this.physics.add.overlap(this.player, this.tirs, this.joueurTouche, null, this);
        this.physics.add.overlap(this.ennemis, this.tirs, this.ennemiTouche, null, this);

                    
        // Resize selon l'écran
        // Création de la caméra
        this.camera = this.cameras.main;
        this.camera.setSize(game.config.width, game.config.height);

        // Ajout des étoiles en arrière plan
        this.bg = this.add.group({ key: 'star', frameQuantity: 50 });				
        let rect = new Phaser.Geom.Rectangle(this.cameras.main.width, this.cameras.main.height, this.cameras.main.width, this.cameras.main.height);
        Phaser.Actions.RandomRectangle(this.bg.getChildren(), rect);	
        // Colorer les étoiles pour que ça fasse un peu plus gai
        
        this.bg.getChildren().forEach(function(element) {
            const variableColor = 80;
            const red = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            const green = 255 - variableColor + Math.floor(Math.random() * variableColor);
            const blue = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            element.setTint(red*256*256 + green*256 + blue);
        });       



        // Définir couleur arrière plan
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 2)');

        // Définir Taille vaisseau
        this.player.setScale(0.6);

        // Définir vitesse max du vaisseau (et ralentissement naturel)
        this.player.body.maxVelocity.set(this.baseShipStats.maxVelocity);
        this.player.body.drag.set(100);


        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player.body.position, false);


        // Sockets
        let self = this;
        socket.on("power",  function(powerValue) {
            self.onPowerChanged(powerValue);        
        });

        socket.on("weapon",  function(weaponValue) {
            self.onWeaponChanged(weaponValue);
        });	
        
        socket.on("shield",  function(shieldValue) {
            self.onShieldChanged(shieldValue);
        });			
        socket.on("gameOver",  function() {
            self.onGameOverReceived();
        });	

    };

    update(time, delta)
    {

        if (this.gameOver == true){
            return;
        }
        // Mettre toutes les étoiles dans l'image
        let stars = this.bg.getChildren();
        for (let i = 0; i < stars.length; i++) 
        {
            if (stars[i].x <  this.cameras.main.worldView.x)
                stars[i].x +=  this.cameras.main.width;
            if (stars[i].x >  this.cameras.main.worldView.x  +  this.cameras.main.width)
                stars[i].x -=  this.cameras.main.width;

            if (stars[i].y <  this.cameras.main.worldView.y)
                stars[i].y +=  this.cameras.main.height;
            if (stars[i].y >  this.cameras.main.worldView.y +  this.cameras.main.height)
                stars[i].y -=  this.cameras.main.height;
        }

        // Mettre à jour le bouclier

        // Valeur bouclier à atteindre    
        const targerShield = this.meca_shield * this.baseShipStats.maxBouclier;
        
        // Si le bouclier est plus puissant que le réglage, on le diminue
        if (this.realShield > targerShield) {

            this.realShield = Math.max(this.realShield - this.baseShipStats.rechargementBouclier*delta / 1000, targerShield); 
        }    

        // Si le bouclier est moins puissant que le réglage, on l'augmente
        if (this.realShield < targerShield) {

            this.realShield = Math.min(this.realShield + this.baseShipStats.rechargementBouclier*delta / 1000, targerShield);
        } 

        this.player.shield.setPosition (this.player.x, this.player.y);
        this.player.shield.setAlpha(this.realShield / this.baseShipStats.maxBouclier);

        // Création des ennemis				
        if (time > this.lastEnnemiApparu + 15000)
        {
            let ennemi = this.ennemis.get();
            if (ennemi)
            {
                ennemi.display();
                this.lastEnnemiApparu = time;
            }
        }
        

        // Gestion des inputs du joueur
        let cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown)
        {

            this.player.setAngularVelocity(-this.baseShipStats.vitesseRotation * this.meca_power);

        }
        else if (cursors.right.isDown)
        {
            this.player.setAngularVelocity(this.baseShipStats.vitesseRotation * this.meca_power);
        }
        else
        {
            this.player.setAngularVelocity(0);
        }
        if (cursors.up.isDown)
        {
            const velocity = this.physics.velocityFromRotation(this.player.rotation, this.baseShipStats.acceleration * this.meca_power);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);				
        }
        else if (cursors.down.isDown)
        {
            const velocity = this.physics.velocityFromRotation(this.player.rotation + Math.PI, this.baseShipStats.acceleration);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);					
        }

        else
        {
            this.player.setAccelerationX (0);
            this.player.setAccelerationY (0);
        }

        // Tirer
        if (cursors.space.isDown)
        {
            if (this.meca_weapon > 0.001)
            {

                // Vérifier que le tir précédent soit suffisamment lointain
                if (time > this.lastFired + this.baseShipStats.rechargementTir / this.meca_weapon)
                {
                    let tir = this.tirs.get();
                    if (tir)
                    {
                        tir.fire(this.player.x, this.player.y, this.player.rotation, this.player.body.velocity, this.baseShipStats.vitesseTir, true, this.baseShipStats.precisionTir,  this.baseShipStats.degats);
                        this.lastFired = time;
                    }
                }
            }
        }

        // Affichage des warnings
        let listWarnings = [this.powerWarning, this.weaponWarning, this.shieldWarning];

        let max = 0;
        // Un seul warning doit prendre la place du milieu, alors on prend le plus récent.
        listWarnings.forEach(imageWarning => {

            if (imageWarning.timeChanged > max) {
                max = imageWarning.timeChanged;
            }
        });

        listWarnings.forEach(imageWarning => {
            const timeStartMove = 1750;
            const timeEndMove = 2000;

            const posX = game.config.width / 2;
            const posY = 300;

            const diffTime = new Date().getTime() - imageWarning.timeChanged;
            if (diffTime < timeStartMove && imageWarning.timeChanged == max) {
                imageWarning.x = posX;
                imageWarning.y = posY;
                imageWarning.setScale(1);
                console.log(posX);

            }
            else if (diffTime < timeEndMove) {
                imageWarning.x = posX + (imageWarning.initialPositionX - posX) * ((diffTime - timeStartMove) / (timeEndMove - timeStartMove));
                imageWarning.y = posY + (imageWarning.initialPositionY - posY) * ((diffTime - timeStartMove) / (timeEndMove - timeStartMove));
                imageWarning.setScale(1 - 0.3 * ((diffTime - timeStartMove) / (timeEndMove - timeStartMove)));
            }
            else {
                imageWarning.x = imageWarning.initialPositionX;
                imageWarning.y = imageWarning.initialPositionY;
                imageWarning.setScale(0.3);
            }
        });

    };
}