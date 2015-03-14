/*
Level 3
*/
var LevelSetup = require('../entities/level_setup');

var levelThree = function () { };

module.exports = levelThree;

levelThree.prototype = {
	
  init: function(params){
  	this.levelSong = this.game.add.audio(params[0]);
	this.levelSong.play('',params[1],params[2],true,true);
  },
	
  create: function () {
   console.log('create');
	this.levelSetup = new LevelSetup(this, 'level_three');
	this.pauseMenu = this.game.add.image(-2000, -2000, 'pauseMenu');
	this.pauseMenu.kill();
	this.pauseMenu.anchor.setTo(0.5, 0.5);
	this.pauseKey = this.game.input.keyboard.addKey(27);
	this.pauseKey.onDown.add(this.pauseGame, {game: this, context: 'key'});
	this.menuKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.menuKey.onDown.add(this.returnToMenu, this);
	this.restartKey = this.game.input.keyboard.addKey(Phaser.Keyboard.G);
	this.restartKey.onDown.add(this.restartLevel, {game: this, context: 'key'});
	this.state.game.input.onDown.add(this.pauseGame, {game: this, context: 'mouse'});
  },
  
  update: function () {
   this.levelSetup.update();
  },
  
  render: function () {
   this.levelSetup.render();
  },
  
  pauseGame: function() {
		if(!this.game.state.game.paused) {
			if(this.context === 'key') {
				this.game.pauseMenu = this.game.add.image(this.game.camera.x + (this.game.camera.width / 2), this.game.camera.y + (this.game.camera.height / 2), 'pauseMenu');
				this.game.pauseMenu.anchor.setTo(0.5, 0.5);
				this.game.state.game.paused = true;
			}
		}
		else {
			this.game.state.game.paused = false;
			this.game.pauseMenu.destroy();
		}
	},

	restartLevel: function() {
		if(this.context === 'key') {
			if(this.game.state.game.paused) {
				this.game.state.game.paused = false;
				this.game.levelSong.destroy();
				this.game.game.state.start('levelThree', true, false, ['mainSong', 0, 0.75]);
			}
		}
		else {
			this.game.levelSong.destroy();
			this.game.game.state.start('levelThree', true, false, ['mainSong', 0, 0.75]);
		}
	},
	
	returnToMenu: function() {
		if(this.state.game.paused) {
			this.state.game.paused = false;
			this.levelSong.destroy();
			this.game.state.start('Menu', true, false, ['menuSong', 0, 1]);
		}
	},
};






