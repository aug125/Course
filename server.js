function random(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1,y1,x2,y2)
{
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function creerFlotte(idJoueur, xmin, xmax, ymin, ymax)
{	
	var listBateaux = mapGames.get(idGameLobby).get("listBateaux");

	// Id, x, y, joueur, vitesse, portée, puissance
	var nbBateaux = 5;
	
	// Porte avion
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 0,xmin + (xmax - xmin)*0/(nbBateaux-1),ymin + (ymax - ymin)*0/(nbBateaux-1),idJoueur,5,35,7));

	// Torpilleurs
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 1,xmin + (xmax - xmin)*1/(nbBateaux-1),ymin + (ymax - ymin)*1/(nbBateaux-1),idJoueur,8,25,4));				
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 2,xmin + (xmax - xmin)*2/(nbBateaux-1),ymin + (ymax - ymin)*2/(nbBateaux-1),idJoueur,8,25,4));
	
	// Sous marins
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 3,xmin + (xmax - xmin)*3/(nbBateaux-1),ymin + (ymax - ymin)*3/(nbBateaux-1),idJoueur,10,15,3));
	listBateaux.push(new Bateau(idJoueur*nbBateaux + 4,xmin + (xmax - xmin)*4/(nbBateaux-1),ymin + (ymax - ymin)*4/(nbBateaux-1),idJoueur,10,15,3));
	

	
} 

function jeu()
{
	var mapGame = new Map(); 

	mapGame.set("listBateaux", []);
	mapGame.set("listJoueurs", []);

	mapGames.set(idGameLobby,mapGame);	
	
	creerFlotte(0,20,20,30,70);
	creerFlotte(1,140,140,30,70);
	
	if (nbTotalJoueurs > 2)
			creerFlotte(2,60,100,20,20);

	if (nbTotalJoueurs > 3)
			creerFlotte(3,60,100,80,80);

	
		
	
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
	this.refresh = new Date(0).getTime();
}


var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

	
var nbTotalJoueurs = 2;
var nbPlayersInLobby = 0;
var idJoueur = 0;
var idGameLobby = 0;
var mapGames = new Map();

app.use( express.static( "views" ) );
app.use( express.static( "public" ) );
app.set('view engine', 'ejs');

		
// Chargement de la page index.html
app.get('/', function (req, res) {	
	res.render('index.ejs');	
	console.log("test");
});

/*app.get('/game/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});*/

io.sockets.on('connection', function (socket) {

	socket.on('nouveau_joueur', function (){
		nbPlayersInLobby += 1;
		console.log(nbPlayersInLobby + " joueur(s) dans la salle d'attente de la partie " + idGameLobby);
		socket.game = idGameLobby;
		socket.join(idGameLobby);
		if (nbPlayersInLobby == nbTotalJoueurs)
		{					
			jeu();
			io.to(idGameLobby).emit("jeu");
			idGameLobby +=1;
			idJoueur = 0;
			nbPlayersInLobby -= nbTotalJoueurs;			
		}
	});		

	socket.on('disconnect', function() {
		if (socket.game == idGameLobby)
			nbPlayersInLobby -= 1;
	});
	
	socket.on('id', function() {

		var listBateaux = mapGames.get(socket.game).get("listBateaux");
		var listJoueurs = mapGames.get(socket.game).get("listJoueurs");

		console.log("Le joueur " + idJoueur + " joue dans la partie " + socket.game);
		listJoueurs.push(new Joueur(idJoueur));		
		socket.id = idJoueur;		
		socket.emit("infosPartie", idJoueur);
		socket.emit("message", "Vous êtes le joueur " + (idJoueur+1));
						
		for (var i=0; i< listBateaux.length; i=i+1)
		{
			if (listBateaux[i].joueur == idJoueur)
				socket.emit("bateau", listBateaux[i].id, listBateaux[i].x_dest, listBateaux[i].y_dest, listBateaux[i].speed, listBateaux[i].portee, listBateaux[i].puissance);
		}
		idJoueur +=1;

	});		
	
});	


server.listen(8080);