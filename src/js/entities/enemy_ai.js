var Utils = require('../utils.js');

var EnemyAI = function(game, group, type, playerGroup) {
   this.game = game;
   this.group = group;
   this.type = type;
   this.playerGroup = playerGroup;
   this.player = this.playerGroup.root;
   this.ramDist = 500;
   this.bootupTime = 5000;
   this.rotationForce = 50;
   this.facingAllowance = Math.PI / 20;
   this.thrustersFiring = false;
   switch (this.type) {
      case 'ram':
      this.allocateToThrusters();
      break;
   }
};

EnemyAI.prototype.constructor = EnemyAI;

EnemyAI.prototype.update = function() {
   if (this.bootupTime > 0) {
      // console.log(this.bootupTime);
      this.bootupTime -= this.game.time.elapsed;
      return;
   }
   switch (this.type) {
      case 'ram':
      this.ramUpdate();
      break;
   }
};

EnemyAI.prototype.ramUpdate = function() {
   if (!this.group.root) {
      return;
   }
   var root = this.group.root;
   var myPos = new Phaser.Point(root.x, root.y);
   var playerPos = new Phaser.Point(this.player.x, this.player.y);
   var dist = Utils.distance(myPos.x, myPos.y, playerPos.x, playerPos.y);
   if (dist <= this.ramDist) {
      var angleTo = this.angleTo(myPos, playerPos);
      var diffAngle = angleTo - root.body.rotation;
      if (diffAngle > 0) {
         root.body.angularForce = this.rotationForce;
      } else {
         root.body.angularForce = -this.rotationForce;
      }
      if (Math.abs(diffAngle) <= this.facingAllowance && !this.thrustersFiring) {
         // this.game.events.thrustersFire.dispatch(this.group);
         this.group.call('beginThrust');
         this.thrustersFiring = true;
         this.allocateToThrusters();
      } else if (Math.abs(diffAngle) > this.facingAllowance && this.thrustersFiring){
         // this.game.events.thrustersHalt.dispatch(this.group);
         this.group.call('endThrust');
         this.thrustersFiring = false;
      }
   }
};

EnemyAI.prototype.allocateToThrusters = function() {
   var panels = [];
   var thrusters = [];
   for (var row = 0; row < this.group.cubesWidth(); row++) {
      for (var col = 0; col < this.group.cubesHeight(); col++) {
         var cube = this.group.cubes[row][col];
         if (cube && cube.module) {
            if (cube.module.type === 'solarPanel' && !cube.myConnection) {
               panels.push(cube.module);
            } else if (cube.module.type === 'thruster' && !cube.myConnection) {
               thrusters.push(cube.module);
            }
         }
      }
   }
   var i = 0;
   while (i < thrusters.length && i < panels.length) {
      var tarPanel = panels[i];
      var tarThruster = thrusters[i];
      var newConnection = {start: tarPanel.cube, end: tarThruster.cube};
      tarPanel.cube.myConnection = newConnection;
      tarThruster.cube.myConnection = newConnection;
      this.group.displayConnection(tarPanel.cube.myConnection);
      i++;
   }
};

EnemyAI.prototype.angleTo = function(from, to) {
  var angleToOther = Phaser.Point.angle(from, to);
  if (angleToOther < 0) { // fix dumb part of Phaser.Point.angle()
     angleToOther = 2 * Math.PI + angleToOther;
  }
  angleToOther = (angleToOther + 3/2 * Math.PI) % (2 * Math.PI); // rotate 90 d clockwise
  return angleToOther;
};

/*
EnemyAI.prototype.lerp = function(a, b, f) {
    return a + f * (b - a);
};
*/

module.exports = EnemyAI;










