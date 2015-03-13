var Cheating = function(state) {
   // initialisation
	this.state = state;
   this.game = state.game;
   this.cam = this.game.camera;
   this.mouse = this.state.mouse;
   // buttons
   //core
	this.placeCoreKey = this.game.input.keyboard.addKey(Phaser.Keyboard.P);
	this.placeCoreKey.onDown.add(this.debugAddModule, {caller: this, key: 'core'});
	//shield
	this.placeShieldKey = this.game.input.keyboard.addKey(Phaser.Keyboard.O);
    this.placeShieldKey.onDown.add(this.debugAddModule, {caller: this, key: 'shield'});
	//thruster
	this.placeThrusterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.I);
    this.placeThrusterKey.onDown.add(this.debugAddModule, {caller: this, key: 'thruster'});
	//solarPanel
	this.placeSPKey = this.game.input.keyboard.addKey(Phaser.Keyboard.U);
    this.placeSPKey.onDown.add(this.debugAddModule, {caller: this, key: 'solarPanel'});
	//hacker
	this.placeHackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.Y);
	this.placeHackKey.onDown.add(this.debugAddModule, {caller: this, key: 'hacker'});
	//gun
	this.placeGunKey = this.game.input.keyboard.addKey(Phaser.Keyboard.T);
    this.placeGunKey.onDown.add(this.debugAddModule, {caller: this, key: 'gun'});
	//hackable
	this.placeHackableKey = this.game.input.keyboard.addKey(Phaser.Keyboard.L);
   this.placeHackableKey.onDown.add(this.debugAddModule, {caller: this, key: 'hackable'});
};

Cheating.prototype.constructor = Cheating;

Cheating.prototype.debugAddModule = function() {
   this.caller.state.moduleBuilder.build(this.key, this.caller.mouse.x, this.caller.mouse.y, true);
};

module.exports = Cheating;













