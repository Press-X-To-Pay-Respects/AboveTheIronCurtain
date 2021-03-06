/*
Main testing environment.
*/
var LevelSetup = require('../entities/level_setup');

var Game = function () { };

module.exports = Game;

Game.prototype = {
	
  init: function(params){
  	this.levelSong = this.game.add.audio(params[0]);
	this.levelSong.play('',params[1],params[2],true,true);
  },
	
  create: function () {
   this.levelSetup = new LevelSetup(this, 'level_one');
  },
  
  update: function () {
   this.levelSetup.update();
  },
  
  render: function () {
   this.levelSetup.render();
  }
};



























