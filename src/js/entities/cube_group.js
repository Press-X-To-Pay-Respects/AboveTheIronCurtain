/*
Defines a cube group.
*/

var CubeGroup = function (game, root) {
   this.game = game;
   this.root = root;
   this.cubes = [];
   var col = [];
   col.push(this.root);
   this.cubes.push(col);
   this.root.group = this;
   this.DIR = {NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3};
   this.offset = 2;
};

CubeGroup.prototype.constructor = CubeGroup;

/**
 * Automatically called by World.update
 */
CubeGroup.prototype.update = function() {
};

CubeGroup.prototype.add = function(cube) {
  cube.group = this; 
};

CubeGroup.prototype.handleCollision = function(origin, other) {
   // stop if other does not exist, either is not a cube, both are in same gruop
   if (other === null || origin.prototype !== other.prototype || origin.group === other.group) {
      return;
   }
   var relSide = this.relativeSide(origin.body, other.body);
   var originLoc = this.find(origin);
   var otherLoc = this.adjust(originLoc, relSide);
   // console.log('hm', originLoc.x, originLoc.y);
   if (this.getCube(otherLoc)) {
      return;
   }
   switch (relSide) {
      case this.DIR.NORTH:
      if (originLoc.y === this.cubesHeight() - 1) {
         this.addTopRow();
      }
      this.game.physics.p2.createLockConstraint(origin.body, other.body, [0, origin.width + this.offset]);
      break;
      case this.DIR.EAST:
      if (originLoc.x === this.cubesWidth() - 1) {
         this.addRightCol();
      }
      this.game.physics.p2.createLockConstraint(origin.body, other.body, [-origin.width - this.offset, 0]);
      break;
      case this.DIR.SOUTH:
      if (originLoc.y === 0) {
         this.addBotRow();
      }
      this.game.physics.p2.createLockConstraint(other.body, origin.body, [0, origin.width + this.offset]);
      break;
      case this.DIR.WEST:
      if (originLoc.x === 0) {
         this.addLeftCol();
      }
      this.game.physics.p2.createLockConstraint(other.body, origin.body, [-origin.width - this.offset, 0]);
      break;
   }
   // console.log('end');
   originLoc = this.find(origin);
   otherLoc = this.adjust(originLoc, relSide);
   if (!otherLoc) {
      console.log('hande collision failed to find second other loc');
      return;
   }
   this.set(otherLoc, other);
   // console.log('add: ' + other.name + ' at ' + otherLoc.x + ', ' + otherLoc.y);
   // this.displayCubes();
   other.group = this;
};

CubeGroup.prototype.relativeSide = function(thisBody, otherBody) {
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

CubeGroup.prototype.find = function(cube) {
   // console.log('find', cube.name);
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         if (this.cubes[row][col] === cube) {
            // console.log('found at', row, col);
            return new Phaser.Point(row, col);
         }
      }
   }
   console.log('could not find cube', cube.name);
   this.displayCubes();
   return undefined;
};

CubeGroup.prototype.cubesWidth = function() {
   return this.cubes.length;
};

CubeGroup.prototype.cubesHeight = function() {
   return this.cubes[0].length;
};

/*
[0,height] ...  [width, height]
.                 
.               .
.               .
[0,1] [1,1] ... .
[0,0] [1,0] ... [width,0]
*/
CubeGroup.prototype.addTopRow = function() {
   // console.log('add top');
   // this.displayCubes();
   for (var row = 0; row < this.cubesWidth(); row++) {
      this.cubes[row].push(undefined);
   }
   // console.log('end add top');
   // this.displayCubes();
};

CubeGroup.prototype.addRightCol = function() {
   // console.log('add right');
   var newCol = new Array(this.cubesHeight);
   this.cubes.push(newCol);
};

CubeGroup.prototype.addBotRow = function() {
   // console.log('add bot');
   // this.displayCubes();
   for (var row = 0; row < this.cubesWidth(); row++) {
      this.cubes[row].unshift(undefined);
   }
   // console.log('end add bot');
   // this.displayCubes();
};

CubeGroup.prototype.addLeftCol = function() {
   // console.log('add left');
   // this.displayCubes();
   // console.log('height is ' + this.cubesHeight());
   var newCol = new Array(this.cubesHeight());
   this.cubes.unshift(newCol);
   // console.log('end add left');
   // this.displayCubes();
};

CubeGroup.prototype.getCube = function(point) {
   if (this.outOfBounds(point)) {
      return undefined;
   }
   return this.cubes[point.x][point.y];
};

CubeGroup.prototype.adjust = function(point, dir) {
  if (!point) {
     console.log('adjust given undefined point');
     return;
  }
  var newPoint = new Phaser.Point(point.x, point.y);
  switch (dir) {
      case this.DIR.NORTH:
      newPoint.y++;
      break;
      case this.DIR.EAST:
      newPoint.x++;
      break;
      case this.DIR.SOUTH:
      newPoint.y--;
      break;
      case this.DIR.WEST:
      newPoint.x--;
      break;
   }
   return newPoint;
};

CubeGroup.prototype.set = function(point, cube) {
   if (!point) {
      console.log('set given undefined point');
      return;
   }
   if (this.outOfBounds(point)) {
      return;
   }
   this.cubes[point.x][point.y] = cube;
};

CubeGroup.prototype.outOfBounds = function(point) {
   if (!point) {
      console.log('out of bounds given undefined point');
      return;
   }
   if (point.x < 0 || point.x >= this.cubesWidth() || point.y < 0 || point.y >= this.cubesHeight()) {
      return true;
   }
   return false;
};

CubeGroup.prototype.displayCubes = function() {
   for (var row = 0; row < this.cubesWidth(); row++) {
      var string = '';
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube) {
            string += this.cubes[row][col].name + ' ';
         } else {
            string += 'empty' + ' ';
         }
      }
      console.log('row ' + row + ': ' + string + '| ' + this.cubes[row].length);
   }
};

module.exports = CubeGroup;
















