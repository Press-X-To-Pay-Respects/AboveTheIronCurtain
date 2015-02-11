var Sat = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'testsprite');
    game.add.existing(this);
};

Sat.prototype = Object.create(Phaser.Sprite.prototype);
Sat.prototype.constructor = Sat;

/**
 * Automatically called by World.update
 */
Sat.prototype.update = function() {
};

module.exports = Sat;