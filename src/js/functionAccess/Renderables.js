var Renderables = function() {
	if(Renderables.prototype.exists) {
		return Renderables.prototype.existingReference;
	}
	
	this.list = [];
	Renderables.prototype.exists = true;
	Renderables.prototype.existingReference = this;
};

Renderables.prototype.constructor = Renderables;
//These var's help create the singleton functionality
Renderables.prototype.exists = false;
Renderables.prototype.existingReference = null;

Renderables.prototype.subscribe = function(subscriber) {
	this.list.push(subscriber);
};

Renderables.prototype.unsubscribe = function(unsubscriber) {
	for(var i = 0; i < this.list.length; i++) {
		if(this.list[i] === unsubscriber) {
			this.list[i] = false;
		}
	}
};

Renderables.prototype.renderAll = function() {
	for(var i = 0; i < this.list.length; i++) {
		if(this.list[i] === false) {
			continue;
		}
		this.list[i].render();
	}
};

module.exports = Renderables;