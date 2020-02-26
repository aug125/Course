var Ennemi = new Phaser.Class({

	
    Extends: Phaser.GameObjects.Image,

    initialize:

    function Ennemi (scene)
    {
          Phaser.GameObjects.Image.call(this, scene, 0, 0, 'vaisseau');
          this.scene = scene;
          this.lastFired = 0;

    },

    display: function (x, y)
    {
		this.x = x;
		this.y = y;
		this.setActive(true);
		this.setVisible(true);  
		this.setPosition(x, y);
        this.setRotation(40);
        this.speed = 100;
        //this.body.setVelocity(Math.cos(this.rotation) * this.speed, Math.sin(this.rotation) * this.speed);
	},

    update: function (time, delta)
    {
        let angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        let ecartAngle = angle - this.rotation;
        while (ecartAngle < 0) {
            ecartAngle += Math.PI * 2;
        }
        while (ecartAngle > Math.PI * 2) {
            ecartAngle -= Math.PI * 2;
        }       

        if ( ecartAngle > Math.PI) {
            this.body.setAngularVelocity(-50);
        }
        else {
            this.body.setAngularVelocity(50);
        }
        let velocity = this.scene.physics.velocityFromRotation(this.rotation, 20);
        this.body.setAccelerationX(velocity.x);
        this.body.setAccelerationY(velocity.y);

        // Faire tirer le vaisseau
        if (time - this.lastFired > 1000) {
            tir = tirs.get();
            if (tir)
            {
                console.log("tir");

                tir.fire(this.x, this.y, this.rotation, this.body.velocity, 200, false);
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