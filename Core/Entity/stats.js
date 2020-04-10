class Stats{
	constructor(owner){
		if (owner == "player") {
			this.maxVelocity = 400; // Vitesse max
			this.acceleration = 400; // Accélération du vaisseau
			this.vitesseRotation = 180; // Vitesse de rotation du vaisseau
			this.vitesseTir = 700; // Vitesse du projectile
			this.rechargementTir = 300; // Temps avant le prochain tir
			this.precisionTir = 0.1; // Précision du tir. 0 = tire en face
			this.maxBouclier = 100;
			this.rechargementBouclier = 20; // Rechargement bouclier par seconde
			this.degats = 40; // dégats au bouclier/coque

		}
		if (owner == "ennemi") {
			this.maxVelocity = 300; // Vitesse max
			this.acceleration = 200; // Accélération du vaisseau
			this.vitesseRotation = 150; // Vitesse de rotation du vaisseau
			this.vitesseTir = 500; // Vitesse du projectile
			this.rechargementTir = 900; // Temps avant le prochain tir
			this.precisionTir = 0.0; // Précision du tir. 0 = tire en face
			this.degats = 25; // dégats au bouclier/coque
		}
		if (owner == "meca") {
			this.nbModules = 4; // Nombre de modules
			this.initialTemperature = 30; // Température de base
			this.dangerTemperature = 500; // Température minimale du danger 
			this.maxTemperature = 1000; // Température maximale
			this.consommationMaxTemperature = 400; // La consommation permettant d'atteindre la température maximale
			this.coefficientChaleur = 0.2; // Influe sur la vitesse de montée et de descente de température		
			this.dureeMinimaleEntrePannes = 3; // Durée minimale entre l'ajout de pannes en seconde
			this.dureeMaximaleEntrePannes = 10; // Durée maximale entre l'ajout des pannes en seconde
			this.degatsMaxSurchauffe = 30; // Dégat maximal que peut provoquer une surchauffe.
			this.vitesseReparation = 5; // Vitesse de réparation par seconde
			this.tempsRadarEntreScans = 2000; // Temps entre 2 scans.
			this.porteeRadar = 3000;
		}
		if (owner == "game") {
			this.maxDistancePortail = 1000; // Distance max du portail en x et y, ramené vers le joueur si trop éloigné
			this.distanceApparitionEnnemi = 400;
			this.nbEnnemis = 1;
		}
	}
}