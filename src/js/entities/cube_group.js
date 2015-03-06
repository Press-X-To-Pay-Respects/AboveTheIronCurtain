var Astar = require('../libs/javascript-astar/astar');
var EnemyAI = require('./enemy_ai');

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
   if (this.root) {
      this.root.group = this;
   }
   this.DIR = {NORTH: 0, EAST: 1, SOUTH: 2, WEST: 3};
   this.offset = 2;
   this.numCubes = 1;
};

CubeGroup.prototype.constructor = CubeGroup;

/**
 * Automatically called by World.update
 */
CubeGroup.prototype.update = function() {
   if (this.AI) {
      this.AI.update();
   }
};

CubeGroup.prototype.call = function(fun) {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && cube.hasOwnProperty(fun)) {
            // if cubes need functions called
         } else if (cube && cube.module && cube.module.hasOwnProperty(fun)) {
            var fn = cube.module[fun];
            if (typeof fn === 'function') {
               fn.call(cube.module);
            }
         }
      }
   }
};

CubeGroup.prototype.giveAI = function(type, player) {
   this.AI = new EnemyAI(this.game, this, type, player);
};

CubeGroup.prototype.add = function(cube, point) {
  if (!this.root && cube.module.type === 'core') {
     this.root = cube;
  }
  cube.group = this;
  this.set(cube, point);
  this.createConstraints(cube, point);
  // this.displayCubes();
};

CubeGroup.prototype.handleCollision = function(origin, other) {
   // stop if other does not exist, either is not a cube, both are in same group
   if (other === null || origin.prototype !== other.prototype) {
      return;
   }
   if (other.group && other.group !== this && origin.ramDelay <= 0) {
      console.log(origin.name, 'ramming damage!');
      other.takeDamage(1);
      origin.resetRamDelay();
   } else if (!other.group) {
      var relSide = this.relativeSide(origin.body, other.body);
      var originLoc = this.find(origin);
      var otherLoc = this.adjust(originLoc, relSide);
      this.set(other, otherLoc);
      otherLoc = this.find(other); // update position since set can shift grid
      if (!otherLoc) {
         // console.log('handle collision failed to find position for good applicant');
         return;
      }
      this.createConstraints(other, otherLoc);
      // console.log(other.body.collidesWith);
      // this.displayCubes();
   }
};

