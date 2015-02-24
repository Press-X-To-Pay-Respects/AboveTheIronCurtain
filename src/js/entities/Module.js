//Don't use this function to create modules, instead use moduleBuilder()
var Module = function(setCube) {
	this.cube = setCube;
};

Module.prototype.constructor = Module;

module.exports = Module;