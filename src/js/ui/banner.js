var Utils = require('../utils');

//NOTE: DON'T USE this code to create a Banner. Instead, use the UIBuilder object and call buildBanner
var Banner = function(gameState, xRatio, yRatio, textJSON, graphics, renderables) {
   this.bgBorderSize = 6;			//default size of background border
	this.bgBorderColor = 0xAAAAAA;	//default color of background border
	this.bgColor = 0x888888;		//default color of background
   this.shadowOffsetX = 3;
   this.shadowOffsetY = 3;
   this.shadowColor = 'rgba(0,0,0,0.9)';
   this.shadowBlur = 5;
   this.normalText = '#ffffff';
   this.highlightText = '#00ff00';
   this.textJSON = textJSON;
   this.gameState = gameState;
   this.game = gameState.game;
   this.cam = this.game.camera;
   this.xRatio = xRatio;
   this.yRatio = yRatio;
   this.graphics = graphics;
   this.renderables = renderables;
   this.width = 400;
   this.height = 200;
   this.index = 0;
   this.addTexts();
   this.x = 0;
   this.hideBuffer = -50;
   this.hideHeight = -this.height - this.hideBuffer;
   this.y = this.hideHeight;
   this.goalY = this.y;
   this.slideRate = 0.2;
};

Banner.prototype.constructor = Banner;

Banner.prototype.destroy = function() {
	this.graphics.clear();
	this.renderables.unsubscribe(this);
};

Banner.prototype.update = function() {
   this.x = this.cam.x + this.cam.width * this.xRatio;
   this.y = Utils.lerp(this.y, this.goalY, this.slideRate);
   var curText = this.textObjs[this.index];
   curText.x = this.x;
   curText.y = this.y;
};

Banner.prototype.addTexts = function() {
   if (!this.textObs) {
      this.textObjs = [];
   }
   var textDefs = JSON.parse(this.game.cache.getText(this.textJSON));
   var textArray = textDefs['text'];
   var textColors = textDefs['colors'];
   for (var i = 0; i < textArray.length; i++) {
      var text = textArray[i];
      var newText = this.game.add.text(0, 0, text);
      newText.font = 'Montserrat';
      newText.fontSize = 25;
      newText.align = 'center';
      newText.fill = this.normalText;
      newText.wordWrap = true;
      newText.wordWrapWidth = this.width;
      newText.anchor.set(0.5);
      newText.setShadow(this.shadowOffsetX, this.shadowOffsetY, this.shadowColor, this.shadowBlur);
      var newColors = textColors[i];
      for (var j = 0; j < newColors.length; j++) {
         newText.addColor(this.highlightText, newColors[j]);
         j++;
         newText.addColor(this.normalText, newColors[j]);
      }
      this.textObjs.push(newText);
   }
};

Banner.prototype.render = function() {
	this.update();
	this.graphics.clear();
	//Draw background
	this.graphics.lineStyle(this.bgBorderSize, this.bgBorderColor, 1); //sets border color and size
	this.graphics.beginFill(this.bgColor); //sets color of background fill
	this.graphics.drawRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	this.graphics.endFill();
};

Banner.prototype.show = function() {
   this.goalY = this.cam.y + this.cam.height * this.yRatio;
};

Banner.prototype.hide = function() {
   this.goalY = this.hideHeight;
};

module.exports = Banner;








