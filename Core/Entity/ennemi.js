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
        let angleApparition = Math.random() * Math.PI*2;
        let distanceApparition = 1000;
        this.setPosition(pilote.player.x + Math.cos(angleApparition) * distanceApparition, pilote.player.y + Math.sin(angleApparition) * distanceApparition);
        this.setRotation(angleApparition + Math.PI); // L'ennemi fait face au joueur
        this.body.maxVelocity.set(this.stats.maxVelocity);
	},

    update: function (time, delta)
    {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, pilote.player.x, pilote.player.y);
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
        let velocity = this.scene.physics.velocityFromRotation(this.rotation, this.stats.acceleration);
        this.body.setAccelerationX(velocity.x);
        this.body.setAccelerationY(velocity.y);

        // Faire tirer le vaisseau
        if (time - this.lastFired > 1000 && pilote.gameOver == false) {
            tir = tirs.get();
            if (tir)
            {
                tir.fire(this.x, this.y, this.rotation, this.body.velocity, this.stats.vitesseTir, false, this.stats.precisionTir, this.stats.degats);
                this.lastFired = time;
            }
        }
    },
    remove : function() 
    {    
        this.setVisible(false);
        this.setActive(false);
    }
});