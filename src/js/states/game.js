/*
Main testing environment.
*/

var Renderables = require('../functionAccess/Renderables');
var UIBuilder = require('../ui/UIBuilder');
var Cube = require('../entities/cube');
var ModuleBuilder = require('../entities/ModuleBuilder');
var Utils = require('../utils');
var CubeGroup = require('../entities/cube_group');
var Hackable = require('../entities/Hackable');
var Emitter = require('../effects/Emitter');
var mouseBody; // physics body for mouse
var Mouse = require('../entities/mouse');

var bg, bg2;
var numRoids = 0;
var maxRoids = 100;
var asteroids, asteroidList;
var leftKey, rightKey, cwKey, ccwKey;
var asteroidCG, cubeCG;
var warning;
var timer;

var Game = function () {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {
	
  create: function () {
	this.game.world.setBounds(0, 0, 8000, 4000);
	
	//Create the two background images
    bg = this.game.add.sprite(0, 0, 'earthNight');
	bg2 = this.game.add.sprite(-8000, 0, 'earthNight');
	
	this.game.physics.startSystem(Phaser.Physics.P2JS);
   this.game.physics.p2.setImpactEvents(true);

	cubeCG = this.game.physics.p2.createCollisionGroup();
	asteroidCG = this.game.physics.p2.createCollisionGroup();
	
   this.mouse = new Mouse(this.game, this.input);
   
   this.updateDependents = [];

	//create Renderables class
	this.renderables = new Renderables();
	//create the UIBuilder
	this.uiBuilder = new UIBuilder(this, this.renderables);   
	//create ModuleBuilder and store it in this game state object
	this.moduleBuilder = new ModuleBuilder(this);
	//create and store the core module
	this.coreModule = this.moduleBuilder.build('core', 1200, 1200, true);
	this.cubeWidth = this.coreModule.cube.width;
	this.coreModule.cube.body.setCollisionGroup(cubeCG);
	this.coreModule.cube.body.collides([cubeCG, asteroidCG]);
	this.cubeBuffer = 2;
	var playerGroup = new CubeGroup(this, this.coreModule.cube);
	this.updateDependents.push(playerGroup);
	this.player = playerGroup;
	this.player.isPlayer = true;
   
	this.mouse = new Mouse(this.game, this.input, playerGroup);
	this.player.isPlayer = true;

	//Create the emitter for the binary particle effects
	this.BinaryEmitter = new Emitter(this);
	
	//test hackable object
	this.testHack = new Hackable(this, 1600,1200, 'hackable1', 400);

	this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.game.input.keyboard.addKeyCapture([this.spaceKey]);

	
	asteroids = this.game.add.group();
	asteroids.enableBody = true;
	asteroids.physicsBodyType = Phaser.Physics.P2JS;
	asteroidList = new Phaser.ArraySet();
	this.generateAsteroids();
	
	timer = this.game.time.create(false);
	warning = this.game.add.image(this.game.camera.x, this.game.camera.y, 'warning');
	warning.kill();
	
	leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	ccwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
	cwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
	
	//DEBUGGING LISTENERS- allow you to create modules by pressing keys
	//core
	this.placeCoreKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
	this.placeCoreKey.onDown.add(this.addCore, this);
	//shield
	this.placeShieldKey = this.game.input.keyboard.addKey(Phaser.Keyboard.O);
    this.placeShieldKey.onDown.add(this.addShield, this);
	//thruster
	this.placeThrusterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
    this.placeThrusterKey.onDown.add(this.addThruster, this);
	//solarPanel
	this.placeSPKey = this.game.input.keyboard.addKey(Phaser.Keyboard.U);
    this.placeSPKey.onDown.add(this.addSP, this);
	//hacker
	this.placeHackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Y);
	this.placeHackKey.onDown.add(this.addHack, this);
	//gun
	this.placeGunKey = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.placeGunKey.onDown.add(this.addGun, this);
	//END
    
    // Debug controller
    this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
    this.debugKey.onDown.add(this.debug, this);
    this.rootSpawned = false;
    
    this.debugNum = 0;
    this.myRoot = undefined;
    
    this.levelData = JSON.parse(this.game.cache.getText('level_one'));
    //this.loadData();
    
	this.game.camera.follow(this.coreModule.cube);
	this.shopButton = this.game.add.button(this.game.camera.x + 1232, 16, 'shopButton', this.openShopMenu, this, 1, 0, 2);
	
    this.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));
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
               // var practical = [];
               for (var row = 0; row < blueprint.length; row++) {
                  // var newCol = [];
                  for (var col = 0; col < blueprint[row].length; col++) {
                     var type = blueprint[row][col];
                     var newModule = this.moduleBuilder.build(type, enemyX + row * (this.cubeWidth + this.cubeBuffer),
                     enemyY - col * (this.cubeWidth + this.cubeBuffer), false);
					 newModule.cube.body.setCollisionGroup(cubeCG);
					 newModule.cube.body.collides([cubeCG, asteroidCG]);
                     // newCol.push(newModule.cube);
                     var point = new Phaser.Point(row, col);
                     enemyGroup.add(newModule.cube, point);
                  }
                  // practical.push(newCol);
               }
               // TODO: give different types here
               enemyGroup.giveAI('ram', this.player);
            }
         }
      }
  },
  
  openShopMenu: function() {
  
  },

  update: function () {    
	if(leftKey.isDown) {
		if(this.coreModule.cube.body.angularVelocity > -9) { 
			this.coreModule.cube.body.angularForce += -5 * Math.pow(this.player.numCubes, 1.65);
		}
	}
	
	if(rightKey.isDown) {
		if(this.coreModule.cube.body.angularVelocity < 9) {
			this.coreModule.cube.body.angularForce += 5 * Math.pow(this.player.numCubes, 1.65);
		}
	}
	
	if(ccwKey.isDown) {
		if(this.mouse.grabbed !== undefined && this.mouse.grabbed.sprite.group === undefined) {
			this.mouse.grabbed.angularForce += -5;
		}
	}
	
	if(cwKey.isDown) {
		if(this.mouse.grabbed !== undefined && this.mouse.grabbed.sprite.group === undefined) {
			this.mouse.grabbed.angularForce += 5;
		}
	}
	
	this.mouse.update();
	this.scrollBG();
   
	for (var i = 0; i < this.updateDependents.length; i++) {
		if (this.updateDependents[i].update) {
			this.updateDependents[i].update();
		}
	}
	
	if(this.coreModule.cube.x + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 8000 ||
	this.coreModule.cube.x - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0 ||
	this.coreModule.cube.y + (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) > 4000 ||
	this.coreModule.cube.y - (Math.max(this.player.cubesWidth(), this.player.cubesHeight()) / 2 * 64) < 0) {
		if(timer.length === 0) {
			warning.revive();
			timer.loop(Phaser.Timer.SECOND * 10, this.resetPlayer, this);
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
	this.shopButton.x = this.game.camera.x + 1232;
	this.shopButton.y = this.game.camera.y + 16;
  },
  
  render: function () {
	this.mouse.render();
	this.renderables.renderAll();
  },
  
	scrollBG: function() {
		bg.x += 0.125;
		if(bg.x >= 8000) {
			bg.x += 0;
		}
		bg2.x += 0.125;
		if(bg2.x >= 8000) {
			bg2.x = 0;
		}
	},
	
	generateAsteroids: function() {
		for(;numRoids < maxRoids; numRoids++) {
			var randX = this.game.rnd.integerInRange(0, this.game.world.width);
			var randY = this.game.rnd.integerInRange(0, this.game.world.height);
			
			while(randX < this.coreModule.cube.x - (this.player.cubesWidth() / 2 + 100) && randX > this.coreModule.cube.x + (this.player.cubesWidth() / 2 + 100) &&
			randY < this.coreModule.cube.y - (this.player.cubesHeight() / 2 + 100) && randY > this.coreModule.cube.y + (this.player.cubesHeight() / 2 + 100)) {
				randX = this.game.rnd.integerInRange(0, this.game.world.width);
				randY = this.game.rnd.integerInRange(0, this.game.world.height);
			}
			
			var asteroid = asteroids.create(randX, randY, 'asteroid');
			
			asteroid.body.setCircle(16); //Change the collision detection from an AABB to a circle
			asteroid.body.angularDamping = 0;
			asteroid.body.damping = this.game.rnd.realInRange(0, 0.5) * this.game.rnd.integerInRange(0, 1);
			asteroid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
			asteroid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.setCollisionGroup(asteroidCG);
			asteroid.body.collides([asteroidCG, cubeCG]);
			asteroid.body.collideWorldBounds = false;
			asteroid.autoCull = true;
			asteroid.checkWorldBounds = true;
			asteroid.events.onOutOfBounds.add(this.resetAsteroid, {roid: asteroid, coreModule: this.coreModule, player: this.player, game: this.game});
			asteroidList.add(asteroid);
		}
	},
	
	resetAsteroid: function() {
		var randX = this.game.rnd.integerInRange(0, this.game.world.width);
		var randY = this.game.rnd.integerInRange(0, this.game.world.height);
			
		while(randX < this.coreModule.cube.x - (this.player.cubesWidth() / 2 + 100) && randX > this.coreModule.cube.x + (this.player.cubesWidth() / 2 + 100) &&
			randY < this.coreModule.cube.y - (this.player.cubesHeight() / 2 + 100) && randY > this.coreModule.cube.y + (this.player.cubesHeight() / 2 + 100)) {
				randX = this.game.rnd.integerInRange(0, this.game.world.width);
				randY = this.game.rnd.integerInRange(0, this.game.world.height);
		}
		this.roid.x = randX;
		this.roid.y = randY;
		this.roid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
		this.roid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
		this.roid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
	},
	
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
	
  //DEBUG FUNCTIONS- event functions called from listeners that allow you to create modules with key presses
  addCore: function () { 
	//Attempts to create more core modules here will only return the existing core
	var newModule = this.moduleBuilder.build('core', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },
  addShield: function () {
	var newModule = this.moduleBuilder.build('shield', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },
  addThruster: function () {
	var newModule = this.moduleBuilder.build('thruster', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },
  addSP: function () {
	var newModule = this.moduleBuilder.build('solarPanel', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },
  addHack: function () {
	var newModule = this.moduleBuilder.build('hacker', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },
  addGun: function () {
	var newModule = this.moduleBuilder.build('gun', this.mouse.x, this.mouse.y, true);
	newModule.cube.body.setCollisionGroup(cubeCG);
	newModule.cube.body.collides([cubeCG, asteroidCG]);
  },

  debug: function () {
    this.juicy.shake();
  }
};



























