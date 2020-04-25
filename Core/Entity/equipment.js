class EquipmentLocation {
  
    constructor(scene, name, offsetX, offsetY) {
        
        this.id = EquipmentLocation.counter;
        EquipmentLocation.counter++;
        this.scene = scene;
        this.nameEquipment = name;
        this.x = scene.squelette.x + offsetX;
        this.y = scene.squelette.y + offsetY;
        this.idBonus = -1; // Le bonus associé à l'équipement (par défaut -1)

        this.img = scene.add.image(this.x, this.y, "baseBonus").setScale(0.6).setVisible(false);
      
    }

}