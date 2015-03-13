/*
Plays sounds needed across multiple scripts.
*/
var SoundManager = function(state) {
   // initial variables
	this.state = state;
   this.game = this.state.game;
   this.cam = this.game.camera;
   // sounds
   this.hoverClick = this.game.add.audio('hoverClick');
   this.downClick = this.game.add.audio('downClick');
};

SoundManager.prototype.constructor = SoundManager;

SoundManager.prototype.playHoverClick = function() {
   this.hoverClick.play();
};

SoundManager.prototype.playDownClick = function() {
   this.downClick.play();
};

module.exports = SoundManager;












