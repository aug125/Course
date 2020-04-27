class Effect {
    constructor(id, minValue, maxValue, randomValue = 0.2) {
        this.id = id;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.randomValue = randomValue;

    }

    initialize(rarity) {
        this.value = this.minValue + (this.maxValue - this.minValue) * rarity + (Math.random() - 0.5) * 2 * this.randomValue * this.minValue;       
    }

    static getName(id) {

        switch (id) {
            case "fireFrequence":
                name = "Fréquence de tir";
                break;
            case "firePrecision":
                name = "Précision de tir";
                break;
            case "shieldMaxValue":
                name = "absorption du bouclier";
                break;
            case "shieldRegeneration":
                name = "Regénération du bouclier";
                break;
        
            default:
                name = "Pouvoir inconnu";
                break;
        }
    
        return name;

    }
}

// Définit le bonus
class Bonus {
    constructor(name, description, minRarity, listEffects, module, minCost, maxCost, imageName) {

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
        this.minCost = minCost;
        this.maxCost = maxCost;

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

        this.cost = this.minCost + Math.floor((this.maxCost - this.minCost) * this.rarity);
    }

    static getBaseColor(nameModule) {

        // Couleur de la base, dépendant du type de bonus
        let color;
        switch (nameModule) {
            case ("weapon") :
                color = "#666600";
                break;
            case ("shield") :
                color = "#001133";
                break;
            case ("system") :
                color = "#222222";
                break;
            case ("power") :
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

        const baseColor = Bonus.getBaseColor(this.module);
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
        
        this.listBonus.push(new Bonus(
              "Surchargeur de canon", // Name
              "Une optimisation de la répartition de l'énergie du canon\n permet d'augmenter la fréquence de tir.", // Description
              0, // Rareté minimale
              [new Effect("fireFrequence", 0.2, 1.5), 
               new Effect("firePrecision", -0.1, -0.5)], // Liste des effets
              "weapon", // Module
              50, // Coût minimal
              100, // Coût maximal
              "bonus_surchargeur" // Nom de l'image
            )
        );

        this.listBonus.push(new Bonus(
            "Bouclier énergétique", // Name
            "Un bouclier de grande capacité d'absorption et de regénération faible", // Description
            0, // Rareté minimale
            [new Effect("shieldMaxValue", 0.5, 1.2), 
             new Effect("shieldRegeneration", -0.4, -0.4)], // Liste des effets
            "shield", // Module
            20, // Coût minimal
            80, // Coût maximal
            "bonus_bouclier" // Nom de l'image
          )
      );

      // Todo reflecteurs, IA...

    }


    getNewBonus(){

        // Calculer notre "chance"
        const rarity = Math.random() * Math.random();

        // Récupérer le bonus
        let bonus;
        do {
            bonus = this.listBonus[Math.floor(Math.random() * this.listBonus.length)];
        } while (bonus.minRarity > rarity);

        bonus.initialize(rarity);

        return bonus;
    }

}