var Menu = function () {
  this.text = null;
};

module.exports = Menu;

Menu.prototype = {

  init: function(params){
  	
	this.menuSong = this.game.add.audio(params[0]);
	if(!this.menuSong.isPlaying){
	  this.menuSong.play('',params[1],params[2],true,true);
	} 
  },
  
  pos: [-25, 25, 75],
  create: function () {
	   
    this.title = this.add.image(this.world.centerX, this.world.centerY - 95, 'menu_title');
    this.title.anchor.setTo(0.5, 0.5);
    
    this.select = this.addButton(1, 'menu_select', this.changeToGame);
  	this.select.anchor.setTo(0.5, 0.5);
  	
  	this.manual = this.addButton(2, 'menu_manual', this.changeToMenu);
  	this.manual.anchor.setTo(0.5, 0.5);
  	
  	this.credits = this.addButton(3, 'menu_credits', this.changeToMenu);
  	this.credits.anchor.setTo(0.5, 0.5);
  },

  addButton: function(button, img, func){
    return this.add.button(this.world.centerX, this.world.centerY + this.pos[button - 1], img, func);
  },
  
  draw: function(){
  },
  
  changeToGame: function(){
	menuSong.stop();
	var params = ['mainSong', 0, this.menuSong.volume];
  	this.game.state.start('Game');
  },  
  
  changeToMenu: function(){
  	var params = ['menuSong', this.menuSong.position, this.menuSong.volume];
  	this.game.state.start('Menu');
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
  },

};
