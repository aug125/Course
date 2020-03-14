
class Pilote{ 

    constructor(){
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


    joueurTouche = function(player, tir) {
        console.log("test");
        if (tir.isPlayer == false)
        {

            // Le bouclier encaisse en premier
            this.realShield -= tir.damage;
            console.log(this.realShield);
            tir.remove();
            if (this.realShield <= 0)
            {


                // Arrêt du joueur
                player.setVelocity(0,0);
                player.setAccelerationX (0);
                player.setAccelerationY (0);
                player.setAngularVelocity(0);
                player.setVisible(false);
                player.shield.setAlpha(0);

                this.gameOver = true;

                // Score au milieu
                this.scoreText.setPosition(500, 500);
            }
        }
    };

    ennemiTouche = function(ennemi, tir){
        console.log("test");
        if (tir.isPlayer == true && ennemi.active == true)
        {
            ennemi.remove();
            this.score++;
            this.scoreText.setText('Score: ' + this.score);
        }
    };


    onPowerChanged = function(newPowerValue){
        console.log("test");
        // Changement de puissance
        this.meca_power = newPowerValue;
        this.player.body.maxVelocity.set(this.baseShipStats.maxVelocity * this.meca_power);    
    };

    onWeaponChanged = function(newWeaponValue){
        console.log("test");
        // Changement de puissance
        this.meca_weapon = newWeaponValue;
    };

    onShieldChanged = function(newShieldValue){
        console.log("test");
        // Changement de puissance
        this.meca_shield = newShieldValue;
    };



    preload = function()
    {

        // Parait que c'est mieux avec ça...
        game.renderer.clearBeforeRender = false;
        game.renderer.roundPixels = true;


        // Charger les images
        this.load.image('vaisseau', 'vaisseau.png');
        this.load.image('star', 'star.png');
        this.load.image('tir', 'tir.png');
        this.load.image('bouclier', 'bouclier.png');
    };

    create = function ()
    {
        
        // Création du joueur !
        this.player = this.physics.add.image(1, 10, 'vaisseau');

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
        this.scoreText.setScrollFactor(0,0);

        // Créer les callbacks en cas de tir 
        this.physics.add.overlap(this.player, this.tirs, this.joueurTouche, null, this);
        this.physics.add.overlap(this.ennemis, this.tirs, this.ennemiTouche, null, this);

                    
        // Resize selon l'écran
        // Création de la caméra
        this.cameras.main.setSize(game.config.width, game.config.height);

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
        this.player.body.maxVelocity.set(this.baseShipStats.maxVelocity * this.meca_power);
        this.player.body.drag.set(100);


        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player.body.position, false);
    };

    update = function (time, delta)
    {
        console.log(this.player.x);

        if (pilote.gameOver == true){
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
        if (time > this.lastEnnemiApparu + 1000)
        {
            ennemi = this.ennemis.get();
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
            const velocity = this.physics.velocityFromRotation(this.player.rotation, this.baseShipStats.acceleration);
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
                    tir = this.tirs.get();
                    if (tir)
                    {
                        tir.fire(this.player.x, this.player.y, this.player.rotation, this.player.body.velocity, this.baseShipStats.vitesseTir, true, this.baseShipStats.precisionTir,  this.baseShipStats.degats);
                        this.lastFired = time;
                    }
                }
            }
        }
        console.log(this.player.x);
    };
}
