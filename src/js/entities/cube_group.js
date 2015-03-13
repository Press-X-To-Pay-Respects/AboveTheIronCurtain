var Astar = require('../libs/javascript-astar/astar');
var EnemyAI = require('./enemy_ai');

/*
Defines a cube group.
*/

var CubeGroup = function (state, root) {
   this.state = state;
   this.game = this.state.game;
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
	this.activeHackerModules = [];	//list of hacker modules in this group
	this.moduleConnect = this.game.add.audio('moduleConnect');
	this.moduleConnect.allowMultiple = true;
   this.numCubes = 1;
   this.bounceBackForce = 30;
   this.minRamVel = 300;
   this.debug = false;
   this.debugHandleAttatch = false;
   this.debugCreateConstraints = false;
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

CubeGroup.prototype.callOnType = function(fun, type) {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && cube.hasOwnProperty(fun)) {
            // if cubes need functions called
         } else if (cube && cube.module && cube.module.type === type && cube.module.hasOwnProperty(fun)) {
            var fn = cube.module[fun];
            if (typeof fn === 'function') {
               fn.call(cube.module);
            }
         }
      }
   }
};

CubeGroup.prototype.getModules = function(type) {
   var modules = [];
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && cube.module.type === type) {
            modules.push(cube.module);
         }
      }
   }
   return modules;
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
};

CubeGroup.prototype.handleAttatch = function(origin, other) {
   if (this.debugHandleAttatch) { console.log('handleCollision() start:', origin.module.type, other.module.type); }
   if (this.debugHandleAttatch) { this.displayCubes(); }
   if (this.get(other)) {
      console.log('handleAttatch() was given a member');
      return;
   }
   var relSide = this.relativeSide(origin.body, other.body);
   var originLoc = this.find(origin);
   var otherLoc = this.calcPos(origin, relSide);
   this.moduleConnect.play();
   if (this.debugHandleAttatch) console.log('handleCollision() pre-find:', 'relSide:', relSide, 'originLoc:', Math.floor(originLoc.x), Math.floor(originLoc.y), 'otherLoc:', Math.floor(otherLoc.x), Math.floor(otherLoc.y)); // jshint ignore:line
   this.set(other, otherLoc);
   otherLoc = this.find(other); // update position since set can shift grid
   if (!otherLoc) {
      if (this.debugHandleAttatch) {
         console.log('handleCollision(): otherLoc DNE', '---------------------');
         this.displayCubes();
      }
      return;
   }
   var relativeNorth = this.relativeNorth(other); // other's north points this dir relative to the root
   if (this.debugHandleAttatch) { console.log('handleCollision() post-find:', 'otherLoc:', Math.floor(otherLoc.x), Math.floor(otherLoc.y), 'relativeNorth:', relativeNorth); }
   this.createConstraints(other, otherLoc, relativeNorth);
   if (other.module.type === 'solarPanel') {
      this.createConnectionFrom(other);
   } else if (other.module.powerable) {
      var spareSolarPanel = this.spareSolarPanel();
      if (spareSolarPanel) {
         spareSolarPanel.giveTarget(other.module);
      }
   }
   if (this.debugHandleAttatch) { this.displayCubes(); }
   if (this.debugHandleAttatch) { console.log('handleCollision() end:', '------------------------------'); }
};

CubeGroup.prototype.relativeNorth = function(cube) {
   var diffAngle = cube.body.rotation - this.root.body.rotation;
   var relative = this.angleToDir(diffAngle);
   return relative;
};

CubeGroup.prototype.createConnectionFrom = function(panel) {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && cube !== panel && !cube.myConnection && cube.module.powerable) {
            panel.module.giveTarget(cube.module);
            return;
         }
      }
   }
};

CubeGroup.prototype.spareSolarPanel = function() {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && !cube.myConnection && cube.module.type === 'solarPanel') {
            return cube.module;
         }
      }
   }
};

CubeGroup.prototype.handleRamming = function(origin, other) {
   if (!other.group || other.group === this) {
      return;
   }
   var sumVel = Math.abs(origin.body.velocity.x) + Math.abs(origin.body.velocity.y);
   if (this.debug) { console.log('handleRamming():', 'sumVel:', sumVel.toPrecision(4)); }
   if (sumVel >= this.minRamVel) {
      if (this.game.juicy) {
         this.game.juicy.shake();
      }
      other.takeDamage(3);
      this.call('thrusterHalt');
   }
};

