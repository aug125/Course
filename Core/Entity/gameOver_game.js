class GameOver extends Phaser.Scene {

constructor ()
{
    super('GameOver');
}

preload = function() {
    }
create = function(){  
        this.add.text(game.config.width /2 - 70  ,game.config.height /2 - 20, 'Game Over', { fontSize: '64px', fill: '#FFF' });
    }

update = function(time, delta) {
    }
}