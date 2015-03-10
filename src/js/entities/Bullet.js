//Bullets are tagged as 'playerBullet' or 'enemyBullet'
var Bullet = function(gameState, x, y, direction, inhertitSpeed, tag) {
    Phaser.Sprite.call(this, gameState.game, x, y, 'bullet');
	this.direction = direction; //Unit vector representing direction bullet is travelling;
	this.speed = 300 + inhertitSpeed;				//Speed bullet is travelling;
	this.tag = tag;
	this.game = gameState.game;
	this.game.add.existing(this);
	this.lifeTime = 300;
	var scale = 0.5;
	this.scale.x = scale;
	this.scale.y = scale;
	this.anchor.setTo(0.5, 0.5);
	gameState.game.physics.p2.enable(this);
	//Set proper collision function by determining type from 'tag'
	if(this.tag === 'enemyBullet') {
		this.collision = function(other) {
			console.log(this.tag);
			if(other.sprite.tag === 'module') {
				other.sprite.takeDamage(0.5);
			}
			this.destroy();
		};
	}
	else if(this.tag === 'playerBullet') {
		this.collision = function(other) {
			this.destroy();
		};
	}
	this.body.onBeginContact.add(this.collision, this);
	this.body.setZeroDamping();
	this.body.mass = 0.1;
	this.body.velocity.x = direction[0]*this.speed;
	this.body.velocity.y = direction[1]*this.speed;
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function() {/*
	this.x += this.direction[0] * this.speed;
	this.y += this.direction[1] * this.speed;
	//this.lifeTime--;
	if(this.lifeTime <= 0) {
		//TODO destroy bullet
	}*/
};

module.exports = Bullet;