var Utils = require('../utils.js');

var Mouse = function(game, input, playerGroup) {
   this.game = game;
   this.input = input;
	this.body = new p2.Body(); // jshint ignore:line
   this.game.physics.p2.world.addBody(this.body);
   this.input.onDown.add(this.click, this);
   this.input.onUp.add(this.release, this);
   this.input.addMoveCallback(this.move, this);
   this.x = 0;
   this.y = 0;
   this.grabbed = undefined;
   this.lastClicked = undefined;
   this.line = new Phaser.Line(0, 0, 0, 0);
   this.removeThreshold = 40; // distance you must pull to remove module
   this.removeDist = 0; // distance you are pulling
   this.playerGroup = playerGroup;
   // keys
   this.ccwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
	this.cwKey = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
};

Mouse.prototype.constructor = Mouse;

Mouse.prototype.update = function() {
   if (this.grabbed && this.grabbed.sprite) {
      var angle = Math.atan2(this.grabbed.sprite.y - (this.input.position.y + this.game.camera.y), this.grabbed.sprite.x - (this.input.position.x+ this.game.camera.x)) + Math.PI;
      var dist = Utils.distance(this.grabbed.sprite.x, this.grabbed.sprite.y, (this.input.position.x+ this.game.camera.x), (this.input.position.y + this.game.camera.y));
      var weight;
	  if(this.grabbed.sprite.key === 'asteroid') {
		weight = 1;
	  }
	  else {
		weight = 10;
	  }
	  if (!this.grabbed.sprite.group) {
         this.grabbed.force.x = Math.cos(angle) * dist * weight;
         this.grabbed.force.y = Math.sin(angle) * dist * weight;
      }
      this.line.setTo(this.grabbed.sprite.x, this.grabbed.sprite.y, (this.input.position.x+ this.game.camera.x), (this.input.position.y + this.game.camera.y));
      var deltaX = this.grabbed.sprite.x - this.x;
	  var deltaY = this.grabbed.sprite.y - this.y;
	  this.removeDist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
      if(this.grabbed.sprite.tag === 'module') {
		  if (this.removeDist >= this.removeThreshold && this.grabbed.sprite.key !== 'asteroid') {
			 this.grabbed.sprite.remove();
		  }
	  }
    } else {
       this.line.setTo(0, 0, 0, 0);
    }
    var point = new Phaser.Point(this.x, this.y);
    var bodies = this.game.physics.p2.hitTest(point);
    if (bodies.length)
    {
        var hover = bodies[0].parent;
        if (hover.sprite.module && hover.sprite.module.mouseOver) {
           hover.sprite.module.mouseOver();
        }
    }
    // rotate
   if(this.ccwKey.isDown) {
		if(this.grabbed !== undefined && this.grabbed.sprite.group === undefined) {
			this.grabbed.angularForce += -5;
		}
	}
	if(this.cwKey.isDown) {
		if(this.grabbed !== undefined && this.grabbed.sprite.group === undefined) {
			this.grabbed.angularForce += 5;
		}
	}
};

Mouse.prototype.click = function(pointer) {
   var point = new Phaser.Point(pointer.x + this.game.camera.x, pointer.y + this.game.camera.y);
   var bodies = this.game.physics.p2.hitTest(point);
   if (bodies.length)
   {
     var temp = bodies[0].parent;
     this.grabbed = temp;
     if (this.grabbed.sprite.module && this.grabbed.sprite.module.hasOwnProperty('mouseDown')) {
       this.grabbed.sprite.module.mouseDown();
     }
     if (this.lastClicked && this.lastClicked.sprite && this.lastClicked.sprite.module &&
     this.lastClicked.sprite.module.giveTarget) {
        this.lastClicked.sprite.module.giveTarget(this.grabbed.sprite.module);
     }
     if (temp.sprite && temp.sprite.module && temp.sprite.module.type === 'core') {
        this.grabbed = undefined;
     }
     if (temp.sprite && temp.sprite.group && temp.sprite.group !== this.playerGroup) {
        this.grabbed = undefined;
     }
     this.lastClicked = temp;
   }
   
   //create sprite overlay to show selection
   if(this.grabbed && this.grabbed.sprite.key !== 'asteroid') {
		this.selected = this.game.add.sprite(0, 0, 'selected');
		this.grabbed.sprite.addChild(this.selected);
		this.selected.x = 0 - this.grabbed.sprite.width;
		this.selected.y = 0 - this.grabbed.sprite.height;
		this.selected.bringToTop();
   }
};
  
 Mouse.prototype.release = function() {
   if (this.grabbed && this.grabbed.sprite.key !== 'asteroid') {
		//destroy selected sprite
		this.grabbed.sprite.removeChild(this.selected);
		this.selected.destroy();
		this.grabbed = undefined;
   }
};

Mouse.prototype.move = function(pointer) {
   // p2 uses different coordinate system, so convert the pointer position to p2's coordinate system
   this.body.position[0] = this.game.physics.p2.pxmi(pointer.position.x);
   this.body.position[1] = this.game.physics.p2.pxmi(pointer.position.y);
   this.x = pointer.position.x + this.game.camera.x;
   this.y = pointer.position.y + this.game.camera.y;
};

Mouse.prototype.render = function() {
   //this.game.debug.geom(this.line);
};

module.exports = Mouse;














