let Ennemi = new Phaser.Class({
	
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Ennemi (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'vaisseau');
        this.scene = scene;
        this.lastFired = 0;
        this.gameStats = new Stats("game");    
        this.displayed = false;
        this.playerId = -1;

    },

    display: function ()
    {
        this.stats = new Stats("player");
        this.setScale(this.stats.scale);
        this.setActive(true);
		this.setVisible(true);  


        //Positionner le vaisseau autour du joueur
        // Choisir un angle        
        
        this.body.maxVelocity.set(this.stats.maxVelocity);

        // Création des particules
        this.ennemiEmitter = this.scene.particles.createEmitter({
            lifespan: 600,
            speed: { min: 400, max: 600 },
            scale: { start: 0.2, end: 0 },
            tint: 0x990099,
            blendMode: 'ADD',
        });

        this.ennemiEmitter.startFollow(this);

	},

    update: function (time, delta)
    {
        if (this.active == false) {
            return;
        }
/*
        // Faire tourner l'ennemi vers le joeuur
        if ( this.scene.gameOver == false) {
            let angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
            let ecartAngle = angle - this.rotation;
            while (ecartAngle < 0) {
                ecartAngle += Math.PI * 2;
            }
            while (ecartAngle > Math.PI * 2) {
                ecartAngle -= Math.PI * 2;
            }       

            if ( ecartAngle > Math.PI) {
                this.body.setAngularVelocity(-this.stats.vitesseRotation);
            }
            else {
                this.body.setAngularVelocity(this.stats.vitesseRotation);
            }
        }
        else {
            this.body.setAngularVelocity(0);
        }
*/
/*        // Avancer le vaisseau        
        let velocity = this.scene.physics.velocityFromRotation(this.rotation, this.stats.acceleration);
        this.body.setAccelerationX(velocity.x);
        this.body.setAccelerationY(velocity.y);

        // Calcul distance entre vaisseau et joueur
        const distanceEnnemiPlayer = Phaser.Math.Distance.Between(this.scene.player.x, this.scene.player.y, this.x, this.y);
*/
        const randomParticleAngle = 15;

        // Positionner les particules de l'ennemi
        this.ennemiEmitter.setAngle( {min : this.angle + 180 - randomParticleAngle, max: this.angle + 180 + randomParticleAngle });
        this.ennemiEmitter.setPosition (-Math.cos(this.rotation) * 20, -Math.sin(this.rotation) * 20);


    },
    
});