CubeGroup.prototype.calcPos = function(origin, relSide) {
   var diffAngle = origin.body.rotation - this.root.body.rotation;
   var relative = this.angleToDir(diffAngle);
   var output = this.find(origin);
   if (!output) {
      return;
   }
   if (relative === 0) { // north relative to the root
      if (relSide === 0) {
         output.y++;
      } else if (relSide === 1) {
         output.x++;
      } else if (relSide === 2) {
         output.y--;
      } else if (relSide === 3) {
         output.x--;
      }
   } else if (relative === 1) { // east relative to root
      if (relSide === 0) {
         output.x++;
      } else if (relSide === 1) {
         output.y--;
      } else if (relSide === 2) {
         output.x--;
      } else if (relSide === 3) {
         output.y++;
      }
   } else if (relative === 2) { // south relative to root
      if (relSide === 0) {
         output.y--;
      } else if (relSide === 1) {
         output.x--;
      } else if (relSide === 2) {
         output.y++;
      } else if (relSide === 3) {
         output.x++;
      }
   } else if (relative === 3) { // west relative to root
      if (relSide === 0) {
         output.x--;
      } else if (relSide === 1) {
         output.y++;
      } else if (relSide === 2) {
         output.x++;
      } else if (relSide === 3) {
         output.y--;
      }
   }
   return output;
};

CubeGroup.prototype.angleToDir = function(angle) {
   if (angle >= 0) {
     angle %= 2 * Math.PI;
  } else {
     angle *= -1;
     angle %= 2 * Math.PI;
     angle *= -1;
  }
  if (this.debug) { console.log('angleToDir():', 'angle:', angle.toPrecision(4)); }
  if ((angle >= -1 / 4 * Math.PI && angle < 1 / 4 * Math.PI) || angle > 7 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case one NORTH'); }
     return this.DIR.NORTH;
  } else if (angle >= 1 / 4 * Math.PI && angle < 3 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case two EAST'); }
     return this.DIR.EAST;
  } else if (angle >= 3 / 4 * Math.PI && angle < 5 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case three SOUTH'); }
     return this.DIR.SOUTH;
  } else if (angle >= 5 / 4 * Math.PI && angle < 7 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case four WEST'); }
     return this.DIR.WEST;
  } else if (angle >= -3 / 4 * Math.PI && angle < -1 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case five WEST'); }
     return this.DIR.WEST;
  } else if (angle >= -5 / 4 * Math.PI && angle < -3 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case six SOUTH'); }
     return this.DIR.SOUTH;
  } else if (angle >= -7 / 4 * Math.PI && angle < -5 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case seven EAST'); }
     return this.DIR.EAST;
  } else if (angle < -7 / 4 * Math.PI) {
     if (this.debug) { console.log('angleToDir() case eight NORTH'); }
     return this.DIR.NORTH;
  }
};

CubeGroup.prototype.dirToNeighbourRelative = function(pointA, pointB) {
  if (pointA.x > pointB.x) { // neighbour is to the left
      return this.DIR.WEST;
  } else if (pointA.x < pointB.x) { // neighbour is to the right
      return this.DIR.EAST;
  } else if (pointA.y > pointB.y) { // neighbour is to below
     return this.DIR.SOUTH;
  } else { // neighbour is above
     return this.DIR.NORTH;
  }
};

CubeGroup.prototype.decideSideRelative = function(pointA, pointB, relativeNorth) {
  if (pointA.x > pointB.x) { // neighbour is to the left
   if (relativeNorth === this.DIR.NORTH) {
      return this.DIR.WEST;
   } else if (relativeNorth === this.DIR.EAST) {
      return this.DIR.SOUTH;
   } else if (relativeNorth === this.DIR.SOUTH) {
      return this.DIR.EAST;
   } else if (relativeNorth === this.DIR.WEST) {
      return this.DIR.NORTH;
   }
  } else if (pointA.x < pointB.x) { // neighbour is to the right
      if (relativeNorth === this.DIR.NORTH) {
         return this.DIR.EAST;
      } else if (relativeNorth === this.DIR.EAST) {
         return this.DIR.NORTH;
      } else if (relativeNorth === this.DIR.SOUTH) {
         return this.DIR.WEST;
      } else if (relativeNorth === this.DIR.WEST) {
         return this.DIR.SOUTH;
      }
  } else if (pointA.y > pointB.y) { // neighbour is to below
     if (relativeNorth === this.DIR.NORTH) {
         return this.DIR.SOUTH;
      } else if (relativeNorth === this.DIR.EAST) {
         return this.DIR.EAST;
      } else if (relativeNorth === this.DIR.SOUTH) {
         return this.DIR.NORTH;
      } else if (relativeNorth === this.DIR.WEST) {
         return this.DIR.WEST;
      }
  } else { // neighbour is above
     if (relativeNorth === this.DIR.NORTH) {
         return this.DIR.NORTH;
      } else if (relativeNorth === this.DIR.EAST) {
         return this.DIR.WEST;
      } else if (relativeNorth === this.DIR.SOUTH) {
         return this.DIR.SOUTH;
      } else if (relativeNorth === this.DIR.WEST) {
         return this.DIR.EAST;
      }
  }
};

