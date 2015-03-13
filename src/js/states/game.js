/*
Main testing environment.
*/

var Renderables = require('../functionAccess/Renderables');
var UIBuilder = require('../ui/UIBuilder');
var ModuleBuilder = require('../entities/ModuleBuilder');
var CubeGroup = require('../entities/cube_group');
var Hackable = require('../entities/Hackable');
var Emitter = require('../effects/Emitter');
var Mouse = require('../entities/mouse');
var Bullet = require('../entities/Bullet');
var SoundManager = require('../entities/sound_manager');
var Shop = require('../ui/shop');
var Helper = require('../entities/helper');
var Cheating = require('../entities/cheating');
var Asteroids = require('../entities/asteroids');

var playerStartX = 1200, playerStartY = 1200;
var bg, bg2;
// var numRoids;
// var maxRoids = 100;
// var newModuleSpeed = 1000;
// var asteroids, asteroidList;
var leftKey, rightKey;
var warning;
var timer;

var Game = function () { };

module.exports = Game;

Game.prototype = {
	
  create: function () {
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
	
   this.simplify = false; // prevents things that get in the way of debugging
	
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
	// this.game.camera.x = playerStartX;
	// this.game.camera.y = playerStartY;
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
	
	// asteroids = this.game.add.group();
	// asteroids.enableBody = true;
	// asteroids.physicsBodyType = Phaser.Physics.P2JS;
	// asteroidList = new Phaser.ArraySet();
	// if (!this.simplify) { this.generateAsteroids(); }
	
	timer = this.game.time.create(false);
	warning = this.game.add.image(this.game.camera.x, this.game.camera.y, 'warning');
	warning.kill();
	
	leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	
   /*this.pauseKey = this.game.input.keyboard.addKey(27);
	this.pauseKey.onDown.add(this.pauseMenu, this);*/

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
   this.asteroids = new Asteroids(this, this.simplify);
   this.updateDependents.push(this.asteroids);
  },
  
  restartLevel: function() {
	this.mainSong.stop();
	this.game.state.start(playerState.currentLevel);
  },
  
	/*pauseMenu: function() {
		if(this.game.paused === false) {
			this.game.paused = true;
		}
		else {
			this.game.paused = false;
		}
	},*/
  
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

  update: function () {
	if(leftKey.isDown) {
		if(this.coreModule.cube.body.angularVelocity > -9) { 
			this.coreModule.cube.body.angularForce += -7.5 * Math.pow(this.player.numCubes, 1.65);
		}
	}
	if(rightKey.isDown) {
		if(this.coreModule.cube.body.angularVelocity < 9) {
			this.coreModule.cube.body.angularForce += 7.5 * Math.pow(this.player.numCubes, 1.65);
		}
	}
	this.mouse.update();
	this.scrollBG();
 
	for (var i = 0; i < this.updateDependents.length; i++) {
		if (this.updateDependents[i].update) {
			this.updateDependents[i].update();
		}
	}
	//Warning Code
	if(this.coreModule.cube.x + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 8000 ||
	this.coreModule.cube.x - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0 ||
	this.coreModule.cube.y + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 4000 ||
	this.coreModule.cube.y - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0) {
		if(timer.length === 0) {
			warning.revive();
			timer.loop(Phaser.Timer.SECOND * 5, this.resetPlayer, this);
			timer.start();
		}
	}
	else {
		if(warning.alive === true) {
			warning.kill();
		}
		if(timer.length > 0) {
			timer.stop(true);
		}
	}
	warning.x = this.game.camera.x;
	warning.y = this.game.camera.y;
  },
  
  render: function () {
	this.mouse.render();
	this.renderables.renderAll();
  },
  
	scrollBG: function() {
		bg.x += 0.125;
		if(bg.x >= 8000) {
			bg.x = 0;
		}
		bg2.x += 0.125;
		if(bg2.x >= 8000) {
			bg2.x = 0;
		}
	},
	
	// generateAsteroids: function() {
		// for(;numRoids < maxRoids; numRoids++) {
			// var randX = this.game.rnd.integerInRange(0, this.game.world.width);
			// var randY = this.game.rnd.integerInRange(0, this.game.world.height);
			
			// while(randX < this.coreModule.cube.x - (this.player.cubesWidth() / 2 + 100) && randX > this.coreModule.cube.x + (this.player.cubesWidth() / 2 + 100) &&
			// randY < this.coreModule.cube.y - (this.player.cubesHeight() / 2 + 100) && randY > this.coreModule.cube.y + (this.player.cubesHeight() / 2 + 100)) {
				// randX = this.game.rnd.integerInRange(0, this.game.world.width);
				// randY = this.game.rnd.integerInRange(0, this.game.world.height);
			// }
			
			// var asteroid = asteroids.create(randX, randY, 'asteroid');
			
			// asteroid.body.clearShapes(); 
			// asteroid.body.loadPolygon('asteroidPolygon', 'asteroid'); //Change the collision detection from an AABB to a polygon
			// asteroid.body.damping = this.game.rnd.realInRange(0, 0.3) * this.game.rnd.integerInRange(0, 1) * this.game.rnd.integerInRange(0, 1);
			// asteroid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
			// asteroid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
			// asteroid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
			// asteroid.body.setCollisionGroup(this.collisionGroup);
			// asteroid.body.collides(this.collisionGroup);
			// asteroid.body.collideWorldBounds = false;
			// asteroid.autoCull = true;
			// asteroid.checkWorldBounds = true;
			// asteroid.events.onOutOfBounds.add(this.resetAsteroid, {roid: asteroid, coreModule: this.coreModule, player: this.player, game: this.game});
			// asteroidList.add(asteroid);
		// }
	// },
	
	// resetAsteroid: function() {
		// var randX = this.game.rnd.integerInRange(0, this.game.world.width);
		// var randY = this.game.rnd.integerInRange(0, this.game.world.height);
			
		// while(randX < this.coreModule.cube.x - (this.player.cubesWidth() / 2 + 100) && randX > this.coreModule.cube.x + (this.player.cubesWidth() / 2 + 100) &&
			// randY < this.coreModule.cube.y - (this.player.cubesHeight() / 2 + 100) && randY > this.coreModule.cube.y + (this.player.cubesHeight() / 2 + 100)) {
				// randX = this.game.rnd.integerInRange(0, this.game.world.width);
				// randY = this.game.rnd.integerInRange(0, this.game.world.height);
		// }
		// this.roid.x = randX;
		// this.roid.y = randY;
		// this.roid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
		// this.roid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
		// this.roid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
	// },
	
	resetPlayer: function() {
		if(this.coreModule.cube.x + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 8000) {
			this.coreModule.cube.body.moveLeft(this.player.numCubes * 750);
		}
		if(this.coreModule.cube.x - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0) {
			this.coreModule.cube.body.moveRight(this.player.numCubes * 750);
		}
		if(this.coreModule.cube.y + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 4000) {
			this.coreModule.cube.body.moveUp(this.player.numCubes * 750);
		}
		else if(this.coreModule.cube.y - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0) {
			this.coreModule.cube.body.moveDown(this.player.numCubes * 750);
		}
	},
};



























