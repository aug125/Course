class Stats{
	constructor(owner){
		if (owner == "player") {
			this.maxVelocity = 300; // Vitesse max
			this.acceleration = 200; // Accélération du vaisseau
			this.vitesseRotation = 300; // Vitesse de rotation du vaisseau
			this.vitesseTir = 500; // Vitesse du projectile
			this.rechargementTir = 400; // Temps avant le prochain tir
			this.precisionTir = 0.1; // Précision du tir. 0 = tire en face
		}
		if (owner == "ennemi") {
			this.maxVelocity = 100; // Vitesse max
			this.acceleration = 200; // Accélération du vaisseau
			this.vitesseRotation = 150; // Vitesse de rotation du vaisseau
			this.vitesseTir = 300; // Vitesse du projectile
			this.rechargementTir = 900; // Temps avant le prochain tir
			this.precisionTir = 0.1; // Précision du tir. 0 = tire en face
		}

	}
}