CubeGroup.prototype.createConstraints = function(me, myPoint, relativeNorth) {
   var neighbours = this.getNeighbours(me);
   for (var i = 0; i < neighbours.length; i++) {
      var neighbour = neighbours[i];
      var neighbourPoint = this.find(neighbour);
      // var dirToNeighbourRelative = this.dirToNeighbourRelative(myPoint, neighbourPoint); // direction to neighbour relative to root
      var neighbourRelativeNorth = this.relativeNorth(neighbour);
      var mySide = this.decideSideRelative(myPoint, neighbourPoint, relativeNorth);
      var neighbourSide = this.decideSideRelative(neighbourPoint, myPoint, neighbourRelativeNorth);
      if (this.debugCreateConstraints) { console.log('createConstraints():', 'mySide:', mySide, 'neighbourSide:', neighbourSide); }
      var constraint;
      var offset = me.width + this.offset;
      if (mySide === 0) {
        if (neighbourSide === 0) {
           constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, offset], Math.PI);
        } else if (neighbourSide === 1) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, offset], 1 / 2 * Math.PI);
        } else if (neighbourSide === 2) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, offset], 0);
        } else if (neighbourSide === 3) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, offset], 3 / 2 * Math.PI);
        }
     } else if (mySide === 1) {
        if (neighbourSide === 0) {
           constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [-offset, 0], -1 / 2 * Math.PI);
        } else if (neighbourSide === 1) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [-offset, 0], Math.PI);
        } else if (neighbourSide === 2) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [-offset, 0], 1 / 2 * Math.PI);
        } else if (neighbourSide === 3) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [-offset, 0], 0);
        }
     } else if (mySide === 2) {
         if (neighbourSide === 0) {
           constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, -offset], 0);
        } else if (neighbourSide === 1) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, -offset], 3 / 2 * Math.PI);
        } else if (neighbourSide === 2) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, -offset], Math.PI);
        } else if (neighbourSide === 3) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [0, -offset], 1 / 2 * Math.PI);
        }
     } else if (mySide === 3) {
        if (neighbourSide === 0) {
           constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [offset, 0], 1 / 2 * Math.PI);
        } else if (neighbourSide === 1) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [offset, 0], 0);
        } else if (neighbourSide === 2) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [offset, 0], -1 / 2 * Math.PI);
        } else if (neighbourSide === 3) {
            constraint = this.game.physics.p2.createLockConstraint(me.body, neighbour.body, [offset, 0], Math.PI);
        }
     }
     me.constraints.push(constraint);
     neighbour.constraints.push(constraint);
   }
};

CubeGroup.prototype.relativeSide = function(thisBody, otherBody) {
  var thisPoint = new Phaser.Point(thisBody.x, thisBody.y);
  var otherPoint = new Phaser.Point(otherBody.x, otherBody.y);
  var angleToOther = this.angleBetweenPoints(thisPoint, otherPoint);
  var diffAngle = angleToOther - thisBody.rotation;
  var returnDir = this.angleToDir(diffAngle);
  if (this.debug) { console.log('relativeSide():', 'angleToOther:', angleToOther.toPrecision(4), 'thisBody.rotation:', thisBody.rotation.toPrecision(4), 'diffAngle:', diffAngle.toPrecision(4), 'returnDir:', returnDir); }
  return returnDir;
};

