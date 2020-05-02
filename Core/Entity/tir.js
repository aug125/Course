let Tir = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Tir (scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'tir');
    },

    fire: function (x, y, rotation, velocity, speed, isPlayer, precisionTir, damage, homing)
    {
        this.setScale(0.5);

        let color;
        if (isPlayer)
            color = 0x00dd00;
        else
            color = 0xee0000;

        this.setTint(color);

        rotation += (Math.random() * 2 - 1) * precisionTir; 

        this.isPlayer = isPlayer;
        this.setPosition(x, y);
        this.setRotation(rotation);
        this.setActive(true);
        this.setVisible(true);   
        this.speed = speed; // Vitesse, par rapport à sa direction
        this.homing = homing;
        this.start = Date.now();  
        this.damage = damage;      
        this.body.setVelocity(Math.cos(rotation) * speed + velocity.x, Math.sin(rotation) * speed + velocity.y);


        // Création des particules
        this.emitter = this.scene.particles.createEmitter({
            lifespan: 800,
            speed: { min: 10, max: 40 },
            scale: { start: 0.1, end: 0.06 },
            alpha: { start: 1, end: 0 },
            tint: color,
            blendMode: 'ADD',
            quantity: 1
       });

       this.emitter.startFollow(this);


    },


    remove: function() {
        this.setActive(false);
        this.setVisible(false);
        this.damage = 0;
        this.emitter.on = false;
    },

    update: function (time, delta)
    {
        // Diriger le tir s'il est à tête chercheuse

        const homing = this.homing * delta / 1000;
        const timeBeforeHoming = 500;

        if (homing > 0 && Date.now() - this.start > timeBeforeHoming) {

            // Si tir joueur, diriger vers l'ennemi le plus proche.
            let target;

            if (this.isPlayer == true) {
                target = this.scene.physics.closest(this, this.scene.ennemis.getChildren()); 
            }
            else {
                target = this.scene.player;
            }
            
            if (target !== null) {
                let angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
                let ecartAngle = angle - this.rotation;
                while (ecartAngle < 0) {
                    ecartAngle += Math.PI * 2;
                }
                while (ecartAngle > Math.PI * 2) {
                    ecartAngle -= Math.PI * 2;
                }
                if ( ecartAngle > Math.PI) {                    
                    //this.body.setAngularVelocity(this.homing);
                    this.setRotation(this.rotation - homing);
                }
                else {
                    //this.body.setAngularVelocity(this.homing);
                    this.setRotation(this.rotation + homing);
                }
                this.body.setVelocity(Math.cos(this.rotation) * this.speed, Math.sin(this.rotation) * this.speed);
                
                if (this.isPlayer) {
                    color = 0x00aaff;

                }
                else {
                    color = 0xaa00ff;
                }
                this.emitter.setTint(color);
                this.setTint(color);
            }
        }

        // Durée de vie
        let lifeTime = 3000;

        if (Date.now() - this.start > lifeTime)
        {
            this.remove();
        }   

        const randomParticleAngle = 8;        

        // Positionner les particules du tir
        this.emitter.setAngle( {min : this.angle + 180 - randomParticleAngle, max: this.angle + 180 + randomParticleAngle });
       
    }

});