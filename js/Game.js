class Game {
  constructor() {
    this.resetTitle=createElement("h2");
    this.resetButton=createButton("");
    this.leaderboardTitle=createElement("h2");
    this.leader1=createElement("h2");
    this.leader2=createElement("h2");
    this.playerMoving=false;

    this.leftKeyActive=false;
    this.blast=false;
  }

  getState() {
    var gameStateRef= database.ref("gameState"); //.ref= passa a localização para BD.
    gameStateRef.on("value", function(data){  //tem q ter o "on" pra ele ler e salvar o valor do campo gamestate
      gameState= data.val();
    });
  }

  update(state){
    database.ref("/").update({
      gameState:state
    });
  }

  start() {
    form = new Form();
    form.display();
    player = new Player();
    playerCount=player.getCount();

    //criando os carros aqui
    car1=createSprite(width/2-50, height-100);
    car1.addImage("car1", car1image);
    car1.scale = 0.07;
    car1.addImage("blast", blastImage);

    car2=createSprite(width/2+100, height-100);
    car2.addImage("car2", car2image);
    car2.scale = 0.07;
    car2.addImage("blast", blastImage);

    cars= [car1,car2];

    fuels = new Group();
    powerCoins = new Group();

    obstacles = new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    //adicionar o sprite de fuel
    this.addSprites(fuels, 4, fuelImage, 0.02);
    //add sprite da moeda
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);
    
    // add obstacles(sprite)
    this.addSprites(obstacles, obstaclesPositions.length, obstacle1Image, 0.04, obstaclesPositions);
  }

  handleElements(){
    form.hide();
    form.titleImg.position(40,50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar o jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2+200,40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width/2+230,100);

    this.leaderboardTitle.html("Placar");
    this.leaderboardTitle.class("resetText");
    this.leaderboardTitle.position(width/3-60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width/3-50,80)

    this.leader2.class("leadersText");
    this.leader2.position(width/3-50,130);
  }

  play(){
    this.handleElements();
    this.handleResetButton();


   Player.getPlayersInfo();

   player.getCarsAtEnd();

   if(allPlayers!=undefined){
    image(trackimage, 0 , -height*5,width, height*6);
    this.showFuelBar();
    this.showLife();
    this.showLeaderboard();

    //indice da matriz
    var index = 0;
    for(var plr in allPlayers){
      //add um ao indice para cada loop
      index= index+1;

      //usando B.D. pra exibir os carros nas diressões x e y
      var x=allPlayers[plr].positionX;
      var y=height-allPlayers[plr].positionY;

      var currentlife = allPlayers[plr].life;

      if(currentlife<=0){
        cars[index-1].changeImage("blast");
        cars[index-1].scale=0.3;
      }

      cars [index-1].position.x=x;
      cars [index-1].position.y=y;

      //marcanu jogador
      if(index==player.index){
        stroke(10);
        fill("red");
        ellipse(x,y,60,60);

        this.handleFuel(index);
        this.handlePowerCoin(index);
        this.handleCarACollisionWithCarB(index);
        this.handleObstacleCollision(index);
        if(player.life<=0){
          this.blast=true;
          this.playerMoving=false;
        }

        //alteranu a cam na direção y
        camera.position.x=cars[index-1].position.x;
        camera.position.y=cars[index-1].position.y;
      }
    }

    /*if(this.playerMoving){
      player.positionY+=5;
      player.update();
    }*/
    this.handlePlayerControls();

    const finshLine=height*6-100;
    if(player.positionY>finshLine){
      gameState=2;
      player.rank+=1;
      Player.updateCarsAtEnd(player.rank);
      player.update();
      this.showRank();
    }


    drawSprites();
   }
  }

  handleResetButton(){
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        carsAtEnd:0,
        playerCount:0,
        gameState:0,
        players:{},
        carsAtEnd:0
      });
      //recarregar janela
      window.location.reload();
    });
  }

  showLife(){
    push();
    image(lifeImage, width/2-130, height-player.positionY-300, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-300, 185, 20);
    fill("#f50057");
    rect(width/2-100, height-player.positionY-300, player.life, 20);
    noStroke();
    pop();
  }

  showFuelBar(){
    push();
    image(fuelImage, width/2-130, height-player.positionY-270, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-270, 185, 20);
    fill("#ffc400");
    rect(width/2-100, height-player.positionY-270, player.fuel, 20);
    noStroke();
    pop();
  }



  showLeaderboard() {
    var leader1, leader2;
    var players= Object.values(allPlayers);
    //condição pra verificar se o gamer um chego em primero
    if (players[0].rank==0 && players[1].rank==0|| players[0].rank==1){
      leader1=players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader2=players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }
    //condição pra verificar se o gamer 2 chegou em primeiro
    if (players[1].rank==1){
      leader1=players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
      leader2=players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
    }
     //passando leader 1 2 em html pra aparecer na tela
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls(){
    if(!this.blast){
        //manipulando events do teclado
      if(keyIsDown(UP_ARROW)){
        this.playerMoving=true;
        player.positionY+=10;
        player.update();
      }
      //movendo pra isqueda
      if (keyIsDown(LEFT_ARROW) && player.positionX> width/2-300){
        this.leftKeyActive=true;
        player.positionX -= 5;
        player.update();
      }
      //movendo pra direita
      if (keyIsDown(RIGHT_ARROW) && player.positionX< width/2+300){
        this.leftKeyActive=false;
        player.positionX += 5;
        player.update();
      }
    }
    
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions=[]){
    for (var i = 0; i <numberOfSprites; i++){
      var x, y;

      if (positions.length>0){
        x=positions[i].x;
        y=positions[i].y;
        spriteImage=positions[i].image;
      }
      else{
        x= random(width/2+150, width/2 - 150);
        y = random(-height*4.5, height-400);
      }

      

      var sprite = createSprite(x, y);
      sprite.addImage("sprite",spriteImage);

      sprite.scale= scale;
      spriteGroup.add(sprite);
    }
  }

  handleFuel(index){
   // coletanu combustível
   cars[index-1].overlap(fuels, function(collector, collected){
    player.fuel=185;
    collected.remove();
   });

   //reduzindo o fuel
   if(player.fuel>0 && this.playerMoving){
    player.fuel-=0.3;
   }

   if(player.fuel<=0){
    gameState=2;
    this.gameOver();
   }
  }

  handlePowerCoin(index){
    // coletanu moeda
    cars[index-1].overlap(powerCoins, function(collector, collected){
     player.score +=100;
     player.update();
     collected.remove();
    });
  }

  handleObstacleCollision(index){
    if(cars[index-1].collide(obstacles)){
      if(this.leftKeyActive){
        player.positionX +=100;
      }
      else{
        player.positionX -=100;
      }

      if(player.life>0){
        player.life -= 185/4;
      }
      player.update();
    }
  }

  handleCarACollisionWithCarB(index){
    if(index==1){
      if(cars[index-1].collide(cars[1])){
        if(this.leftKeyActive){
          player.positionX+=100;
        }
        else{
          player.positionX-=100;
        }

        if(player.life>0){
          player.life-=185/4;
        }
        player.update();
      }
    }
    if(index==2){
      if(cars[index-1].collide(cars[0])){
        if(this.leftKeyActive){
          player.positionX+=100;
        }
        else{
          player.positionX-=100;
        }

        if(player.life>0){
          player.life-=185/4;
        }
        player.update();
      }
    }
  }

  showRank() {
    swal({
      title: `Incrível!${"\n"}Rank${"\n"}${player.rank}`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Oops você perdeu a corrida!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por jogar"
    });
  }
}