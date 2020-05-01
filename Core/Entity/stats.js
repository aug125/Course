class Stats{
	constructor(owner){
		if (owner == "player") {
			this.maxVelocity = 250; // Vitesse max
			this.acceleration = 300; 
			this.vitesseRotation = 120; // Vitesse de rotation du vaisseau
			this.vitesseTir = 600; // Vitesse du projectile
			this.rechargementTir = 600; // Temps avant le prochain tir
			this.precisionTir = 0.2; // Précision du tir. 0 = tire en face
			this.maxBouclier = 100;
			this.rechargementBouclier = 20; // Rechargement bouclier par seconde
			this.degats = 40; // dégats au bouclier/coque

		}

		// Ennemis.

		// pod rouge
		if (owner == "pod1") {
			this.scale = 0.5; // Taille du vaisseau
			this.maxVelocity = 250; // Vitesse max
			this.acceleration = 250; 
			this.vitesseRotation = 150; // Vitesse de rotation du vaisseau
			this.vitesseTir = 600; // Vitesse du projectile
			this.rechargementTir = 900; // Temps avant le prochain tir
			this.precisionTir = 0.0; // Précision du tir. 0 = tire en face
			this.degats = 25; // dégats au bouclier/coque
			this.teleguidage = 0; // Tête chercheuse
		}

		// pod bleu
		if (owner == "pod2") {
			this.scale = 0.5; // Taille du vaisseau
			this.maxVelocity = 80; // Vitesse max
			this.acceleration = 50; 
			this.vitesseRotation = 90; // Vitesse de rotation du vaisseau
			this.vitesseTir = 700; // Vitesse du projectile
			this.rechargementTir = 1900; // Temps avant le prochain tir
			this.precisionTir = 0.0; // Précision du tir. 0 = tire en face
			this.degats = 36; // dégats au bouclier/coque
			this.teleguidage = 1; // Tête chercheuse
		}

		
		// Stats du joueur meca		
		if (owner == "meca") {
			this.nbModules = 4; // Nombre de modules
			this.initialTemperature = 30; // Température de base
			this.dangerTemperature = 500; // Température minimale du danger 
			this.maxTemperature = 1000; // Température maximale
			this.consommationMaxTemperature = 500; // La consommation permettant d'atteindre la température maximale
			this.coefficientChaleur = 0.08; // Influe sur la vitesse de montée et de descente de température		
			this.dureeMinimaleEntrePannes = 3; // Durée minimale entre l'ajout de pannes en seconde
			this.dureeMaximaleEntrePannes = 10; // Durée maximale entre l'ajout des pannes en seconde
			this.degatsMaxSurchauffe = 30; // Dégat maximal que peut provoquer une surchauffe.
			this.vitesseReparation = 5; // Vitesse de réparation par seconde
			this.tempsRadarEntreScans = 2000; // Temps entre 2 scans en ms.
			this.porteeRadar = 4000;
		}
		if (owner == "game") {
			this.maxDistancePortail = 5000; // Distance max du portail en x et y, ramené vers le joueur si trop éloigné
			this.distanceApparitionEnnemi = 3000;
			this.tempsApparitionEnnemi = 5000; // en ms
			this.nbEnnemis = 10;
			this.probaBonusParEnnemi = 0.3; // Proba de lâcher un bonus par ennemi
			this.maxBonusParNiveau = 3;
			
			this.ennemisLevel = new Map();

			// Niveau 1
			this.ennemisLevel.set(1, new Map([
				['pod1', 1],
				['pod2', 1]])
			);

			// Niveau 2
			this.ennemisLevel.set(2, new Map([
				['pod1', 1],
				['pod2', 1]])
			);



		}	
	}
}