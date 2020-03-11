var meca = {}; 
meca.power = 0.0;
meca.powerChanged = false;


meca.onPowerChanged = function(newValue){
    meca.power = (1-newValue);
    console.log(meca.power);
    meca.powerChanged = true;
};

meca.sendSettings = function() {
    if (meca.powerChanged == true) {
        socket.emit("power", meca.power);
    }
};


function meca_preload ()
{

    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexsliderplugin.min.js';
    this.load.plugin('rexsliderplugin', url, true);
  
    url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/white-dot.png';      
    this.load.image('dot', url);


}

function meca_create ()
{

    // Création du slider de puissance
    this.puissance = this.add.image(400, 300, 'dot').setScale(10, 10);
    this.puissance.slider = this.plugins.get('rexsliderplugin').add(this.puissance, {
        endPoints: [{
                x: this.puissance.x,
                y: this.puissance.y
            },
            {
                x: this.puissance.x,
                y: this.puissance.y + 100 
            }
        ],
        value: 1
    });
    this.puissance.text = this.add.text(this.puissance.x - 20,this.puissance.y + 40, '0');

    this.add.graphics()
        .lineStyle(3, 0x888888, 1)
        .strokePoints(this.puissance.slider.endPoints);

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    this.puissance.slider.on('valuechange', function(newValue, prevValue){ meca.onPowerChanged(newValue) });    

    // Gestion du relachement du clic gauche
    this.input.on('pointerup', function (pointer) {        
        meca.sendSettings();        
    }, this);

}

function meca_update (time, delta) {
    this.puissance.text.setText(Math.round(meca.power * 100) + " GW");
}	


