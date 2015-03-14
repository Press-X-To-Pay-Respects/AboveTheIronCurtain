var Utils = require('../utils.js');

var EnemyAI = function(game, group, type, playerGroup) {
   this.game = game;
   this.group = group;
   this.type = type;
   this.playerGroup = playerGroup;
   this.player = this.playerGroup.root;
   this.ramDist = 750;
   this.shootDist = 750;
   this.rotationForce = 125;
   this.facingAllowance = Math.PI / 15;
   this.acting = false;
   switch (this.type) {
      case 'ram':
      this.allocateTo('thruster');
      break;
      case 'shoot':
      this.allocateTo('gun');
   }
};

EnemyAI.prototype.constructor = EnemyAI;

EnemyAI.prototype.update = function() {
   switch (this.type) {
      case 'ram':
      this.customUpdate('thruster', this.ramDist);
      break;
      case 'shoot':
      this.customUpdate('gun', this.shootDist);
   }
};

EnemyAI.prototype.customUpdate = function(type, threshold) {
   if (!this.group.root) {
      return;
   }
   else if(!this.group.root.body) {
		return;
   }
   var root = this.group.root;
   var myPos = new Phaser.Point(root.x, root.y);
   var playerPos = new Phaser.Point(this.player.x, this.player.y);
   var dist = Utils.distance(myPos.x, myPos.y, playerPos.x, playerPos.y);
   if (dist <= threshold) {
      var angleTo = this.angleTo(myPos, playerPos);
      var diffAngle = angleTo - root.body.rotation;
      if (diffAngle > 0) {
         root.body.angularForce = this.rotationForce;
      } else {
         root.body.angularForce = -this.rotationForce;
      }
      if (Math.abs(diffAngle) <= this.facingAllowance && !this.acting) {
         // this.group.call('beginAct');
         this.group.callOnType('beginAct', type);
         this.acting = true;
         // this.allocateTo(type);
      } else if (Math.abs(diffAngle) > this.facingAllowance && this.acting){
         // this.group.call('endAct');
         this.group.callOnType('endAct', type);
         this.acting = false;
      }
   }
};

EnemyAI.prototype.allocateTo = function(type) {
   var panels = [];
   var types = [];
   for (var row = 0; row < this.group.cubesWidth(); row++) {
      for (var col = 0; col < this.group.cubesHeight(); col++) {
         var cube = this.group.cubes[row][col];
         if (cube && cube.module) {
            if (cube.module.type === 'solarPanel' && !cube.myConnection) {
               panels.push(cube.module);
            } else if (cube.module.type === type && !cube.myConnection) {
               types.push(cube.module);
            }
         }
      }
   }
   var i = 0;
   while (i < types.length && i < panels.length) {
      var tarPanel = panels[i];
      var tarType = types[i];
      var newConnection = {start: tarPanel.cube, end: tarType.cube};
      tarPanel.cube.myConnection = newConnection;
      tarType.cube.myConnection = newConnection;
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

module.exports = EnemyAI;










