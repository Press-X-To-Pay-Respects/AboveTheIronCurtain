var Utils = require('../utils.js');

var EnemyAI = function(game, group, type, playerGroup) {
   this.game = game;
   this.group = group;
   this.type = type;
   this.playerGroup = playerGroup;
   this.player = this.playerGroup.root;
   this.ramDist = 500;
   this.bootupTime = 40000;
   this.rotationForce = 50;
   this.facingAllowance = Math.PI / 20;
   this.thrustersFiring = false;
};

EnemyAI.prototype.constructor = EnemyAI;

EnemyAI.prototype.update = function() {
   if (this.bootupTime > 0) {
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
      } else if (Math.abs(diffAngle) > this.facingAllowance && this.thrustersFiring){
         // this.game.events.thrustersHalt.dispatch(this.group);
         this.group.call('endThrust');
         this.thrustersFiring = false;
      }
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










