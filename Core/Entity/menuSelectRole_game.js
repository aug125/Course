class MenuSelectRole extends Phaser.Scene {
    constructor ()
    {
        super('Menu');
        console.log("constructeur");
        this.firstPlayer = false;
    }

    init (data)
    {

    }

    preload() {
    }
    create = function(){ 
        
        let self = this;
             
        socket.on('sendId', function(id) {
            console.log("id joueur : " + id);
            if (id % 2 == 1) // Il s'agit du premier joueur. Celui-ci va choisir le rôle
            {

                self.piloteButton = self.add.text(100, 100, 'Pilote', { fill: '#0f0' })
                .setInteractive()
                .on('pointerdown', () => self.piloteButtonClicked(self));

                self.mecaButton = self.add.text(100, 200, 'Meca', { fill: '#0f0' })
                .setInteractive()
                .on('pointerdown', () => self.mecaButtonClicked(self));

                self.firstPlayer = true;
            }
            else
            {
                self.add.text(100, 200, "En attente de la sélection de l'autre joueur", { fill: '#0f0' });
            }
        });

        socket.on('role', function(role) {
            console.log("role envoyé par le premier joueur : " + role);
            console.log("Premier joueur : " + self.firstPlayer);
            if (self.firstPlayer == true) {
                // Rôle déjà choisi.
                return;
            }
            if (role == "pilote"){
                self.scene.start('Pilote');

            }
            else {
                self.scene.start('Meca');
            }
            
        });


    }

    update = function(time, delta) {
    }

    piloteButtonClicked(phaser) {
        socket.emit('role', 'meca');
        phaser.scene.start('Pilote');
    }
    mecaButtonClicked(phaser) {
        socket.emit('role', 'pilote');
        phaser.scene.start('Meca');
    }
}
