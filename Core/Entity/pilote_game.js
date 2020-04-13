
class Pilote extends Phaser.Scene{ 

    constructor(){
        super('Pilote');
        this.lastFired = 0;
        this.timeLastEnnemyPop = 0;
        this.score = 0;
        this.gameOver = false;

        // Statistiques données par l'autre joueur. Compris entre 0 et 1
        this.meca_power = 0;
        this.meca_weapon = 0;
        this.meca_shield = 0;
    
        this.realShield = 0;

        // Ennemis restants;
        this.ennemiLeft = 0;

        // Qualité. à 0, pas de particules... (TODO)
        this.quality = 1;
        
        // Numéro de niveau
        this.currentLevel = 1;

        // Temps depuis le début du niveau
        this.timeStartLevel = -1;
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
        this.scene.start('GameOver', { score: this.score});
    };

    // Callbacks
    joueurTouche (player, tir) {
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

    ennemiTouche (ennemi, tir){
        if (tir.isPlayer == true && ennemi.active == true)
        {
            ennemi.remove();
            this.score++;
            if (this.ennemiLeft > 0) {
                this.ennemiLeft--;
                this.textEnnemiLeft.setText("Ennemis restants : " + this.ennemiLeft);
            }
            if (this.ennemiLeft == 0 && this.portal.visible == false) {
                this.openPortal();
                this.textEnnemiLeft.setText("Trouvez le portail");
            }            
        }
    };

    portalReached (player, portal) {
        this.levelInitialisation();
    }

    openPortal() {
        // Ouverture du portail
        this.portal.setVisible(true);
        this.portal.timeSetActive = new Date().getTime();
        this.printText("Portail ouvert !");
    }    



    setWarningTint(image, value, isPrintRequired = true) {
        let message = "";

        if (image.name == "power") {
            message = "Puissance ";
        }
        else if (image.name == "weapon") {
            message = "Armement "
        }
        else if (image.name == "shield") {
            message = "Bouclier "
        }

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
            if (state == "NONE") {
                message += "H.S."
            }
            else if (state == "LOW") {
                message += "faible"
            }
            else if (state == "HIGH") {
                message += "OK"
            }
            this.printText(message);
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

    printText(text) {
        this.textPrincipal.setText(text);
        this.textPrincipal.timeDisplayed = new Date().getTime();
        this.textPrincipal.setAlpha(1);
    }    

    levelInitialisation() {

        // Initialiser le niveau
        this.ennemiLeft =  this.gameStats.nbEnnemis;
        this.textEnnemiLeft.setText("Ennemis restants : " + this.ennemiLeft);

        // Positionner le joueur
        this.player.x = 0;
        this.player.y = 0;
        this.player.setAccelerationX(0);
        this.player.setAccelerationY(0);
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        // Enlever tous les ennemis
        this.ennemis.getChildren().forEach(function(ennemi) {
            ennemi.remove();
        });

        // Enlever tous les tirs
        this.tirs.getChildren().forEach(function(tir) {
            tir.remove();
        });


        // Initialiser le portail
        this.portal.x = Math.random() * this.gameStats.maxDistancePortail * 2 - this.gameStats.maxDistancePortail;
        this.portal.y = Math.random() * this.gameStats.maxDistancePortail * 2 - this.gameStats.maxDistancePortail;
        this.portal.setScale(0);
        this.portal.timeSetActive = -1;
        this.portal.setVisible(false);
        this.portal.setAngularVelocity(250);


        // Mettre à jour le compteur                
        this.timeStartLevel = new Date().getTime();
    }

    // Méthodes de socket

    onGameOverReceived() {
        this.setGameOver();
    };

    onPowerChanged (newPowerValue){
        // Changement de puissance
        this.meca_power = newPowerValue;
        
        if (newPowerValue < 0.1) {
            this.playerEmitter.setFrequency(500, 2);
        }
        else {
            this.playerEmitter.setFrequency(50 / newPowerValue , 2);
        }
        this.setWarningTint(this.powerWarning, newPowerValue);        
    };

    onWeaponChanged (newWeaponValue){
        // Changement d'armement
        this.meca_weapon = newWeaponValue;
        this.setWarningTint(this.weaponWarning, newWeaponValue);        
    };

    onShieldChanged (newShieldValue){
        // Changement de bouclier
        this.meca_shield = newShieldValue;
        this.setWarningTint(this.shieldWarning, newShieldValue);        
    };

    onAskRadarScanReceived() {
        socket.emit("sendRadarScan",  this.player.x, this.player.y, this.ennemis.getChildren(), this.portal);
    }


    // Fonctions phaser

    preload()
    {

        // Parait que c'est mieux avec ça...
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;


        // Charger les images
        this.load.image('vaisseau', 'vaisseau.png');

        // Vaisseau ennemis
        this.load.image('pod', 'pod.png');

        this.load.image('star', 'star.png');
        this.load.image('tir', 'tir.png');
        this.load.image('bouclier', 'bouclier.png');
        this.load.image('powerImg', 'power.png');
        this.load.image('weaponImg', 'weapon.png');
        this.load.image('shieldImg', 'shield.png');
        this.load.image('flares', 'flares.png');
        this.load.image('portail', 'portail.png');
    };

    create()
    {
        
        // Création du joueur !
        this.player = this.physics.add.image(0, 0, 'vaisseau');


        // Création des textes affichés
        this.textPrincipal = this.add.text(game.config.width /2  , 600, "").setStyle({
            fontSize: '48px',
            fontFamily: 'Calibri',
            color: "#ffffff",
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);

        this.textEnnemiLeft = this.add.text(0,0, "Ennemis restants : " + this.ennemiLeft).setStyle({
            fontSize: '32px',
            fontFamily: 'Calibri',
            color: "#ffffff",
            align: 'center'
        }).setScrollFactor(0);


        this.textPrincipal.timeDisplayed = 0;
        this.textPrincipal.setDepth(10);
        this.textEnnemiLeft.setDepth(10);

        // Création des images de warning
        this.powerWarning = this.add.image(game.config.width - 100, 350, 'powerImg');
        this.powerWarning.name = "power";
        this.weaponWarning = this.add.image(game.config.width - 100, 475, 'weaponImg');
        this.weaponWarning.name = "weapon";
        this.shieldWarning = this.add.image(game.config.width - 100, 600, 'shieldImg');
        this.shieldWarning.name = "shield";
 
        this.createWarningImage(this.powerWarning);        
        this.createWarningImage(this.weaponWarning);        
        this.createWarningImage(this.shieldWarning);        
 
        this.setWarningTint(this.powerWarning,0, false);
        this.setWarningTint(this.weaponWarning,0, false);
        this.setWarningTint(this.shieldWarning,0, false);

        this.powerWarning.setScrollFactor(0);
        this.weaponWarning.setScrollFactor(0);
        this.shieldWarning.setScrollFactor(0);


        // Statistiques du vaisseau
        this.baseShipStats = new Stats("player"); 

        // Statistiques de la partie
        this.gameStats = new Stats("game");

        // Créations du bouclier
        this.player.shield = this.add.image(0, 0, 'bouclier').setAlpha(this.realShield).setScale(0.6);
        this.player.shield.setDepth(1);
        this.player.shield.setScale(0.5);

        
        // Création des "tirs"			
        this.tirs = this.physics.add.group({
            classType: Tir,
            maxSize: 200,
            runChildUpdate: true
        });


        // Création des ennemis			
        this.ennemis = this.physics.add.group({
            classType: Ennemi,
            maxSize: 30,
            runChildUpdate: true
        });

        // Création du portail
        this.portal = this.physics.add.image(0, 0, 'portail').setDepth(3);

        // Création des particules
        this.particles = this.add.particles('flares');

        this.playerEmitter = this.particles.createEmitter({
            lifespan: 600,
            speed: { min: 400, max: 600 },
            scale: { start: 0.2, end: 0 },
            tint: 0x00aaff,
            blendMode: 'ADD',
            on:false
        });

        // Particules du portail
        this.portal.wellParticle = this.particles.createGravityWell(this.portal.x, this.portal.y);
        this.portal.particle = this.particles.createEmitter({
            lifespan: 600,           
            speed: { min: 0, max: 350 },
            scale: { start: 0.1, end: 0 },
            tint: 0xbbbbff,
            quantity: 4,
            blendMode: 'ADD',
            on:false
        });

        this.playerEmitter.setFrequency(500, 1);
        this.playerEmitter.startFollow(this.player);
 
        // Créer les callbacks en cas de tir 
        this.physics.add.overlap(this.player, this.tirs, this.joueurTouche, null, this);
        this.physics.add.overlap(this.ennemis, this.tirs, this.ennemiTouche, null, this);
        this.physics.add.overlap(this.player, this.portal, this.portalReached, null, this);
        
        // Resize selon l'écran
        // Création de la caméra
        this.camera = this.cameras.main;
        this.camera.setSize(game.config.width, game.config.height);

        // Ajout des étoiles en arrière plan
        this.bg = this.add.group({ key: 'star', frameQuantity: 100 });
        this.bg.setDepth(-1);

        const rectScreen = new Phaser.Geom.Rectangle(0,0, this.cameras.main.width, this.cameras.main.height);
        Phaser.Actions.RandomRectangle(this.bg.getChildren(), rectScreen);	

        // Colorer les étoiles pour que ça fasse un peu plus gai
        this.bg.getChildren().forEach(function(element) {
            const variableColor = 100;
            const red = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            const green = 255 - variableColor + Math.floor(Math.random() * variableColor);
            const blue = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            element.setTint(red*256*256 + green*256 + blue);

            // Taille aléatoire
            element.setScale(Math.random());
        });       



        // Définir couleur arrière plan
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 2)');

        // Créer rectangle de transition
        this.rectangleTransition = this.add.rectangle(0,0,game.config.width, game.config.height, 0xeeeeff).setOrigin(0).setAlpha(0);
        this.rectangleTransition.setScrollFactor(0);
        this.rectangleTransition.setDepth(20);

        // Définir Taille vaisseau
        this.player.setScale(0.4);

        // Définir vitesse max du vaisseau (et ralentissement naturel)
        this.player.body.maxVelocity.set(this.baseShipStats.maxVelocity);
        this.player.body.drag.set(150);


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

        socket.on("askRadarScan",  function() {
            self.onAskRadarScanReceived();
        });

        this.levelInitialisation();

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
        
        // Initialisation de l'apparition des ennemis la première fois.
        if (this.timeLastEnnemyPop == 0) {
            this.timeLastEnnemyPop = time;
        }
        
        const delaiApparitionEnnemi = this.gameStats.tempsApparitionEnnemi;

        if (time > this.timeLastEnnemyPop + delaiApparitionEnnemi)
        {
            let ennemi = this.ennemis.get();
            if (ennemi)
            {
                ennemi.display("pod");
                this.timeLastEnnemyPop = time;
            }
        }
        

        // Gestion des inputs du joueur
        let cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown)
        {
            // Gauche
            this.player.setAngularVelocity(-this.baseShipStats.vitesseRotation * this.meca_power);

        }
        else if (cursors.right.isDown)
        {
            // Droite
            this.player.setAngularVelocity(this.baseShipStats.vitesseRotation * this.meca_power);
        }
        else
        {
            this.player.setAngularVelocity(0);
        }

        const randomParticleAngle = 15;
        if (cursors.up.isDown)
        {
            // Accélération
            // Ajout des particules
            this.playerEmitter.on = true;

            // Positionner les particules du joueur

            this.playerEmitter.setAngle( {min : this.player.body.rotation + 180 - randomParticleAngle, max: this.player.body.rotation + 180 + randomParticleAngle });

            // Mettre les particules à l'arrière du vaisseau
            this.playerEmitter.setPosition (-Math.cos(this.player.rotation) * 20, -Math.sin(this.player.rotation) * 20);



            const velocity = this.physics.velocityFromRotation(this.player.rotation, this.baseShipStats.acceleration * this.meca_power);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);				
        }
        else if (cursors.down.isDown)
        {
            // Ajout des particules
            this.playerEmitter.on = true;

            // Positionner les particules du joueur
            this.playerEmitter.setAngle( {min : this.player.body.rotation - 5, max: this.player.body.rotation + 5 });   

            // Mettre les particules à l'arrière du vaisseau
            this.playerEmitter.setPosition (-Math.cos(this.player.rotation) * 20, -Math.sin(this.player.rotation) * 20);
        
            const velocity = this.physics.velocityFromRotation(this.player.rotation + Math.PI, this.baseShipStats.acceleration * this.meca_power);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);					
        }