CubeGroup.prototype.angleBetweenPoints = function(thisPoint, otherPoint) {
  var angleToOther = Phaser.Point.angle(thisPoint, otherPoint);
  if (angleToOther < 0) { // fix dumb part of Phaser.Point.angle()
     angleToOther = 2 * Math.PI + angleToOther;
  }
  angleToOther = (angleToOther + 3/2 * Math.PI) % (2 * Math.PI); // rotate 90 d clockwise
   return angleToOther;
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
      if (this.debug) { console.log('add left col'); }
      this.addLeftCol();
      point.x = 0;
   } else if (point.x >= this.cubesWidth()) {
      if (this.debug) { console.log('add right col'); }
      this.addRightCol();
      point.x = this.cubesWidth() - 1;
   } else if (point.y < 0) {
      if (this.debug) { console.log('add bot row'); }
      this.addBotRow();
      point.y = 0;
   } else if (point.y >= this.cubesHeight()) {
      if (this.debug) { console.log('add top row'); }
      this.addTopRow();
      point.y = this.cubesHeight() - 1;
   }
   if (this.get(point)) {
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
   var output = 'displayCubes():\n';
   var row = 0;
   var col = this.cubesHeight() - 1;
   while (col >= 0) {
      while (row < this.cubesWidth()) {
         var cube = this.cubes[row][col];
         if (cube) {
            switch (cube.module.type) {
               case 'shield':
               output += 'S ';
               break;
               case 'core':
               output += 'C ';
               break;
               case 'thruster':
               output += 'T ';
               break;
               case 'solarPanel':
               output += 'P ';
               break;
               case 'hacker':
               output += 'H ';
               break;
               case 'gun':
               output += 'G ';
               break;
            }
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
};

CubeGroup.prototype.displayConnection = function(connection) {
   this.hideOtherConnections(connection);
   var graph = new Astar.Graph(this.cubesToGraph());
   var startPoint = this.find(connection.start);
   var endPoint = this.find(connection.end);
   if (!startPoint || !endPoint) {
      console.log('displayConnection failed to get points');
      return;
   }
   var start = graph.grid[startPoint.x][startPoint.y];
   var end = graph.grid[endPoint.x][endPoint.y];
   var result = Astar.astar.search(graph, start, end);
   result.unshift(start);
   var previous;
   for(var i = 0; i < result.length; i++) {
      var curPoint = new Phaser.Point(result[i].x, result[i].y);
      var curCube = this.get(curPoint);
      var indicator = curCube.cIndicator;
      var prevPoint;
      var nextPoint;
      var side;
      var prevCube;
      var nextCube;
      if (!previous) {
         indicator.animations.play('end');
         nextPoint = new Phaser.Point(result[i+1].x, result[i+1].y);
         nextCube = this.get(nextPoint);
         side = this.relativeSide(curCube.body, nextCube.body);
         indicator.rotation = this.dirToAngle(side);
      } else if (i === result.length - 1) {
         indicator.animations.play('end');
         prevPoint = new Phaser.Point(previous.x, previous.y);
         prevCube = this.get(prevPoint);
         side = this.relativeSide(curCube.body, prevCube.body);
         indicator.rotation = this.dirToAngle(side);
      } else {
         indicator.animations.play('line');
         prevPoint = new Phaser.Point(previous.x, previous.y);
         nextPoint = new Phaser.Point(result[i+1].x, result[i+1].y);
         prevCube = this.get(prevPoint);
         nextCube = this.get(nextPoint);
         var prevSide = this.relativeSide(curCube.body, prevCube.body);
         var nextSide = this.relativeSide(curCube.body, nextCube.body);
         this.manageIndicator(indicator, prevSide, nextSide);
      }
      previous = result[i];
      curCube.displayIndicator();
    }
};

CubeGroup.prototype.manageIndicator = function(indicator, prevDir, nextDir) {
  indicator.scale.setTo(Math.abs(indicator.scale.x), indicator.scale.y);
  if (prevDir === this.DIR.NORTH && nextDir === this.DIR.SOUTH) { // 2
      if (this.debug) { console.log('case 2'); }
      indicator.rotation = Math.PI;
   } else if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.NORTH) { // 1
      if (this.debug) { console.log('case 1'); }
      indicator.rotation = 0;
   } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.WEST) { // 4
      if (this.debug) { console.log('case 4'); }
      indicator.rotation = 1 / 2 * Math.PI;
   } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.EAST) { // 3
      if (this.debug) { console.log('case 3'); }
      indicator.rotation = 3 / 2  * Math.PI;
   } else {
      indicator.animations.play('right');
      if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.EAST) { // 5
         if (this.debug) { console.log('case 5'); }
         indicator.rotation = 0;
      } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.SOUTH) { // 6
         if (this.debug) { console.log('case 6'); }
         indicator.rotation = 1 / 2 * Math.PI;
      } else if (prevDir === this.DIR.NORTH && nextDir === this.DIR.WEST) { // 7
         if (this.debug) { console.log('case 7'); }
         indicator.rotation = Math.PI;
      } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.NORTH) { // 8
         if (this.debug) { console.log('case 8'); }
         indicator.rotation = 3 / 2 * Math.PI;
      } else {
         indicator.scale.setTo(-Math.abs(indicator.scale.x), indicator.scale.y);
         if (prevDir === this.DIR.SOUTH && nextDir === this.DIR.WEST) { // 9
            if (this.debug) { console.log('case 9'); }
            indicator.rotation = 0;
         } else if (prevDir === this.DIR.WEST && nextDir === this.DIR.NORTH) { // 10
            if (this.debug) { console.log('case 10'); }
            indicator.rotation = 1 / 2 * Math.PI;
         } else if (prevDir === this.DIR.NORTH && nextDir === this.DIR.EAST) { // 11
            if (this.debug) { console.log('case 11'); }
            indicator.rotation = Math.PI;
         } else if (prevDir === this.DIR.EAST && nextDir === this.DIR.SOUTH) { // 12
            if (this.debug) { console.log('case 12'); }
            indicator.rotation = 3 / 2 * Math.PI;
         }
      }
   } 
};

