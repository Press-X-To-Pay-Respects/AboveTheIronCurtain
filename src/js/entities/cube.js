/*
Defines a cube.
*/

var Cube = function (game, x, y, sprite) {
    Phaser.Sprite.call(this, game, x, y, sprite);
    this.game = game;
    this.game.add.existing(this);
    this.group = undefined;
    this.module = undefined;
    this.indicatorFade = 0.02;
    this.health = 3;
    this.constraints = [];
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
   if (this.cIndicator && this.cIndicator.alpha > 0) {
      this.cIndicator.alpha -= this.indicatorFade;
   }
};

Cube.prototype.cubeCollide = function(other) {
   if (!this.group || !other || !other.sprite) {
      return;
   }
   this.group.handleCollision(this, other.sprite);
   this.group.countCubes();
};

Cube.prototype.toString = function() {
   var string = '';
   string += this.concat('name', this.name);
   return string;
};

Cube.prototype.concat = function(string, val) {
   return string + ': ' + val + '\n';
};
Cube.prototype.displayIndicator = function() {
  this.cIndicator.alpha = 1; 
};

Cube.prototype.takeDamage = function(amt) {
   this.health -= amt;
   if (this.health <= 0) {
      this.group.destroyCube(this);
	  this.group.countCubes();
   }
};

Cube.prototype.remove = function() {
   if (!this.group) {
      return;
   }
   this.group.remove(this);
};

module.exports = Cube;














