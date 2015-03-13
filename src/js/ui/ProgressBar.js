//NOTE: DON'T USE this code to create a ProgressBar. Instead, use the UIBuilder object and call buildProgressBar

var ProgressBar = function(setType, setMaxValue, setGraphics, setRenderables) {
	this.type = setType; //Two types, "growing" (starts at 0, triggers event when full) 
						 //and "shrinking" (starts full, triggers at 0)
	this.bgBorderSize = 2;			//default size of background border
	this.bgBorderColor = 0xAAAAAA;	//default color of background border
	this.bgColor = 0x888888;		//default color of background
	this.paddingHoriz = 5;			//default sum of padding on left and right side inner value bar
	this.paddingVert = 5;			//default sum (i.e. half on each side) of vertical padding of inner value bar
	this.valueBorderSize = 1;		//default size of value border
	this.valueBorderColor = 0x8888FF; //default color of value border
	this.valueColor = 0x000099;		//default color of inner value bar
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
	if(setType === 'growing') {
		this.value = 0;
		//tryTrigger is called automatically when you add/subtract value, and will trigger the onEvent() function
		this.tryTrigger = function() {
			if(this.value >= this.maxValue) {
				this.onEvent();
			}
		};
		//break;
	}
	else if(setType === 'shrinking') {
	//case 'shrinking' :
		this.value = this.maxValue;
		this.tryTrigger = function() {
			if(this.value <= 0) {
				this.onEvent();
			}
		};
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

ProgressBar.prototype.setStyle = function(bgBorderSize, bgBorderColor, bgColor, paddingHoriz, paddingVert, valueBorderSize, valueBorderColor, valueColor) {
	this.bgBorderSize = bgBorderSize;
	this.bgBorderColor = bgBorderColor;
	this.bgColor = bgColor;
	this.paddingHoriz = paddingHoriz;
	this.paddingVert = paddingVert;
	this.valueBorderSize = valueBorderSize;
	this.valueBorderColor = valueBorderColor;
	this.valueColor = valueColor;
};

//update for progress bar, called just before drawing progress bar
//Overwrite this function if desired
ProgressBar.prototype.update = function() {};

//Renders progressBar
ProgressBar.prototype.render = function() {
	this.update();
	this.graphics.clear();
	//Draw background of bar
	this.graphics.lineStyle(this.bgBorderSize, this.bgBorderColor, 1); //sets border color and size
	this.graphics.beginFill(this.bgColor); //sets color of background fill
	this.graphics.drawRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	this.graphics.endFill();
	//Draw value of bar
	var percentage = this.value / this.maxValue;
	var barWidth = this.width - this.paddingHoriz;
	var barHeight = this.height - this.paddingVert;
	this.graphics.lineStyle(this.valueBorderSize, this.valueBorderColor, 1);
	this.graphics.beginFill(this.valueColor);
	this.graphics.drawRect(this.x-(barWidth/2), this.y-(barHeight/2), barWidth*percentage, barHeight);
	this.graphics.endFill();
};

module.exports = ProgressBar;