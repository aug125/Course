class EquipmentLocation {

    constructor(scene, name, x, y) {
        this.scene = scene;
        this.nameEquipment = name;
        this.idBonus = -1; // Le bonus associé à l'équipement (par défaut -1)

        scene.graphicsEquipment.lineStyle(2, 0xffffff);

        switch(name) {
            case ("weapon_upgrade") :
                scene.graphicsEquipment.fillStyle(0x444400);
                break;
            case ("weapon") :
                scene.graphicsEquipment.fillStyle(0x664400);
                break;
            case ("shield_upgrade") :
                scene.graphicsEquipment.fillStyle(0x001133);
                break;
            case ("system_upgrade") :
                scene.graphicsEquipment.fillStyle(0x222222);
                break;
            case ("power_upgrade") :
                scene.graphicsEquipment.fillStyle(0x330000);
                break;
        

            default:
                scene.graphicsEquipment.fillStyle(0x222222);
                break;                
        }


        scene.graphicsEquipment.strokeRect(scene.squelette.x + x - 40, scene.squelette.y + y - 40, 80, 80, 8);
        this.img = scene.graphicsEquipment.fillRect(scene.squelette.x + x - 40, scene.squelette.y + y - 40, 80, 80, 8);
//        this.img.
    }

}