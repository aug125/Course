let express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

	
let nbPlayersInLobby = 0;
let idJoueur = 0;
let idGameLobby = 0;
let mapGames = new Map();


app.use( express.static( "public" ) );

app.use( express.static("views" ) );
app.use( express.static("Core" ) );
app.use( express.static("Core/Entity" ) );
app.use( express.static("Core/Pictures" ) );
app.use( express.static("Core/Pictures/Bonus" ) );
app.use( express.static("Core/Sounds" ) );
app.use( express.static("Core/Plugins" ) );

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
			console.log("jeu");
			io.to(socket.game).emit("jeu");			
			let mapGame = new Map(); 
			mapGames.set(socket.game,mapGame);
			idJoueur = 0;
			idGameLobby++;
			nbPlayersInLobby -= 2;
			
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

	socket.on('role', function(role) {
		console.log("Envoi du rôle choisi par le premier joueur");
		io.to(socket.game).emit('role', role);
	});

	// MECA => PILOTE
	socket.on('power', function(powerValue) {		
		io.to(socket.game).emit('power', powerValue);
	});	
	
	socket.on('weapon', function(weaponValue) {		
		io.to(socket.game).emit('weapon', weaponValue);
	});	

	socket.on('shield', function(shieldValue) {		
		io.to(socket.game).emit('shield', shieldValue);
	});

	socket.on('askRadarScan', function() {		
		io.to(socket.game).emit('askRadarScan');
	});

	socket.on('sendRadarScan', function(posJoueurX, posJoueurY, listEnnemis, portal) {
		io.to(socket.game).emit('sendRadarScan', posJoueurX, posJoueurY, listEnnemis, portal);
	});

	socket.on('upgrade', function(listUpgrade) {	
		io.to(socket.game).emit('upgrade', listUpgrade);
	});	


	// PILOTE => MECA
	socket.on('damage', function(damage) {
		io.to(socket.game).emit('damage', damage);
	});

	socket.on('gameOver', function() {		
		io.to(socket.game).emit('gameOver');
	});

	// PILOTE => TOUS
	socket.on('score', function(score) {		
		io.to(socket.game).emit('score', score);
	});

	socket.on('bonus', function(bonus) {
		io.to(socket.game).emit('bonus', bonus);
	});


});	

let port = process.env.PORT;
console.log(port);

server.listen(port, function () {
	console.log(`Listening on ${server.address().port}`);
  });