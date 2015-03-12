var BinaryParticle = function(game, targetObj, x, y, tarOffsetX, tarOffsetY) {
	var style = {font: '20px VT323', fill: '#FFFFFF', align: 'center'};
	var byteSymbol = Math.random() >= 0.5 ? '1' : '0';
	Phaser.Text.call(this, game, x, y, byteSymbol, style);
	game.add.existing(this);
	this.targetObj = targetObj;
	this.speed = 3.6;
	this.tarOffsetX = tarOffsetX;
	this.tarOffsetY = tarOffsetY;
};

BinaryParticle.prototype = Object.create(Phaser.Text.prototype);
BinaryParticle.prototype.constructor = BinaryParticle;

BinaryParticle.prototype.update = function() {
	//Get delta vector to target object
	var delta = [this.targetObj.x + this.tarOffsetX - this.x, this.targetObj.y + this.tarOffsetY - this.y];
	//Get distance and check if we've reached target distance
	var dist = Math.sqrt(Math.pow(delta[0], 2) + Math.pow(delta[1], 2));
	if(dist <= this.speed) {
		this.destroy();
		return;
	}
	//Normalize delta vector
	delta = [delta[0]/dist, delta[1]/dist];
	//Update position
	this.x = this.x + this.speed*delta[0];
	this.y = this.y + this.speed*delta[1];
};

module.exports = BinaryParticle;