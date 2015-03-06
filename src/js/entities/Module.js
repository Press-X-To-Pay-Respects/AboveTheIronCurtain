//Don't use this function to create modules, instead use moduleBuilder()
var Module = function(setCube, type) {
	this.cube = setCube;
   setCube.module = this;
   this.type = type;
};

Module.prototype.constructor = Module;

module.exports = Module;