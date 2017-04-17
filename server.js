var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var friendHolder = {};
var partnerId;
function updateNumber() {
  var cnt = 1;
  for (var socked_id in friendHolder) {
    if (friendHolder.hasOwnProperty(socked_id)) {
      friendHolder[socked_id][1] = cnt;
      cnt++;
    }
  }
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:partnerId', (req, res) => {
  partnerId = req.params.partnerId;
  res.redirect('/');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  console.log("Own id : " + socket.id);
  console.log("Coming from : " + partnerId || 'Player 1');

  friendHolder[socket.id] = [partnerId, 0];
  if (partnerId) {
    friendHolder[partnerId] = [socket.id, 0];
    io.emit('play', friendHolder);
  }
  updateNumber();
  emitPlayerCount();

  console.log(friendHolder);

  socket.on('greenUpPressed', function (msg) {
    console.log(socket.id + ' says green up pressed');
    io.to(socket.id).emit('greenUpPressed', msg);
    io.to(friendHolder[socket.id][0]).emit('redUpPressed', msg);
  });

  socket.on('greenDownPressed', function (msg) {
    console.log(socket.id + ' says green down pressed');
    io.to(socket.id).emit('greenDownPressed', msg);
    io.to(friendHolder[socket.id][0]).emit('redDownPressed', msg);
  });

  socket.on('disconnect', function () {
    console.log(friendHolder);
    console.log('user disconnected');
    friendHolder[friendHolder[socket.id][0]] = ['', 0];
    delete friendHolder[socket.id];
    console.log(friendHolder);
    updateNumber();
    emitPlayerCount();
  });
});


function emitPlayerCount() {
  for (var socket_id in friendHolder) {
    if (friendHolder.hasOwnProperty(socket_id)) {
      io.to(socket_id).emit('count', { cnt: friendHolder[socket_id][1] });
    }
  }
}

http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));