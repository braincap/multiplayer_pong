var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('chat message', function (msg) {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
  })
});

http.listen(process.env.PORT || 3000, () => console.log(`listening on *:${process.env.PORT || 3000}`));