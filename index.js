var app = require('express')();
var https = require('https');
var http = require('http');
var fs = require('fs');
 
var server = http.createServer(app).listen('80');
console.log('HTTP server listening on port 80');

var io = require('socket.io')(server);

var game_server = require('./gameserver.js').init(io);
