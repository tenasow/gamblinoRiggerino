var fs = require('fs');

var options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('cert.pem')
};

var express = require('express');
var app = express();
var server = require('https').createServer(options, app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.php');
});

server.listen(8080);

//User code

var clients = [];

io.on("connection", function(socket) {

  function refreshLeaderboard(){
    var leaderboard = [];
    for (var i in clients) {
      leaderboard.push([i, clients[i]['money']]);
    }

    leaderboard.sort(function(a, b) {
      return a[1] - b[1];
    });
    leaderboard.reverse();

    for(var i in leaderboard){
        for(var k in clients){
          if(leaderboard[i][0] == k){
            leaderboard[i][0] = clients[k]['name'];
        }
      }
    }

    var leaderboard = leaderboard.slice(0,9);
    socket.emit("leaderboard", {players: leaderboard});
    socket.broadcast.emit("leaderboard", {players: leaderboard});
  }

  socket.emit("user", {id: socket.id, state: 'waiting', money: 200, bet: 0});
  clients.push({id: socket.id, name: 'anon', state: 'waiting', money: 200, bet: 0});
  socket.on("bet", function(data){
    if(data["bet"] <= 500 && data["bet"] > 0){
      for (var i in clients) {
        if(clients[i]['id'] == socket.id){
          if(clients[i]['money']-data['bet'] >= 0){
            var roll = Math.floor((Math.random() * 10) + 1);
            if(roll <=5){
              clients[i]['money'] = parseInt(clients[i]['money'])-parseInt(data['bet']);
              socket.emit("user", {id: socket.id, state: 'playing', money: clients[i]['money'], bet: roll});
            } else {
              clients[i]['money'] = parseInt(clients[i]['money'])+parseInt(data['bet']);
              socket.emit("user", {id: socket.id, state: 'playing', money: clients[i]['money'], bet: roll});
            }
            refreshLeaderboard();
          }
        }
      }
    }
  });
  refreshLeaderboard();

  socket.on('name', function(data){
    for(var k in clients){
      if(clients[k]['id'] == socket.id){
        clients[k]['name'] = data['name'];
      }
    }
    refreshLeaderboard();
  });

  socket.on('reset', function(){
    for(var k in clients){
      if(clients[k]['id'] == socket.id){
        clients[k]['money'] = 200;
      }
    }
    socket.emit("user", {id: socket.id, state: 'waiting', money: 200, bet: 0});
    refreshLeaderboard();
  });

  socket.on("disconnect", function(){
    for(var k in clients){
      if(clients[k]['id'] == socket.id){
        delete clients[k];
      }
    }
    refreshLeaderboard();
  });
});
