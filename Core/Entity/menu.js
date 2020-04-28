class Menu extends Phaser.Scene {

    constructor ()
    {
      super('Menu');    
    }

    init (data)
    {

    }

    preload() {

        this.load.image('piloteButton', 'piloteButton.png');

    }
    create = function(){
      let attenteText = this.add.text(800, 400, "En attente de la connexion de l'autre joueur")
      .setStyle({
          fontSize: '32px',
          fontFamily: 'Arial',
          color: "#33ff33",
          align: 'center'
      });
      attenteText.setOrigin(0.5);  

      let self = this;
      socket.on('jeu', function(role) {
        console.log("jeu");
        self.scene.start('MenuSelectRole');
      });

      // On annonce qu'on est prêt.
      socket.emit('newPlayer');

    };

}