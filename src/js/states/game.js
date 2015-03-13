/*
Main testing environment.
*/

var Renderables = require('../functionAccess/Renderables');
var UIBuilder = require('../ui/UIBuilder');
// var Cube = require('../entities/cube');
var ModuleBuilder = require('../entities/ModuleBuilder');
// var Utils = require('../utils');
var CubeGroup = require('../entities/cube_group');
var Hackable = require('../entities/Hackable');
var Emitter = require('../effects/Emitter');
// var mouseBody; // physics body for mouse
var Mouse = require('../entities/mouse');
var Bullet = require('../entities/Bullet');

var playerStartX = 1200, playerStartY = 1200;
var bg, bg2;
var numRoids;
var maxRoids = 100;
var newModuleSpeed = 1000;
var asteroids, asteroidList;
var leftKey, rightKey, cwKey, ccwKey;
var warning;
var timer;
var shopPanel, shopMenuOpening = false, shopMenuClosing = false;
var diff;
var shieldButton, solarPanelButton, thrusterButton, gunButton, hackButton;

var Game = function () {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {
	
  create: function () {
	this.game.world.setBounds(0, 0, 8000, 4000);
	
	numRoids = 0;
	diff = 0;
	this.money = 500;
	
	//Create the two background images
    bg = this.game.add.sprite(0, 0, 'earthNight');
	bg2 = this.game.add.sprite(-8000, 0, 'earthNight');
	
	//Load in sound effects
	this.hoverClick = this.game.add.audio('hoverClick');
	this.downClick = this.game.add.audio('downClick');
	this.cashRegister = this.game.add.audio('cashRegister');
	this.cashRegister.allowMultiple = true;
	this.error = this.game.add.audio('error');
	
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
	ccwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
	cwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
	
	this.shopKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
	this.shopKey.onDown.add(this.useShopButton, this);
	/*this.pauseKey = this.game.input.keyboard.addKey(27);
	this.pauseKey.onDown.add(this.pauseMenu, this);*/
	
	//DEBUGGING LISTENERS- allow you to create modules by pressing keys
	//Module debug buttons are broken and obsolete with the purchasing menu
	//core
	this.placeCoreKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
	this.placeCoreKey.onDown.add(this.debugAddCore, this);
	//shield
	this.placeShieldKey = this.game.input.keyboard.addKey(Phaser.Keyboard.O);
    this.placeShieldKey.onDown.add(this.debugAddShield, this);
	//thruster
	this.placeThrusterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
    this.placeThrusterKey.onDown.add(this.debugAddThruster, this);
	//solarPanel
	this.placeSPKey = this.game.input.keyboard.addKey(Phaser.Keyboard.U);
    this.placeSPKey.onDown.add(this.debugAddSP, this);
	//hacker
	this.placeHackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Y);
	this.placeHackKey.onDown.add(this.debugAddHack, this);
	//gun
	this.placeGunKey = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.placeGunKey.onDown.add(this.debugAddGun, this);
	//hackable
	this.placeHackableKey = this.game.input.keyboard.addKey(Phaser.Keyboard.L);
   this.placeHackableKey.onDown.add(this.debugAddHackable, this);
	
	//reset game
	this.resetKey = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
    this.resetKey.onDown.add(this.restartLevel, this);
	//add money
	this.addMoneyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
	this.addMoneyKey.onDown.add(this.addMoney, this);
	//END
    
    // Debug controller
    this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
    this.debugKey.onDown.add(this.debug, this);

    this.levelData = JSON.parse(this.game.cache.getText('level_one'));
    this.loadData();
    
	//Buttons & Button Events
   this.shopSpeed = 1;
	shopPanel = this.game.add.image(this.game.camera.x + this.game.camera.width + 256 + 16, this.game.camera.y + 16, 'shopPanel');
	shopPanel.kill();
	shieldButton = this.game.add.button(this.game.camera.x + this.game.camera.width - diff, this.game.camera.y + 52 + (88 * 1), 'shieldButton', this.purchaseModule, {state: this, key: 'shield'}, 1, 0, 2);
	shieldButton.kill();
	shieldButton.onInputOver.add(this.playHoverClick, this);
	shieldButton.onInputDown.add(this.playDownClick, this);
	solarPanelButton = this.game.add.button(this.game.camera.x + this.game.camera.width - diff, this.game.camera.y + 52 + (88 * 2), 'solarPanelButton', this.purchaseModule, {state: this, key: 'solarPanel'}, 1, 0, 2);
	solarPanelButton.kill();
	solarPanelButton.onInputOver.add(this.playHoverClick, this);
	solarPanelButton.onInputDown.add(this.playDownClick, this);
	thrusterButton = this.game.add.button(this.game.camera.x + this.game.camera.width - diff, this.game.camera.y + 52 + (88 * 3), 'thrusterButton', this.purchaseModule, {state: this, key: 'thruster'}, 1, 0, 2);
	thrusterButton.kill();
	thrusterButton.onInputOver.add(this.playHoverClick, this);
	thrusterButton.onInputDown.add(this.playDownClick, this);
	gunButton = this.game.add.button(this.game.camera.x + this.game.camera.width - diff, this.game.camera.y + 52 + (88 * 4), 'gunButton', this.purchaseModule, {state: this, key: 'gun'}, 1, 0, 2);
	gunButton.kill();
	gunButton.onInputOver.add(this.playHoverClick, this);
	gunButton.onInputDown.add(this.playDownClick, this);
	hackButton = this.game.add.button(this.game.camera.x + this.game.camera.width - diff, this.game.camera.y + 52 + (88 * 5), 'hackButton', this.purchaseModule, {state: this, key: 'hack'}, 1, 0, 2);
	hackButton.kill();
	hackButton.onInputOver.add(this.playHoverClick, this);
	hackButton.onInputDown.add(this.playDownClick, this);
	this.shopButton = this.game.add.button(this.game.camera.x + this.game.camera.width - 48, 16, 'shopButton', this.useShopButton, this, 1, 0, 2);
	this.shopButton.onInputOver.add(this.playHoverClick, this);
	this.shopButton.onInputDown.add(this.playDownClick, this);
   
   this.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this));
   this.game.camera.follow(this.coreModule.cube);
    
	this.helpBanner = this.uiBuilder.buildBanner(0.5, 0.5, 'tutorial_text');
	this.helpButton = this.game.add.button(0, 0, 'helpButton', this.helpBanner.toggle, this.helpBanner, 1, 0, 2);
	this.helpButton.onInputOver.add(this.playHoverClick, this);
	this.helpButton.onInputDown.add(this.playDownClick, this);
	
	this.moneyText = this.game.add.text(this.shopButton.x - 8, this.shopButton.y + 48, this.money);
    this.moneyText.font = 'VT323';
    this.moneyText.fontSize = 24;
    this.moneyText.fill = '#ffffff';
	this.be = this.game.add.image(this.moneyText.x + this.moneyText.width + 8, this.moneyText.y, 'be');
	
	this.mainSong = this.game.add.audio('mainSong', 1, true);
	if (!this.simplify) { this.mainSong.play('',0,1,true,true); }
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
  
	playHoverClick: function() {
		this.hoverClick.play();
	},
	
	playDownClick: function() {
		this.downClick.play();
	},
  
	useShopButton: function() {
		this.downClick.play();
		if(!shopPanel.alive && !shopMenuOpening && !shopMenuClosing) {
			shopPanel.revive();
			diff = 0;
			shopMenuOpening = true;
		}
		else if(shopPanel.alive&& !shopMenuClosing && !shopMenuOpening) {
			shopMenuClosing = true;
		}
	},
	
	addShopButtons: function() {
		shieldButton.revive();
		solarPanelButton.revive();
		thrusterButton.revive();
		gunButton.revive();
		hackButton.revive();
	},
	
	purchaseModule: function() {
		var randY = this.state.game.rnd.integerInRange(100, this.state.game.camera.height - 100);
		if(this.key === 'shield' && this.state.mouse.x > shieldButton.x && this.state.mouse.x < shieldButton.x + 256 && this.state.mouse.y > shieldButton.y && this.state.mouse.y < shieldButton.y + 82) {
			if(this.state.money >= 45) {
				this.state.addShield(this.state.game.camera.x + this.state.game.camera.width + 80, this.state.game.camera.y + randY);
				this.state.money -= 45;
				this.state.cashRegister.play();
			}
			else {
				this.state.error.play();
			}
		}
		else if(this.key === 'solarPanel' && this.state.mouse.x > solarPanelButton.x && this.state.mouse.x < solarPanelButton.x + 256 && this.state.mouse.y > solarPanelButton.y && this.state.mouse.y < solarPanelButton.y + 82) {
			if(this.state.money >= 105) {
				this.state.addSP(this.state.game.camera.x + this.state.game.camera.width + 80, this.state.game.camera.y + randY);
				this.state.money -= 105;
				this.state.cashRegister.play();
			}
			else {
				this.state.error.play();
			}
		}
		else if(this.key === 'thruster' && this.state.mouse.x > thrusterButton.x && this.state.mouse.x < thrusterButton.x + 256 && this.state.mouse.y > thrusterButton.y && this.state.mouse.y < thrusterButton.y + 82) {
			if(this.state.money >= 90) {
				this.state.addThruster(this.state.game.camera.x + this.state.game.camera.width + 80, this.state.game.camera.y + randY);
				this.state.money -= 90;
				this.state.cashRegister.play();
			}
			else {
				this.state.error.play();
			}
		}
		else if(this.key === 'gun' && this.state.mouse.x > gunButton.x && this.state.mouse.x < gunButton.x + 256 && this.state.mouse.y > gunButton.y && this.state.mouse.y < gunButton.y + 82) {
			if(this.state.money >= 120) {
				this.state.addGun(this.state.game.camera.x + this.state.game.camera.width + 80, this.state.game.camera.y + randY);
				this.state.money -= 120;
				this.state.cashRegister.play();
			}
			else {
				this.state.error.play();
			}
		}
		else if(this.key === 'hack' && this.state.mouse.x > hackButton.x && this.state.mouse.x < hackButton.x + 256 && this.state.mouse.y > hackButton.y && this.state.mouse.y < hackButton.y + 82) {
			if(this.state.money >= 200) {
				this.state.addHack(this.state.game.camera.x + this.state.game.camera.width + 80, this.state.game.camera.y + randY);
				this.state.money -= 200;
				this.state.cashRegister.play();
			}
			else {
				this.state.error.play();
			}
		}
		this.state.moneyText.text = this.state.money;
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
	
	//Shop Movement Code
	if(shopMenuOpening === true) {	
		// diff += 4;
      diff += this.shopSpeed * this.game.time.elapsed;
		if(diff >= 276) {
			shopMenuOpening = false;
			this.addShopButtons();
		}
	}
	else if(shopMenuClosing === true) {
		// diff -= 4;
      diff -= this.shopSpeed * this.game.time.elapsed;
		if(diff <= 0) {
			shopPanel.kill();
			shopMenuClosing = false;
		}
	}
	//Position Updates
	this.shopButton.x = this.game.camera.x + this.game.camera.width - 48 - diff;
	this.shopButton.y = this.game.camera.y + 16;
	this.helpButton.x = this.game.camera.x + 16;
	this.helpButton.y = this.game.camera.y + 16;
	shopPanel.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	shopPanel.y = this.game.camera.y + 16;
	shieldButton.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	shieldButton.y = this.game.camera.y + 70 + (86 * 0);
	solarPanelButton.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	solarPanelButton.y = this.game.camera.y + 70 + (86 * 1);
	thrusterButton.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	thrusterButton.y = this.game.camera.y + 70 + (86 * 2);
	gunButton.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	gunButton.y = this.game.camera.y + 70 + (86 * 3);
	hackButton.x = this.game.camera.x + this.game.camera.width + 16 - diff;
	hackButton.y = this.game.camera.y + 70 + (86 * 4);
	this.moneyText.x = this.shopButton.x - 16;
	this.moneyText.y = this.shopButton.y + 48;
	this.be.x = this.moneyText.x + this.moneyText.width + 8;
	this.be.y = this.moneyText.y;
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
			
			asteroid.body.clearShapes(); 
			asteroid.body.loadPolygon('asteroidPolygon', 'asteroid'); //Change the collision detection from an AABB to a polygon
			asteroid.body.damping = this.game.rnd.realInRange(0, 0.3) * this.game.rnd.integerInRange(0, 1) * this.game.rnd.integerInRange(0, 1);
			asteroid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
			asteroid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
			asteroid.body.setCollisionGroup(this.collisionGroup);
			asteroid.body.collides(this.collisionGroup);
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
	
	//Functions that add cubes to the game
	addCore: function (x, y) { 
		var newModule = this.moduleBuilder.build('core', x, y, true);
	},
	addShield: function (x, y) {
		var newModule = this.moduleBuilder.build('shield', x, y, true);
		newModule.cube.body.moveLeft(newModuleSpeed);
	},
	addThruster: function (x, y) {
		var newModule = this.moduleBuilder.build('thruster', x, y, true);
		newModule.cube.body.moveLeft(newModuleSpeed);
	},
	addSP: function (x, y) {
		var newModule = this.moduleBuilder.build('solarPanel', x, y, true);
		newModule.cube.body.moveLeft(newModuleSpeed);
	},
	addHack: function (x, y) {
		var newModule = this.moduleBuilder.build('hacker', x, y, true);
		newModule.cube.body.moveLeft(newModuleSpeed);
	},
	addGun: function (x, y) {
		var newModule = this.moduleBuilder.build('gun', x, y, true);
		newModule.cube.body.moveLeft(newModuleSpeed);
	},
  
   //DEBUG FUNCTIONS- event functions called from listeners that allow you to create modules with key presses
	addMoney: function() {
		this.money += 100;
		this.moneyText.text = this.money;
		this.cashRegister.play();
	},
  
  debug: function () {
     
  },
  
  debugAddCore: function () { 
	this.moduleBuilder.build('core', this.mouse.x, this.mouse.y, true);
  },
  debugAddShield: function () {
	this.moduleBuilder.build('shield', this.mouse.x, this.mouse.y, true);
  },
  debugAddThruster: function () {
	this.moduleBuilder.build('thruster', this.mouse.x, this.mouse.y, true);
  },
  debugAddSP: function () {
	this.moduleBuilder.build('solarPanel', this.mouse.x, this.mouse.y, true);
  },
  debugAddHack: function () {
	this.moduleBuilder.build('hacker', this.mouse.x, this.mouse.y, true);
  },
  debugAddGun: function () {
	this.moduleBuilder.build('gun', this.mouse.x, this.mouse.y, true);
  },
  debugAddHackable: function () {
   this.moduleBuilder.build('hackable', this.mouse.x, this.mouse.y, true);
  }
};



























