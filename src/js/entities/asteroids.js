var Asteroids = function(state, simplify) {
   // initialise
	this.state = state;
   this.simplify = simplify;
   this.game = this.state.game;
   this.cam = this.game.camera;
   this.numRoids = 0;
   this.maxRoids = 100;
   this.asteroids = this.game.add.group();
	this.asteroids.enableBody = true;
	this.asteroids.physicsBodyType = Phaser.Physics.P2JS;
	this.asteroidList = new Phaser.ArraySet();
	if (!this.simplify) { this.generateAsteroids(); }
   this.generateAsteroids();
};

Asteroids.prototype.constructor = Asteroids;

Asteroids.prototype.update = function() {
   
};

Asteroids.prototype.generateAsteroids = function() {
  for(; this.numRoids < this.maxRoids; this.numRoids++) {
      var randX = this.game.rnd.integerInRange(0, this.game.world.width);
      var randY = this.game.rnd.integerInRange(0, this.game.world.height);
      /* TODO: prevent collision spawning
      while(randX < this.coreModule.cube.x - (this.player.cubesWidth() / 2 + 100) && randX > this.coreModule.cube.x + (this.player.cubesWidth() / 2 + 100) &&
      randY < this.coreModule.cube.y - (this.player.cubesHeight() / 2 + 100) && randY > this.coreModule.cube.y + (this.player.cubesHeight() / 2 + 100)) {
         randX = this.game.rnd.integerInRange(0, this.game.world.width);
         randY = this.game.rnd.integerInRange(0, this.game.world.height);
      }
      */
      var asteroid = this.asteroids.create(randX, randY, 'asteroid');
      asteroid.body.clearShapes(); 
      asteroid.body.loadPolygon('asteroidPolygon', 'asteroid'); //Change the collision detection from an AABB to a polygon
      asteroid.body.damping = this.game.rnd.realInRange(0, 0.3) * this.game.rnd.integerInRange(0, 1) * this.game.rnd.integerInRange(0, 1);
      asteroid.body.rotation = this.game.rnd.realInRange(0, 2 * Math.PI);
      asteroid.body.force.x = this.game.rnd.integerInRange(-10, 10) * 750;
      asteroid.body.force.y = this.game.rnd.integerInRange(-10, 10) * 750;
      asteroid.body.setCollisionGroup(this.state.collisionGroup);
      asteroid.body.collides(this.state.collisionGroup);
      asteroid.body.collideWorldBounds = false;
      asteroid.autoCull = true;
      asteroid.checkWorldBounds = true;
      asteroid.events.onOutOfBounds.add(this.resetAsteroid, {caller: this, asteroid: asteroid});
      this.asteroidList.add(asteroid);
   }
};

Asteroids.prototype.resetAsteroid = function() {
   var randX = this.caller.game.rnd.integerInRange(0, this.caller.game.world.width);
   var randY = this.caller.game.rnd.integerInRange(0, this.caller.game.world.height);
   // TODO: prevent overlap on reset
   this.asteroid.x = randX;
   this.asteroid.y = randY;
   this.asteroid.body.rotation = this.caller.game.rnd.realInRange(0, 2 * Math.PI);
   this.asteroid.body.force.x = this.caller.game.rnd.integerInRange(-10, 10) * 750;
   this.asteroid.body.force.y = this.caller.game.rnd.integerInRange(-10, 10) * 750;
};

module.exports = Asteroids;














