// requires
var five = require("johnny-five");
var tessel = require("tessel-io");
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);

var lightOne, lightTwo, lightThree, lightFour, lightFive, lightSix;

var voiceSave = [0, 0, 0, 0, 0, 0];

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', function(req, res, next) {
  console.log("GET request");
  res.sendFile(__dirname + '/index.html');
});

var board = new five.Board({
   io: new tessel()
})

board.on("ready", setup);

function setup() {
   lightOne = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 0
   });
   lightOne.level = 0;
   lightTwo = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 1
   });
   lightTwo.level = 0;
   lightThree = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 2
   });
   lightThree.level = 0;
   lightFour = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 3
   });
   lightFour.level = 0;
   lightFive = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 4
   });
   lightFive.level = 0;
   lightSix = new five.Led({
      controller: "PCA9685",
      port: "A",
      address: 0x40,
      pin: 5
   });
   lightSix.level = 0;
}

app.post('/', function(req, res) {
   var action = req.body.value1;
   console.log(req.body);
   switch (action) {
      case "on":
         lightsOn();
         break;
      case "off":
         lightsOff();
         break;
      case "up":
      case "brighter":
         lightLevel(15);
         break;
      case "down":
      case "dimmer":
         lightLevel(-15);
         break;
      case "save":
         saveLevels();
         break;
      default:
         // do nothing
   }
   res.send(req.body);
});

function saveLevels() {
   voiceSave = [lightOne.level, lightTwo.level, lightThree.level, lightFour.level, lightFive.level, lightSix.level];
}

function lightsOn() {
   if (voiceSave[0] == 0) {
      lightOne.level = 255;
      lightOne.on();
      lightTwo.level = 255;
      lightTwo.on();
      lightThree.level = 255;
      lightThree.on();
      lightFour.level = 255;
      lightFour.on();
      lightFive.level = 255;
      lightFive.on();
      lightSix.level = 255;
      lightSix.on();
   } else {
      lightOne.brightness(voiceSave[0]);
      lightOne.level = voiceSave[0];
      lightTwo.brightness(voiceSave[1]);
      lightTwo.level = voiceSave[1];
      lightThree.brightness(voiceSave[2]);
      lightThree.level = voiceSave[2];
      lightFour.brightness(voiceSave[3]);
      lightFour.level = voiceSave[3];
      lightFive.brightness(voiceSave[4]);
      lightFive.level = voiceSave[4];
      lightSix.brightness(voiceSave[5]);
      lightSix.level = voiceSave[5];
   }
}

function lightsOff() {
   lightOne.off();
   lightOne.level = 0;
   lightTwo.off();
   lightTwo.level = 0;
   lightThree.off();
   lightThree.level = 0;
   lightFour.off();
   lightFour.level = 0;
   lightFive.off();
   lightFive.level = 0;
   lightSix.off();
   lightSix.level = 0;
}

function lightLevel (amount) {
   lightOne.level = lightOne.level + amount;
   lightOne.brightness(lightOne.level);
   lightTwo.level = lightTwo.level + amount;
   lightTwo.brightness(lightTwo.level);
   lightThree.level = lightThree.level + amount;
   lightThree.brightness(lightThree.level);
   lightFour.level = lightFour.level + amount;
   lightFour.brightness(lightFour.level);
   lightFive.level = lightFive.level + amount;
   lightFive.brightness(lightFive.level);
   lightSix.level = lightSix.level + amount;
   lightSix.brightness(lightSix.level);
}

io.on('connection', function (socket) {
   console.log(socket.id);

   emitUpdate();

   socket.on('allOff', function(data) {
      lightsOff();
      emitUpdate();
   });

   socket.on('levelChange', function(data) {
      switch (data.light) {
         case "lightOne":
            lightOne.level = parseInt(data.level);
            lightOne.brightness(lightOne.level);
            break;
         case "lightTwo":
            lightTwo.level = parseInt(data.level);
            lightTwo.brightness(lightTwo.level);
            break;
         case "lightThree":
            lightThree.level = parseInt(data.level);
            lightThree.brightness(lightThree.level);
            break;
         case "lightFour":
            lightFour.level = parseInt(data.level);
            lightFour.brightness(lightFour.level);
            break;
         case "lightFive":
            lightFive.level = parseInt(data.level);
            lightFive.brightness(lightFive.level);
            break;
         case "lightSix":
            lightSix.level = parseInt(data.level);
            lightSix.brightness(lightSix.level);
            break;
         default:

      }
      emitUpdate();
   });

   function emitUpdate() {
      io.emit('setValue', {
         lightOne: lightOne.level,
         lightTwo: lightTwo.level,
         lightThree: lightThree.level,
         lightFour: lightFour.level,
         lightFive: lightFive.level,
         lightSix: lightSix.level
      });
   }
});

server.listen(80);
console.log("Server listening");
