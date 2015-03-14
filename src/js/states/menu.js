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
	this.butDiff = 0;
	this.creditsSpeed = 16;
	this.butSpeed = 32;
	this.creditsOpening = false;
	this.creditsClosing = false;
	this.buttonsLeaving = false;
	this.buttonsComing = false;
	this.mainButtonsUp = true;
	
	this.bg = this.game.add.sprite(-4500, -500, 'earthNight');
	this.bg2 = this.game.add.sprite(-12500, -500, 'earthNight');
    
	//Main Screen
    this.title = this.add.image(this.game.camera.x + (this.game.camera.width / 2), this.game.camera.y + (this.game.camera.height / 2) + 32, 'title');
    this.title.anchor.setTo(0.5, 0.5);
    
    this.startButton = this.addButton(0, 'startGameButton', this.changeToLevel1, this);
	this.formatButton(this.startButton);
  	
  	this.missionSelectButton = this.addButton(1, 'missionSelectButton', this.switchButtons, this);
	this.formatButton(this.missionSelectButton);
  	
  	this.creditsButton = this.addButton(2, 'creditsButton', this.doCredits, {game: this, button: 'creditsButton'});
	this.formatButton(this.creditsButton);
	
	//Level Select
	this.level1Button = this.addButton(-1, 'level1Button', this.changeToLevel1, this);
	this.formatButton(this.level1Button);
  	
	this.level2Button = this.addButton(0, 'level2Button', this.changeToLevel2, this);
	this.formatButton(this.level2Button);
	
	this.level3Button = this.addButton(1, 'level3Button', this.changeToLevel3, this);
	this.formatButton(this.level3Button);
	
	this.backButton = this.addButton(2, 'backButton', this.switchButtons, this);
	this.formatButton(this.backButton);

	this.credits = this.add.image(this.game.camera.x + (this.game.camera.width / 2) - 360, this.game.camera.y + (this.game.camera.height / 2) - 256 + this.diff, 'credits');
	this.credits.kill();
	this.creditsCloseButton = this.addButton(10, 'closeButton', this.doCredits, {game: this, button: 'closeCreditsButton'});
	this.creditsCloseButton.x = this.credits.x + this.credits.width - 32;
	this.creditsCloseButton.y = this.credits.y;
	this.creditsCloseButton.onInputOver.add(this.playHoverClick, this);
	this.creditsCloseButton.onInputDown.add(this.playDownClick, this);
  },

  addButton: function(button, img, func, context){
    return this.add.button(this.game.camera.x + (this.game.camera.width / 2), this.game.camera.y + (this.game.camera.height / 2) + (button) * 90, img, func, context, 1, 0, 2);

  },
  
  draw: function(){
  },
  
  changeToLevel1: function(){
	if(!this.credits.alive) {
		this.menuSong.destroy();
		var params = ['mainSong', 0, 0.75];
		this.playDownClick();
		this.game.state.start('levelOne', true, false, params);
	}
  },
  
  changeToLevel2: function(){
	if(!this.credits.alive) {
		this.menuSong.destroy();
		var params = ['secondSong', 0, 0.75];
		this.playDownClick();
		this.game.state.start('levelTwo', true, false, params);
	}
  }, 
  
  changeToLevel3: function(){
	if(!this.credits.alive) {
		this.menuSong.destroy();
		var params = ['thirdSong', 0, 0.75];
		this.playDownClick();
		this.game.state.start('levelThree', true, false, params);
	}
  }, 
/* 
  changeToMenu: function(){
	if(!this.credits.alive) {
		this.menuSong.destroy();
		this.playDownClick();
		this.game.state.start('Menu');
	}
  },
*/ 
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
  
  switchButtons: function() {
	this.playDownClick();
	if(!this.buttonsLeaving && this.mainButtonsUp === true) {
		this.butDiff = 0;
		this.buttonsLeaving = true;
	}
	else if(!this.buttonsComing && this.mainButtonsUp === false) {
		this.buttonsComing = true;
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
		this.credits.y = this.game.camera.y + (this.game.camera.height / 2) - 256 + this.diff;
		this.creditsCloseButton.x = this.credits.x + this.credits.width - 32;
		this.creditsCloseButton.y = this.credits.y;
		
		if(this.buttonsLeaving === true) {
			this.butDiff -= this.butSpeed;
			if(this.butDiff <= -768) {
				this.buttonsLeaving = false;
				this.mainButtonsUp = false;
			}
		}
		else if(this.buttonsComing === true) {
			this.butDiff += this.butSpeed;
			if(this.butDiff >= 0) {
				this.buttonsComing = false;
				this.mainButtonsUp = true;
			}
		}
		this.startButton.x = this.game.camera.x + (this.game.camera.width / 2) + this.butDiff;
		this.missionSelectButton.x = this.game.camera.x + (this.game.camera.width / 2) + this.butDiff;
		this.creditsButton.x = this.game.camera.x + (this.game.camera.width / 2) + this.butDiff;
		this.level1Button.x = this.startButton.x + 768;
		this.level2Button.x = this.startButton.x + 768;
		this.level3Button.x = this.startButton.x + 768;
		this.backButton.x = this.startButton.x + 768;
		
	},
	
	playHoverClick: function() {
		this.hoverClick.play();
	},
	
	playDownClick: function() {
		this.downClick.play();
	},

};
