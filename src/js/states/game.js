/*
Main testing environment.
*/

var ModuleBuilder = require('../entities/ModuleBuilder');
var ModuleBuilder = require('../entities/ModuleBuilder');
var CubeGroup = require('../entities/cube_group');
var Mouse = require('../entities/mouse');

var bg, bg2;

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
	this.player = new CubeGroup(this, this.coreModule.cube);
	
	this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.game.input.keyboard.addKeyCapture([this.spaceKey]);
	
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
	//solarPannel
	this.placeSPKey = this.game.input.keyboard.addKey(Phaser.Keyboard.U);
    this.placeSPKey.onDown.add(this.addSP, this);
	//END
    
    // Debug controller
    this.debugKey = this.game.input.keyboard.addKey(Phaser.Keyboard.H);
    this.debugKey.onDown.add(this.debugDestroy, this);
    this.rootSpawned = false;
    
    this.debugNum = 0;
    this.myRoot = undefined;
	
	 this.game.camera.setPosition(1000, 1000);
  },

  update: function () {
   this.mouse.update();
	this.scrollBG();
  },
  
  render: function () {
   // this.game.debug.geom(this.line);
   this.mouse.render();
	this.game.debug.text('mouseX: ' + this.mouseX + ' mouseY: ' + this.mouseY, 32, 32);
	this.game.debug.text('input.x: ' + this.input.x + ' input.y: ' + this.input.y, 32, 48);
  },
  
	scrollBG: function() {
		bg.x += 0.5;
		if(bg.x >= 13500) {
			bg.x += 0;
		}
		bg2.x += 0.5;
		if(bg2.x >= 13500) {
			bg2.x = 0;
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
	this.moduleBuilder.build('solarPannel', this.mouse.x, this.mouse.y);
  },

  debugDestroy: function () {
    var point = new Phaser.Point(this.mouseX, this.mouseY);
	 var bodies = this.game.physics.p2.hitTest(point);
    if (bodies.length)
    {
        var hover = bodies[0].parent;
        hover.sprite.takeDamage(3);
    }
  }
};



























