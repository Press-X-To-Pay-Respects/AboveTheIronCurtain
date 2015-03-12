/*
Defines a cube.
*/

var Cube = function (gameState, x, y, sprite) {
    Phaser.Sprite.call(this, gameState.game, x, y, sprite);
	 this.tag = 'module';	//tag is used to detect object type during collision checking
    this.game = gameState.game;
	this.gameState = gameState;
    this.game.add.existing(this);
    this.group = undefined;
    this.module = undefined;
    this.indicatorFade = 0.02;
    this.healthBar = gameState.uiBuilder.buildProgressBar('shrinking', 0, 0, 20, 4, 3);
	this.healthBar.setStyle(0, 0xFFFFFF, 0x363636, 0, 0, 0, 0xFFFFFF, 0x20CC20);
	this.healthBar.cube = this;
   this.healthBarFade = 0.02;
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
					this.gameState.money += 35;
				}
				else if(this.key === 'shield') {
					this.gameState.money += 10;
				}
				else if(this.key === 'gun') {
					this.gameState.money += 50;
				}
				else if(this.key === 'solarPanel') {
					this.gameState.money += 25;
				}
				this.gameState.moneyText.text = this.gameState.money;
			}
            this.group.destroyCube(this);
         } else {
            this.destroy();
         }
      }
   }
};

Cube.prototype.cubeCollide = function(other) {
   if (!this.group || !this.group.isPlayer || !other || !other.sprite || other.sprite.tag !== 'module' ||
       (other.group && other.group === this.group) || (other.group && other.group.isPlayer) ||
         other.prototype !== this.prototype) {
      return;
   }
	this.group.handleCollision(this, other.sprite);
	this.group.countCubes();
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

Cube.prototype.takeDamage = function(amt) {
   this.healthBar.addValue(-amt);
};

Cube.prototype.remove = function() {
   if (!this.group) {
      return;
   }
   this.group.remove(this);
};

module.exports = Cube;














