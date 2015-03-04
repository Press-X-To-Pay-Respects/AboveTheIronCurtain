/*
Defines a hackable object.
*/

var Hackable = function (game, x, y, sprite, hackDistance) {
    Phaser.Sprite.call(this, game, x, y, sprite);
    game.add.existing(this);
	this.hackDistance;
	var scale = 0.5;
    this.scale.x = scale;
    this.scale.y = scale;
    this.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(this);
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
};


Hackable.prototype.cubeCollide = function(other) {
/*   if (this.group === undefined) {
      return;
   }
   this.group.handleCollision(this, other.sprite);*/
};

module.exports = Hackable;