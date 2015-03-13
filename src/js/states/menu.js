var Menu = function () {
  this.text = null;
};

module.exports = Menu;

Menu.prototype = {

  init: function(params){
  	
	this.menuSong = this.game.add.audio(params[0]);
	this.menuSong.play('',params[1],params[2],true,true);
	this.hoverClick = this.game.add.audio('hoverClick');
	this.downClick = this.game.add.audio('downClick');
  },
  
  create: function () {
	this.diff = 768;
	this.creditsSpeed = 16;
	this.creditsOpening = false;
	this.creditsClosing = false;
	this.bg = this.game.add.sprite(-4500, -500, 'earthNight');
	this.bg2 = this.game.add.sprite(-12500, -500, 'earthNight');
    
    this.title = this.add.image(this.world.centerX, this.world.centerY + 32, 'title');
    this.title.anchor.setTo(0.5, 0.5);
    
    this.startButton = this.addButton(0, 'startGameButton', this.changeToGame, this);
	this.formatButton(this.startButton);
  	
  	this.missionSelectButton = this.addButton(1, 'missionSelectButton', this.changeToMenu, this);
	this.formatButton(this.missionSelectButton);
  	
  	this.creditsButton = this.addButton(2, 'creditsButton', this.doCredits, {game: this, button: 'creditsButton'});
	this.formatButton(this.creditsButton);
	
	this.credits = this.add.image(this.world.centerX - 360, this.world.centerY - 256 + this.diff, 'credits');
	this.credits.kill();
	this.creditsCloseButton = this.addButton(10, 'closeButton', this.doCredits, {game: this, button: 'closeCreditsButton'});
	this.creditsCloseButton.x = this.credits.x + this.credits.width - 32;
	this.creditsCloseButton.y = this.credits.y;
	this.creditsCloseButton.onInputOver.add(this.playHoverClick, this);
	this.creditsCloseButton.onInputDown.add(this.playDownClick, this);
  },

  addButton: function(button, img, func, context){
    return this.add.button(this.world.centerX, this.world.centerY + (button) * 90, img, func, context, 1, 0, 2);

  },
  
  draw: function(){
  },
  
  changeToGame: function(){
	if(!this.credits.alive) {
		this.menuSong.destroy();
		var params = ['mainSong', 0, 0.75];
		this.playDownClick();
		this.game.state.start('Game', true, false, params);
	}
  },  
  
  changeToMenu: function(){
	if(!this.credits.alive) {
		menuSong.destroy();
		this.playDownClick();
		this.game.state.start('Menu');
	}
  },
  
  doCredits: function() {
	this.game.playDownClick();
	if(!this.game.credits.alive && !this.game.creditsOpening && !this.game.creditsClosing && this.button === 'creditsButton') {
	  this.game.credits.revive();
	  this.game.diff = 768;
	  this.game.creditsOpening = true;
   }
   else if(this.game.credits.alive && !this.game.creditsClosing && !this.game.creditsOpening && this.button === 'closeCreditsButton') {
	  this.game.creditsClosing = true;
	  this.game.killReviveButtons('revive');
   }
  },
  
  formatButton: function(button) {
	button.anchor.setTo(0.5, 0.5);
	button.onInputOver.add(this.playHoverClick, this);
	button.onInputDown.add(this.playDownClick, this);
  },
  
  killReviveButtons: function(key) {
	if(key === 'kill') {
		this.startButton.kill();
		this.missionSelectButton.kill();
		this.creditsButton.kill();
	}
	else if(key === 'revive') {
		this.startButton.revive();
		this.missionSelectButton.revive();
		this.creditsButton.revive();
	}
  },
  
  /*
  changeState: function(state){
  	switch(state){
  		case 'game':
  			this.game.state.start('Game');
  			break;
  		case 'menu':
  			this.game.state.start('Menu');
  			break;
  		default:
  			break;
  	}
  },
  */
	update: function () {
		this.bg.x += 0.125;
		if(this.bg.x >= 0) {
			this.bg.x = -8000;
		}
		this.bg2.x += 0.125;
		if(this.bg2.x >= 0) {
			this.bg2.x = -8000;
		}
		if(this.creditsOpening === true) {	
		  this.diff -= this.creditsSpeed;
			if(this.diff <= 0) {
				this.killReviveButtons('kill');
				this.creditsOpening = false;
			}
		}
		else if(this.creditsClosing === true) {
		  this.diff += this.creditsSpeed;
			if(this.diff >= 768) {
				this.credits.kill();
				this.creditsClosing = false;
			}
		}
		this.credits.y = this.world.centerY - 256 + this.diff;
		this.creditsCloseButton.x = this.credits.x + this.credits.width - 32;
		this.creditsCloseButton.y = this.credits.y;
	},
	
	playHoverClick: function() {
		this.hoverClick.play();
	},
	
	playDownClick: function() {
		this.downClick.play();
	},

};
