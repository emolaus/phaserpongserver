var app = require('express')();
var https = require('https');
var http = require('http');
var fs = require('fs');
var sslOptions = {
  key: fs.readFileSync('../keys/server.key'),
  cert: fs.readFileSync('../keys/server.crt'),
  ca: fs.readFileSync('../keys/ca.crt'),
  requestCert: true,
  rejectUnauthorized: false
}; 
 
/*var server = https.createServer(sslOptions,app).listen('443', function(){
  console.log("Secure Express server listening on port 443"); 
  app.get('/', function(req, res){
    res.send('hello world');
  });
});*/
var server = http.createServer(app).listen('80');

var io = require('socket.io')(server);

io.on('connection', function (socket) {
   console.log('new connection');
   socket.on('game data', function (msg) {
      console.log('message: ' + msg);
      io.emit('server game data', msg);
   });
});

