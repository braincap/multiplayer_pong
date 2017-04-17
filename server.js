var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var friendId;
var friendIdHolder = {};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/:userInput', (req, res) => {
  friendId = req.params.userInput;
  console.log("Friend ID received and stored : " + friendIdHolder);
});

io.on('connection', function (socket) {
  friendIdHolder[socket.id] = friendId;
  console.log('a user connected');
  console.log("Own id : " + socket.id);
  console.log("Friend id : " + friendId);

  socket.on('greenUpPressed', function (msg) {
    console.log(socket.id + ' says green up pressed');
    io.to(socket.id).emit('greenUpPressed', msg);
    io.to(friendId).emit('redUpPressed', msg);
  });

  socket.on('greenDownPressed', function (msg) {
    console.log(socket.id + ' says green down pressed');
    io.to(socket.id).emit('greenDownPressed', msg);
    io.to(friendId).emit('redDownPressed', msg);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});


http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));