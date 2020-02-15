var Tir = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Tir (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'star');
    },

    fire: function (x, y, rotation, speed)
    {
        this.setPosition(x, y);
        this.setRotation(rotation);
        this.setActive(true);
        this.setVisible(true);
        this.speed = speed;
        this.start = Date.now();
    },

    update: function (time, delta)
    {
        let speed = this.speed * delta / 1000;

        this.x += Math.cos(this.rotation) * speed;
        this.y += Math.sin(this.rotation) * speed;

        // Durée de vie
        let lifeTime = 1000;

        if (Date.now() - this.start > lifeTime)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
});