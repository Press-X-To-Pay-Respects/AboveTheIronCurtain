//NOTE: DON'T USE this code to create a Banner. Instead, use the UIBuilder object and call buildBanner
var Banner = function(gameState, width, height, texts, snap) {
   this.texts = texts;
   this.gameState = gameState;
   this.game = gameState.game;
   Phaser.Sprite.call(this, this.game, 0, 0, 'banner');
   this.game.add.existing(this);
   this.cam = this.game.camera;
   this.snap = snap;
   // this.setScale(width, height);
   // this.addTexts();
};

Banner.prototype.constructor = Banner;

Banner.prototype.update = function() {
   switch (this.snap) {
      case 'top_right':
      this.x = this.cam.x + this.cam.width - this.width;
      this.y = this.cam.y;
      break;
   }
};

//Sets the size of the progress bar
Banner.prototype.setScale = function(setWidth, setHeight) {
	var curWidth = this.width;
   var curHeight = this.height;
   var camWidth = this.cam.width;
   var camHeight = this.cam.height;
   var widthRatio = (camWidth * setWidth) / curWidth;
   var heightRatio = (camHeight * setHeight) / curHeight;
   this.scale = new Phaser.Point(widthRatio, heightRatio);
};

Banner.prototype.addTexts = function() {
   if (!this.textObs) {
      this.textObs = [];
   }
   for (var i = 0; i < this.texts.length; i++) {
      var text = texts[i];
      var style = {font: '65px Arial', fill: '#ff0044', align: 'center'};
      this.textObjs.push(this.game.add.text(this.x, this.y, text, style));
   }
};

module.exports = Banner;








