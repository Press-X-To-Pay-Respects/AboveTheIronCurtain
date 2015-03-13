var Mission_Select = function () {
  this.text = null;
};

module.exports = Mission_Select;

Mission_Select.prototype = {
	
	init: function(params){
  	
	this.menuSong = this.game.add.audio(params[0]);
	if(!this.menuSong.isPlaying){
	  this.menuSong.play('',params[1],params[2],true,true);
	} 
  },
  
  create: function () {
  	
  },
  
  draw: function(){  	
  },
  
  update: function(){  	
  },
  
};