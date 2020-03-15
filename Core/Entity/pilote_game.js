
var Pilote = class { 

    constructor(){
        this.lastFired = 0;
        this.lastEnnemiApparu = 0;
        this.score = 1;
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


    onPowerChanged (newPowerValue){
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
};

create()
{
    
    // Création du joueur !
    pilote.player = this.physics.add.image(1, 10, 'vaisseau');

    // Statistiques du vaisseau
    pilote.baseShipStats = new Stats("player"); 

    // Créations du bouclier
    pilote.player.shield = this.physics.add.image(0, 0, 'bouclier').setAlpha(this.realShield).setScale(0.6);
    // Mettre le bouclier au premier plan
    pilote.player.shield.setDepth(1);
    // Création des "tirs"			
    pilote.tirs = this.physics.add.group({
        classType: Tir,
        maxSize: 500,
        runChildUpdate: true
    });


    // Création des ennemis			
    pilote.ennemis = this.physics.add.group({
        classType: Ennemi,
        maxSize: 500,
        runChildUpdate: true
    });

    pilote.scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '64px', fill: '#FFF' });
    pilote.scoreText.setScrollFactor(0,0);

    // Créer les callbacks en cas de tir 
    this.physics.add.overlap(pilote.player, this.tirs, this.joueurTouche, null, this);
    this.physics.add.overlap(this.ennemis, this.tirs, this.ennemiTouche, null, this);

                
    // Resize selon l'écran
    // Création de la caméra
    this.cameras.main.setSize(game.config.width, game.config.height);

    // Ajout des étoiles en arrière plan
    pilote.bg = this.add.group({ key: 'star', frameQuantity: 50 });				
    let rect = new Phaser.Geom.Rectangle(this.cameras.main.width, this.cameras.main.height, this.cameras.main.width, this.cameras.main.height);
    Phaser.Actions.RandomRectangle(pilote.bg.getChildren(), rect);	
    // Colorer les étoiles pour que ça fasse un peu plus gai
    
    pilote.bg.getChildren().forEach(function(element) {
        const variableColor = 80;
        const red = 255 - variableColor + Math.floor(Math.random() * variableColor);				
        const green = 255 - variableColor + Math.floor(Math.random() * variableColor);
        const blue = 255 - variableColor + Math.floor(Math.random() * variableColor);				
        element.setTint(red*256*256 + green*256 + blue);
    });       



    // Définir couleur arrière plan
    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 2)');

    // Définir Taille vaisseau
    pilote.player.setScale(0.6);

    // Définir vitesse max du vaisseau (et ralentissement naturel)
    pilote.player.body.maxVelocity.set(pilote.baseShipStats.maxVelocity * pilote.meca_power);
    pilote.player.body.drag.set(100);


    // Caméra suit le joueur
    this.cameras.main.startFollow(pilote.player.body.position, false);

    console.log("test");
};

update(time, delta)
{
    console.log("test");
    if (pilote.gameOver == true){
        return;
    }
    // Mettre toutes les étoiles dans l'image
    let stars = pilote.bg.getChildren();
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
    const targerShield = pilote.meca_shield * pilote.baseShipStats.maxBouclier;
    
    // Si le bouclier est plus puissant que le réglage, on le diminue
    if (pilote.realShield > targerShield) {

        pilote.realShield = Math.max(pilote.realShield - pilote.baseShipStats.rechargementBouclier*delta / 1000, targerShield); 
    }    

    // Si le bouclier est moins puissant que le réglage, on l'augmente
    if (pilote.realShield < targerShield) {

        pilote.realShield = Math.min(pilote.realShield + pilote.baseShipStats.rechargementBouclier*delta / 1000, targerShield);
    } 

    pilote.player.shield.setPosition (pilote.player.x, pilote.player.y);
    pilote.player.shield.setAlpha(pilote.realShield / pilote.baseShipStats.maxBouclier);

    // Création des ennemis				
    if (time > pilote.lastEnnemiApparu + 1000)
    {
        let ennemi = pilote.ennemis.get();
        if (ennemi)
        {
            ennemi.display();
            pilote.lastEnnemiApparu = time;
        }
    }
    

    // Gestion des inputs du joueur
    let cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
    {
        pilote.player.setAngularVelocity(-pilote.baseShipStats.vitesseRotation * pilote.meca_power);

    }
    else if (cursors.right.isDown)
    {
        pilote.player.setAngularVelocity(pilote.baseShipStats.vitesseRotation * pilote.meca_power);
    }
    else
    {
        pilote.player.setAngularVelocity(0);
    }
    if (cursors.up.isDown)
    {
        const velocity = pilote.physics.velocityFromRotation(pilote.player.rotation, pilote.baseShipStats.acceleration);
        pilote.player.setAccelerationX(velocity.x);
        pilote.player.setAccelerationY(velocity.y);				
    }
    else if (cursors.down.isDown)
    {
        const velocity = pilote.physics.velocityFromRotation(pilote.player.rotation + Math.PI, pilote.baseShipStats.acceleration);
        pilote.player.setAccelerationX(velocity.x);
        pilote.player.setAccelerationY(velocity.y);					
    }

    else
    {
        pilote.player.setAccelerationX (0);
        pilote.player.setAccelerationY (0);
    }

    // Tirer
    if (cursors.space.isDown)
    {
        if (pilote.meca_weapon > 0.001)
        {

            // Vérifier que le tir précédent soit suffisamment lointain
            if (time > pilote.lastFired + pilote.baseShipStats.rechargementTir / pilote.meca_weapon)
            {
                let tir = pilote.tirs.get();
                if (tir)
                {
                    tir.fire(pilote.player.x, pilote.player.y, pilote.player.rotation, pilote.player.body.velocity, pilote.baseShipStats.vitesseTir, true, pilote.baseShipStats.precisionTir,  pilote.baseShipStats.degats);
                    pilote.lastFired = time;
                }
            }
        }
    }
    console.log(pilote.player.x);
};
}
