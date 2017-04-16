var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ownId, friendId;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:userInput', (req, res) => {
  friendId = req.params.userInput;
  console.log("Friend ID received and stored : " + friendId);
});

io.on('connection', function (socket) {
  console.log('a user connected');
  ownId = socket.id;

  console.log("Own id : " + ownId);
  console.log("Friend id : " + friendId);

  socket.on('redUpPressed', function (msg) {
    io.to(friendId).emit('redUpPressed', msg);
  });

  socket.on('redDownPressed', function (msg) {
    io.to(friendId).emit('redDownPressed', msg);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});


http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));