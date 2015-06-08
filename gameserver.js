UUID = require('node-uuid');
// Original solution with multple rooms.
game_server = module.exports = {games: {}, game_count: 0};
// Simplified with single room
//game_server = module.exports = {}


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
	console.log('New connection, socket id: ' + socket.id);
	var gameID = findGameToJoin();
	if (!gameID) {
	    // Create new game
	    gameID = createGame();
	    if (!gameID) {
		socket.emit('registered', {success: false});
		return;
	    }
	}
	// Add player to game. 
	var player = addPlayer(gameID, socket);
	// Inform player of registration
	
	if (!player) {
	    console.log('Failed to add player.');
	    socket.emit('registered', {success: false});
	}
	socket.emit('registered', {success: true, host: player.host});
	
	// If there is opponent, inform that new player joined
	opponent = getOpponent(socket);
	if (opponent) opponent.socket.emit('add opponent');
	
	// Relay game data to opponent
	socket.on('game data', function (data) {
	    if (game_server.game_count == 0) {
		console.log('Received game data but no game found.');
		return;
	    }
	    opponent = getOpponent(socket);
	    if (opponent === false) {
		return;
	    }
	    //console.log('Received data from ' + socket.id);
	    //console.log('Trying to pass data to ' + opponent.socket.id);
            opponent.socket.emit('game data', data);
	});
	socket.on('disconnect', function () {
	    console.log('Socket disconnecting: ' + socket.id);
	    console.log('Removing player.');
	    opponent = getOpponent(socket);
	    removePlayer(socket);
	    if (opponent) opponent.socket.emit('remove opponent');
	    else console.log('Couldnt find opponent => failed informing about opponent gone.');
	    
	});
	    /*
	    var player = {host: true, socket: socket};
	    console.log('Host player joined. socket id: ' + socket.id);
	    var newGame = {players: [player]};
	    gameID = UUID.v4();
	    game_server.games[gameID] = newGame;
	    console.log("New game created: " + gameID);
	    game_server.game_count++;
	    // Communicate registration to user
	    socket.emit('registered', {host: true} );
	    */
	/* else {
	    // join game
	    
	    var player = {host: false, socket: socket};
	    console.log('Guest player joined. socket id: ' + socket.id);
	    console.log('Will attempt to join game ' + gameID);
	    game_server.games[gameID].players.push(player);
	    socket.emit('registered', {host: false} );
	    
	}
	*/

	// TODO ta bort socket fr�n game p� disconnect
	//socket.on('disconnect', function () {});
    });

}
/**
 * Get opponent given a socket.
 */
function getOpponent(socket) {
    for (gameID in game_server.games) {
	if (game_server.games[gameID].players.length < 2) continue;
	if (game_server.games[gameID].players[0].socket.id == socket.id) return game_server.games[gameID].players[1];
	return game_server.games[gameID].players[0];
    }
    return false;
}
/**
 * remove player by socket
 */
function removePlayer(socket) {
    for (gameID in game_server.games) {
	for (var i = 0; i < game_server.games[gameID].players.length; i++) {
	    if (game_server.games[gameID].players[i].socket.id == socket.id) {
		// Found the player. Remove.
		game_server.games[gameID].players.splice(i, 1);
	    }
	}
    }
}
/**
 * Create new game. At this point, allow maximally 1 game. Return false if game already exists
 **/

function createGame() {
    if (game_server.game_count > 0) return false;
    gameID = UUID.v4();
    game_server.games[gameID] = {players: []};
    game_server.game_count++;
    return gameID;
}
/**
 * Add player to given game. Returns player object or false on error.
 * Errors may be:
 *   didn't find gameID
 *   game already contains 2 players
 **/
function addPlayer(gameID, socket) {
    if (!game_server.games[gameID]) return false;
    if (game_server.games[gameID].players.length > 1) return false;
    var host = true;
    if (game_server.games[gameID].players.length == 1
	&& game_server.games[gameID].players[0].host)
	host = false;
    
    var player = {host: host, socket: socket};
    game_server.games[gameID].players.push(player);
    return player;
}
/**
With given player id and game id, find opponent
(i.e. first player with different id)
returns player object or false if no opponent or error
*/
/*
function getFirstOpponent(gameID, playerId) {
    if (!game_server.games[gameID]) return false;
    var currentGame = game_server.games[gameID];
    console.log("getFirstOpponent is searching in game " + gameID);
    for (player in currentGame.players) {
        console.log('Checking player');
	if (player.socket.id != playerId) return player;
    }
    return false;
    console.log('Couldnt find opponent');
}*/
/**
Return uuid of first available room or false
*/

function findGameToJoin() {
    if (game_server.game_count == 0) return false;
    for (uuid in game_server.games) {
	var gameToInspect = game_server.games[uuid];
	if (gameToInspect.players.length == 1) return uuid;
    }
    console.log('findGameToJoin: no room left in existing games');
    return false;
}

