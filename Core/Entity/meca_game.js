let meca = {}; 

// Puissance
meca.power;

// Sliders

meca.sendSettings = function() {
    if (meca.power.isChanged == true) {
        socket.emit("power", meca.power.value);
        meca.power.isChanged = false;
    }
    if (meca.weapon.isChanged == true) {
        socket.emit("weapon", meca.weapon.value);
        meca.weapon.isChanged = false;
    }
    if (meca.shield.isChanged == true) {
        socket.emit("shield", meca.shield.value);
        meca.shield.isChanged = false;
    }
    
};


function meca_preload ()
{

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
    this.load.plugin('rexsliderplugin', url, true);
  
    this.load.image('manette', 'manette.png');
    
    // Nécessaire pour corriger le bug du slider
    this.scale.setGameSize(game.config.width, game.config.height);


}

function meca_create ()
{

       // Gestion du relachement du clic gauche
    this.input.on('pointerup', function (pointer) {        
        meca.sendSettings();        
    }, this);    

    meca.power  = meca.createSlider(this, "PUISSANCE", game.config.width / 5, game.config.height * 3 /5, 1, '#ffaaaa');
    meca.weapon = meca.createSlider(this, "ARMEMENT", game.config.width* 2 / 5, game.config.height * 3 /5, 1, '#aaffaa');
    meca.shield = meca.createSlider(this, "BOUCLIER", game.config.width * 3 / 5, game.config.height * 3 /5, 1, '#aaaaff');
    meca.shield = meca.createSlider(this, "REPARATIONS", game.config.width * 4 / 5, game.config.height * 3 /5, 1, '#bbbbbb');
 
}

function meca_update (time, delta) {

}	

meca.createSlider = function(game,  text, posX, posY, size, color) {



        // Création du slider de puissance
        let object = game.add.image(posX, posY, 'manette');
        object.originY = 1;        
        object.slider = game.plugins.get('rexsliderplugin').add(object, {
           endPoints: [{
                   x: object.x,
                   y: object.y - 100 * size
               },
               {
                   x: object.x,
                   y: object.y + 100 * size
               }
           ],
           value: 1
        });

        object.isChanged = false;

        // Trait
        game.add.graphics()
        .lineStyle(3, 0x888888, 1)
        .strokePoints(object.slider.endPoints);

        // Mettre la manette au premier plan
        object.setDepth(1);


        object.value = 0;
        object.textValue = game.add.text(object.x - 45,object.y + 40, object.value +" GW")
        .setStyle({
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center'
        });
        object.textName = game.add.text(object.x - 100,object.y + 80, text)
        .setStyle({
            fontSize: '38px',
            fontFamily: 'Arial',
            color: color,
            align: 'center'
        });
   
        object.slider.on('valuechange', function(newValue, prevValue){  
                object.isChanged = true; 
                object.value = (1-newValue); 
                object.textValue.setText(Math.round(object.value * 100) + " GW");
            }
        );

        game.cursorKeys = game.input.keyboard.createCursorKeys();
        return object;

};

