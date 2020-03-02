var vaisseau = new Image();			
var bulletTime = 0;
var lastFired = 0;
var lastEnnemiApparu = 0;
var score = 0;
var scoreText;
var gameOver = false;

function joueurTouche(player, tir)
{
    if (tir.isPlayer == false)
    {
        // Arrêt du joueur
        player.setVelocity(0,0);
        player.setAccelerationX (0);
        player.setAccelerationY (0);
        player.setAngularVelocity(0);
        player.setVisible(false);

        gameOver = true;

        // Score au milieu
        scoreText.setPosition(500, 500);
    }
}

function ennemiTouche(ennemi, tir)
{
    if (tir.isPlayer == true && ennemi.active == true)
    {
        ennemi.remove();
        score++;
        scoreText.setText('Score: ' + score);
    }
}


function preload ()
{

    // Parait que c'est mieux avec ça...
    game.renderer.clearBeforeRender = false;
    game.renderer.roundPixels = true;


    // Charger les images
    this.load.image('vaisseau', 'vaisseau.png');
    this.load.image('star', 'star.png');
    this.load.image('tir', 'tir.png');
}

function create ()
{
    // Création du joueur !
    player = this.physics.add.image(0, 0, 'vaisseau');


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

    scoreText = this.add.text(0, 0, 'Score: 0', { fontSize: '64px', fill: '#FFF' });
    scoreText.setScrollFactor(0,0);

    // Créer le callback en cas de tir
    this.physics.add.overlap(player, tirs, joueurTouche, null, this);

    // Créer le callback en cas de tir
    this.physics.add.overlap(ennemis, tirs, ennemiTouche, null, this);

    // Création du vaisseau
    playerStats = new Stats("player");				

    // Resize selon l'écran
    // Création de la caméra
    camera = this.cameras.main;
    console.log(game.config.width);
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
    player.setScale(0.5);

    // Définir vitesse max du vaisseau (et ralentissement naturel)
    player.body.maxVelocity.set(playerStats.maxVelocity);
    player.body.drag.set(100);

    // Caméra suit le joueur
    camera.startFollow(player, false);



}

function update (time, delta)
{
    if (gameOver == true){
        return;
    }


    // Création des ennemis				
    if (time > lastEnnemiApparu + 3000)
    {
        ennemi = ennemis.get();
        if (ennemi)
        {
            ennemi.display();
            lastEnnemiApparu = time;
        }
    }
    

    // Gestion des inputs du joueur
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
    {
        player.setAngularVelocity(-playerStats.vitesseRotation);

    }
    else if (cursors.right.isDown)
    {
        player.setAngularVelocity(playerStats.vitesseRotation);
    }
    else
    {
        player.setAngularVelocity(0);
    }
    if (cursors.up.isDown)
    {
        velocity = this.physics.velocityFromRotation(player.rotation, playerStats.acceleration);
        player.setAccelerationX(velocity.x);
        player.setAccelerationY(velocity.y);				
    }
    else if (cursors.down.isDown)
    {
        velocity = this.physics.velocityFromRotation(player.rotation + Math.PI, playerStats.acceleration);
        player.setAccelerationX(velocity.x);
        player.setAccelerationY(velocity.y);					
    }

    else
    {
        player.setAccelerationX (0);
        player.setAccelerationY (0);
    }

    // Tirer
    if (cursors.space.isDown)
    {
        // Vérifier que le tir précédent soit suffisamment lointain
        if (time > lastFired + playerStats.rechargementTir)
        {
            tir = tirs.get();
            if (tir)
            {
                tir.fire(player.x, player.y, player.rotation, player.body.velocity, playerStats.vitesseTir, true, playerStats.precisionTir);
                lastFired = time;
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