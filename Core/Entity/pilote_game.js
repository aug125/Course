
var pilote = {}; 
pilote.lastFired = 0;
pilote.lastEnnemiApparu = 0;
pilote.score = 0;
pilote.scoreText;
pilote.gameOver = false;
pilote.player;

// Statistiques données par l'autre joueur. Compris entre 0 et 1
pilote.meca_power = 0;
pilote.meca_weapon = 0;
pilote.meca_shield = 0;

pilote.realShield = 0;


pilote.joueurTouche = function(player, tir) {
    if (tir.isPlayer == false)
    {

        // Le bouclier encaisse en premier
        pilote.realShield -= tir.damage;
        console.log(pilote.realShield);
        tir.remove();
        if (pilote.realShield <= 0)
        {


            // Arrêt du joueur
            pilote.player.setVelocity(0,0);
            pilote.player.setAccelerationX (0);
            pilote.player.setAccelerationY (0);
            pilote.player.setAngularVelocity(0);
            pilote.player.setVisible(false);
            pilote.player.shield.setAlpha(0);

            pilote.gameOver = true;

            // Score au milieu
            pilote.scoreText.setPosition(500, 500);
        }
    }
};

pilote.ennemiTouche = function(ennemi, tir){

    if (tir.isPlayer == true && ennemi.active == true)
    {
        ennemi.remove();
        pilote.score++;
        pilote.scoreText.setText('Score: ' + pilote.score);
    }
};


pilote.onPowerChanged = function(newPowerValue){

    // Changement de puissance
    pilote.meca_power = newPowerValue;
    pilote.player.body.maxVelocity.set(pilote.baseShipStats.maxVelocity * pilote.meca_power);    
};

pilote.onWeaponChanged = function(newWeaponValue){

    // Changement de puissance
    pilote.meca_weapon = newWeaponValue;
};

pilote.onShieldChanged = function(newShieldValue){

    // Changement de puissance
    pilote.meca_shield = newShieldValue;
};



function pilote_preload ()
{

    // Parait que c'est mieux avec ça...
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;


    // Charger les images
    this.load.image('vaisseau', 'vaisseau.png');
    this.load.image('star', 'star.png');
    this.load.image('tir', 'tir.png');
    this.load.image('bouclier', 'bouclier.png');
}

function pilote_create ()
{
    
    // Création du joueur !
    pilote.player = this.physics.add.image(0, 0, 'vaisseau');

    // Statistiques du vaisseau
    pilote.baseShipStats = new Stats("player"); 

    // Créations du bouclier
    pilote.player.shield = this.physics.add.image(0, 0, 'bouclier').setAlpha(pilote.realShield).setScale(0.6);;
    // Mettre le bouclier au premier plan
    pilote.player.shield.setDepth(1);
    // Création des "tirs"			
    tirs = this.physics.add.group({
        classType: Tir,
        maxSize: 500,
        runChildUpdate: true
    });


    // Création des ennemis			
    ennemis = this.physics.add.group({
        classType: Ennemi,
        maxSize: 500,
        runChildUpdate: true
    });

    pilote.scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '64px', fill: '#FFF' });
    pilote.scoreText.setScrollFactor(0,0);

    // Créer les callbacks en cas de tir 
    this.physics.add.overlap(pilote.player, tirs, pilote.joueurTouche, null, this);
    this.physics.add.overlap(ennemis, tirs, pilote.ennemiTouche, null, this);

   				
    // Resize selon l'écran
    // Création de la caméra
    camera = this.cameras.main;
    camera.setSize(game.config.width, game.config.height);


    // Ajout des étoiles en arrière plan
    bg = this.add.group({ key: 'star', frameQuantity: 50 });				
    let rect = new Phaser.Geom.Rectangle(camera.width, camera.height, camera.width, camera.height);
    Phaser.Actions.RandomRectangle(bg.getChildren(), rect);	
    // Colorer les étoiles pour que ça fasse un peu plus gai
    
    bg.getChildren().forEach(function(element) {
        const variableColor = 80;
        const red = 255 - variableColor + Math.floor(Math.random() * variableColor);				
        const green = 255 - variableColor + Math.floor(Math.random() * variableColor);
        const blue = 255 - variableColor + Math.floor(Math.random() * variableColor);				
        element.setTint(red*256*256 + green*256 + blue);
    });

    // Définir couleur arrière plan
    camera.setBackgroundColor('rgba(0, 0, 0, 2)');

    // Définir Taille vaisseau
    pilote.player.setScale(0.6);

    // Définir vitesse max du vaisseau (et ralentissement naturel)
    pilote.player.body.maxVelocity.set(pilote.baseShipStats.maxVelocity * pilote.meca_power);
    pilote.player.body.drag.set(100);

    // Caméra suit le joueur
    camera.startFollow(pilote.player, false);

}

function pilote_update (time, delta)
{
    if (pilote.gameOver == true){
        return;
    }

    // Mettre toutes les étoiles dans l'image
    stars = bg.getChildren();
      for (i = 0; i < stars.length; i++) 
    {
        if (stars[i].x < camera.worldView.x)
            stars[i].x += camera.width;
        if (stars[i].x > camera.worldView.x  + camera.width)
            stars[i].x -= camera.width;

        if (stars[i].y < camera.worldView.y)
            stars[i].y += camera.height;
        if (stars[i].y > camera.worldView.y + camera.height)
            stars[i].y -= camera.height;
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
        ennemi = ennemis.get();
        if (ennemi)
        {
            ennemi.display();
            pilote.lastEnnemiApparu = time;
        }
    }
    

    // Gestion des inputs du joueur
    cursors = this.input.keyboard.createCursorKeys();
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
        velocity = this.physics.velocityFromRotation(pilote.player.rotation, pilote.baseShipStats.acceleration);
        pilote.player.setAccelerationX(velocity.x);
        pilote.player.setAccelerationY(velocity.y);				
    }
    else if (cursors.down.isDown)
    {
        velocity = this.physics.velocityFromRotation(pilote.player.rotation + Math.PI, pilote.baseShipStats.acceleration);
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
                tir = tirs.get();
                if (tir)
                {
                    tir.fire(pilote.player.x, pilote.player.y, pilote.player.rotation, pilote.player.body.velocity, pilote.baseShipStats.vitesseTir, true, pilote.baseShipStats.precisionTir,  pilote.baseShipStats.degats);
                    pilote.lastFired = time;
                }
            }
        }
    }
}	

