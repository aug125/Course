let Ennemi = new Phaser.Class({

	
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Ennemi (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'vaisseau');
        this.scene = scene;
        this.lastFired = 0;
        this.stats = new Stats("ennemi");

    },

    display: function ()
    {
        this.setActive(true);
		this.setVisible(true);  

        //Positionner le vaisseau autour du joueur
        // Choisir un angle
        const angleApparition = Math.random() * Math.PI*2;
        const distanceApparition = 1000;
        this.setPosition(this.scene.player.x + Math.cos(angleApparition) * distanceApparition, this.scene.player.y + Math.sin(angleApparition) * distanceApparition);
        this.setRotation(angleApparition + Math.PI); // L'ennemi fait face au joueur
        this.body.maxVelocity.set(this.stats.maxVelocity);

        // Création des particules
        this.ennemiEmitter = this.scene.playerParticles.createEmitter({
            lifespan: 1200,
            speed: { min: 400, max: 600 },
            scale: { start: 0.2, end: 0 },
            tint: 0xee1144,
            blendMode: 'ADD',
        });

        this.ennemiEmitter.startFollow(this);

	},

    update: function (time, delta)
    {
        
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
        let velocity = this.scene.physics.velocityFromRotation(this.rotation, this.stats.acceleration);
        this.body.setAccelerationX(velocity.x);
        this.body.setAccelerationY(velocity.y);

        // Faire tirer le vaisseau
        if (time - this.lastFired > this.stats.rechargementTir && this.scene.gameOver == false) {
            let tir = this.scene.tirs.get();
            if (tir)
            {
                tir.fire(this.x, this.y, this.rotation, new Phaser.Math.Vector2(0,0), this.stats.vitesseTir, false, this.stats.precisionTir, this.stats.degats);
                this.lastFired = time;
            }
        }

        // Mise à jour de la direction des particules

        const randomParticleAngle = 15;

        // Positionner les particules du joueur
        this.ennemiEmitter.setAngle( {min : this.angle + 180 - randomParticleAngle, max: this.angle + 180 + randomParticleAngle });

    },
    remove : function() 
    {    
        this.setVisible(false);
        this.setActive(false);
        this.ennemiEmitter.on = false;
    }
});