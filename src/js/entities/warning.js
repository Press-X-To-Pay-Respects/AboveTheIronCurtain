var Warning = function(state) {
	this.state = state;
   this.game = this.state.game;
   this.cam = this.game.camera;
};

Warning.prototype.constructor = Warning;

module.exports = Warning;