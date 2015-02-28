/*
Defines a cube.
*/

// var Astar = require('../libs/javascript-astar/astar');

var Cube = function (game, x, y, sprite) {
    Phaser.Sprite.call(this, game, x, y, sprite);
    game.add.existing(this);
    this.group = undefined;
    this.module = undefined;
    this.indicatorFade = 0.008;
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
   if (this.cIndicator && this.cIndicator.alpha > 0) {
      this.cIndicator.alpha -= this.indicatorFade;
   }
};

Cube.prototype.cubeCollide = function(other) {
   if (!this.group || !other || !other.sprite) {
      return;
   }
   this.group.handleCollision(this, other.sprite);
};

Cube.prototype.toString = function() {
   var string = '';
   string += this.concat('name', this.name);
   return string;
};

Cube.prototype.concat = function(string, val) {
   return string + ': ' + val + '\n';
};

Cube.prototype.removeConnection = function() {
  
};

Cube.prototype.displayIndicator = function() {
  this.cIndicator.alpha = 1; 
};

/*
Cube.prototype.runAstar = function() {
   var graph = new Astar.Graph([
        [1,1,1,1],
        [0,1,1,0],
        [0,0,1,1]
    ]);
    var start = graph.grid[0][0];
    var end = graph.grid[1][2];
    var result = Astar.astar.search(graph, start, end);
    for(var i = 0; i < result.length; i++) {
       console.log(result[i].x, result[i].y);
    }
};
*/

module.exports = Cube;