CubeGroup.prototype.hideOtherConnections = function(exception) {
   for (var row = 0; row < this.cubesWidth(); row++) {
      for (var col = 0; col < this.cubesHeight(); col++) {
         var cube = this.cubes[row][col];
         if (cube && cube.myConnection && cube.myConnection !== exception) {
            cube.hideIndicator();
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
  var loc = this.find(cube);
  if (!loc) {
     console.log('attempt to destroy cube not in group');
     return;
  }
  // remove cube from group
  this.remove(cube);
  // destroy cube
  if(cube.key === 'core' && cube.tag === 'module') {
	cube.kill();
	this.state.levelSetup.restartLevel();
  }
  cube.destroy(true);
};

CubeGroup.prototype.remove = function(cube) {
   if (this.debug) { console.log('remove()'); }
   if (this.root === cube) {
      return;
   }
   // remove cube from array
   var row, col;
   for (row = 0; row < this.cubesWidth(); row++) {
      for (col = 0; col < this.cubesHeight(); col++) {
         if (this.cubes[row][col] === cube) {
            cube.group = undefined;
            cube.tag = 'module';
            this.cubes[row][col] = undefined;
            break;
         }
      }
   }
   //If this is an active module, splice it from the active list
   if(cube.module.isActive){
	   if(cube.module.type === 'hacker') {
			var hackIndex = this.activeHackerModules.indexOf(cube.module);
			this.activeHackerModules.splice(hackIndex, 1);
	   }
	   cube.module.isActive = false;
   }
   //set sprite of cube to greyed if necisarry
   if(cube.module.type === 'thruster' || cube.module.type === 'gun' || cube.module.type === 'hacker') {
		cube.frame = 0;
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
   if (this.debug) { this.displayCubes(); }
};

CubeGroup.prototype.removeneighboursConstraint = function(constraint, cube) {
   // console.log('removeneighboursConstraint');
   var neighbours = this.getNeighbours(cube);
   for (var i = 0; i < neighbours.length; i++) {
      var neighbour = neighbours[i];
      for (var j = 0; j < neighbour.constraints.length; j++) {
         if (neighbour.constraints[j] === constraint) {
            neighbour.constraints.splice(j, 1);
         }
      }
   }
};

CubeGroup.prototype.getNeighbours = function(cube) {
   var loc = this.find(cube);
   var north = this.get(this.adjust(loc, this.DIR.NORTH));
   var east = this.get(this.adjust(loc, this.DIR.EAST));
   var south = this.get(this.adjust(loc, this.DIR.SOUTH));
   var west = this.get(this.adjust(loc, this.DIR.WEST));
   var neighbours = [];
   if (north) {
      neighbours.push(north);
   }
   if (east) {
      neighbours.push(east);
   }
   if (south) {
      neighbours.push(south);
   }
   if (west) {
      neighbours.push(west);
   }
   return neighbours;
};

CubeGroup.prototype.removeConstraints = function(cube) {
   // console.log('removeConstraints');
   while (cube.constraints.length > 0) {
      this.removeneighboursConstraint(cube.constraints[0], cube);
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
















