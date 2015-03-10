//Don't use this function to create modules, instead use moduleBuilder()
var Module = function(setType, setCube, setGameState) {
	this.isActive = false;
	this.type = setType;
	this.cube = setCube;
	setCube.module = this;
	this.gameState = setGameState;
};

Module.prototype.constructor = Module;

module.exports = Module;