var Preloader = function (game) {
  game = null;
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(640, 360, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('testsprite', 'assets/test2.png');
	this.load.spritesheet('core', 'assets/coreSheet.png', 64, 64);
	this.load.spritesheet('thruster', 'assets/thrusterSheet.png', 64, 64);
	this.load.image('shield', 'assets/shield.png');
	this.load.image('solarPanel', 'assets/solarPanel.png');
	this.load.image('asteroid', 'assets/asteroid.png');
   this.load.atlasJSONHash('connections', 'assets/connections.png', 'assets/connections.json');
	this.load.image('earthNight', 'assets/bg_earthNightSmall.jpg');
    this.load.physics('module_physics', 'assets/module_physics.json');
   this.load.text('level_one', 'assets/level_one.json');
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
