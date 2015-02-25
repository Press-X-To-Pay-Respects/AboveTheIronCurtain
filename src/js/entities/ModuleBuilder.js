var Cube = require('./cube');
var Module = require('./Module');

//Use this to create a moduleBuilder- only need to create one instance of it
var ModuleBuilder = function(setGameState) {
	//Ensure that cannot create multiple instances of this class
	if(ModuleBuilder.prototype.exists) {
		return ModuleBuilder.prototype.existingReference;
	}
		
	this.gameState = setGameState;
	this.coreExists = false;	//records if core has been created
	this.core = null;			//stores core when it is created
	ModuleBuilder.prototype.exists = true;
	ModuleBuilder.prototype.existingReference = this;
};

ModuleBuilder.prototype.constructor = ModuleBuilder;

//These var's help create the singleton functionality
ModuleBuilder.prototype.exists = false;
ModuleBuilder.prototype.existingReference = null;

//call this function from ModuleBuilder to construct modules
//TYPES: 'core' 'shield' 'thruster' 'solarPannel'
ModuleBuilder.prototype.build = function(type, x, y) {
	//Check if core has been created
	if(type === 'core' && this.coreExists) {
		//if so, return existing core b/c is singleton
		//b/c of this, can call ModuleBuilder.build('core') to access reference to existing core
		return this.core;
	}
	
	//Create cube object to be stored within module
	//Sprite names for modules are directly mapped to module names, so just pass 'type' as sprite name
	var newCube = new Cube(this.gameState.game, x, y, type);
    var scale = 0.5;
    newCube.name = this.gameState.debugNum++;
    newCube.scale.x = scale;
    newCube.scale.y = scale;
    newCube.anchor.setTo(0.5, 0.5);
    this.gameState.game.physics.p2.enable(newCube);
    newCube.body.onBeginContact.add(newCube.cubeCollide, newCube);
    newCube.body.damping = 0.9;
    newCube.body.angularDamping = 0.9;
    if (!this.gameState.rootSpawned) {
       newCube.root = true;
       this.gameState.rootSpawned = true;
    }
	
	//Create module to wrap around cube class
	var newModule = new Module(newCube);
		
	//TODO: edit special module atributes based on 'type'
	
	//Store module if it is core
	if(type === 'core')
	{
		this.core = newModule;
		this.coreExists = true;
	}
   // solar panel testing
   if (type === 'solarPannel') {
      newModule.cube.runAstar();
   }
	
	//Return the module object
	return newModule;
};


module.exports = ModuleBuilder;