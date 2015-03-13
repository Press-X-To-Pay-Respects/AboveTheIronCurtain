var Warning = function(state) {
   // initialise
	this.state = state;
   this.game = this.state.game;
   this.cam = this.game.camera;
   this.timer = this.game.time.create(false);
	this.warning = this.game.add.image(this.game.camera.x, this.game.camera.y, 'warning');
	this.warning.kill();
};

Warning.prototype.constructor = Warning;

Warning.prototype.update = function() {
   // warning graphic
	if(this.state.coreModule.cube.x + (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) > 8000 ||
	this.state.coreModule.cube.x - (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) < 0 ||
	this.state.coreModule.cube.y + (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) > 4000 ||
	this.state.coreModule.cube.y - (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) < 0) {
		if(this.timer.length === 0) {
			this.warning.revive();
			this.timer.loop(Phaser.Timer.SECOND * 5, this.resetPlayer, this);
			this.timer.start();
		}
	}
	else {
		if(this.warning.alive === true) {
			this.warning.kill();
		}
		if(this.timer.length > 0) {
			this.timer.stop(true);
		}
	}
	this.warning.x = this.game.camera.x;
	this.warning.y = this.game.camera.y;
};

Warning.prototype.resetPlayer = function() {
   if(this.state.coreModule.cube.x + (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) > 8000) {
      this.state.coreModule.cube.body.moveLeft(this.state.player.numCubes * 750);
   }
   if(this.state.coreModule.cube.x - (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) < 0) {
      this.state.coreModule.cube.body.moveRight(this.state.player.numCubes * 750);
   }
   if(this.state.coreModule.cube.y + (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) > 4000) {
      this.state.coreModule.cube.body.moveUp(this.state.player.numCubes * 750);
   }
   else if(this.state.coreModule.cube.y - (Math.max(this.state.player.cubesWidth(), this.state.player.cubesHeight()) / 2 * 64) < 0) {
      this.state.coreModule.cube.body.moveDown(this.state.player.numCubes * 750);
   }
};

module.exports = Warning;