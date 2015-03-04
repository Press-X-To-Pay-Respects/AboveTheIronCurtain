//NOTE: DON'T USE this code to create a ProgressBar. Instead, use the UIBuilder object and call buildProgressBar

var ProgressBar = function(setType, setMaxValue, setGraphics, setRenderables) {
	this.type = setType; //Two types, "growing" (starts at 0, triggers event when full) 
						 //and "shrinking" (starts full, triggers at 0)
	this.x = null;
	this.y = null;
	this.width = null;
	this.height = null;
	this.maxValue = setMaxValue;
	this.graphics = setGraphics; //store graphics class (used to draw bar)
	this.renderables = setRenderables;
	
	this.onEvent = function() {}; //overwrite this function to make whatever you want happen when progressBar reaches limit
	
	//switch(this.type) {
	//case 'growing' : 
	if(setType == 'growing') {
		this.value = 0;
		//tryTrigger is called automatically when you add/subtract value, and will trigger the onEvent() function
		this.tryTrigger = function() {
			if(this.value >= this.maxValue) {
				this.onEvent();
			}
		};
		//break;
	}
	else if(setType == 'shrinking') {
	//case 'shrinking' :
		this.value = this.maxValue;
		this.tryTrigger = function() {
			if(this.value <= 0) {
				this.onEvent();
			}
		};
	//}
	}
};

ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.destroy = function() {
	this.graphics.clear();
	this.renderables.unsubscribe(this);
};

//To subtract value, just use negative numbers as argument i.e. foo.addValue(-5);
ProgressBar.prototype.addValue = function (addThis) {
	this.value += addThis;
	if(this.value > this.maxValue) {
		this.value = this.maxValue;
	}
	if(this.value < 0) {
		this.value = 0;
	}
	this.tryTrigger();
};

//Sets the location where progress bar is rendered
ProgressBar.prototype.setLocation = function(setX, setY) {
	this.x = setX;
	this.y = setY;
};

//Sets the size of the progress bar
ProgressBar.prototype.setSize = function(setWidth, setHeight) {
	this.width = setWidth;
	this.height = setHeight;
};

//Renders progressBar
ProgressBar.prototype.render = function() {
	console.log('rendered');
	this.graphics.clear();
	//Draw background of bar
	this.graphics.lineStyle(2, 0xAAAAAA, 1);
	this.graphics.beginFill(0x888888);
	this.graphics.drawRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	this.graphics.endFill();
	//Draw value of bar
	var percentage = this.value / this.maxValue;
	var barWidth = this.width - 5;
	var barHeight = this.height - 5;
	this.graphics.lineStyle(1, 0x8888FF, 1);
	this.graphics.beginFill(0x000099);
	this.graphics.drawRect(this.x-(barWidth/2), this.y-(barHeight/2), barWidth*percentage, barHeight);
	this.graphics.endFill();
};

module.exports = ProgressBar;