CubeGroup.prototype.createConstraints = function(me, point) {
   // this.displayCubes();
   var myNorth = this.get(this.adjust(point, this.DIR.NORTH));
   var myEast = this.get(this.adjust(point, this.DIR.EAST));
   var mySouth = this.get(this.adjust(point, this.DIR.SOUTH));
   var myWest = this.get(this.adjust(point, this.DIR.WEST));
   var constraint;
   if (myNorth) {
      constraint = this.game.physics.p2.createLockConstraint(me.body, myNorth.body, [0, me.width + this.offset]); // me - north
      me.constraints.push(constraint);
      myNorth.constraints.push(constraint);
   }
   if (myEast) {
      constraint = this.game.physics.p2.createLockConstraint(me.body, myEast.body, [-me.width - this.offset, 0]); // me - east
      me.constraints.push(constraint);
      myEast.constraints.push(constraint);
   }
   if (mySouth) {
      constraint = this.game.physics.p2.createLockConstraint(mySouth.body, me.body, [0, me.width + this.offset]); // south - me
      me.constraints.push(constraint);
      mySouth.constraints.push(constraint);
   }
   if (myWest) {
      constraint = this.game.physics.p2.createLockConstraint(myWest.body, me.body, [-me.width - this.offset, 0]); // west - me
      me.constraints.push(constraint);
      myWest.constraints.push(constraint);
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
  var diffAngle = Math.abs(Math.abs(angleToOther) - Math.abs(thisBody.rotation));
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

/*
CubeGroup.prototype.setRotation = function(rotation) {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         this.cubes[row][col].body.rotation = rotation;
      }
   }
   this.root.body.rotation = rotation;
};
*/

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

CubeGroup.prototype.set = function(cube, point) {
   if (!point) {
      console.log('set given undefined point');
      return;
   }
   if (point.x < 0) {
      this.addLeftCol();
      point.x = 0;
   } else if (point.x >= this.cubesWidth()) {
      this.addRightCol();
      point.x = this.cubesWidth() - 1;
   } else if (point.y < 0) {
      this.addBotRow();
      point.y = 0;
   } else if (point.y >= this.cubesHeight()) {
      this.addTopRow();
      point.y = this.cubesHeight() - 1;
   }
   if (this.get(point)) {
      // console.log('tried to set to filled position');
      return;
   }
   this.cubes[point.x][point.y] = cube;
   cube.group = this;
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
  indicator.scale.setTo(Math.abs(indicator.scale.x), indicator.scale.y);
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
            indicator.rotation = 0;
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

CubeGroup.prototype.destroyCube = function(cube) {
  // console.log('destroyCube');
  var loc = this.find(cube);
  if (!loc) {
     console.log('attempt to destroy cube not in group');
     return;
  }
  // remove cube from group
  this.remove(cube);
  // destroy cube
  cube.kill(true);
};

CubeGroup.prototype.remove = function(cube) {
   // console.log('remove');
   if (this.root === cube) {
      return;
   }
   // remove cube from array
   var row, col;
   for (row = 0; row < this.cubesWidth(); row++) {
      for (col = 0; col < this.cubesHeight(); col++) {
         if (this.cubes[row][col] === cube) {
            // this.cubes[row][col].group = undefined;
            this.cubes[row][col] = undefined;
            break;
         }
      }
   }
   // remove constraints from cube
   this.removeConstraints(cube);
   cube.group = undefined;
   if (cube.module && cube.module.hasOwnProperty('onRemove')) {
      cube.module.onRemove();
   }
   // test for exiles
   for (row = 0; row < this.cubesWidth(); row++) {
      for (col = 0; col < this.cubesHeight(); col++) {
         var exile = this.cubes[row][col];
         if (exile && this.isExile(exile)) {
            this.remove(exile);
         }
      }
   }
   // this.displayCubes();
};

CubeGroup.prototype.removeNeighborsConstraint = function(constraint, cube) {
   // console.log('removeNeighborsConstraint');
   var neighbors = this.getNeighbors(cube);
   for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];
      for (var j = 0; j < neighbor.constraints.length; j++) {
         if (neighbor.constraints[j] === constraint) {
            neighbor.constraints.splice(j, 1);
         }
      }
   }
};

CubeGroup.prototype.getNeighbors = function(cube) {
   var loc = this.find(cube);
   var north = this.get(this.adjust(loc, this.DIR.NORTH));
   var east = this.get(this.adjust(loc, this.DIR.EAST));
   var south = this.get(this.adjust(loc, this.DIR.SOUTH));
   var west = this.get(this.adjust(loc, this.DIR.WEST));
   var neighbors = [];
   if (north) {
      neighbors.push(north);
   }
   if (east) {
      neighbors.push(east);
   }
   if (south) {
      neighbors.push(south);
   }
   if (west) {
      neighbors.push(west);
   }
   return neighbors;
};

CubeGroup.prototype.removeConstraints = function(cube) {
   // console.log('removeConstraints');
   while (cube.constraints.length > 0) {
      this.removeNeighborsConstraint(cube.constraints[0], cube);
      this.game.physics.p2.removeConstraint(cube.constraints[0]);
      cube.constraints.splice(0, 1);
   }
};

// only used to test Astar
CubeGroup.prototype.testPath = function() {
  var graph = new Astar.Graph([
        [1,1,1,1],
        [0,1,1,0],
        [0,0,0,1]
    ]);
   var start = graph.grid[0][0];
   var end = graph.grid[2][3];
   var result = Astar.astar.search(graph, start, end);
   result.unshift(start);
   for(var i = 0; i < result.length; i++) {
      console.log(result[i].x, result[i].y);
    } 
};

CubeGroup.prototype.isExile = function(cube) {
   if (cube === this.root) {
      return;
   }
   var graph = new Astar.Graph(this.cubesToGraph());
   var startPoint = this.find(this.root);
   var endPoint = this.find(cube);
   var start = graph.grid[startPoint.x][startPoint.y];
   var end = graph.grid[endPoint.x][endPoint.y];
   var result = Astar.astar.search(graph, start, end);
   // if no path is found, the cube is an exile
   if (result.length === 0) {
      return true;
   }
   return false;
};

CubeGroup.prototype.countCubes = function() {
	var row, col;
	var num  = 0;
	for (row = 0; row < this.cubesWidth(); row++) {
		for (col = 0; col < this.cubesHeight(); col++) {
			if (this.cubes[row][col] !== undefined) {
				num++;
			}
		}
	}
	//console.log(num);
	this.numCubes = num;
};

module.exports = CubeGroup;
















