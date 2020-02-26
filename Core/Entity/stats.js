function playerStats() {
    	this.maxVelocity = 300; // Vitesse max
	this.acceleration = 200; // Accélération du vaisseau
	this.vitesseRotation = 300; // Vitesse de rotation du vaisseau
	this.vitesseTir = 500; // Vitesse du projectile
	this.rechargementTir = 100; // Temps avant le prochain tir
};

function ennemiStats() {

	this.vitesseTir = 500; // Vitesse du projectile
	this.rechargementTir = 1000; // Temps avant le prochain tir
    };