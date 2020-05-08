
class Pilote extends Phaser.Scene{ 

    constructor(){
        super('Pilote');
        this.lastFired = 0;
        this.timeLastEnnemyPop = 0;
        this.score = 0;
        this.gameOver = false;

        this.realShield = 0;

        // Ennemis restants;
        this.ennemiLeft = 0;

        // Qualité. à 0, pas de particules... (TODO)
        this.quality = 1;
        
        // Numéro de niveau
        this.currentLevel = 1;

        // Temps depuis le début du niveau
        this.timeStartLevel = -1;

        this.bonusManager = new BonusManager();

        // La liste de tous les bonus
        this.listUpgrade = new Map();

    }

    init(players) {
        this.playersInformation = players;
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
        
        this.shield.setAlpha(0);

        this.gameOver = true;
        this.scene.start('GameOver', { score: this.score});
    };

    // Callbacks
    joueurTouche (player, tir) {

    };

    ennemiTouche (ennemi, tir){

    };

    // Le joueur a réussi à atteindre le portail
    portalReached (player, portal) {
        this.soundTeleport.play();
        this.currentLevel++;        
        this.levelInitialisation();
    }

    // Le joueur a atteint un bonus
    bonusReached (player, pictureBonus)  {
        if (pictureBonus.visible == false) {
            return;
        }
        pictureBonus.setVisible(false);
        let bonus = this.bonusManager.getNewBonus();

        const color = bonus.getColor();
        const rarityText = bonus.getRarityText();
        

        this.printText(bonus.name + " (" + rarityText + ")", color);

    }

    openPortal() {
        // Ouverture du portail
        this.portal.setVisible(true);
        this.portal.timeSetActive = new Date().getTime();
        this.printText("Portail ouvert !");
    }    


    printText(text, color = "#ccffcc") {
        this.textPrincipal.setText(text);
        this.textPrincipal.timeDisplayed = new Date().getTime();
        this.textPrincipal.setAlpha(1);
        this.textPrincipal.setColor(color);
    }    
    getUpgradeCoeff(name) {
        // Retourne valeur + 1 ( 10% -> 1.1)
        return  (this.listUpgrade.has(name) ? this.listUpgrade.get(name) + 1 : 1);
    }

    getUpgradeValue(name) {
        // Retourne valeur ( 10% -> 0.1)
        return  (this.listUpgrade.has(name) ? this.listUpgrade.get(name) + 1 : 1);
    }
    levelInitialisation() {

        // Initialiser le niveau
        this.ennemiLeft =  this.gameStats.nbEnnemis;
        this.textEnnemiLeft.setText("Ennemis restants : " + this.ennemiLeft);
        this.textVague.setText("Niveau " + this.currentLevel);

        
        // Positionner le joueur
        this.player.x = 0;
        this.player.y = 0;
        this.player.setAccelerationX(0);
        this.player.setAccelerationY(0);
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);

        // Ajout des étoiles en arrière plan

        // Supprimer les anciennes
        if (this.bg !== undefined) {
            this.bg.getChildren().forEach(function(star) {
                star.setVisible(false);
                star.setActive(false);
            });
        }

        const nbStar = Math.random() * 200 + 100;

        this.bg = this.add.group({ key: 'star', frameQuantity: nbStar });
        this.bg.setDepth(-1);

        const rectScreen = new Phaser.Geom.Rectangle(0,0, this.cameras.main.width, this.cameras.main.height);
        Phaser.Actions.RandomRectangle(this.bg.getChildren(), rectScreen);	

        // Colorer les étoiles pour que ça fasse un peu plus gai
        this.bg.getChildren().forEach(function(element) {
            const variableColor = 120;
            const red = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            const green = 255 - variableColor + Math.floor(Math.random() * variableColor);
            const blue = 255 - variableColor + Math.floor(Math.random() * variableColor);				
            element.setTint(red*256*256 + green*256 + blue);

            // Taille aléatoire
            element.setScale(Math.random());
        });       


