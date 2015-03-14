var Utils = require('../utils');

//NOTE: DON'T USE this code to create a Banner. Instead, use the UIBuilder object and call buildBanner
var Banner = function(state, xRatio, yRatio, textJSON, graphics, renderables) {
   this.bgBorderSize = 6;			//default size of background border
	this.bgBorderColor = 0xffffff;	//default color of background border
	this.bgColor = 0x4a4a4a;		//default color of background
   this.shadowOffsetX = 3;
   this.shadowOffsetY = 3;
   this.shadowColor = 'rgba(0,0,0,0.9)';
   this.shadowBlur = 5;
   this.normalText = '#ffffff';
   this.highlightText = '#00ff00';
   this.textWrapPadding = 10;
   this.offScreenPadding = -200;
   this.textJSON = textJSON;
   this.state = state;
   this.game = state.game;
   this.cam = this.game.camera;
   this.sm = this.state.soundManager;
   this.xRatio = xRatio;
   this.yRatio = yRatio;
   this.graphics = graphics;
   this.renderables = renderables;
   this.width = 400;
   this.height = 200;
   this.index = 0;
   this.x = 0;
   this.hideBuffer = -50;
   this.hideHeight = -this.height - this.hideBuffer;
   this.y = this.cam.y - this.cam.height / 2 - this.hideHeight;
   this.slideY = this.hideHeight;
   this.goalY = this.y;
   this.slideRate = 0.2;
   this.visible = false;
   // add buttons
   this.rightButton = this.game.add.button(0, 0, 'arrowButton', this.nextIndex, this, 1, 0, 2);
	this.rightButton.onInputOver.add(this.sm.playHoverClick, this.sm);
	this.rightButton.onInputDown.add(this.sm.playDownClick, this.sm);
   this.leftButton = this.game.add.button(0, 0, 'arrowButton', this.prevIndex, this, 1, 0, 2);
	this.leftButton.onInputOver.add(this.sm.playHoverClick, this.sm);
	this.leftButton.onInputDown.add(this.sm.playDownClick, this.sm);
   this.leftButton.scale.x = -1;
   this.group = new Phaser.Group(this.game);
   this.group.add(this.graphics);
   this.group.add(this.rightButton);
   this.group.add(this.leftButton);
   this.addTexts();
   this.game.world.bringToTop(this.group);
   this.debug = false;
};

Banner.prototype.constructor = Banner;

Banner.prototype.destroy = function() {
	this.graphics.clear();
	this.renderables.unsubscribe(this);
};

Banner.prototype.update = function() {
   // TODO: add layer groups to other things
   this.game.world.bringToTop(this.group);
   // my pos
   this.x = this.cam.x + this.cam.width * this.xRatio;
   if (this.visible) {
      this.goalY = this.cam.height / 2;
   } else {
      this.goalY = this.hideHeight;
   }
   this.slideY = Utils.lerp(this.slideY, this.goalY, this.slideRate);
   if (this.debug) { console.log('this.cam.y:', this.cam.y, 'this.slideY:', this.slideY, 'this.y:', this.y); }
   this.y = this.cam.y + this.slideY;
   // text pos
   var curText = this.textObjs[this.index];
   curText.x = this.x;
   curText.y = this.y;
   // button pos
   this.rightButton.x = this.x + this.width / 2 + this.rightButton.width / 2;
   this.rightButton.y = this.y - this.rightButton.height / 2;
   this.leftButton.x = this.x - this.width / 2 + this.leftButton.width / 2;
   this.leftButton.y = this.y - this.leftButton.height / 2;
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
      var newText = this.game.add.text(this.offScreenPadding, this.offScreenPadding, text);
      newText.font = 'Roboto';
      newText.fontSize = 24;
      newText.align = 'center';
      newText.fill = this.normalText;
      newText.wordWrap = true;
      newText.wordWrapWidth = this.width - this.textWrapPadding;
      newText.anchor.set(0.5);
      newText.setShadow(this.shadowOffsetX, this.shadowOffsetY, this.shadowColor, this.shadowBlur);
      var higlights = textColors[i];
      for (var j = 0; j < higlights.length; j++) {
         var word = higlights[j];
         var indices = this.indicesOf(word, newText.text);
         for (var k = 0; k < indices.length; k++) {
            newText.addColor(this.highlightText, indices[k]);
            newText.addColor(this.normalText, indices[k] + word.length);
         }
      }
      this.textObjs.push(newText);
      this.group.add(newText);
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

Banner.prototype.indicesOf = function(search, target) {
   var startIndex = 0;
   var searchLength = search.length;
   var index;
   var indices = [];
   target = target.toLowerCase();
   var firstA = false;
   while ((index = target.indexOf(search, startIndex)) > -1) {
      var left = target.charAt(index - 1);
      var right = target.charAt(index + searchLength);
      if ((left === '' || left === ' ') && (right === '' || right === ' ')) {
         if (!firstA && target.charAt(index) === 'a') {
            firstA = true;
            indices.push(index);
         } else if (target.charAt(index) !== 'a') {
            indices.push(index);
         }
      }
      startIndex = index + searchLength;
   }
   return indices;
};

Banner.prototype.show = function() {
   // this.goalY = this.cam.y + this.cam.height * this.yRatio;
   this.visible = true;
};

Banner.prototype.hide = function() {
   // this.goalY = this.hideHeight;
   this.visible = false;
};

Banner.prototype.toggle = function() {
  if (this.visible) {
     this.hide();
  } else {
     this.show();
  }  
};

Banner.prototype.hideCurText = function() {
  this.textObjs[this.index].x = this.textObjs[this.index].y = 0; 
};

Banner.prototype.nextIndex = function() {
   this.hideCurText();
   this.index++;
   if (this.index >= this.textObjs.length) {
      this.index = 0;
   }
};

Banner.prototype.prevIndex = function() {
   this.hideCurText();
   this.index--;
   if (this.index < 0) {
      this.index = this.textObjs.length - 1;
   }
};

module.exports = Banner;








