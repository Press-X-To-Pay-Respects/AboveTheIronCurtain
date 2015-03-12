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
	
	//Load Spritesheets
	this.load.spritesheet('core', 'assets/images/coreSheet.png', 64, 64); 
	this.load.spritesheet('thruster', 'assets/images/thrusterSheet.png', 64, 64);
	this.load.spritesheet('gun', 'assets/images/gunSheet.png', 64, 64);
	this.load.spritesheet('hacker', 'assets/images/hackSheet.png', 64, 64);
	this.load.spritesheet('shieldButton', 'assets/images/shieldButtonSheet.png', 256, 82);
	this.load.spritesheet('solarPanelButton', 'assets/images/solarPanelButtonSheet.png', 256, 82);
	this.load.spritesheet('thrusterButton', 'assets/images/thrusterButtonSheet.png', 256, 82);
	this.load.spritesheet('gunButton', 'assets/images/gunButtonSheet.png', 256, 82);
	this.load.spritesheet('hackButton', 'assets/images/hackButtonSheet.png', 256, 82);
	this.load.spritesheet('hackable1', 'assets/images/hackable1.png', 256, 256);
	this.load.spritesheet('shopButton', 'assets/images/shopButtonSheet.png', 32, 32);
	
	//Load Images
	this.load.image('earthNight', 'assets/images/bg_earthNightSmall.jpg');
	this.load.image('bullet', 'assets/images/bullet.png');
	this.load.image('shield', 'assets/images/shield.png');
	this.load.image('solarPanel', 'assets/images/solarPanel.png');
	this.load.image('asteroid', 'assets/images/asteroid.png');
	this.load.image('shopPanel', 'assets/images/shopBackPanel.png');
	this.load.image('warning', 'assets/images/warning.png');
	this.load.image('be', 'assets/images/be.png');
    
	//Load Fonts
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	
	//Load JSON Files
	this.load.atlasJSONHash('connections', 'assets/images/connections.png', 'assets/json/connections.json');
	this.load.atlasJSONHash('connections', 'assets/images/connections.png', 'assets/json/connections.json');
	this.load.atlasJSONHash('helpButton', 'assets/images/helpButtonSheet.png', 'assets/json/help_button.json');
	this.load.atlasJSONHash('arrowButton', 'assets/images/arrowButtonSheet.png', 'assets/json/arrow_button.json');
	this.load.physics('module_physics', 'assets/json/module_physics.json');
	this.load.physics('asteroidPolygon', 'assets/json/asteroidPolygon.json');
	this.load.text('level_one', 'assets/json/level_one.json');
	this.load.text('tutorial_text', 'assets/json/tutorial_text.json');
	
	//Load Sound Effects
	this.load.audio('downClick', 'assets/sound/downClick.ogg');
	this.load.audio('hoverClick', 'assets/sound/hoverClick.ogg');
	this.load.audio('error', 'assets/sound/error.ogg');
	
	this.load.text('tutorial_text', 'assets/json/tutorial_text.json');
	this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	this.load.atlasJSONHash('helpButton', 'assets/images/helpButtonSheet.png', 'assets/json/help_button.json');
	this.load.atlasJSONHash('arrowButton', 'assets/images/arrowButtonSheet.png', 'assets/json/arrow_button.json');
	//menu buttons
	this.load.image('menu_title', 'assets/images/atic_menu_titleT.png');
	this.load.image('menu_select', 'assets/images/atic_menu_selectT.png');
	this.load.image('menu_manual', 'assets/images/atic_menu_manualT.png');
	this.load.image('menu_credits', 'assets/images/atic_menu_creditsT.png');

	this.load.audio('cashRegister', 'assets/sound/cashRegister.ogg');
	
	//Load Music
	this.load.audio('menuSong', 'assets/sound/Yet Another.ogg');
	this.load.audio('mainSong', 'assets/sound/Top (down) Night.ogg');

  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('Menu');
      //this.game.state.start(playerState.currentLevel); // jshint ignore:line
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
