var Menu = function () {
  this.text = null;
};

module.exports = Menu;

Menu.prototype = {

  create: function () {
    var x = this.game.width / 2;
    var y = this.game.height / 2;

    var style = { font: '65px Arial', fill: '#ffffff', align: 'center' };
    this.title = this.add.text(game.world.centerX, game.world.centerY - 250, 'Above The Iron Curtain', style);
    this.newGame = this.add.text(game.world.centerX, game.world.centerY - 150, 'New Simulation', style);
    this.level = this.add.text(game.world.centerX, game.world.centerY - 50, 'Mission Select', style);
    this.controls = this.add.text(game.world.centerX, game.world.centerY + 50, 'Manual', style);
    this.credits = this.addtext(game.world.centerX, game.world.centerY + 150, 'Credits', style);

    this.input.onDown.add(this.onDown, this);
  },

  update: function () {
  },

  onDown: function () {
    this.game.state.start(playerState.currentLevel); // jshint ignore:line
  }
};
