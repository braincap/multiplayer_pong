// Socket handling
var socket = io.connect({ 'forceNew': true });
var a = document.getElementById('partner-id');
a.style.visibility = "hidden";

// Send partner's ID


// socket.emit("partnerId received", partnerId);

//Update player counter

socket.on('count', function (msg) {
  console.log('Count received', msg);
  document.getElementById('player').innerHTML = msg.cnt;
  if (msg.cnt == 1) {
    console.log('http://localhost:5000/' + socket.io.engine.id);
    a.href = 'http://localhost:5000/' + socket.io.engine.id;
    a.style.visibility = "visible";
  }
});

// Canvas and rest of the game


var canvas = document.getElementById('myCanvas');
var c = canvas.getContext('2d');
var playing = false;

function init() {
  paddleWidth = 15;
  paddleHeight = 90;
  paddleAX = 0;
  paddleAY = (canvas.height - paddleHeight) / 2;
  paddleBX = (canvas.width - paddleWidth);
  paddleBY = (canvas.height - paddleHeight) / 2;
  greenUpPressed = false;
  greenDownPressed = false;
  redUpPressed = false;
  redDownPressed = false;
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  dx = 2;
  dy = 2;
  ballRadius = 10;
}

init();

var redColor = "#FF1744"
var greenColor = "#00BFA5"
var ballColor = "#0095DD"

window.addEventListener('keydown', keyDownHandler, false);
window.addEventListener('keyup', keUpHandler, false);

function keyDownHandler(e) {
  if (e.keyCode == 38) {
    socket.emit('greenUpPressed', true);
  } else if (e.keyCode == 40) {
    socket.emit('greenDownPressed', true);
  } else if (e.keyCode == 32) {
    playing = true;
  }
}

function keUpHandler(e) {
  if (e.keyCode == 38) {
    socket.emit('greenUpPressed', false);
  } else if (e.keyCode == 40) {
    socket.emit('greenDownPressed', false);
  } else if (e.keyCode == 32) {
    playing = true;
  }
}

socket.on('greenUpPressed', function (msg) {
  greenUpPressed = msg;
  console.log("Own press received greenUpPressed : " + greenUpPressed);
});

socket.on('greenDownPressed', function (msg) {
  greenDownPressed = msg;
  console.log("Own press received greenDownPressed: " + greenDownPressed);
});

socket.on('redUpPressed', function (msg) {
  redUpPressed = msg;
  console.log("Friend's press received redUpPressed : " + redUpPressed);
});

socket.on('redDownPressed', function (msg) {
  redDownPressed = msg;
  console.log("Friend's press received redDownPressed: " + redDownPressed);
});


function drawPaddleA() {
  c.beginPath();
  c.rect(paddleAX, paddleAY, paddleWidth, paddleHeight);
  c.fillStyle = greenColor;
  c.strokeStyle
  c.fill();
  c.closePath();
  c.beginPath();
  c.moveTo(paddleAX + paddleWidth, paddleAY);
  c.lineTo(paddleAX + paddleWidth, paddleAY + paddleHeight);
  c.stroke();
  c.closePath();
}

function drawPaddleB() {
  c.beginPath();
  c.rect(paddleBX, paddleBY, paddleWidth, paddleHeight);
  c.fillStyle = redColor;
  c.fill();
  c.closePath();
  c.beginPath();
  c.moveTo(paddleBX, paddleBY);
  c.lineTo(paddleBX, paddleBY + paddleHeight);
  c.stroke();
  c.closePath();
}

function drawBall() {
  c.beginPath();
  c.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  c.fillStyle = ballColor;
  c.fill();
  c.closePath();
}

function draw() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddleA();
  drawPaddleB();
  drawBall();
  bounceCheck();
  ballX = ballX + dx;
  ballY = ballY + dy;
  //Left paddle USER
  if (greenUpPressed) {
    paddleAY -= 7;
  } else if (greenDownPressed) {
    paddleAY += 7;
  }
  //Right paddle SOCKET
  if (redUpPressed) {
    paddleBY -= 7;
  } else if (redDownPressed) {
    paddleBY += 7;
  }

  if (playing) {
    requestAnimationFrame(draw);
  }
}

function bounceCheck() {
  if (ballY + dy + ballRadius >= canvas.height || ballY + dy - ballRadius <= 0) {     //vertical wall bounce check
    dy = -dy;
  } else if (ballX + dx + ballRadius >= canvas.width - paddleWidth && ballY >= paddleBY && ballY <= paddleBY + paddleHeight) {   //right B pad played
    dx = -dx;
  } else if (ballX + dx - ballRadius <= paddleWidth && ballY >= paddleAY && ballY <= paddleAY + paddleHeight) {    //left A pad played
    dx = -dx;
  } else if (ballX + ballRadius >= paddleBX && ballX - ballRadius <= canvas.width && ballY + ballRadius >= paddleBY && ballY - ballRadius <= paddleBY + paddleHeight) {
    dy = -dy;
  } else if (ballX - ballRadius <= paddleWidth && ballX + ballRadius >= 0 && ballY + ballRadius >= paddleAY && ballY - ballRadius <= paddleAY + paddleHeight) {
    dy = -dy;
  } else if (ballX + dx + ballRadius >= canvas.width) {
    init();
  } else if (ballX + dx - ballRadius <= 0) {
    init();
  }
}

socket.on('play', function (msg) {
  console.log("Play received");
  playing = true;
  draw();
});