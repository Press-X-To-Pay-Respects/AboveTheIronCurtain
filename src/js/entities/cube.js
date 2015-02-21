/*
Defines a cube module for a cubesat.
*/

var Cube = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'testsprite');
    game.add.existing(this);
    this.north = undefined;
    this.east = undefined;
    this.south = undefined;
    this.west = undefined;
    this.root = false;
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
};

Cube.prototype.addConnection = function(other) {
  var thisPoint = new Phaser.Point(this.x, this.y);
  var otherPoint = new Phaser.Point(other.x, other.y);
  var angleToOther = Phaser.Point.angle(thisPoint, otherPoint);
  if (angleToOther < 0) { // fix dumb part of Phaser.Point.angle()
     angleToOther = 2 * Math.PI + angleToOther;
  }
  angleToOther = (angleToOther + 3/2 * Math.PI) % (2 * Math.PI); // rotate 90 d clockwise
  var diffAngle = angleToOther - this.rotation;
  /*
  this.body.rotation = other.rotation = angleToOther;
  var placePoint = new Phaser.Point(0, -this.width - 1);
  Phaser.Point.rotate(placePoint, 0, 0, angleToOther);
  other.x = this.x + placePoint.x;
  other.y = this.y + placePoint.y;
  this.body.velocity.x = this.body.velocity.y = 0;
  other.velocity.x = other.velocity.y = 0;
  */
  var offset = 1;
  if (diffAngle < 1 / 4 * Math.PI || diffAngle > 7 / 4 * Math.PI) { // north
     // console.log('north');
     this.game.physics.p2.createLockConstraint(this.body, other, [0, this.width + offset]);
  } else if (diffAngle >= 1 / 4 * Math.PI && diffAngle < 3 / 4 * Math.PI) { // east
     // console.log('east');
     this.game.physics.p2.createLockConstraint(this.body, other, [-this.width - offset, 0]);
  } else if (diffAngle >= 3 / 4 * Math.PI && diffAngle < 5 / 4 * Math.PI) { // south
     // console.log('south');
     this.game.physics.p2.createLockConstraint(this.body, other, [0, -this.width - offset]);
  } else if (diffAngle >= 5 / 4 * Math.PI && diffAngle < 7 / 4 * Math.PI) { // west
     // console.log('west');
     this.game.physics.p2.createLockConstraint(this.body, other, [this.width + offset, 0]);
  }
};

Cube.prototype.cubeCollide = function(other) {
  // console.log('collide', other);
   if (other === null || this.prototype !== other.prototype) {
      console.log('not a cube', other);
      return;
   }
   if (this.root || this.hasRoot()) {
      this.addConnection(other);
   }
};

Cube.prototype.hasRoot = function() {
  return false; 
};

module.exports = Cube;