        else
        {
            this.playerEmitter.on = false;
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

        // Positionner le portail pour qu'il ne soit pas trop loin du joueur

        // Portail trop à gauche
        while (this.portal.x  < this.player.x - this.gameStats.maxDistancePortail) {
            this.portal.x += 2 * this.gameStats.maxDistancePortail;
        }
        // Portail trop à droite
        while (this.portal.x  > this.player.x + this.gameStats.maxDistancePortail) {
            this.portal.x -= 2 * this.gameStats.maxDistancePortail;
        }

        // Portail trop en haut
        while (this.portal.y  < this.player.y - this.gameStats.maxDistancePortail) {
            this.portal.y += 2 * this.gameStats.maxDistancePortail;
        }
        // Portail trop à droite
        while (this.portal.y  > this.player.y + this.gameStats.maxDistancePortail) {
            this.portal.y -= 2 * this.gameStats.maxDistancePortail;
        }

        //Particules du portail
        this.portal.particle.setPosition({min: this.portal.x - 500, max: this.portal.x + 500}, {min: this.portal.y - 500, max: this.portal.y + 500});
        this.portal.wellParticle.x = this.portal.x;
        this.portal.wellParticle.y = this.portal.y;

        // Taille du portail
        const diffTimePortail = new Date().getTime() - this.portal.timeSetActive;
        if (diffTimePortail < 1000) {
            this.portal.setScale(diffTimePortail / 1000);  
            this.portal.particle.on = false;          
        }
        else if (this.portal.visible) {
            this.portal.setScale(1);
            this.portal.wellParticle.power = 50;
            this.portal.particle.on = true;
        }
        else {
            this.portal.setScale(0);
            this.portal.wellParticle.power = 0;
            this.portal.particle.on = false;
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
            }
            else if (diffTime < timeEndMove  && imageWarning.timeChanged == max) {
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

        // Changer l'affichage du texte.
        const diffTimetextPrincipal = new Date().getTime() - this.textPrincipal.timeDisplayed;
        if (diffTimetextPrincipal < 1500) {
            this.textPrincipal.setAlpha(1);
        } 
        else if (diffTimetextPrincipal < 1600) {
            this.textPrincipal.setAlpha((1600 - diffTimetextPrincipal) / 100);
        } 
        else {
            this.textPrincipal.setAlpha(0);
        }


        // Rectangle de transition
        const timeElapsedLevel = new Date().getTime() - this.timeStartLevel;
        if (timeElapsedLevel < 500) {
            this.rectangleTransition.setAlpha(1 - (timeElapsedLevel / 500));
            this.cameras.main.setZoom(2 - Math.sqrt((timeElapsedLevel / 500)));
        }
        else {
            this.rectangleTransition.setAlpha(0);
            this.cameras.main.setZoom(1);
        }

    };
}