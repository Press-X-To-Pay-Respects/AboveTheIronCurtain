/*
Level 1
*/
var LevelSetup = require('../entities/level_setup');

var levelOne = function () { };

module.exports = levelOne;

levelOne.prototype = {
	
	init: function(params){
		this.levelSong = this.game.add.audio(params[0]);
		this.levelSong.play('',params[1],params[2],true,true);
	},
	
	create: function () {
		this.numEnemies = 0;
		this.numKilled = 0;
		this.level = 'one';
		this.playerDead = false;
		this.deathMenu = false;
		this.levelSetup = new LevelSetup(this, 'level_one');
		this.complete = false;
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
		this.state.game.input.onDown.add(this.levelComplete, this);
		this.state.game.input.onDown.add(this.playerDied, this);
		
	},
  
	update: function () {
		this.levelSetup.update();
		if(this.deathMenu) {
			this.deathMenu.x = this.game.camera.x + (this.game.camera.width / 2);
			this.deathMenu.y = this.game.camera.y + (this.game.camera.height / 2);
		}
		if(this.congrats) {
			this.congrats.x = this.game.camera.x + (this.game.camera.width / 2);
			this.congrats.y = this.game.camera.y + (this.game.camera.height / 2);
		}
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
		if(this.context) {
			if(this.game.state.game.paused) {
				this.game.state.game.paused = false;
				this.game.levelSong.destroy();
				this.game.game.state.start('levelOne', true, false, ['mainSong', 0, 0.75]);
			}
		}
		else {
			this.levelSong.destroy();
			this.game.state.start('levelOne', true, false, ['mainSong', 0, 0.75]);
		}
	},
	
	returnToMenu: function() {
		if(this.state.game.paused || this.complete || this.deathMenu) {
			this.state.game.paused = false;
			this.levelSong.destroy();
			this.game.state.start('Menu', true, false, ['menuSong', 0, 1]);
		}
	},
	
	levelComplete: function() {
		if(this.complete) {
			this.congrats.destroy();
			this.levelSong.destroy();
			this.game.state.start('levelTwo', true, false, ['secondSong', 0, 0.75]);
		}
		if(this.numKilled === this.numEnemies && this.numKilled !== 0) {
			this.congrats = this.game.add.image(this.game.camera.x + (this.game.camera.width / 2), this.game.camera.y + (this.game.camera.height / 2), 'levelComplete');
			this.congrats.anchor.set(0.5, 0.5);
			this.complete = true;
		}
	},
	
	playerDied: function() {
		if(this.deathMenu) {
			this.deathMenu.destroy();
			this.levelSong.destroy();
			this.game.state.start('levelOne', true, false, ['mainSong', 0, 0.75]);
		}
		if(this.playerDead) {
			this.deathMenu = this.game.add.image(this.game.camera.x + (this.game.camera.width / 2), this.game.camera.y + (this.game.camera.height / 2), 'deathMenu');
			this.deathMenu.anchor.set(0.5, 0.5);
		}
	},
};



























