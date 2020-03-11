
var pilote = {}; 
pilote.lastFired = 0;
pilote.lastEnnemiApparu = 0;
pilote.score = 0;
pilote.scoreText;
pilote.gameOver = false;
pilote.player;

pilote.power = 0;

pilote.joueurTouche = function(player, tir) {
    if (tir.isPlayer == false)
    {
        // Arrêt du joueur
        player.setVelocity(0,0);
        player.setAccelerationX (0);
        player.setAccelerationY (0);
        player.setAngularVelocity(0);
        player.setVisible(false);

        pilote.gameOver = true;

        // Score au milieu
        pilote.scoreText.setPosition(500, 500);
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
    pilote.power = newPowerValue;
    pilote.player.body.maxVelocity.set(baseShipStats.maxVelocity * pilote.power);    
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
}

function pilote_create ()
{
    // Création du joueur !
    pilote.player = this.physics.add.image(0, 0, 'vaisseau');


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

    // Créer le callback en cas de tir
    this.physics.add.overlap(pilote.player, tirs, pilote.joueurTouche, null, this);

    // Créer le callback en cas de tir
    this.physics.add.overlap(ennemis, tirs, pilote.ennemiTouche, null, this);

    // Création du vaisseau
    baseShipStats = new Stats("player");				

    // Resize selon l'écran
    // Création de la caméra
    camera = this.cameras.main;
    camera.setSize(game.config.width, game.config.height);

    // Ajout des étoiles en arrière plan
    bg = this.add.group({ key: 'star', frameQuantity: 50 });				
    var rect = new Phaser.Geom.Rectangle(camera.width, camera.height, camera.width, camera.height);
    Phaser.Actions.RandomRectangle(bg.getChildren(), rect);			

    // Colorer les étoiles pour que ça fasse un peu plus gai
    
    bg.getChildren().forEach(function(element) {
        let red = 200 + Math.floor(Math.random() * 55);				
        let green = 200 + Math.floor(Math.random() * 55);
        let blue = 200 + Math.floor(Math.random() * 55);				
        element.setTint(red*256*256 + green*256 + blue);
    });

    // Définir couleur arrière plan
    camera.setBackgroundColor('rgba(0, 0, 0, 2)');

    // Définir Taille vaisseau
    pilote.player.setScale(0.5);

    // Définir vitesse max du vaisseau (et ralentissement naturel)
    pilote.player.body.maxVelocity.set(baseShipStats.maxVelocity * pilote.power);
    pilote.player.body.drag.set(100);

    // Caméra suit le joueur
    camera.startFollow(pilote.player, false);



}

function pilote_update (time, delta)
{
    if (pilote.gameOver == true){
        return;
    }

    // Création des ennemis				
    if (time > pilote.lastEnnemiApparu + 31000)
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
        pilote.player.setAngularVelocity(-baseShipStats.vitesseRotation * pilote.power);

    }
    else if (cursors.right.isDown)
    {
        pilote.player.setAngularVelocity(baseShipStats.vitesseRotation * pilote.power);
    }
    else
    {
        pilote.player.setAngularVelocity(0);
    }
    if (cursors.up.isDown)
    {
        velocity = this.physics.velocityFromRotation(pilote.player.rotation, baseShipStats.acceleration);
        pilote.player.setAccelerationX(velocity.x);
        pilote.player.setAccelerationY(velocity.y);				
    }
    else if (cursors.down.isDown)
    {
        velocity = this.physics.velocityFromRotation(pilote.player.rotation + Math.PI, baseShipStats.acceleration);
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
        // Vérifier que le tir précédent soit suffisamment lointain
        if (time > pilote.lastFired + baseShipStats.rechargementTir)
        {
            tir = tirs.get();
            if (tir)
            {
                tir.fire(pilote.player.x, pilote.player.y, pilote.player.rotation, pilote.player.body.velocity, baseShipStats.vitesseTir, true, baseShipStats.precisionTir);
                pilote.lastFired = time;
            }
        }
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

}	

