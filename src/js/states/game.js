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
    this.game.physics.p2.setImpactEvents(true);
    mouseBody = new p2.Body(); // jshint ignore:line
    this.game.physics.p2.world.addBody(mouseBody);
    this.placeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
    this.placeKey.onDown.add(this.placeCube, this);
    
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.input.onDown.add(this.click, this);
    this.input.onUp.add(this.release, this);
    this.input.addMoveCallback(this.move, this);
    this.grabbed = undefined;
    this.line = new Phaser.Line(0, 0, 0, 0);
    
    this.rootSpawned = false;
    
    this.debugNum = 0;
    this.myRoot = undefined;
    
     // var thisPoint = new Phaser.Point(10, 10);
     // var otherPoint = new Phaser.Point(10, 11);
     // var angleToOther = Phaser.Point.angle(thisPoint, otherPoint);
     // console.log(angleToOther);
     
     // var polygonTest = this.game.add.sprite(60, 60, 'testsprite');
     // this.game.physics.p2.enableBody(polygonTest, true);
     // polygonTest.body.clearShapes();
     // polygonTest.body.loadPolygon('module_physics', 'test2');
  },

  update: function () {
    if (this.grabbed) {
      var angle = Math.atan2(this.grabbed.sprite.y - this.input.position.y, this.grabbed.sprite.x - this.input.position.x) + Math.PI;
      var dist = Utils.distance(this.grabbed.sprite.x, this.grabbed.sprite.y, this.input.position.x, this.input.position.y);
      var weight = 10;
      this.grabbed.force.x = Math.cos(angle) * dist * weight;
      this.grabbed.force.y = Math.sin(angle) * dist * weight;
      this.line.setTo(this.grabbed.sprite.x, this.grabbed.sprite.y, this.input.position.x, this.input.position.y);
    } else {
       this.line.setTo(0, 0, 0, 0);
    }
  },
  
  render: function () {
    this.game.debug.geom(this.line);
  },

  click: function (pointer) {
    // console.log(this.grabbed);
    var bodies = this.game.physics.p2.hitTest(pointer.position);
    if (bodies.length)
    {
        this.grabbed = bodies[0].parent;
        //console.log(this.grabbed.sprite.name, this.grabbed.sprite.north, this.grabbed.sprite.east, this.grabbed.sprite.south, this.grabbed.sprite.west);
        console.log(this.grabbed.sprite.toString());
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
    this.mouseX = pointer.position.x;
    this.mouseY = pointer.position.y;
  },
  
  placeCube: function () {
    var entity = new Cube(this.game, this.mouseX, this.mouseY);
    var scale = 0.5;
    entity.name = this.debugNum++;
    entity.scale.x = scale;
    entity.scale.y = scale;
    entity.anchor.setTo(0.5, 0.5);
    this.game.physics.p2.enable(entity, true);
    entity.body.onBeginContact.add(entity.cubeCollide, entity);
    entity.body.damping = 0.9;
    entity.body.angularDamping = 0.9;
    if (!this.rootSpawned) {
       entity.root = true;
       this.rootSpawned = true;
    }
  }
};



























