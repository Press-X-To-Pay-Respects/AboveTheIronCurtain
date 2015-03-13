/*
Main testing environment.
*/
var LevelSetup = require('../entities/level_setup');

var Game = function () { };

module.exports = Game;

Game.prototype = {
	
  create: function () {
<<<<<<< HEAD
   this.levelSetup = new LevelSetup(this, 'level_one');
  },
  
=======
	this.game.world.setBounds(0, 0, 8000, 4000);
	
	numRoids = 0;
	//Create the two background images
   bg = this.game.add.sprite(0, 0, 'earthNight');
	bg2 = this.game.add.sprite(-8000, 0, 'earthNight');
	
	//Set up physics
	this.game.physics.startSystem(Phaser.Physics.P2JS);
	this.game.physics.p2.setImpactEvents(true);
	//add collision group
	this.collisionGroup = this.game.physics.p2.createCollisionGroup();
	
   this.simplify = true; // prevents things that get in the way of debugging
	
	this.mouse = new Mouse(this.game, this.input);
   
	this.updateDependents = [];

	//create Renderables class
	this.renderables = new Renderables();
	//create the UIBuilder
	this.uiBuilder = new UIBuilder(this, this.renderables);   
	//create ModuleBuilder and store it in this game state object
	this.moduleBuilder = new ModuleBuilder(this);
	//create and store the core module
	this.coreModule = this.moduleBuilder.build('core', playerStartX, playerStartY, true);
	this.game.camera.x = playerStartX;
	this.game.camera.y = playerStartY;
	this.cubeWidth = this.coreModule.cube.width;
	this.cubeBuffer = 2;
	this.testVar = 7;
	var playerGroup = new CubeGroup(this, this.coreModule.cube);
	this.updateDependents.push(playerGroup);
	this.player = playerGroup;
	this.player.isPlayer = true;
   
	this.mouse = new Mouse(this.game, this.input, playerGroup);
	this.player.isPlayer = true;
	
	//Create the emitter for the binary particle effects
	this.BinaryEmitter = new Emitter(this);
	
	//test hackable object
	// this.testHack = new Hackable(this, 1600, 1200, 'hackable1', 400);
	
	asteroids = this.game.add.group();
	asteroids.enableBody = true;
	asteroids.physicsBodyType = Phaser.Physics.P2JS;
	asteroidList = new Phaser.ArraySet();
	if (!this.simplify) { this.generateAsteroids(); }
	
	timer = this.game.time.create(false);
	warning = this.game.add.image(this.game.camera.x, this.game.camera.y, 'warning');
	warning.kill();
	
	leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	
	this.pauseText = this.game.add.text(-1000, -1000, 'Press \'Esc\' To Unpause');
	this.pauseText.font = 'Roboto';
    this.pauseText.fontSize = 64;
    this.pauseText.fill = '#ffffff';
	this.pauseKey = this.game.input.keyboard.addKey(27);
	this.pauseKey.onDown.add(this.pauseMenu, this);

   this.levelData = JSON.parse(this.game.cache.getText('level_one'));
   this.loadData();

   this.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));
   this.game.camera.follow(this.coreModule.cube);
	
	this.mainSong = this.game.add.audio('mainSong', 1, true);
	if (!this.simplify) { this.mainSong.play('',0,1,true,true); }
   
   this.soundManager = new SoundManager(this);
   this.shop = new Shop(this);
   this.updateDependents.push(this.shop);
   this.helper = new Helper(this);
   this.updateDependents.push(this.helper);
   this.cheating = new Cheating(this);
  },
  
  restartLevel: function() {
	this.mainSong.stop();
	this.game.state.start(playerState.currentLevel);
  },
  
	pauseMenu: function() {
		
		if(this.game.paused === false) {
			this.pauseText.x = this.game.camera.x + (this.game.camera.width / 2) - (this.pauseText.width / 2);
			this.pauseText.y = this.game.camera.y + (this.game.camera.height / 2) - (this.pauseText.height / 2);
			this.game.paused = true;
		}
		else {
			this.game.paused = false;
			this.pauseText.x = -1000;
			this.pauseText.y = -1000;
		}
	},
  
  loadData: function() {
      var myLevel = this.levelData['level_one'];
      for (var key in myLevel) {
         if (myLevel.hasOwnProperty(key)) {
            var element = myLevel[key];
            if (element.hasOwnProperty('blueprint')) { // enemy type
               var enemyX = element['x_pos'];
               var enemyY = element['y_pos'];
               var enemyGroup = new CubeGroup(this, undefined);
               this.updateDependents.push(enemyGroup);
               var blueprint = element['blueprint'];
               for (var row = 0; row < blueprint.length; row++) {
                  for (var col = 0; col < blueprint[row].length; col++) {
                     var type = blueprint[row][col];
                     if (type !== 'none') {
                        var newModule = this.moduleBuilder.build(type, enemyX + row * (this.cubeWidth + this.cubeBuffer),
                        enemyY - col * (this.cubeWidth + this.cubeBuffer), false);
                        newModule.cube.tag = 'enemy_module';
                        var point = new Phaser.Point(row, col);
                        enemyGroup.add(newModule.cube, point);
                     }
                  }
               }
               var aiType = element['type'];
               enemyGroup.giveAI(aiType, this.player);
            }
         }
      }
  },

>>>>>>> origin/gh-pages
  update: function () {
   this.levelSetup.update();
  },
  
  render: function () {
   this.levelSetup.render();
  }
};



