        // Mettre à jour le compteur                
        this.timeStartLevel = new Date().getTime();
    }

    // Méthodes de socket

    onGameOverReceived() {
        this.setGameOver();
    };

    onUpgradeReceived(listUpgrade) {
        this.listUpgrade = new Map(JSON.parse(listUpgrade));

        // Changer immédiatement certaines variables
        this.player.body.maxVelocity.set(this.baseShipStats.maxVelocity * this.getUpgradeCoeff("maxSpeed"));

    }

    setPositionEnnemi(ennemiInformations) {
        this.ennemis.getChildren().forEach(function (ennemi) {
            if (ennemi.playerId === ennemiInformations.playerId) {
                ennemi.setRotation(ennemiInformations.rotation);
                ennemi.setPosition(ennemiInformations.x, ennemiInformations.y);
            }
          });
    }

    addOtherPlayers(playerInfo) {
        console.log(playerInfo);
        let otherPlayer = this.ennemis.get(playerInfo.x, playerInfo.y);                
        otherPlayer.setTint(0xff0000);
        otherPlayer.playerId = playerInfo.playerId;
        otherPlayer.display();
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

        this.load.image('star', 'star.png');
        this.load.image('tir', 'tir.png');
        this.load.image('bouclier', 'bouclier.png');

        this.load.image('flares', 'flares.png');
        this.load.image('portail', 'portail.png');
        this.load.image('bonus', 'bonus.png');

        this.load.spritesheet('explosion', 'explosion.png', { frameWidth: 256, frameHeight:256 });

        // Sons
        this.load.audio('soundLaser4', "laser4.wav");
        this.load.audio('soundLaser7', "laser7.wav");        
        this.load.audio('soundChoc2', "choc2.ogg");
        this.load.audio('soundChoc3', "choc3.ogg");
        this.load.audio('soundExplosion', "explosion.ogg");

        this.load.audio('soundVortex', "vortex.ogg");
        this.load.audio('soundTeleport', "teleport.ogg");
        this.load.audio('soundReacteur', "reacteur.ogg");

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

        this.textEnnemiLeft = this.add.text(0,40, "Ennemis restants : " + this.ennemiLeft).setStyle({
            fontSize: '32px',
            fontFamily: 'Calibri',
            color: "#ffffff",
            align: 'center'
        }).setScrollFactor(0);

        this.textVague = this.add.text(0,0, "Niveau " + this.currentLevel).setStyle({
            fontSize: '32px',
            fontFamily: 'Calibri',
            color: "#ffffff",
            align: 'center'
        }).setScrollFactor(0);


        this.textPrincipal.timeDisplayed = 0;
        this.textPrincipal.setDepth(10);

        // Charger les sons
        this.soundLaser4 = this.sound.add("soundLaser4");
        this.soundLaser7 = this.sound.add("soundLaser7");
        this.soundChocs = [this.sound.add("soundChoc2"), this.sound.add("soundChoc3")];

        this.soundTeleport = this.sound.add("soundTeleport");
        this.soundExplosion = this.sound.add("soundExplosion");

        this.soundReacteur = this.sound.add("soundReacteur");
        this.soundReacteur.setLoop(true);
        this.soundReacteur.setVolume(0.8);

        this.soundVortex = this.sound.add("soundVortex");
        this.soundVortex.setVolume(0);
        this.soundVortex.setLoop(true);
        this.soundVortex.play();

        
        // Création des ennemis			
        this.ennemis = this.physics.add.group({
            classType: Ennemi,
            maxSize: 10,
            runChildUpdate: true
        });        

        let self = this;

        // Statistiques du vaisseau
        this.baseShipStats = new Stats("player"); 

        // Statistiques de la partie
        this.gameStats = new Stats("game");

        
        // Création des "tirs"			
        this.tirs = this.physics.add.group({
            classType: Tir,
            maxSize: 200,
            runChildUpdate: true
        });


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

        // Bonus
        this.bonus = this.physics.add.group({
            key: 'bonus',
            frameQuantity: 10
        });
        this.bonus.setVisible(false);

        this.playerEmitter.setFrequency(50, 1);
        this.playerEmitter.startFollow(this.player);
 
        // Créer les callbacks en cas de tir 
        this.physics.add.overlap(this.player, this.tirs, this.joueurTouche, null, this);
        //this.physics.add.overlap(this.ennemis, this.tirs, this.ennemiTouche, null, this);
        this.physics.add.overlap(this.player, this.bonus, this.bonusReached, null, this);
        
        // Resize selon l'écran
        // Création de la caméra
        this.camera = this.cameras.main;
        this.camera.setSize(game.config.width, game.config.height);


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
        this.player.body.drag.set(250);


        // Afficher tous les vaisseaux
        Object.keys(this.playersInformation).forEach(function (id) {
            console.log(socket.id);
            if (self.playersInformation[id].playerId === socket.id) {
                self.player.x = self.playersInformation[id].x;
                self.player.y = self.playersInformation[id].y;
            } else {
                self.addOtherPlayers(self.playersInformation[id]);
            }
        });



        // Caméra suit le joueur
        this.cameras.main.startFollow(this.player.body.position, false);

        
        // Sockets

        socket.on("position",  function(idPlayer, x, y) {
            self.setPositionEnnemi(idPlayer, x, y);
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
/*
        // Valeur bouclier à atteindre    
        const targerShield =(this.baseShipStats.maxBouclier * (this.getUpgradeCoeff("shieldMaxValue")));
        
        // Si le bouclier est plus puissant que le réglage, on le diminue
        if (this.realShield > targerShield) {

            this.realShield = Math.max(this.realShield - this.baseShipStats.rechargementBouclier * (this.getUpgradeCoeff("shieldRegeneration")) * delta / 1000, targerShield); 
        }    
        
        // Si le bouclier est moins puissant que le réglage, on l'augmente
        if (this.realShield < targerShield) {

            this.realShield = Math.min(this.realShield + this.baseShipStats.rechargementBouclier * (this.getUpgradeCoeff("shieldRegeneration")) * delta / 1000, targerShield);
        } 


        this.shield.setPosition (this.player.x, this.player.y);
        this.shield.setAlpha(this.realShield / this.baseShipStats.maxBouclier);
        this.shield.setScale(0.4 + (this.realShield / 100) / 10);

*/ 
        
        // Gestion des inputs du joueur
        let cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown)
        {
            // Gauche
            this.player.setAngularVelocity(-this.baseShipStats.vitesseRotation);

        }
        else if (cursors.right.isDown)
        {
            // Droite
            this.player.setAngularVelocity(this.baseShipStats.vitesseRotation);
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

            const velocity = this.physics.velocityFromRotation(this.player.rotation, this.baseShipStats.acceleration);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);	
            
            // Ajouter le son
            if (!this.soundReacteur.isPlaying) {
                this.soundReacteur.play();
            }
        }
        else if (cursors.down.isDown)
        {
            // Ajout des particules
            this.playerEmitter.on = true;

            // Positionner les particules du joueur
            this.playerEmitter.setAngle( {min : this.player.body.rotation - 5, max: this.player.body.rotation + 5 });   

            // Mettre les particules à l'arrière du vaisseau
            this.playerEmitter.setPosition (-Math.cos(this.player.rotation) * 20, -Math.sin(this.player.rotation) * 20);
        
            const velocity = this.physics.velocityFromRotation(this.player.rotation + Math.PI, this.baseShipStats.acceleration);
            this.player.setAccelerationX(velocity.x);
            this.player.setAccelerationY(velocity.y);

            // Ajouter le son
            if (!this.soundReacteur.isPlaying) {
                this.soundReacteur.play();
            }    

        }

        else
        {
            this.playerEmitter.on = false;
            this.player.setAccelerationX (0);
            this.player.setAccelerationY (0);

            // Ajouter le son
            if (this.soundReacteur.isPlaying) {
                this.soundReacteur.stop();
            }

        }

        // Tirer
        if (cursors.space.isDown)
        {
                // Vérifier que le tir précédent soit suffisamment lointain

                const bonusFire = this.getUpgradeCoeff("fireFrequence");
                const bonusPrecision = this.getUpgradeCoeff("firePrecision");
                
                if (time > this.lastFired + (this.baseShipStats.rechargementTir / bonusFire))
                {
                    let tir = this.tirs.get();
                    if (tir)
                    {
                        tir.fire(this.player.x, this.player.y, this.player.rotation, this.player.body.velocity, this.baseShipStats.vitesseTir, true, this.baseShipStats.precisionTir / bonusPrecision,  this.baseShipStats.degats);
                        this.lastFired = time;
                        this.soundLaser7.setDetune(Math.random() * 500);
                        this.soundLaser7.play();
                    }
                }        
        }
           
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
        if (timeElapsedLevel < 1500) {
            this.rectangleTransition.setAlpha(1 - (timeElapsedLevel / 1500));
            //this.cameras.main.setZoom(2 - Math.sqrt((timeElapsedLevel / 1500)));
        }
        else {
            this.rectangleTransition.setAlpha(0);
            //this.cameras.main.setZoom(1);
        }

        // Tinte des bonus
        const timeLoop = 1800;
        const currentTime = Math.min(Math.floor(time%timeLoop), timeLoop - Math.floor(time%timeLoop)) * 2;
        const color = Phaser.Display.Color.Interpolate.RGBWithRGB(
            5,100,30,
            200,200,0, 
            timeLoop, 
            currentTime);

        this.bonus.setTint(Math.round(color.r) * 256 * 256 + Math.round(color.g) * 256 + Math.round(color.b));

        // Envoi de sa position
        socket.emit("position", this.player.x, this.player.y, this.player.rotation);

    };
}