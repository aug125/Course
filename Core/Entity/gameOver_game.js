class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');
        console.log("constructeur");
    }

    printScore(score) {
        this.phaser.add.text(game.config.width /2 - 70, game.config.height /2 + 40, "Score : " + score, { fontSize: '64px', fill: '#FFF' });
    }
    
    preload = function() {
        this.phaser = this;
    }
    create = function(){  
        this.add.text(game.config.width /2 - 70  ,game.config.height /2 - 20, 'Game Over', { fontSize: '64px', fill: '#FFF' });
    }

    update = function(time, delta) {
    }

    static onScoreReceived(score) {
        console.log(this);
        this.printScore(score);
    }

    
}