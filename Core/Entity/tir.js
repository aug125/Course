let Tir = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Tir (scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'tir');
    },

    fire: function (x, y, rotation, velocity, speed, isPlayer, precisionTir)
    {

       if (isPlayer)
            this.setTint(0x00dd00);
        else
            this.setTint(0xee0000);

        rotation += (Math.random() * 2 - 1) * precisionTir; 

        this.isPlayer = isPlayer;
        this.setPosition(x, y);
        this.setRotation(rotation);
        this.setActive(true);
        this.setVisible(true);        
        this.speed = speed; // Vitesse, par rapport à sa direction
        this.start = Date.now();        
        this.body.setVelocity(Math.cos(rotation) * speed + velocity.x, Math.sin(rotation) * speed + velocity.y);
    },

    update: function (time, delta)
    {
        // Durée de vie
        let lifeTime = 3000;

        if (Date.now() - this.start > lifeTime)
        {
            this.setActive(false);
            this.setVisible(false);
        }   
    }
});