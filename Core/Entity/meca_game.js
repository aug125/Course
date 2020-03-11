var meca = {}; 

// Puissance
meca.power;

// Sliders


meca.onPowerChanged = function(newValue){
    meca.power.value = (1-newValue);    
    meca.power.isChanged = true;
};

meca.sendSettings = function() {
    if (meca.power.isChanged == true) {
        socket.emit("power", meca.power.value);
        meca.power.isChanged = false;
    }
};


function meca_preload ()
{

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
    this.load.plugin('rexsliderplugin', url, true);
  
    this.load.image('manette', 'manette.png');

}

function meca_create ()
{
    meca.power = meca.createSlider(this, "toto", 0, 100, 300,400);
 
}

function meca_update (time, delta) {
    meca.power.text.setText(Math.round(meca.power.value * 100) + " GW");
}	

meca.createSlider = function(game,  text, minValue, maxValue, posX, posY) {


        // Création du slider de puissance
        object = game.add.image(posX, posY, 'manette');
        object.originY = 1;
        object.slider = game.plugins.get('rexsliderplugin').add(object, {
           endPoints: [{
                   x: object.x,
                   y: object.y - 150
               },
               {
                   x: object.x,
                   y: object.y + 150 
               }
           ],
           value: 1
        });

        // Trait
        game.add.graphics()
        .lineStyle(3, 0x888888, 1)
        .strokePoints(object.slider.endPoints);

        object.value = 0;
        object.text = game.add.text(object.x - 20,object.y + 40, object.value +" GW");
   
        game.cursorKeys = game.input.keyboard.createCursorKeys();

        object.slider.on('valuechange', function(newValue, prevValue){ meca.onPowerChanged(newValue) });    
   
       // Gestion du relachement du clic gauche
       game.input.on('pointerup', function (pointer) {        
           meca.sendSettings();        
       }, game);
       return object;

};

