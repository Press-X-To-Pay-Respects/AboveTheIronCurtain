var Cube = require('./cube');
var Module = require('./Module');

var thrustAmt = 10000;

//Use this to create a moduleBuilder- only need to create one instance of it
var ModuleBuilder = function(setGameState) {
	//Ensure that cannot create multiple instances of this class
	if(ModuleBuilder.prototype.exists) {
		return ModuleBuilder.prototype.existingReference;
	}
		
	this.gameState = setGameState;
	// this.coreExists = false;	//records if core has been created
	this.core = null;			//stores core when it is created
	//var space = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	ModuleBuilder.prototype.exists = true;
	ModuleBuilder.prototype.existingReference = this;
};

ModuleBuilder.prototype.constructor = ModuleBuilder;

//These var's help create the singleton functionality
ModuleBuilder.prototype.exists = false;
ModuleBuilder.prototype.existingReference = null;

/** Module functions **/
function solarPanelGiveTarget(target) {
   if (this.cube.group !== target.cube.group || this === target) {
      return;
   }
   // TODO: restrict to only powered modules
   var ourGroup = this.cube.group;
   // this.cube.removeConnection();
   // target.cube.removeConnection();
   // TODO: restrict by length
   var newConnection = {start: this.cube, end: target.cube};
   this.cube.myConnection = newConnection;
   target.cube.myConnection = newConnection;
   ourGroup.displayConnection(this.cube.myConnection);
}

function solarPanelMouseOver() {
   if (!this.cube.myConnection || !this.cube.group) {
      return;
   }
   this.cube.group.displayConnection(this.cube.myConnection);
}

function applyThrust() {
	if(this.cube.group !== undefined) {
		this.cube.body.thrust(thrustAmt * Math.pow(this.cube.group.numCubes, 0.75));
	}
}

/** End module functions **/

//call this function from ModuleBuilder to construct modules
//TYPES: 'core' 'shield' 'thruster' 'solarPannel'
ModuleBuilder.prototype.build = function(type, x, y) {
	//Check if core has been created
   /*
	if(type === 'core' && this.coreExists) {
		//if so, return existing core b/c is singleton
		//b/c of this, can call ModuleBuilder.build('core') to access reference to existing core
		return this.core;
	}
   */
	
	//Create cube object to be stored within module
	//Sprite names for modules are directly mapped to module names, so just pass 'type' as sprite name
	var newCube = new Cube(this.gameState.game, x, y, type);
    var scale = 0.5;
    newCube.name = this.gameState.debugNum++;
    newCube.scale.setTo(scale, scale);
    newCube.anchor.setTo(0.5, 0.5);
    this.gameState.game.physics.p2.enable(newCube);
    newCube.body.onBeginContact.add(newCube.cubeCollide, newCube);
    newCube.body.damping = 0.9;
    newCube.body.angularDamping = 0.9;
	//newCube.body.setCollisionGroup(this.gameState.game.cubeCG);
    if (!this.gameState.rootSpawned) {
       newCube.root = true;
       this.gameState.rootSpawned = true;
    }

   // var cIndicator = new Phaser.Sprite(this.game, 0, 0, 'connections', 'grid_line.png');
   var cIndicator = this.gameState.add.sprite(0, 0, 'connections', 'connection_line.png');
   cIndicator.anchor.setTo(0.5, 0.5);
   cIndicator.animations.add('end', ['connection_end.png'], 60, true);
   cIndicator.animations.add('line', ['connection_line.png'], 60, true);
   cIndicator.animations.add('right', ['connection_right.png'], 60, true);
   // cIndicator.animations.add('test', ['connection_end.png'], 60, true);
   newCube.addChild(cIndicator);
   newCube.cIndicator = cIndicator;
   cIndicator.alpha = 0;
	
	//Create module to wrap around cube class
	var newModule = new Module(newCube);
		
	//TODO: edit special module attributes based on 'type'z
	
	//Store module if it is core
	if(type === 'core')
	{
		this.core = newModule;
		this.coreExists = true;
	}
   // solar panel testing
   if (type === 'solarPannel') {
      newModule.giveTarget = solarPanelGiveTarget;
      newModule.mouseOver = solarPanelMouseOver;
   }
   
   //Thruster module events
	if(type === 'thruster') {
		var space = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
		this.gameState.input.keyboard.addKeyCapture([space]);
		space.onDown.add(applyThrust, newModule);
	}
	//Return the module object
	return newModule;
};

module.exports = ModuleBuilder;