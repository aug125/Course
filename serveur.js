function random(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1,y1,x2,y2)
{
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function creerFlotte(idJoueur, xmin, xmax, ymin, ymax)
{
	// Id, x, y, joueur, vitesse, portée, puissance
	var nbBateaux = 5;
	
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 0,xmin + (xmax - xmin)*0/(nbBateaux-1),ymin + (ymax - ymin)*0/(nbBateaux-1),idJoueur,8,25,4));				
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 1,xmin + (xmax - xmin)*1/(nbBateaux-1),ymin + (ymax - ymin)*1/(nbBateaux-1),idJoueur,8,25,4));				
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 2,xmin + (xmax - xmin)*2/(nbBateaux-1),ymin + (ymax - ymin)*2/(nbBateaux-1),idJoueur,8,25,4));
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 3,xmin + (xmax - xmin)*3/(nbBateaux-1),ymin + (ymax - ymin)*3/(nbBateaux-1),idJoueur,8,25,4));
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 4,xmin + (xmax - xmin)*4/(nbBateaux-1),ymin + (ymax - ymin)*4/(nbBateaux-1),idJoueur,8,25,4));
} 

function jeu()
{

	creerFlotte(0,20,20,30,70);
	creerFlotte(1,140,140,30,70);
	
	if (nbTotalJoueurs > 2)
			creerFlotte(2,60,100,20,20);

	if (nbTotalJoueurs > 3)
			creerFlotte(3,60,100,80,80);

		
	io.emit("jeu");
}


function Bateau(id,x,y,j,s,r,p) {
  
	this.id = id;
	this.x_dep = x;
	this.y_dep = y;
	this.x_dest = x;
	this.y_dest = y;
	this.joueur = j;
	this.time_move = 0;
	this.speed = s;
	this.portee = r;
	this.puissance = p;
	this.x = function()
	{		
		distanceParcours = distance(this.x_dep, this.y_dep, this.x_dest, this.y_dest);		
		time_delta = (new Date().getTime() - this.time_move) / 1000; // en seconde.
		if (time_delta * this.speed >= distanceParcours)			
			return this.x_dest;			
		else
			return this.x_dep + (this.x_dest - this.x_dep) / distanceParcours * time_delta * this.speed;
	};
	this.y = function()
	{
		distanceParcours = distance(this.x_dep, this.y_dep, this.x_dest, this.y_dest);
		time_delta = (new Date().getTime() - this.time_move) / 1000; // en seconde.
		if (time_delta * this.speed >= distanceParcours)
			return this.y_dest;
		else
			return this.y_dep + (this.y_dest - this.y_dep) / distanceParcours * time_delta * this.speed;
	};
}

function Joueur(id)  {
	this.id = id;
	this.tir = new Date(0).getTime();
	this.nbBateaux = 5;
}


var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
//    ent = require('ent'),
//    fs = require('fs');

var nbTotalJoueurs = 2;
var nbJoueurs = 0;
var idJoueur = 0;

var listBateaux = [];
var listJoueurs = new Array();

app.use( express.static( "public" ) );


		
// Chargement de la page index.html
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
	var idJoueur = 0;  
});

