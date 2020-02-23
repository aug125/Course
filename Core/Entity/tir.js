var Tir = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Tir (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'star');
        var _velocity = (0,0);
    },

    fire: function (x, y, rotation, velocity, speed)
    {
        this.setPosition(x, y);
        this.setRotation(rotation);
        this.setActive(true);
        this.setVisible(true);        
        this.speed = speed;
        this.start = Date.now();        
        _velocity = velocity;
    },

    update: function (time, delta)
    {
        let speed = this.speed * delta / 1000;
        let velocityX = _velocity.x * delta / 1000;
        let velocityY = _velocity.y * delta / 1000;

        this.x += Math.cos(this.rotation) * speed + velocityX;
        this.y += Math.sin(this.rotation) * speed + velocityY;

        // Durée de vie
        let lifeTime = 3000;

        if (Date.now() - this.start > lifeTime)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});