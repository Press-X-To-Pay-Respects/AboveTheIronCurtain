var Helper = function(state) {
	this.state = state;
   this.game = this.state.game;
   this.cam = this.game.camera;
   this.sm = this.state.soundManager;
   this.helpBanner = this.state.uiBuilder.buildBanner(0.5, 0.5, 'tutorial_text');
	this.helpButton = this.game.add.button(this.cam.x - 100, this.cam.y - 100, 'helpButton', this.helpBanner.toggle, this.helpBanner, 1, 0, 2);
	this.helpButton.onInputOver.add(this.sm.playHoverClick, this.sm);
	this.helpButton.onInputDown.add(this.sm.playDownClick, this.sm);
};

Helper.prototype.constructor = Helper;

Helper.prototype.update = function() {
   this.helpButton.x = this.cam.x + 16;
   this.helpButton.y = this.cam.y + 16;
};

module.exports = Helper;