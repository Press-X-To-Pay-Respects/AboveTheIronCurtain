var Menu = function () {
  this.text = null;
};

module.exports = Menu;

var menuSong;

Menu.prototype = {
	
  pos: [-25, 25, 75],
  create: function () {
    var x = this.game.width / 2;
    var y = this.game.height / 2;
	this.diff = 768;
	this.creditsSpeed = 16;
	this.creditsOpening = false;
	this.creditsClosing = false;
	this.bg = this.game.add.sprite(-4500, -500, 'earthNight');
	this.bg2 = this.game.add.sprite(-12500, -500, 'earthNight');
	
	menuSong = this.game.add.audio('menuSong');
	menuSong.play('',0,1,true,true);
    
    this.titleButton = this.add.image(this.world.centerX, this.world.centerY + 32, 'title');
    this.titleButton.anchor.setTo(0.5, 0.5);
    
    this.selectButton = this.addButton(0, 'startGameButton', this.changeToGame, this);
  	this.selectButton.anchor.setTo(0.5, 0.5);
  	
  	this.manualButton = this.addButton(1, 'missionSelectButton', this.changeToMenu, this);
  	this.manualButton.anchor.setTo(0.5, 0.5);
  	
  	this.creditsButton = this.addButton(2, 'creditsButton', this.doCredits, {game: this, button: 'creditsButton'});
  	this.creditsButton.anchor.setTo(0.5, 0.5);
	
	this.credits = this.add.image(this.world.centerX - 360, this.world.centerY - 256 + this.diff, 'credits');
	this.credits.kill();
	this.creditsCloseButton = this.addButton(10, 'closeButton', this.doCredits, {game: this, button: 'closeCreditsButton'});
	this.creditsCloseButton.x = this.credits.x + this.credits.width - 32;
	this.creditsCloseButton.y = this.credits.y;
  },

  addButton: function(button, img, func, context){
    return this.add.button(this.world.centerX, this.world.centerY + (button) * 90, img, func, context, 1, 0, 2);
  },
  
  draw: function(){
  },
  
  changeToGame: function(){
	if(!this.credits.alive) {
		menuSong.stop();
		this.game.state.start('Game');
	}
  },  
  
  changeToMenu: function(){
	if(!this.credits.alive) {
		menuSong.stop();
		this.game.state.start('Menu');
	}
  },
  
  doCredits: function() {
	if(!this.game.credits.alive && !this.game.creditsOpening && !this.game.creditsClosing && this.button === 'creditsButton') {
	  this.game.credits.revive();
	  this.game.diff = 768;
	  this.game.creditsOpening = true;
   }
   else if(this.game.credits.alive && !this.game.creditsClosing && !this.game.creditsOpening && this.button === 'closeCreditsButton') {
	  this.game.creditsClosing = true;
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

};
