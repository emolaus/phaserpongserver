var app = require('express')();
var https = require('https');
var fs = require('fs');
var sslOptions = {
  key: fs.readFileSync('../keys/server.key'),
  cert: fs.readFileSync('../keys/server.crt'),
  ca: fs.readFileSync('../keys/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
}; 
 
var server = https.createServer(sslOptions,app).listen('443', function(){
  console.log("Secure Express server listening on port 443"); 
  app.get('/', function(req, res){
    res.send('hello world');
  });
});

var io = require('socket.io')(server);

var game_server = require('../pongserver/gameserver.js').init(io);
