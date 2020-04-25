class Effect {
    constructor(id, minValue, maxValue, randomValue = 0.2) {
        this.id = id;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.randomValue = randomValue;

        switch (this.id) {
            case "fireFrequence":
                this.name = "Fréquence de tir";
                break;
            default:
                this.name = "Pouvoir inconnu";
                break;
        }

    }

    initialize(rarity) {
        this.value = this.minValue + (this.maxValue - this.minValue) * rarity + (Math.random() - 0.5) * 2 * this.randomValue * this.minValue;       
    }

}

// Définit le bonus
class Bonus {
    constructor(name, description, minRarity, listEffects, module, cost, imageName) {

        this.name = name;
        this.description = description;

        // Rareté : compris entre 0 (commun) et 1 (rare).
        // Rareté minimale du bonus 
        this.minRarity = minRarity;

        // Map contenant la liste des effets 
        this.listEffects = listEffects;

        // Le module concerné : "power" "weapon" "repare" "radar" "shield"
        this.module = module;

        // Coût du bonus en GW
        this.cost = cost;

        this.imageName = imageName;

        // Numéro de l'emplacement d'équipement. -1 -> non utilisé
        this.idEquipment = -1;

    }

    // Modifier les stats selon la valeur de rareté
    initialize(rarity) {
        this.rarity = rarity;

        //Attribuer ID du bonus
        this.id = Bonus.counter;        
        Bonus.counter++;
        this.listEffects.forEach(effect => {
            effect.initialize(rarity);
        });
    }

    getBaseColor() {

        // Couleur de la base, dépendant du type de bonus
        let color;
        switch (this.module) {
            case ("weapon_upgrade") :
                color = "#444400";
                break;
            case ("weapon") :
                color = "#664400";
                break;
            case ("shield_upgrade") :
                color = "#001133";
                break;
            case ("system_upgrade") :
                color = "#222222";
                break;
            case ("power_upgrade") :
                color = "#330000";
                break;
            default:
                color = "#222222";
                break;                            
        }
        return color;

    }

    getColor() {
        let color;
        if (this.rarity < 0.2) {
            color = "#ffffff";
        }
        else if (this.rarity < 0.4) {
            color = "#11cc11";
        }

        else if (this.rarity < 0.6) {
            color = "#22aaff";
        }

        else if (this.rarity < 0.8) {
            color = "#9900aa";
        }
        else {
            color = "#ff4400";
        }
        return color;
    }

    getRarityText() {
        let rarity;

        if (this.rarity < 0.2) {
            rarity = "Commun";
        }
        else if (this.rarity < 0.4) {
            rarity = "Peu commun";
        }

        else if (this.rarity < 0.6) {
            rarity = "Rare";
        }

        else if (this.rarity < 0.8) {
            rarity = "Très rare";
        }
        else {
            rarity = "Légendaire";
        }
        return rarity;
    }

    draw(scene, posOffsetX, posOffsetY) {

        this.originX =  50 + posOffsetX;
        this.originY = 50 + posOffsetY;

        const baseColor = this.getBaseColor();
        const baseColorHex = baseColor.replace("#", "0x");

        const color = this.getColor();
        const colorHex = color.replace("#", "0x");

        this.baseImg = scene.add.image(this.originX, this.originY, "baseBonus").setScale(0.6).setTint(baseColorHex).setVisible(scene.currentScene == "equipment")
        .setInteractive()
        .on('pointerover', () => { 
            scene.setEquipmentText(this);
        })
        .on('pointerout', () => { 
            scene.resetEquipmentText();
        })
        .on('pointerdown', () => {
            scene.placeEquipment(this);
        });

        this.img = scene.add.image(this.originX, this.originY, this.imageName).setScale(0.5).setTint(colorHex).setVisible(scene.currentScene == "equipment").setDepth(2);
    }

    equipe(equipmentLocation) {
        this.baseImg.x = equipmentLocation.x;
        this.baseImg.y = equipmentLocation.y;
        this.img.x = equipmentLocation.x;
        this.img.y = equipmentLocation.y;

        this.idEquipment = equipmentLocation.id;

    }

    unequip() {
        this.idEquipment = -1;
        this.baseImg.x = this.originX;
        this.baseImg.y = this.originY;
        this.img.x = this.originX;
        this.img.y = this.originY;
    }

}


class BonusManager {

    constructor(scene) {

        this.listBonus = [];
        Bonus.counter = 0;
        
        // Optimisation des canons    
        this.listBonus.push(new Bonus(
              "Surchargeur de canon", // Name
              "Une optimisation de la répartition de l'énergie des canons de tir permet d'augmenter la fréquence de tir", // Description
              0, // Rareté minimale
              [new Effect("fireFrequence", 0.5, 2.5)], // Liste des effets
              "weapon_upgrade", // Module
              50, // Coût
              "surchargeur" // Nom de l'image
            )
        );
    }


    getNewBonus(){

        // Calculer notre "chance"
        const random = Math.random();
        const rarity = Math.pow(random, 4);

        // Récupérer le bonus
        let bonus;
        do {
            bonus = this.listBonus[Math.floor(Math.random() * this.listBonus.length)];
        } while (bonus.minRarity > rarity);

        bonus.initialize(rarity);

        return bonus;
    }

}