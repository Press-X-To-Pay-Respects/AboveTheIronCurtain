/*
Defines a cube module.
*/

var Cube = function (game, x, y, sprite) {
    Phaser.Sprite.call(this, game, x, y, sprite);
    game.add.existing(this);
    this.group = undefined;
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
};

Cube.prototype.cubeCollide = function(other) {
   if (this.group === undefined) {
      return;
   }
   this.group.handleCollision(this, other.sprite);
};

Cube.prototype.toString = function() {
   var string = '';
   string += this.concat('name', this.name);
   return string;
};

Cube.prototype.concat = function(string, val) {
   return string + ': ' + val + '\n';
};

module.exports = Cube;














