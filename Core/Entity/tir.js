var Tir = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Tir (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'star');
        this.velocity = (0,0);
    },

    fire: function (x, y, rotation, velocity, speed, isPlayer)
    {
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