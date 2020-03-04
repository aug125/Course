var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

	
var nbPlayersInLobby = 0;
var idJoueur = 0;
var idGameLobby = 0;
var mapGames = new Map();


app.use( express.static( "public" ) );

app.use( express.static("views" ) );
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
	

		if (nbPlayersInLobby == 2) {

			// Création de la partie
			io.to(idGameLobby).emit("jeu");			
			var mapGame = new Map(); 
			mapGames.set(idGameLobby,mapGame);
			idJoueur = 0;
			idGameLobby++;
		}		
	});		

	socket.on('disconnect', function() {
		if (socket.game == idGameLobby)
			nbPlayersInLobby -= 1;
	});
	
	socket.on('askId', function() {

		console.log("Le joueur " + idJoueur + " joue dans la partie " + socket.game);
		socket.id = idJoueur;		
		socket.emit('sendId', idJoueur);
		idJoueur += 1;
	});		



});	


server.listen(8080);