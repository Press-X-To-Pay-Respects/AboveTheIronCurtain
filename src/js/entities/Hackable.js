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
	//add hackBar
	this.hackBar = gameState.uiBuilder.buildProgressBar('growing', 1500, 1200, 100, 10,  200);
	this.hackBar.setStyle(0, 0xFFFFFF, 0x363636, 0, 0, 0, 0xFFFFFF, 0x2020CC);
	this.hackBar.hackable = this;
	this.hackBar.onEvent = function() {
		this.hackable.frame = 1;
		this.hackable.isHacked = true;
		this.destroy();
	};
	this.tag = 'neutralObj';	//Tag is used to identify object type during collision checking
	this.hackDistance = hackDistance;
	var scale = 0.5;
   this.scale.x = scale;
   this.scale.y = scale;
   this.anchor.setTo(0.5, 0.5);
   gameState.game.physics.p2.enable(this);
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
		if(this.gameState.player.hackerModules.length > 0) {
			var dist;
			var hacker;
			//Loop through all hacker modules on the player's cubsat
			for(var i = 0; i < this.gameState.player.hackerModules.length; i++) {
				hacker = this.gameState.player.hackerModules[i];
				dist = Math.sqrt( Math.pow(this.x - hacker.cube.x, 2) + Math.pow(this.y - hacker.cube.y, 2) );
				if(dist < this.hackDistance) {
					//If hacker is in range, increase hack value and try to emit binary particle
					this.hackBar.addValue(0.05);
					hacker.count++;
					if(hacker.count >= hacker.cycle) {
						hacker.count = 0;
						this.gameState.BinaryEmitter.emitBinary(this, hacker.cube.x, hacker.cube.y, 60);
					}
				}
			}
		}
	}
};


Hackable.prototype.cubeCollide = function(other) {
/*   if (this.group === undefined) {
      return;
   }
   this.group.handleCollision(this, other.sprite);*/
};

module.exports = Hackable;