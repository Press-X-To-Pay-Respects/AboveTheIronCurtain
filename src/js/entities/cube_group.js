var Astar = require('../libs/javascript-astar/astar');

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
   // this.groups = this.game.add.group();
   // this.cubeSprites = new Phaser.Group(this.game, this.groups);
   // this.gridSprites = new Phaser.Group(this.game, this.groups);
};

CubeGroup.prototype.constructor = CubeGroup;

/**
 * Automatically called by World.update
 */
CubeGroup.prototype.update = function() {
};

CubeGroup.prototype.add = function(cube) {
  cube.group = this;
  // this.cubeSprites.add(cube);
};

CubeGroup.prototype.handleCollision = function(origin, other) {
   // stop if other does not exist, either is not a cube, both are in same group
   if (other === null || origin.prototype !== other.prototype || origin.group === other.group) {
      return;
   }
   var relSide = this.relativeSide(origin.body, other.body);
   var originLoc = this.find(origin);
   var otherLoc = this.adjust(originLoc, relSide);
   if (this.getCube(otherLoc)) {
      return;
   }
   switch (relSide) {
      case this.DIR.NORTH:
      if (originLoc.y === this.cubesHeight() - 1) {
         this.addTopRow();
      }
      break;
      case this.DIR.EAST:
      if (originLoc.x === this.cubesWidth() - 1) {
         this.addRightCol();
      }
      break;
      case this.DIR.SOUTH:
      if (originLoc.y === 0) {
         this.addBotRow();
      }
      break;
      case this.DIR.WEST:
      if (originLoc.x === 0) {
         this.addLeftCol();
      }
      break;
   }
   originLoc = this.find(origin);
   otherLoc = this.adjust(originLoc, relSide);
   this.createConstraints(otherLoc, other);
   if (!otherLoc) {
      console.log('hande collision failed to find second other loc');
      return;
   }
   this.set(otherLoc, other);
   other.group = this;
   // this.displayCubes();
};

CubeGroup.prototype.createConstraints = function(loc, me) {
   // this.displayCubes();
   var myNorth = this.get(this.adjust(loc, this.DIR.NORTH));
   var myEast = this.get(this.adjust(loc, this.DIR.EAST));
   var mySouth = this.get(this.adjust(loc, this.DIR.SOUTH));
   var myWest = this.get(this.adjust(loc, this.DIR.WEST));
   if (myNorth) {
      this.game.physics.p2.createLockConstraint(me.body, myNorth.body, [0, me.width + this.offset]); // me - north
   }
   if (myEast) {
      this.game.physics.p2.createLockConstraint(me.body, myEast.body, [-me.width - this.offset, 0]); // me - east
   }
   if (mySouth) {
      this.game.physics.p2.createLockConstraint(mySouth.body, me.body, [0, me.width + this.offset]); // south - me
   }
   if (myWest) {
      this.game.physics.p2.createLockConstraint(myWest.body, me.body, [-me.width - this.offset, 0]); // west - me
   }
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
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         if (this.cubes[row][col] === cube) {
            return new Phaser.Point(row, col);
         }
      }
   }
   return undefined;
};

CubeGroup.prototype.get = function(point) {
  if (!point || this.outOfBounds(point)) {
      return;
  }
  return this.cubes[point.x][point.y];
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
   for (var row = 0; row < this.cubesWidth(); row++) {
      this.cubes[row].push(undefined);
   }
};

CubeGroup.prototype.addRightCol = function() {
   var newCol = [];
   for (var i = 0; i < this.cubesHeight(); i++) {
      newCol.push(undefined);
   }
   this.cubes.push(newCol);
};

CubeGroup.prototype.addBotRow = function() {
   for (var row = 0; row < this.cubesWidth(); row++) {
      this.cubes[row].unshift(undefined);
   }
};

CubeGroup.prototype.addLeftCol = function() {
   var newCol = new Array(this.cubesHeight());
   this.cubes.unshift(newCol);
};

