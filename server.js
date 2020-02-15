function random(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1,y1,x2,y2)
{
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function jeu()
{
	var mapGame = new Map(); 
	mapGames.set(idGameLobby,mapGame);	

}

var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

	
var nbPlayersInLobby = 0;
var idJoueur = 0;
var idGameLobby = 0;
var mapGames = new Map();


app.use( express.static( "public" ) );

app.use( express.static("Core" ) );
app.use( express.static("Core/Entity" ) );
app.use( express.static("Core/Pictures" ) );

app.set('view engine', 'ejs');

		
// Chargement de la page index.html
app.get('/', function (req, res) {	
	res.render('index.ejs');		
});

io.sockets.on('connection', function (socket) {

	socket.on('newPlayer', function (){		
		nbPlayersInLobby += 1;
		console.log(nbPlayersInLobby + " joueur(s) dans la salle d'attente de la partie " + idGameLobby);
		socket.game = idGameLobby;
		socket.join(idGameLobby);
		jeu();
		io.to(idGameLobby).emit("jeu");		
	});		

	socket.on('disconnect', function() {
		if (socket.game == idGameLobby)
			nbPlayersInLobby -= 1;
	});
	
	socket.on('initPilote', function() {

		console.log("Le joueur " + idJoueur + " joue dans la partie " + socket.game);
		listJoueurs.push(new Joueur(idJoueur));		
		socket.id = idJoueur;		
		socket.emit("infosPartie", idJoueur);
		socket.emit("message", "Vous êtes le joueur " + (idJoueur+1));

		idJoueur +=1;

	});		
	
});	


server.listen(8080);