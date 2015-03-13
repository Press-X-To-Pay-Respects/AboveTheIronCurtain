var Cube = require('./cube');
var Module = require('./Module');
var Bullet = require('./Bullet');

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
   if (this === target || !this.cube.group || !target.cube.group || this.cube.group !== target.cube.group) {
      return;
   }
   this.cube.loseConnection();
   var ourGroup = this.cube.group;
   var newConnection = {start: this.cube, end: target.cube};
   this.cube.myConnection = newConnection;
   target.cube.myConnection = newConnection;
   ourGroup.displayConnection(this.cube.myConnection);
	if(!target.isActive) {
		//Activate the module
		target.isActive = true;
		if(target.type === 'hacker') {
			ourGroup.activeHackerModules.push(target);
		}
		//If this is one of the powerable types, switch the frame from 'greyed' to 'active'
		if(target.type === 'gun' || target.type === 'hacker' || target.type === 'thruster') {
			target.cube.frame = 1;
		}
	}
}

function solarPanelMouseOver() {
   if (!this.cube.myConnection || !this.cube.group) {
      return;
   }
   this.cube.group.displayConnection(this.cube.myConnection);
}

function genericOnRemove() {
   this.cube.loseConnection();
}

function hackerOnLoseConnection() {
   var hackIndex = this.gameState.player.activeHackerModules.indexOf(this);
   this.gameState.player.activeHackerModules.splice(hackIndex, 1);
   this.isActive = false;
}

function beginAct() {
   this.timer = 0;
   this.act = true;
}

function endAct() {
   this.act = false;
   this.cube.frame = 1;
}

function thrusterUpdate() {
   if (this.haltTime && this.haltTime > 0) {
      this.haltTime -= this.cube.game.time.elapsed;
      this.cube.frame = 1;
   } else if (this.act && this.cube.myConnection) {
      this.cube.body.force.x = thrustAmt * Math.cos(this.cube.rotation - Math.PI / 2);
      this.cube.body.force.y = thrustAmt * Math.sin(this.cube.rotation - Math.PI / 2);
	  if(this.cube.frame === 1) {
		this.cube.frame = 3;
	  }
	  else {
		this.cube.frame = 2;
	  }
   }
}

function thrusterHalt() {
   this.haltTime = 1500;
}

function gunUpdate() {
   if (!this.cube.myConnection || !this.act) {
      this.cube.animations.stop();
	  return;
   }
   if (this.timer <= 0) {
      var angle = this.cube.body.rotation % (2*Math.PI);
      var direction = [Math.sin(angle), -Math.cos(angle)];
      var deltaDist = Math.sqrt(Math.pow(this.cube.deltaX, 2) + Math.pow(this.cube.deltaY, 2));
      var speed = deltaDist * 50;
      new Bullet(this.gameState, this.cube.x + 30*direction[0], this.cube.y + 30*direction[1], 
               direction, speed, this.tag + 'Bullet');
	  this.gun.play();
      this.timer = 400;
   } else {
      this.timer -= this.gameState.game.time.elapsed;
   }
}

function hackableUpdate() {
   this.hackBar.setLocation(this.cube.x, this.cube.y - 25);
   if (this.barFadeDelay <= 0 && this.hackBar.graphics.alpha > 0) {
      this.hackBar.graphics.alpha -= this.gameState.time.elapsed * this.barFade;
   } else if (this.barFadeDelay > 0) {
      this.barFadeDelay -= this.gameState.time.elapsed;
   }
	//check if getting hacked
	if(!this.isHacked) {
		this.cube.animations.play('hackable');
		if(this.gameState.player.activeHackerModules.length > 0) {
			var dist;
			var hacker;
			//Loop through all hacker modules on the player's cubsat
			for(var i = 0; i < this.gameState.player.activeHackerModules.length; i++) {
				hacker = this.gameState.player.activeHackerModules[i];
				dist = Math.sqrt( Math.pow(this.cube.x - hacker.cube.x, 2) + Math.pow(this.cube.y - hacker.cube.y, 2) );
				if(dist < this.hackDistance) {
					//If hacker is in range, increase hack value and try to emit binary particle
               if (this.beingHacked) {
                  this.beingHackedPrev = true;
               }
               this.beingHacked = true;
					this.hackBar.addValue(0.1);
					hacker.count++;
					if(hacker.count >= hacker.cycle) {
                  this.hackBar.graphics.alpha = 1;
                  this.barFadeDelay = this.barFadeMaxDelay;
						hacker.count = 0;
						this.gameState.BinaryEmitter.emitBinary(this.cube, hacker.cube.x, hacker.cube.y, 60);
						if(hacker.cube.frame === 5) {
							hacker.cube.frame = 0;
						}
						hacker.cube.frame++;
						
					}
				}
				else {
					hacker.cube.animations.stop();
               if(!this.beingHacked) {
						this.beingHackedPrev = false;
					}
					this.beingHacked = false;
				}
			}
		}
	} else if (this.delay < 0) {
      this.hacking.stop();
      this.hackBar.destroy();
      this.cube.dieQuick();
   } else {
      this.hacking.stop();
      this.delay -= this.gameState.time.elapsed;
   }
   if(this.beingHacked === true && this.beingHackedPrev === false) {
		if(this.hacking.paused === true) {
			this.hacking.resume();
		}
		else {
			this.hacking.play();
		}
	}
	else if(this.beingHacked === false && this.beingHackedPrev === true){
		this.hacking.pause();
	}
}
/** End module functions **/

