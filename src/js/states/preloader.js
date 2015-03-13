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
	this.load.spritesheet('hackable', 'assets/images/hackableSheet.png', 64, 64);
	this.load.spritesheet('shopButton', 'assets/images/shopButtonSheet.png', 32, 32);
	this.load.spritesheet('closeButton', 'assets/images/closeButtonSheet.png', 32, 32);
	
	//Load Images
	this.load.image('earthNight', 'assets/images/bg_earthNightSmall.jpg');
	this.load.image('credits', 'assets/images/credits.png');
	this.load.image('bullet', 'assets/images/bullet.png');
	this.load.image('shield', 'assets/images/shield.png');
	this.load.image('solarPanel', 'assets/images/solarPanel.png');
	this.load.image('asteroid', 'assets/images/asteroid.png');
	this.load.image('shopPanel', 'assets/images/shopBackPanel.png');
	this.load.image('warning', 'assets/images/warning.png');
	this.load.image('be', 'assets/images/be.png');
	this.load.image('selected', 'assets/images/selected.png');
	this.load.image('missionPrompt', 'assets/images/missionPrompt.png');
    
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
	this.load.audio('cashRegister', 'assets/sound/cashRegister.ogg');
	this.load.audio('gun', 'assets/sound/gun.ogg');
	this.load.audio('hacking', 'assets/sound/hacking.ogg');
	this.load.audio('moduleImpact', 'assets/sound/moduleImpact.ogg');
	this.load.audio('moduleConnect', 'assets/sound/moduleConnect.ogg');
	this.load.audio('modulePower', 'assets/sound/modulePower.ogg');
	this.load.audio('thrusterLoop', 'assets/sound/thrusterLoop.ogg');
	
	this.load.text('tutorial_text', 'assets/json/tutorial_text.json');
	// this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	this.load.atlasJSONHash('helpButton', 'assets/images/helpButtonSheet.png', 'assets/json/help_button.json');
	this.load.atlasJSONHash('arrowButton', 'assets/images/arrowButtonSheet.png', 'assets/json/arrow_button.json');
	//menu buttons
	this.load.spritesheet('startGameButton', 'assets/images/startGameButtonSheet.png', 256, 82);
	this.load.spritesheet('missionSelectButton', 'assets/images/missionSelectButtonSheet.png', 256, 82);
	this.load.spritesheet('creditsButton', 'assets/images/creditsButtonSheet.png', 256, 82);
	this.load.image('title', 'assets/images/title.png');

	
	
	//Load Music
	this.load.audio('menuSong', 'assets/sound/Yet Another.ogg');
	this.load.audio('mainSong', 'assets/sound/Top (down) Night.ogg');

  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      var params = ['menuSong', 0, 1];
      this.game.state.start('Menu', true, false, params);
      //this.game.state.start(playerState.currentLevel); // jshint ignore:line
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
