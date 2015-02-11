/*
Main testing environment.
*/

var Cube = require('../entities/cube');

var Utils = require('../utils');

var mouseBody; // physics body for mouse

var Game = function () {
  this.testentity = null;
};

module.exports = Game;

Game.prototype = {

  create: function () {
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    mouseBody = new p2.Body(); // jshint ignore:line
    this.game.physics.p2.world.addBody(mouseBody);
    
    var x = (this.game.width / 2) - 100;
    var y = (this.game.height / 2) - 50;

    this.testentity = new Cube(this.game, x, y);
    this.testentity.anchor.setTo(0.5, 0.5);
    this.game.physics.p2.enable(this.testentity);
    this.testentity.body.damping = 0.9;
    this.scale = 0.5;
    this.testentity.scale.x = this.scale;
    this.testentity.scale.y = this.scale;
    
    this.input.onDown.add(this.click, this);
    this.input.onUp.add(this.release, this);
    this.input.addMoveCallback(this.move, this);
    this.grabbed = undefined;
    this.line = new Phaser.Line(this.testentity.x, this.testentity.y, this.input.position.x, this.input.position.y);
  },

  update: function () {
    if (this.grabbed) {
      var angle = Math.atan2(this.grabbed.sprite.y - this.input.position.y, this.grabbed.sprite.x - this.input.position.x) + Math.PI;
      var dist = Utils.distance(this.grabbed.sprite.x, this.grabbed.sprite.y, this.input.position.x, this.input.position.y);
      var weight = 10;
      this.grabbed.force.x = Math.cos(angle) * dist * weight;
      this.grabbed.force.y = Math.sin(angle) * dist * weight;
      this.line.setTo(this.testentity.x, this.testentity.y, this.input.position.x, this.input.position.y);
    } else {
       this.line.setTo(0, 0, 0, 0);
    }
  },
  
  render: function () {
    this.game.debug.geom(this.line);
  },

  click: function (pointer) {
    var bodies = this.game.physics.p2.hitTest(pointer.position, [ this.testentity.body ]);
    if (bodies.length)
    {
        this.grabbed = bodies[0].parent;
    }
  },
  
  release: function () {
     if (this.grabbed) {
        this.grabbed = undefined;
     }
  },
  
  move: function (pointer) {
    // p2 uses different coordinate system, so convert the pointer position to p2's coordinate system
    mouseBody.position[0] = this.game.physics.p2.pxmi(pointer.position.x);
    mouseBody.position[1] = this.game.physics.p2.pxmi(pointer.position.y);
  }
};



























