UUID = require('node-uuid');
game_server = module.exports = {games: {}, game_count: 0};

/**
games spec:
games {uuid1: game1, uuid2: game2...}

game spec:
{players: [player1, player2]}

player spec:
{host: bool, socket: obj}
*/

game_server.init = function (io) {
    io.on('connection', function (socket) {
        // TODO: Om spelaren  skickat ett UUID, �koppla tillbaka till tidigare rum
	// Om spelaren är ny och det inte finns något rum att ansluta sig till,
	// skapa nytt rum
	// Om spelaren är ny och det finns ett rum som väntar, lägg till
	// och informera host.

	// Minimal implementation med 1högst 1 rum totalt
	// Litet hello world
	console.log('New connection');
	var uuid = findGameToJoin();
	if (!uuid) {
	    // Create new game
	    var player = {host: true, socket: socket};
	    var newGame = {players: [player]};
	    var gameID = UUID.v4();
	    game_server.games[gameID] = newGame;
	    game_server.game_count++;
	    // Communicate registration to user
	    socket.emit('registered', {host: true} );
	} else {
	    // join game
	    var player = {host: false, socket: socket};
	    game_server.games[uuid].players.push(player);
	    socket.emit('registered', {host: false} );		
	}
    });
}
/**
Return uuid of first available room or false
*/
function findGameToJoin() {
    if (game_server.game_count == 0) return false;
    for (uuid in game_server.games) {
	var gameToInspect = game_server.games[uuid];
	if (gameToInspect.players.length == 1) return uuid;
    }
    return false;
}
