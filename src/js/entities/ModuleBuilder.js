var Cube = require('./cube');
var Module = require('./Module');

var thrustAmt = 5000;

//Use this to create a moduleBuilder- only need to create one instance of it
var ModuleBuilder = function(setGameState, setColGroup) {
	//Ensure that cannot create multiple instances of this class
	if(ModuleBuilder.prototype.exists) {
		return ModuleBuilder.prototype.existingReference;
	}
		
	this.gameState = setGameState;
   this.colGroup = setColGroup;
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
   if (this.cube.group && target.cube.group && this.cube.group !== target.cube.group || this === target) {
      return;
   }
   var ourGroup = this.cube.group;
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

function beginThrust() {
   this.thrust = true;
}

function endThrust() {
   this.thrust = false;
}

function thrusterUpdate() {
   // console.log(this.thrust);
   if (this.thrust) {
      this.cube.body.force.x = thrustAmt * Math.cos(this.cube.rotation - Math.PI / 2);
      this.cube.body.force.y = thrustAmt * Math.sin(this.cube.rotation - Math.PI / 2);
   }
}

/** End module functions **/

//call this function from ModuleBuilder to construct modules
<<<<<<< HEAD
//TYPES: 'core' 'shield' 'thruster' 'solarPannel'
ModuleBuilder.prototype.build = function(type, x, y, forPlayer) {
=======
//TYPES: 'core' 'shield' 'thruster' 'solarPanel'
ModuleBuilder.prototype.build = function(type, x, y) {
>>>>>>> origin/gh-pages
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
    if (!this.gameState.rootSpawned) {
       newCube.root = true;
       this.gameState.rootSpawned = true;
    }

   var cIndicator = this.gameState.add.sprite(0, 0, 'connections', 'connection_line.png');
   cIndicator.anchor.setTo(0.5, 0.5);
   cIndicator.animations.add('end', ['connection_end.png'], 60, true);
   cIndicator.animations.add('line', ['connection_line.png'], 60, true);
   cIndicator.animations.add('right', ['connection_right.png'], 60, true);
   newCube.addChild(cIndicator);
   newCube.cIndicator = cIndicator;
   cIndicator.alpha = 0;
	
	//Create module to wrap around cube class
	var newModule = new Module(newCube, type);
		
	//TODO: edit special module attributes based on 'type'z
	
	//Store module if it is core
	if(type === 'core')
	{
		this.core = newModule;
		this.coreExists = true;
	}
   // solar panel testing
   if (type === 'solarPanel') {
      newModule.giveTarget = solarPanelGiveTarget;
      newModule.mouseOver = solarPanelMouseOver;
   }
   
   //Thruster module events
	if(type === 'thruster') {
      if (forPlayer) {
         var space = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); 
         this.gameState.input.keyboard.addKeyCapture([space]);
         // space.onDown.add(applyThrust, newModule);
         space.onDown.add(beginThrust, newModule);
         space.onUp.add(endThrust, newModule);
      } else {
         // newModule.thrust = false;
         newModule.beginThrust = beginThrust;
         newModule.endThrust = endThrust;
      }
      newModule.update = thrusterUpdate;
	}
	//Return the module object
	return newModule;
};

module.exports = ModuleBuilder;















