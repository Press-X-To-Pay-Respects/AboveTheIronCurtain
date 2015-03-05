/*
Main testing environment.
*/

var ModuleBuilder = require('../entities/ModuleBuilder');
var ModuleBuilder = require('../entities/ModuleBuilder');
var CubeGroup = require('../entities/cube_group');
var Mouse = require('../entities/mouse');

var bg, bg2;
var numRoids = 0;
var maxRoids = 50;
var cubeCG, asteroidCG;
var asteroids, asteroidList;
var leftKey, rightKey, cwKey, ccwKey;

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
    
	this.mouse = new Mouse(this.game, this.input);
    
	//create ModuleBuilder and store it in this game state object
	this.moduleBuilder = new ModuleBuilder(this);
	//create and store the core module
	this.coreModule = this.moduleBuilder.build('core', 1500, 1500);
	this.cubeWidth = this.coreModule.cube.width;
	this.cubeBuffer = 2;
	this.player = new CubeGroup(this, this.coreModule.cube);
	
	this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.game.input.keyboard.addKeyCapture([this.spaceKey]);
	//Creates collision groups for the player and the asteroids
	cubeCG = this.game.physics.p2.createCollisionGroup();
	asteroidCG = this.game.physics.p2.createCollisionGroup();
	
	asteroids = this.game.add.group();
	asteroids.enableBody = true;
	asteroids.physicsBodyType = Phaser.Physics.P2JS;
	asteroidList = new Phaser.ArraySet();
	this.generateAsteroids();
	
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
	//END
    
    // Debug controller
    this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
    this.debugKey.onDown.add(this.debug, this);
    this.rootSpawned = false;
    
    this.debugNum = 0;
    this.myRoot = undefined;

	this.game.camera.setPosition(1000, 1000);
    
    this.levelData = JSON.parse(this.game.cache.getText('level_one'));
    this.loadData();
  },
  
  // this.coreModule = this.moduleBuilder.build('core', 1500, 1500);
	// this.player = new CubeGroup(this, this.coreModule.cube);
  
  loadData: function() {
      var myLevel = this.levelData['level_one'];
      for (var key in myLevel) {
         if (myLevel.hasOwnProperty(key)) {
            var element = myLevel[key];
            if (element.hasOwnProperty('blueprint')) { // enemy type
               var enemyX = element['x_pos'];
               var enemyY = element['y_pos'];
               var enemyGroup = new CubeGroup(this, undefined);
               var blueprint = element['blueprint'];
               for (var row = 0; row < blueprint.length; row++) {
                  for (var col = 0; col < blueprint[row].length; col++) {
                     var type = blueprint[row][col];
                     var newModule = this.moduleBuilder.build(type, enemyX + row * (this.cubeWidth + this.cubeBuffer),
                     enemyY + col * (this.cubeWidth + this.cubeBuffer));
                     var point = new Phaser.Point(row, col);
                     enemyGroup.add(newModule.cube, point);
                  }
               }
            }
         }
      }
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
	this.game.camera.follow(this.coreModule.cube);
  },
  
  render: function () {
   // this.game.debug.geom(this.line);
   this.mouse.render();
   // this.game.debug.geom(this.line);
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
			var coinA = this.game.rnd.integerInRange(0,1);
			var coinB = this.game.rnd.integerInRange(0,1);
			var asteroid;
			if(coinA === 1) {
				if(coinB === 1) { //Spawn asteroid above screen
					asteroid = asteroids.create(this.coreModule.cube.x + this.game.rnd.integerInRange(-this.game.camera.width/2, this.game.camera.width/2), this.coreModule.cube.y - this.game.camera.height/2 - this.game.rnd.integerInRange(32, 300), 'asteroid');
				}
				else { //Spawn asteroid below screen
					asteroid = asteroids.create(this.coreModule.cube.x + this.game.rnd.integerInRange(-this.game.camera.width/2, this.game.camera.width/2), this.coreModule.cube.y + this.game.camera.height/2 + this.game.rnd.integerInRange(32, 300), 'asteroid');
				}
			}
			else {
				if(coinB === 1) { //Spawn asteroid to left of screen
					asteroid = asteroids.create(this.coreModule.cube.x - this.game.camera.width/2 - this.game.rnd.integerInRange(32, 300), this.coreModule.cube.y + this.game.rnd.integerInRange(-this.game.camera.height/2, this.game.camera.height/2), 'asteroid');
				}
				else { //Spawn asteroid to right
					asteroid = asteroids.create(this.coreModule.cube.x + this.game.camera.width/2 + this.game.rnd.integerInRange(32, 300), this.coreModule.cube.y + this.game.rnd.integerInRange(-this.game.camera.height/2, this.game.camera.height/2), 'asteroid');
				}
			}
			
			asteroid.body.setCircle(16); //Change the collision detection from an AABB to a circle
			asteroid.body.angularDamping = 0;
			asteroid.body.damping = 0;
			asteroid.body.rotation = this.game.rnd.realInRange(0, 2 * 3.14);
			asteroid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.setCollisionGroup(asteroidCG); //Set each asteroid to use the asteroid collision group
			asteroid.body.collides([asteroidCG, cubeCG]); //Sets what the asteroids will collide with. Can be an array or just a single collision group
			asteroidList.add(asteroid);
		}
	},
  
  //DEBUG FUNCTIONS- event functions called from listeners that allow you to create modules with key presses
  addCore: function () { 
	//Attempts to create more core modules here will only return the existing core
	this.moduleBuilder.build('core', this.mouse.x, this.mouse.y);
  },
  addShield: function () {
	this.moduleBuilder.build('shield', this.mouse.x, this.mouse.y);
  },
  addThruster: function () {
	this.moduleBuilder.build('thruster', this.mouse.x, this.mouse.y);
  },
  addSP: function () {
	this.moduleBuilder.build('solarPanel', this.mouse.x, this.mouse.y);
  },

  debug: function () {
    var test = JSON.parse(this.game.cache.getText('level_one'));
    console.log(test);
  }
};



























