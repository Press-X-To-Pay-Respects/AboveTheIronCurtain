var ProgressBar = require('./ProgressBar');
var Banner = require('./banner');

var UIBuilder = function(setGameState, setRenderables) {
	//Ensure that cannot create multiple instances of this class
	if(UIBuilder.prototype.exists) {
		return UIBuilder.prototype.existingReference;
	}
	
	this.gameState = setGameState;
	this.renderables = setRenderables;
	//Create and store a graphics object (used for stuff like drawing rectangles)
	UIBuilder.prototype.exists = true;
	UIBuilder.prototype.existingReference = this;
};

UIBuilder.prototype.constructor = UIBuilder;
//These var's help create the singleton functionality
UIBuilder.prototype.exists = false;
UIBuilder.prototype.existingReference = null;

//Use this function to create a progress bar
//Usage: type: can be "growing" or "shrinking", this will effect if bar starts at 0 and goes up or vis versa
//		 maxValue: sets the max value of the progress bar, i.e. using 100 creates a bar from 0 to 100
//		 x,y: sets location
//		 DON'T FORGET to overwrite the onEvent() function for the progress bar after creating it
//			-onEvent() is automatically called when bar fills/shrinks past limit (depending on bar type)
UIBuilder.prototype.buildProgressBar = function(type, x, y, width, height, maxValue) {
	//create and format new prog bar
	var graphics = this.gameState.game.add.graphics(0,0);
	var newProgBar = new ProgressBar(type, maxValue, graphics, this.renderables);
	newProgBar.setLocation(x,y);
	newProgBar.setSize(width, height);
	//subscribe to 'renderables' so that render() is called automatically
	this.renderables.subscribe(newProgBar);
	return newProgBar;
};

UIBuilder.prototype.buildBanner = function(xRatio, yRatio, texts) {
   var graphics = this.gameState.game.add.graphics(0, 0);
   var newBanner = new Banner(this.gameState, xRatio, yRatio, texts, graphics, this.renderables);
   this.renderables.subscribe(newBanner);
   return newBanner;
};

module.exports = UIBuilder;