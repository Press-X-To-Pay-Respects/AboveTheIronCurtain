/*
Defines a cube module.
*/

var Cube = function (game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'testsprite');
    game.add.existing(this);
    this.north = undefined;
    this.east = undefined;
    this.south = undefined;
    this.west = undefined;
    this.root = false;
    this.DIR = {NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3};
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
};

Cube.prototype.addConnection = function(other) {
  var offset = 2;
  var thisSide = this.relativeSide(this.body, other);
  var otherSide = this.relativeSide(other, this.body);
  if (this.getSide(thisSide)) {
     return;
  }
  if (other.sprite.getSide(otherSide)) {
     return;
  }
  switch (thisSide) {
     case this.DIR.NORTH:
     this.game.physics.p2.createLockConstraint(this.body, other, [0, this.width + offset]);
     this.north = other.sprite;
     break;
     case this.DIR.EAST:
     this.game.physics.p2.createLockConstraint(this.body, other, [-this.width - offset, 0]);
     this.east = other.sprite;
     break;
     case this.DIR.SOUTH:
     this.game.physics.p2.createLockConstraint(this.body, other, [0, -this.width - offset]);
     this.south = other.sprite;
     break;
     case this.DIR.WEST:
     this.game.physics.p2.createLockConstraint(this.body, other, [this.width + offset, 0]);
     this.west = other.sprite;
     break;
  }
  switch (otherSide) {
     case this.DIR.NORTH:
     other.sprite.north = this;
     break;
     case this.DIR.EAST:
     other.sprite.east = this;
     break;
     case this.DIR.SOUTH:
     other.sprite.south = this;
     break;
     case this.DIR.WEST:
     other.sprite.west = this;
     break;
  }
};

Cube.prototype.relativeSide = function(thisBody, otherBody) {
  var thisPoint = new Phaser.Point(thisBody.x, thisBody.y);
  var otherPoint = new Phaser.Point(otherBody.x, otherBody.y);
  var angleToOther = Phaser.Point.angle(thisPoint, otherPoint);
  if (angleToOther < 0) { // fix dumb part of Phaser.Point.angle()
     angleToOther = 2 * Math.PI + angleToOther;
  }
  angleToOther = (angleToOther + 3/2 * Math.PI) % (2 * Math.PI); // rotate 90 d clockwise
  var diffAngle = angleToOther - thisBody.rotation;
   if (diffAngle < 1 / 4 * Math.PI || diffAngle > 7 / 4 * Math.PI) { // north
     return this.DIR.NORTH;
  } else if (diffAngle >= 1 / 4 * Math.PI && diffAngle < 3 / 4 * Math.PI) { // east
     return this.DIR.EAST;
  } else if (diffAngle >= 3 / 4 * Math.PI && diffAngle < 5 / 4 * Math.PI) { // south
     return this.DIR.SOUTH;
  } else if (diffAngle >= 5 / 4 * Math.PI && diffAngle < 7 / 4 * Math.PI) { // west
     return this.DIR.WEST;
  }
};

Cube.prototype.cubeCollide = function(other) {
   if (other === null || this.prototype !== other.prototype) {
      return;
   }
   if (this.myRoot) {
      if (other.sprite.myRoot && this.myRoot === other.sprite.myRoot) {
         return;
      }
   } else {
      if (this.root) {
         this.myRoot = this.name;
      }
   }
   if (this.hasRoot() && !other.sprite.hasRoot()) {
      this.addConnection(other);
   }
};

Cube.prototype.hasRoot = function() {
  if (this.root) {
     return true;
  }
  var visited = [];
  visited.push(this);
  if (this.north && this.hasRootR(visited, this.north)) {
    return true;  
  }
  if (this.east && this.hasRootR(visited, this.east)) {
    return true;  
  }
  if (this.south && this.hasRootR(visited, this.south)) {
    return true;  
  }
  if (this.west && this.hasRootR(visited, this.west)) {
    return true;
  }
};

Cube.prototype.hasRootR = function(visited, cur) {
   if (cur.root) {
      if (!this.myRoot) {
         this.myRoot = cur.name;
      }
      return true;
   }
   visited.push(cur);
   if (cur.north && !this.contains(visited, cur.north) && this.hasRootR(visited, cur.north)) {
    return true;  
  }
  if (cur.east && !this.contains(visited, cur.east) && this.hasRootR(visited, cur.east)) {
    return true;  
  }
  if (cur.south && !this.contains(visited, cur.south) && this.hasRootR(visited, cur.south)) {
    return true;  
  }
  if (cur.west && !this.contains(visited, cur.west) && this.hasRootR(visited, cur.west)) {
    return true;  
  }
};

Cube.prototype.contains = function (array, obj) {
  for (var i = 0; i < array.length; i++) {
      if (array[i] === obj) {
         return true;
      }
  }  
   return false;
};

Cube.prototype.getSide = function(side) {
   switch (side) {
     case this.DIR.NORTH:
     return this.north;
     case this.DIR.EAST:
     return this.east;
     case this.DIR.SOUTH:
     return this.south;
     case this.DIR.WEST:
     return this.west;
  }
  return undefined;
};

Cube.prototype.toString = function() {
   var string = '';
   string += this.concat('name', this.name);
   string += this.concat('isRoot', this.root);
   string += this.concat('myRoot', this.myRoot);
   string += this.concat('north', this.north !== undefined);
   string += this.concat('east', this.east !== undefined);
   string += this.concat('south', this.south !== undefined);
   string += this.concat('west', this.west !== undefined);
   return string;
};

Cube.prototype.concat = function(string, val) {
   return string + ': ' + val + '\n';
};

module.exports = Cube;














