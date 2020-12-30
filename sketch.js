//Create variables here
var dog, happyDog, hungryDog, database, foodS,foodStockRef,database;
var frameCountNow = 0;
var fedTime, lastFed, foodObj, currentTime;
var milk, input, name;
var gameState = "hungry";
var gameStateRef;
var bedroomIMG, gardenIMG, washroomIMG,sleepIMG,runIMG;
var feed, addFood;
var input, button;

function preload()
{
  //load images here
  hungryDog = loadImage("dogImg1.png");
  happyDog = loadImage("dogImg.png");
  sadDog = loadImage("deadDog.png");
  bedroomIMG = loadImage("Bed Room.png");
  gardenIMG = loadImage("Garden.png");
  washroomIMG = loadImage("Wash Room.png");
  sleepIMG = loadImage("Lazy.png");
  runIMG = loadImage("running.png");
}

function setup() {
  createCanvas(1200,500);
  database = firebase.database();
  
  foodObj = new Food();

  dog = createSprite(width/2+250,height/2,10,10);
  dog.addAnimation("hungry",hungryDog);
  dog.addAnimation("happy",happyDog);
  dog.addAnimation("sleeping",sleepIMG);
  dog.addAnimation("run",runIMG);
  dog.addAnimation("sad",sadDog);
  dog.scale = 0.3;
  
  getGameState();

  feed = createButton("Feed the dog");
  feed.position(950,95);
  feed.mousePressed(feedDog);

  addFood = createButton("Add food");
  addFood.position(1050,95);
  addFood.mousePressed(addFoods);

  input = createInput("Pet name");
  input.position(950,120);

  button = createButton("Confirm");
  button.position(1000,145);
  button.mousePressed(createName);

}

function draw() { 
  background(rgb(255,179,102));
  currentTime = hour();
  if(gameState ==! "hungry"){
    dog.changeAnimation(sadDog);
    feed.hide();
  }else if(currentTime === lastFed + 1){
    gameState = "playing";
    updateGameState();
    foodObj.garden();
  }
  else if(currentTime === lastFed + 2){
    gameState = "sleeping";
    updateGameState();
    foodObj.bedroom();
  }
  else if(currentTime > lastFed + 2 && currentTime <= lastFed + 4){
    gameState = "bathing";
    updateGameState();
    foodObj.washroom();
  }
  else {
    gameState = "hungry";

    updateGameState();
    foodObj.display();
  }

  //console.log(gameState);

  foodObj.getFoodStock();
  //console.log(foodStock);
  getGameState();

  fedTime = database.ref('feedTime');
  fedTime.on("value",function(data){
    lastFed = data.val();
  })

  if(gameState === "hungry"){
    feed.show();
    addFood.show();
    dog.addAnimation("hungry",hungryDog);
  }
  else {
    feed.hide();
    addFood.hide();
    dog.remove();
  }



  drawSprites();

  textSize(32);
  fill("white");

  textSize(20);
  text("Last fed: "+lastFed+":00",300,70);

  text("Time since last fed: "+(currentTime - lastFed),300,100);
}

function feedDog(){
  foodObj.deductFood();
  foodObj.updateFoodStock();
  dog.changeAnimation("happy", happyDog);
  gameState = "happy";
  updateGameState();
}

function addFoods(){
  foodObj.addFood();
  foodObj.updateFoodStock();
}

async function hour(){
  var site = await fetch("http://worldtimeapi.org/api/timezone/America/New_York");
  var siteJSON = await site.json();
  var datetime = siteJSON.datetime;
  var hourTime = datetime.slice(11,13);
  return hourTime;
}

function createName(){
  input.hide();
  button.hide();

  name = input.value();
  var greeting = createElement('h3');
  greeting.html("Pet's name: "+name);
  greeting.position(width/2+850,height/2+200);
}

function getGameState(){
  gameStateRef = database.ref('gameState');
  gameStateRef.on("value",function(data){
    gameState = data.val();

  });
};

function updateGameState(){
  database.ref('/').update({
    gameState: gameState
  })
}