/*
Defines a cube.
*/

var Cube = function (state, x, y, sprite) {
    Phaser.Sprite.call(this, state.game, x, y, sprite);
	 this.tag = 'module';	//tag is used to detect object type during collision checking
	 this.state = state;
    this.game = this.state.game;
    this.game.add.existing(this);
    this.group = undefined;
    this.module = undefined;
    this.indicatorFade = 0.02;
    this.healthBar = this.state.uiBuilder.buildProgressBar('shrinking', 0, 0, 20, 4, 3);
	this.healthBar.setStyle(0, 0xFFFFFF, 0x363636, 0, 0, 0, 0xFFFFFF, 0x20CC20);
	this.healthBar.cube = this;
	this.healthBarFade = 0.0008;
	this.impact = this.game.add.audio('moduleImpact');
	this.impact.volume = 0.25;
	this.impact.allowMultiple = true;
	//set update function of health bar
	this.healthBar.update = function() {
		this.setLocation(this.cube.x, this.cube.y+10);
	};
	//onEvent called when cube runs out of health
	this.healthBar.onEvent = function() {
		this.cube.dying = true;
		this.cube.life = 50;
		// this.group.countCubes();
		// this.destroy();
	};
	this.constraints = [];
};

Cube.prototype = Object.create(Phaser.Sprite.prototype);
Cube.prototype.constructor = Cube;

/**
 * Automatically called by World.update
 */
Cube.prototype.update = function() {
   if (this.cIndicator && this.cIndicator.alpha > 0) {
      this.cIndicator.alpha -= this.indicatorFade;
   }
   if (this.module.update) {
      this.module.update();
   }
   if (this.healthBar.graphics.alpha > 0) {
      this.healthBar.graphics.alpha -= this.healthBarFade * this.game.time.elapsed;
   }
   if (this.dying) {
      this.life -= this.game.time.elapsed;
      if (this.life < 0) {
         this.dying = false;
         this.healthBar.destroy();
         if (this.group) {
            if(this.tag === 'enemy_module') {
               if(this.key === 'thruster') {
                  this.state.shop.addMoney(35);
               }
               else if(this.key === 'shield') {
                  this.state.shop.addMoney(10);
               }
               else if(this.key === 'gun') {
                  this.state.shop.addMoney(50);
               }
               else if(this.key === 'solarPanel') {
                  this.state.shop.addMoney(25);
               }
			   else if(this.key === 'core') {
				  this.state.shop.addMoney(50);
				  this.state.numKilled++;
				  this.state.levelSetup.missionPrompt.setProgress(this.state.numKilled + '/' + this.state.numEnemies);
			   }
            }
            this.group.destroyCube(this);
         } else {
            if(this.key === 'core' && this.tag === 'module') {
               this.kill();
			   this.state.playerDead = true;
			   this.state.playerDied();
            }
            this.destroy();
         }
      }
   }
};

Cube.prototype.loseConnection = function() {
  if (!this.myConnection) {
    return;
  }  
  if (this.myConnection.start === this) {
      var endModule = this.myConnection.end.module;
      if (endModule.hasOwnProperty('onLoseConnection')) {
         endModule.onLoseConnection();
      }
      this.myConnection.end.myConnection = undefined;
      this.myConnection = undefined;
   } else if (this.myConnection.end === this) {
      var startModule = this.myConnection.end.module;
      if (startModule.hasOwnProperty('onLoseConnection')) {
         startModule.onLoseConnection();
      }
      this.myConnection.start.myConnection = undefined;
      this.myConnection = undefined;
   }
};

Cube.prototype.cubeCollide = function(other) {
   // bad collision, collision with non-sprite, collision with non-cube
   if (!other || !other.sprite || other.prototype !== this.prototype) {
      return;
   }
   if (!this.group && other.sprite.group && other.sprite.group.isPlayer) { // floating hitting player
      other.sprite.group.handleAttatch(other.sprite, this);
   } else if (other.group && this.group === other.group) {// if cubes in same group
      // magic conch, what should we do here?
   } else if (this.group) {
      if (this.group.isPlayer) { // player
         if (other.sprite.tag === 'enemy_module') { // collision with enemy, ramming
            this.group.handleRamming(this, other.sprite);
         }
      } else {// enemy
         this.group.handleRamming(this, other.sprite); // enemies only ram on collision
      }
      this.group.countCubes();
   }
};

Cube.prototype.toString = function() {
   var string = '';
   string += this.concat('name', this.name);
   return string;
};

Cube.prototype.concat = function(string, val) {
   return string + ': ' + val + '\n';
};

Cube.prototype.displayIndicator = function() {
  this.cIndicator.alpha = 1; 
};

Cube.prototype.hideIndicator = function() {
  this.cIndicator.alpha = 0; 
};

Cube.prototype.takeDamage = function(amt) {
   this.impact.play();
   this.healthBar.addValue(-amt);
   this.healthBar.graphics.alpha = 1;
};

Cube.prototype.dieQuick = function() {
  this.dying = true;
  this.life = 0;
};

Cube.prototype.remove = function() {
   if (!this.group) {
      return;
   }
   this.group.remove(this);
};

module.exports = Cube;














