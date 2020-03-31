class GameOver extends Phaser.Scene {

    constructor ()
    {
        super('GameOver');
        console.log("constructeur");
    }

    init (data)
    {

    }

    preload() {
        this.phaser = this;
    }
    create = function(){ 
        
        let self = this;
        // Sockets PILOTE->TOUS
        socket.on("score",  function(score) {
            console.log(score);
            self.add.text(game.config.width /2 - 70  ,game.config.height /2 - 20, 'Score:' + score, { fontSize: '64px', fill: '#FFF' });
        });		
        
    }

    update = function(time, delta) {
    }

    onScoreReceived(score) {
    }

}