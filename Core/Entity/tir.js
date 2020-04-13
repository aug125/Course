var Tir = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Tir (scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'tir');
    },

    fire: function (x, y, rotation, velocity, speed, isPlayer, precisionTir, damage)
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
        this.start = Date.now();  
        this.damage = damage;      
        this.body.setVelocity(Math.cos(rotation) * speed + velocity.x, Math.sin(rotation) * speed + velocity.y);


        // Création des particules
        this.emitter = this.scene.particles.createEmitter({
            lifespan: 400,
            speed: { min: 400, max: 600 },
            scale: { start: 0.1, end: 0 },
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