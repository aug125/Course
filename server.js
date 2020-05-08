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
app.use( express.static("Core/Pictures/Ennemis" ) );
app.use( express.static("Core/Sounds" ) );
app.use( express.static("Core/Plugins" ) );

app.set('view engine', 'ejs');

		
// Chargement de la page index.html
app.get('/', function (req, res) {	
	res.render('index.ejs');		
});

var players = {};

io.sockets.on('connection', function (socket) {



	socket.on('newPlayer', function (){		
		nbPlayersInLobby += 1;
		console.log(nbPlayersInLobby + " joueur(s) dans la salle d'attente de la partie " + idGameLobby);
		socket.game = idGameLobby;
		socket.join(idGameLobby);

		players[socket.id] = {
			rotation: 0,
			x: Math.floor(Math.random() * 700) + 50,
			y: Math.floor(Math.random() * 500) + 50,
			playerId: socket.id
		}		
	
		if (nbPlayersInLobby == 2) {
			// create a new player and add it to our players object
			
			// Création de la partie
			console.log("jeu");
			io.to(socket.game).emit("jeu", players);			
			let mapGame = new Map(); 
			mapGames.set(socket.game,mapGame);
			idGameLobby++;
			nbPlayersInLobby -= 2;
		}
	});		
	
	socket.on('disconnect', function() {
		if (socket.game == idGameLobby)
			nbPlayersInLobby -= 1;
	});	

	socket.on("position",  function(x,y,r) {
		players[socket.id].x = x;
		players[socket.id].y = y;
		players[socket.id].rotation = r;
		io.to(socket.game).emit('position', players[socket.id]);
	});
	
});	

let port = process.env.PORT;

if (port == null || port == "") {
	port = 8080;
}

server.listen(port, function () {
	console.log(`Listening on ${server.address().port}`);
  });