CubeGroup.prototype.getCube = function(point) {
   if (!point || this.outOfBounds(point)) {
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

// [0,2] [1,2] [2,2]
// [0,1] [1,1] [2,1]
// [0,0] [1,0] [2,0]
CubeGroup.prototype.displayCubes = function() {
   console.log('================');
   var output = 'Display Cubes\n';
   var row = 0;
   var col = this.cubesHeight() - 1;
   while (col >= 0) {
      while (row < this.cubesWidth()) {
         var cube = this.cubes[row][col];
         if (cube) {
            output += '# ';
         } else {
            output += '_ ';
         }
         row++;
      }
      row = 0;
      col--;
      output += '\n';
   }
   console.log(output);
   console.log('---------------');
};

CubeGroup.prototype.displayConnection = function(connection) {
   var graph = new Astar.Graph(this.cubesToGraph());
   var startPoint = this.find(connection.start);
   var endPoint = this.find(connection.end);
   var start = graph.grid[startPoint.x][startPoint.y];
   var end = graph.grid[endPoint.x][endPoint.y];
   var result = Astar.astar.search(graph, start, end);
   result.unshift(start);
   var previous;
   for(var i = 0; i < result.length; i++) {
      var curPoint = new Phaser.Point(result[i].x, result[i].y);
      var cur = this.get(curPoint);
      var indicator = cur.cIndicator;
      var dir;
      var prevPoint;
      var nextPoint;
      if (!previous) {
         indicator.animations.play('end');
         nextPoint = new Phaser.Point(result[i+1].x, result[i+1].y);
         dir = this.dirBetween(curPoint, nextPoint);
         indicator.rotation = this.dirToAngle(dir);
      } else if (i === result.length - 1) {
         indicator.animations.play('end');
         prevPoint = new Phaser.Point(previous.x, previous.y);
         dir = this.dirBetween(curPoint, prevPoint);
         indicator.rotation = this.dirToAngle(dir);
      } else {
         indicator.animations.play('line');
         prevPoint = new Phaser.Point(previous.x, previous.y);
         var prevDir = this.dirBetween(curPoint, prevPoint);
         nextPoint = new Phaser.Point(result[i+1].x, result[i+1].y);
         var nextDir = this.dirBetween(curPoint, nextPoint);
         this.manageIndicator(indicator, prevDir, nextDir);
      }
      previous = result[i];
      cur.displayIndicator();
    }
};

CubeGroup.prototype.manageIndicator = function(indicator, prevDir, nextDir) {
  if (prevDir === this.DIR.NORTH && nextDir === this.DIR.SOUTH) { // 2
      indicator.rotation = Math.PI;
   } else if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.NORTH) { // 1
      indicator.rotation = 0;
   } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.WEST) { // 4
      indicator.rotation = 1 / 2 * Math.PI;
   } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.EAST) { // 3
      indicator.rotation = 3 / 2  * Math.PI;
   } else {
      indicator.animations.play('right');
      if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.EAST) { // 5
         indicator.rotation = 0;
      } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.SOUTH) { // 6
         indicator.rotation = 1 / 2 * Math.PI;
      } else if (prevDir === this.DIR.NORTH && nextDir === this.DIR.WEST) { // 7
         indicator.rotation = Math.PI;
      } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.NORTH) { // 8
         indicator.rotation = 3 / 2 * Math.PI;
      } else {
         indicator.scale.setTo(-Math.abs(indicator.scale.x), indicator.scale.y);
         if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.WEST) { // 9
            indicator.rotate = 0;
         } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.NORTH) { // 10
            indicator.rotation = 1 / 2 * Math.PI;
         } else if (prevDir === this.DIR.NORTH && nextDir === this.DIR.EAST) { // 11
            indicator.rotation = Math.PI;
         } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.SOUTH) { // 12
            indicator.rotation = 3 / 2 * Math.PI;
         }
      }
   } 
};

CubeGroup.prototype.cubesToGraph = function() {
  var graph = [];
  for (var row = 0; row < this.cubesWidth(); row++) {
     var newCol = [];
      for (var col = 0; col < this.cubesHeight(); col++) {
         if (this.cubes[row][col]) {
            newCol.push(1);
         } else {
            newCol.push(0);
         }
      }
      graph.push(newCol);
   }
   return graph;
};

// [0,0] [1,0] -> east
// [0,0] [0,1] -> north
// assumes neighbors
CubeGroup.prototype.dirBetween = function(a, b) {
   var deltaX = a.x - b.x;
   var deltaY = a.y - b.y;
   if (deltaX > 0) {
      return this.DIR.WEST;
   }
   if (deltaX < 0) {
      return this.DIR.EAST;
   }
   if (deltaY > 0) {
      return this.DIR.SOUTH;
   }
   if (deltaY < 0) {
      return this.DIR.NORTH;
   }
   return this.DIR.NORTH;
};

CubeGroup.prototype.dirToAngle = function(dir) {
  switch (dir) {
   case this.DIR.NORTH:
   return Math.PI;
   case this.DIR.EAST:
   return 3 / 2 * Math.PI;
   case this.DIR.SOUTH:
   return 0;
   case this.DIR.WEST:
   return 1 / 2 * Math.PI;
  }  
};

module.exports = CubeGroup;
















