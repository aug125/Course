class MenuSelectRole extends Phaser.Scene {
    constructor ()
    {
        super('Menu');
        this.firstPlayer = false;
        this.targetSizePilote = 1;
        this.targetSizeMeca = 1;
    }

    init (data)
    {

    }

    preload() {

        this.load.image('piloteButton', 'piloteButton.png');
        this.load.image('mecaButton', 'mecaButton.png');

    }
    create = function(){ 
        

        // Couleur de l'arrière plan
        this.cameras.main.setBackgroundColor('#000009')

        let self = this;

        socket.on('sendId', function(id) {
            console.log("sendId");
            if (id % 2 == 0)
            {
                // Affichage chez le premier joueur
                self.textRole = self.add.text(game.config.width / 2, 800, "Choisissez votre rôle")
                .setOrigin(0.5)
                .setStyle({
                    fontSize: '64px',
                    fontFamily: 'Calibri',
                    color: "#cccccc",
                    align: 'center'
                });

                self.piloteButton = self.add.image(400, 400, 'piloteButton')
                .setInteractive()
                .on('pointerover', () => { 
                    self.textRole.setText("Pilote");
                    self.targetSizePilote = 1.2;
                })
                .on('pointerout', () => { 
                    self.textRole.setText("Choisissez votre rôle");
                    self.targetSizePilote = 1;
                })
                .on('pointerdown', () => self.piloteButtonClicked(self));

                self.mecaButton = self.add.image(1200, 400, 'mecaButton')
                .setInteractive()
                .on('pointerover', () => { 
                    self.textRole.setText("Meca");
                    self.targetSizeMeca = 1.2;
                })
                .on('pointerout', () => { 
                    self.textRole.setText("Choisissez votre rôle");
                    self.targetSizeMeca = 1;
                })
                .on('pointerdown', () => self.mecaButtonClicked(self));

                self.firstPlayer = true;
            }
            else
            {

                // Affichage chez le deuxième joueur
                let attenteText = self.add.text(800, 400, "En attente de la sélection de l'autre joueur")
                .setStyle({
                    fontSize: '32px',
                    fontFamily: 'Arial',
                    color: "#33ff33",
                    align: 'center'
                });
                attenteText.setOrigin(0.5);
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

        if (this.firstPlayer == false) {
            return;
        }
        const changeSizeSpeed = 1;
        
        // Changer taille bouton pilote
        const sizePilote = this.piloteButton.scaleX;
        let newScale = 1;
        if (sizePilote < this.targetSizePilote) {
            newScale = sizePilote + changeSizeSpeed * delta / 1000;
        }
        else if (sizePilote > this.targetSizePilote) {
            newScale = sizePilote - changeSizeSpeed * delta / 1000;
        }
        else {
            newScale = this.targetSizePilote;
        }

        newScale = Math.min(newScale, 1.2);
        newScale = Math.max(newScale, 1);
        this.piloteButton.setScale(newScale);

        // Changer taille bouton méca
        const sizeMeca = this.mecaButton.scaleX;
        if (sizeMeca < this.targetSizeMeca) {
            newScale = sizeMeca + changeSizeSpeed * delta / 1000;
        }
        else if (sizeMeca > this.targetSizeMeca) {
            newScale = sizeMeca - changeSizeSpeed * delta / 1000;
        }
        else {
            newScale = this.targetSizeMeca;
        }
        
        newScale = Math.min(newScale, 1.2);
        newScale = Math.max(newScale, 1);
        this.mecaButton.setScale(newScale);



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