//call this function from ModuleBuilder to construct modules
//TYPES: 'core' 'shield' 'thruster' 'solarPannel' 'hacker'
ModuleBuilder.prototype.build = function(type, x, y, forPlayer) {	
	//Create cube object to be stored within module
	//Sprite names for modules are directly mapped to module names, so just pass 'type' as sprite name
	var newCube = new Cube(this.gameState, x, y, type);
    var scale = 0.5;
    newCube.name = this.gameState.debugNum++;
    newCube.scale.setTo(scale, scale);
    newCube.anchor.setTo(0.5, 0.5);
	
	//Create physics for new cube
    this.gameState.game.physics.p2.enable(newCube);
	newCube.body.setCollisionGroup(this.gameState.collisionGroup);
	newCube.body.collides(this.gameState.collisionGroup);
	newCube.body.onBeginContact.add(newCube.cubeCollide, newCube);
   newCube.body.damping = 0.9;
   newCube.body.angularDamping = 0.9;
 
   var cIndicator = this.gameState.add.sprite(0, 0, 'connections', 'connection_line.png');
   cIndicator.anchor.setTo(0.5, 0.5);
   cIndicator.animations.add('end', ['connection_end.png'], 60, true);
   cIndicator.animations.add('line', ['connection_line.png'], 60, true);
   cIndicator.animations.add('right', ['connection_right.png'], 60, true);
   newCube.addChild(cIndicator);
   newCube.cIndicator = cIndicator;
   cIndicator.alpha = 0;
	
	//Create module to wrap around cube class
	var newModule = new Module(type, newCube, this.gameState);
		
	//TODO: edit special module attributes based on 'type'
	if(type === 'hacker') {
		newModule.cycle = 6;
		newModule.count = 0;
		newModule.cube.animations.add('hacker', [0,1,2,3,4], 10, true);
      newModule.onRemove = genericOnRemove;
      newModule.onLoseConnection = hackerOnLoseConnection;
	}
	
	//Store module if it is core
	if(type === 'core')
	{
		newModule.cube.animations.add('core', [0,1,2], 20, true);
		newModule.cube.animations.play('core');
		this.core = newModule;
		this.coreExists = true;
      newModule.onRemove = genericOnRemove;
	}
   // solar panel testing
   if (type === 'solarPanel') {
      newModule.giveTarget = solarPanelGiveTarget;
      newModule.mouseOver = solarPanelMouseOver;
      newModule.onRemove = genericOnRemove;
   }
   
   //Thruster module events
	if(type === 'thruster') {
      if (forPlayer) {
         var thrusterKey = this.gameState.input.keyboard.addKey(Phaser.Keyboard.W); 
         this.gameState.input.keyboard.addKeyCapture([thrusterKey]);
         thrusterKey.onDown.add(beginAct, newModule);
         thrusterKey.onUp.add(endAct, newModule);
      } else {
         // newModule.thrust = false;
         newModule.beginAct = beginAct;
         newModule.endAct = endAct;
      }
      newModule.update = thrusterUpdate;
      newModule.thrusterHalt = thrusterHalt;
      newModule.onRemove = genericOnRemove;
	}

	//Gun module events
	if(type === 'gun') {
	  newModule.cube.animations.add('gun', [0,1,2,3,4,5], 16, true);
	  newModule.gun = this.gameState.add.audio('gun');
	  newModule.gun.allowMultiple = true;
      if (forPlayer) {
	     newModule.tag = 'player';
         var actKey = this.gameState.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
         this.gameState.input.keyboard.addKeyCapture([actKey]);
         actKey.onDown.add(beginAct, newModule);
         actKey.onUp.add(endAct, newModule);
      } else {
		 newModule.tag = 'enemy';
         newModule.beginAct = beginAct;
         newModule.endAct = endAct;
      }
	  newModule.update = gunUpdate;
     newModule.onRemove = genericOnRemove;
	}
   
   if (type === 'hackable') {
      // set values
      newModule.isHacked = false;
      newModule.hackDistance = 400;
      newModule.cube.animations.add('hackable', [0,1,2,3,4], 10, true);
      newModule.cube.animations.add('hacked', [5,6,7,8,9], 10, true);
      newModule.barFade = 0.001;
      newModule.barFadeMaxDelay = 200;
      newModule.barFadeDelay = 0;
      newModule.delay = 1600;
      newModule.beingHacked = false;
      newModule.beingHackedPrev = false;
      newModule.hacking = this.gameState.add.audio('hacking', 1, true);
      // give progress bar
      newModule.hackBar = this.gameState.uiBuilder.buildProgressBar('growing', 1500, 1200, 100, 10,  200);
      newModule.hackBar.setStyle(0, 0xFFFFFF, 0x363636, 0, 0, 0, 0xFFFFFF, 0x2020CC);
      newModule.hackBar.hackable = newModule.cube;
      newModule.hackBar.onEvent = function() {
         this.hackable.animations.stop();
         this.hackable.animations.play('hacked');
         this.hackable.module.isHacked = true;
      };
      // add functions
      newModule.update = hackableUpdate;
      newModule.onRemove = genericOnRemove;
   }
	//Return the module object
	return newModule;
};

module.exports = ModuleBuilder;















