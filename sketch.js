var canvas;
var backgroundImage;
var bgImg;
var gameState;
var database;
var form, player;
var playerCount;
var car1image, car2image, trackimage;
var car1, car2;
var cars=[];
var allPlayers;
var fuelImage, powerCoinImage;
var fuels, powerCoins;
var obstacle1Image, obstacle2Image;
var obstacles;
var lifeImage
var blastImage

function preload() {
  backgroundImage = loadImage("assets/background.png");

  car1image = loadImage("assets/car1.png");
  car2image = loadImage("assets/car2.png");
  trackimage = loadImage("assets/track.jpg");
  fuelImage = loadImage("assets/fuel.png");
  powerCoinImage = loadImage("assets/goldCoin.png");
  obstacle1Image = loadImage("assets/obstacle1.png");
  obstacle2Image = loadImage("assets/obstacle2.png");
  lifeImage = loadImage("assets/life.png");
  blastImage = loadImage("assets/blast.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();

}

function draw() {
  background(backgroundImage);
  if (playerCount==2){
    game.update(1);
  }

  if (gameState==1){
    game.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}