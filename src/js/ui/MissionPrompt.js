/*
Defines a hackable object.
*/

var MissionPrompt = function (state) {
   Phaser.Sprite.call(this, state.game, 0, 0, 'missionPrompt');
   state.game.add.existing(this);
	//store state
	this.state = state;
	this.cam = this.state.game.camera;
   this.anchor.setTo(0.5, 0.5);
   //add description text
   var style = { font: '26px Arial', fill: '#333333', align: 'center' };
   this.descriptionText = state.game.add.text(0, 0, 'No description Entered', style);
   this.descriptionText.anchor.setTo(0.5, 0.5);
   this.addChild(this.descriptionText);
   this.descriptionText.x = 0;
   this.descriptionText.y = -14;
   //add value progress text
	style = { font: '26px Arial', fill: '#FFFF66', align: 'center' };
   this.progressText = state.game.add.text(0, 0, '0/0', style);
   this.progressText.anchor.setTo(0.5, 0.5);
   this.addChild(this.progressText);
   this.progressText.x = 0;
   this.progressText.y = 14;
};

MissionPrompt.prototype = Object.create(Phaser.Sprite.prototype);
MissionPrompt.prototype.constructor = MissionPrompt;

//functions for changing the mission prompt text
MissionPrompt.prototype.setDescription = function(text) {
	this.descriptionText.text = text;
};

MissionPrompt.prototype.setProgress = function(text) {
	this.progressText.text = text;
};

/**
 * Automatically called by World.update
 */
MissionPrompt.prototype.update = function() {
	this.x = this.cam.x + this.cam.width/2;
	this.y = this.cam.y + 15*this.cam.height/16;
	this.bringToTop();
};

module.exports = MissionPrompt;