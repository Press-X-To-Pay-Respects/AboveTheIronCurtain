/*
Defines a cube module for a cubesat.
*/

var Cube = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'testsprite');
    game.add.existing(this);
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
};

module.exports = Cube;