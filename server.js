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

  socket.on('greenUpPressed', function (msg) {
    console.log(ownId + ' says green up pressed');
    io.to(ownId).emit('greenUpPressed', msg);
    io.to(friendId).emit('redUpPressed', msg);
  });

  socket.on('greenDownPressed', function (msg) {
    console.log(ownId + ' says green down pressed');
    io.to(ownId).emit('greenDownPressed', msg);
    io.to(friendId).emit('redDownPressed', msg);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});


http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));