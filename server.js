var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var friendHolder = {};
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
  console.log(req.params.partnerId);
  res.redirect('/');
});

io.on('connection', function (socket) {
  console.log('a user connected');
  console.log("Own id : " + socket.id);

  friendHolder[socket.id] = ['', 0];
  updateNumber();

  for (var socket_id in friendHolder) {
    if (friendHolder.hasOwnProperty(socket_id)) {
      io.to(socket_id).emit('count', { cnt: friendHolder[socket_id][1] });
    }
  }

  socket.on('partnerId received', function (msg) {
    console.log(socket.id + ' says partnerId received ' + msg);
    friendHolder[socket.id][0] = msg;
    if (msg) {
      if (friendHolder.hasOwnProperty(msg)) {
        friendHolder[msg][0] = socket.id;
      } else {
        friendHolder[msg] = ['', 0];
      }

      updateNumber();

      console.log(friendHolder);
      console.log(socket.id);
      console.log(msg);
      if (friendHolder[msg][0] == socket.id && friendHolder[socket.id][0] == msg) {
        console.log("Matched");
        io.emit('play', { partner: socket.id });
      }
    }
  });


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
    delete friendHolder[socket.id];
    updateNumber();
    console.log(friendHolder);
    console.log('user disconnected');
  });
});


http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));