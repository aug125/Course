class Effect {
    constructor(name, minValue, maxValue, randomValue = 0.2) {
        this.name = name;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.randomValue = randomValue;
    }

    initialize(rarity) {
        this.value = this.minValue + (this.maxValue - this.minValue) * rarity + (Math.random() - 0.5) * this.randomValue;       
    }

}

// Définit le bonus
class Bonus {
    constructor(name, description, minRarity, listEffects, module, cost, imageName) {

        Bonus.counter = 0;

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
                color = 0x444400;
                break;
            case ("weapon") :
                color = 0x664400;
                break;
            case ("shield_upgrade") :
                color = 0x001133;
                break;
            case ("system_upgrade") :
                color = 0x222222;
                break;
            case ("power_upgrade") :
                color = 0x330000;
                break;
            default:
                color = 0x222222;
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

}


class BonusManager {

    constructor(scene) {

        this.listBonus = [];
        

        // Optimisation des canons    
        this.listBonus.push(new Bonus(
              "Surchargeur de canon", // Name
              "Une optimisation de la répartition de l'énergie des canons de tir permet d'augmenter la fréquence de tir", // Description
              0, // Rareté minimale
              [new Effect("fireFrequence", 50, 250)], // Liste des effets
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