io.sockets.on('connection', function (socket) {

	socket.on('nouveau_joueur', function (){
		nbJoueurs += 1;
		console.log(nbJoueurs + " joueurs");
		if (nbJoueurs == nbTotalJoueurs)
		{
			jeu();
		}
	});		

	socket.on('disconnect', function() {
		nbJoueurs -= 1;
	});
	
	socket.on('id', function() {
		console.log("Le joueur " + idJoueur + " joue");
		listJoueurs.push(new Joueur(idJoueur));			
		socket.id = idJoueur;		
		socket.emit("infosPartie", idJoueur);
						
		for (var i=0; i< listBateaux.length; i=i+1)
		{
			if (listBateaux[i].joueur == idJoueur)
				socket.emit("bateau", listBateaux[i].id, listBateaux[i].x_dest, listBateaux[i].y_dest, listBateaux[i].speed, listBateaux[i].portee, listBateaux[i].puissance);
		}
		idJoueur +=1;

	});		
	
	socket.on('move', function(bateau,px,py)
	{
		
		for (var i=0; i<listBateaux.length;i=i+1)
		{
			if (listBateaux[i].id == bateau && listBateaux[i].joueur == socket.id) // Ouais, faudrait pas qu'il bouge un autre bateau ce con.
			{
				var x = listBateaux[i].x();
				var y = listBateaux[i].y();
				listBateaux[i].x_dep = x;
				listBateaux[i].y_dep = y;
				
				listBateaux[i].x_dest = px;
				listBateaux[i].y_dest = py;
				listBateaux[i].time_move = new Date().getTime();
				io.emit("move", listBateaux[i].id, listBateaux[i].x_dep, listBateaux[i].y_dep, px,py); // normalement, à envoyer qu'à ceux qui voient le bateau.
			}
		}
	});
	
	
	socket.on('tir', function(px,py) {
		// Vérifions si le joueur peut tirer.
		var tempsTir = new Date().getTime() - listJoueurs[socket.id].tir;
		if (tempsTir > 3000)
		{			
			
			var listTirsX = [];
			var listTirsY = [];
			var listTirsP = [];
			
			// maintenant, vérifier les bateaux à portée de tir.
			var tir = false;

			for (var j=0; j<listBateaux.length;j=j+1)
			{	

				if (socket.id != listBateaux[j].joueur || distance(listBateaux[j].x(), listBateaux[j].y(), px, py) > listBateaux[j].portee)
					continue;
				tir = true;
				var x = px + random(-4,4);
				var y = py + random(-4,4);
				
				listTirsX.push(x);
				listTirsY.push(y);
				listTirsP.push(listBateaux[j].puissance);					
				socket.emit('pre_tir', x, y, listBateaux[j].puissance);
			}			
			setTimeout(function() {
				for (var j=0; j<listTirsX.length;j=j+1)
				{
					x = listTirsX[j];
					y = listTirsY[j];
					p = listTirsP[j];
					io.emit('tir', x, y, p);
				
					// détruire les bateaux.
							
					for (var i=0; i<listBateaux.length;i=i+1)
					{				
						if (distance(listBateaux[i].x(), listBateaux[i].y(), x,y) < p)
						{							
							listJoueurs[listBateaux[i].joueur].nbBateaux -= 1;
							if (listJoueurs[listBateaux[i].joueur].nbBateaux == 0)
								io.emit("message", "Le joueur" + (listBateaux[i].joueur +1 ) + " a perdu");
							
							socket.broadcast.emit("destruction",listBateaux[i].id);
							listBateaux.splice(i,1);
							i--;							
						}			
					}
					
				}
			}, 1000);
				
			if (tir)
				listJoueurs[socket.id].tir = new Date().getTime();			
		}
	});
		
	socket.on('positionEnnemi', function() {
		
		
		// Pour chaque bateau contrôlé par le joueur, on regarde les bateaux ennemis proches.
		for (var i=0; i<listBateaux.length; i=i+1)
		{
			
			if (listBateaux[i].joueur != socket.id)
				continue;
			for (var j=0; j<listBateaux.length; j=j+1)
			{
				if (listBateaux[j].joueur == socket.id)
					continue;
				if (distance(listBateaux[i].x(), listBateaux[i].y(), listBateaux[j].x(), listBateaux[j].y()) < listBateaux[i].portee)
					socket.emit('bateauEnnemi', listBateaux[j].id, listBateaux[j].x_dep, listBateaux[j].y_dep, listBateaux[j].x_dest, listBateaux[j].y_dest, listBateaux[j].speed, listBateaux[j].time_move);
			}
			
			
		}
		
	});	
	
});


server.listen(8080);