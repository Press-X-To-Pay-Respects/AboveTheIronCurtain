/*
Defines a hackable object.
*/

var Hackable = function (gameState, x, y, sprite, hackDistance) {
   Phaser.Sprite.call(this, gameState.game, x, y, sprite);
   gameState.game.add.existing(this);
	//store gameState
	this.gameState = gameState;
	//set isHacked to false
	this.isHacked = false;
	this.beingHacked = false;
	this.beingHackedPrev = false;
	//add hackBar
	this.hackBar = gameState.uiBuilder.buildProgressBar('growing', 1500, 1200, 100, 10,  200);
	this.hackBar.setStyle(0, 0xFFFFFF, 0x363636, 0, 0, 0, 0xFFFFFF, 0x2020CC);
	this.hackBar.hackable = this;
	this.hackBar.onEvent = function() {
		this.hackable.animations.stop();
		this.hackable.animations.play('hacked');
		this.hackable.isHacked = true;
		this.destroy();
	};
	this.tag = 'neutralObj';	//Tag is used to identify object type during collision checking
	this.hackDistance = hackDistance;
	var scale = 0.5;
   this.scale.x = scale;
   this.scale.y = scale;
   this.anchor.setTo(0.5, 0.5);
   this.animations.add('hackable', [0,1,2,3,4], 10, true);
   this.animations.add('hacked', [5,6,7,8,9], 10, true);
   this.hacking = this.gameState.add.audio('hacking', 1, true);
   
   //Set up physics body for 'hackable' sprite
   gameState.game.physics.p2.enable(this);
   this.body.setCollisionGroup(gameState.collisionGroup);
	this.body.collides(gameState.collisionGroup);
   this.body.onBeginContact.add(this.cubeCollide, this);
   this.body.damping = 0.9;
   this.body.angularDamping = 0.9;
};

Hackable.prototype = Object.create(Phaser.Sprite.prototype);
Hackable.prototype.constructor = Hackable;

/**
 * Automatically called by World.update
 */
Hackable.prototype.update = function() {
	this.hackBar.setLocation(this.x, this.y - 70);
	//check if getting hacked
	if(!this.isHacked) {
		this.animations.play('hackable');
		if(this.gameState.player.activeHackerModules.length > 0) {
			var dist;
			var hacker;
			//Loop through all hacker modules on the player's cubesat
			for(var i = 0; i < this.gameState.player.activeHackerModules.length; i++) {
				hacker = this.gameState.player.activeHackerModules[i];
				dist = Math.sqrt( Math.pow(this.x - hacker.cube.x, 2) + Math.pow(this.y - hacker.cube.y, 2) );
				if(dist < this.hackDistance) {
					//If hacker is in range, increase hack value and try to emit binary particle
					if(this.beingHacked === true) {
						this.beingHackedPrev = true;
					}
					this.beingHacked = true;
					this.hackBar.addValue(0.1);
					hacker.count++;
					if(hacker.count >= hacker.cycle) {
						hacker.count = 0;
						this.gameState.BinaryEmitter.emitBinary(this, hacker.cube.x, hacker.cube.y, 60);
						if(hacker.cube.frame === 5) {
							hacker.cube.frame = 0;
						}
						hacker.cube.frame++;
						
					}
				}
				else {
					hacker.cube.animations.stop();
					if(this.beingHacked === false) {
						this.beingHackedPrev = false;
					}
					this.beingHacked = false;
				}
			}
		}
	}
	else {
		this.hacking.stop();
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
};


Hackable.prototype.cubeCollide = function(other) {
/*   if (this.group === undefined) {
      return;
   }
   this.group.handleCollision(this, other.sprite);*/
};

module.exports = Hackable;