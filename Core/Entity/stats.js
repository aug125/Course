class Stats{
	constructor(owner){
		if (owner == "player") {
			this.maxVelocity = 300; // Vitesse max
			this.acceleration = 200; // Accélération du vaisseau
			this.vitesseRotation = 300; // Vitesse de rotation du vaisseau
			this.vitesseTir = 500; // Vitesse du projectile
			this.rechargementTir = 300; // Temps avant le prochain tir
			this.precisionTir = 0.1; // Précision du tir. 0 = tire en face
			this.maxBouclier = 100;
			this.rechargementBouclier = 20; // Rechargement bouclier par seconde
			this.degats = 40; // dégats au bouclier/coque

		}
		if (owner == "ennemi") {
			this.maxVelocity = 100; // Vitesse max
			this.acceleration = 200; // Accélération du vaisseau
			this.vitesseRotation = 150; // Vitesse de rotation du vaisseau
			this.vitesseTir = 300; // Vitesse du projectile
			this.rechargementTir = 900; // Temps avant le prochain tir
			this.precisionTir = 0.0; // Précision du tir. 0 = tire en face
			this.degats = 10; // dégats au bouclier/coque
		}
		if (owner == "meca") {
			this.initialCharge = 200; // GW du vaisseau
			this.initialTemperature = 30; // Température de base
			this.dangerTemperature = 100; // Température maximale
			this.maxTemperature = 100; // Température maximale
			this.coefficientChaleur = 0.01; // Influe sur la vitesse de montée et de descente de température		
		}
	}
}