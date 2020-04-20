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
    constructor(name, description, minRarity, listEffects, module, cost) {

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

}


class BonusManager {

    constructor() {

        this.listBonus = [];
        

        // Optimisation des canons    
        this.listBonus.push(new Bonus(
              "Surchargeur de canon", // Name
              "Une optimisation de la répartition de l'énergie des canons de tir permet d'augmenter la fréquence de tir", // Description
              0, // Rareté minimale
              [new Effect("fireFrequence", 50, 250)], // Liste des effets
              "weapon", // Module
              50 // Coût
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