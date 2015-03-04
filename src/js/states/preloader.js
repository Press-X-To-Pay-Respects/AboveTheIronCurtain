var Preloader = function (game) {
  game = null;
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(320, 240, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('testsprite', 'assets/test2.png');
	this.load.image('core', 'assets/core.png');
	this.load.image('thruster', 'assets/thruster.png');
	this.load.image('shield', 'assets/shield.png');
	this.load.image('solarPannel', 'assets/solarPannel.png');
	this.load.image('hacker', 'assets/hacker.png');
	this.load.image('hackable1', 'assets/hackable1.png');
	
    this.load.physics('module_physics', 'assets/module_physics.json');
  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      // this.game.state.start('Menu');
      this.game.state.start(playerState.currentLevel); // jshint ignore:line
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
