/*
Main testing environment.
*/
var LevelSetup = require('../entities/level_setup');

var Game = function () { };

module.exports = Game;

Game.prototype = {
	
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



























