const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIo(server);

var port = process.env.PORT || 3000;


var players = [];
function UpdatePlayers() {
  var top5Players = players.filter(player => player.name !== undefined)
  top5Players.sort(function(a,b) {
    return a.score - b.score;
  });
  top5Players = top5Players.slice(0,5);
  io.emit('update-players', top5Players);
}

app.use(express.static("client"));

io.on("connect", function (socket) {
  console.log("Client Connected");
  UpdatePlayers();
  players.push({id:socket.id,score:0});
  var i = players.length-1;

  socket.emit('server-connected', socket.id);

  socket.on("save-name",function (name) {
    players[i].name = name;
    UpdatePlayers();
  });
  socket.on("save-score",function (score) {
    players[i].score = score;
    UpdatePlayers();
  });

  socket.on("disconnect",function () {
    players = players.filter(player => player.id !== socket.id);
    UpdatePlayers();
  });
})

server.listen(port, function () {
  console.log("Server listening on port " + port + ".");
});
