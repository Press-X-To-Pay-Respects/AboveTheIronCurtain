var BinaryParticle = require('./BinaryParticle');

var Emitter = function(gameState) {
	this.gameState = gameState;
};

Emitter.prototype.constructor = Emitter;

Emitter.prototype.emitBinary = function (targetObj, x, y, spacing) {
	var offsetX = (Math.random()-0.5)*spacing;
	var offsetY = (Math.random()-0.5)*spacing;
	var newParticle = new BinaryParticle(this.gameState.game, targetObj, x, y, offsetX, offsetY);
};

module.exports = Emitter;