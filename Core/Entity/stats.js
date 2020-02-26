class playerStats {
	constructor() {
		this.maxVelocity = 300; // Vitesse max
		this.acceleration = 200; // Accélération du vaisseau
		this.vitesseRotation = 300; // Vitesse de rotation du vaisseau
		this.vitesseTir = 500; // Vitesse du projectile
		this.rechargementTir = 100; // Temps avant le prochain tir
	}
};

class ennemiStats {
	constructor(){
		this.maxVelocity = 100; // Vitesse max
		this.acceleration = 200; // Accélération du vaisseau
		this.vitesseRotation = 150; // Vitesse de rotation du vaisseau
		this.vitesseTir = 300; // Vitesse du projectile
		this.rechargementTir = 900; // Temps avant le prochain tir
	}
};