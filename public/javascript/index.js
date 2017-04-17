// Socket handling
var socket = io.connect({ 'forceNew': true });

// Send partner's ID
var partnerId = prompt("Enter your friend's ID");

var request = new XMLHttpRequest();
request.open('GET', '/' + partnerId, true);
request.onload = function () {
  if (request.status >= 200 && request.status < 400) {
    console.log("Friend ID sent");
    var resp = request.responseText;
  } else {
    console.log("Server connected but error returned");
  }
};

request.onerror = function () {
  console.log("Error while connecting to server");
};

request.send();

// Canvas and rest of the game

var canvas = document.getElementById('myCanvas');
var c = canvas.getContext('2d');

var paddleWidth = 15;
var paddleHeight = 90;
var paddleAX = 0;
var paddleAY = (canvas.height - paddleHeight) / 2;
var paddleBX = (canvas.width - paddleWidth);
var paddleBY = (canvas.height - paddleHeight) / 2;
var greenUpPressed = false;
var greenDownPressed = false;
var redUpPressed = false;
var redDownPressed = false;

var ballX = canvas.width / 2;
var ballY = canvas.height / 2;
var dx = 5;
var dy = 5;
var ballRadius = 10;

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
  }
}

function keUpHandler(e) {
  if (e.keyCode == 38) {
    socket.emit('greenUpPressed', false);
  } else if (e.keyCode == 40) {
    socket.emit('greenDownPressed', false);
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


  requestAnimationFrame(draw);
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
    // window.location.reload();
  } else if (ballX + dx - ballRadius <= 0) {
    // window.location.reload();
  }
}

draw();