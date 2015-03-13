var Shop = function(state) {
   // initial variables
	this.state = state;
   this.game = this.state.game;
   this.cam = this.game.camera;
   this.sm = this.state.soundManager;
   this.mouse = this.state.mouse;
   this.money = 500;
   this.shopSpeed = 1;
   this.diff = 0;
   this.newModuleSpeed = 1500;
   // create button
   this.shopButton = this.game.add.button(this.game.camera.x + this.game.camera.width - 48, 16, 'shopButton', this.useShopButton, this, 1, 0, 2);
	this.shopButton.onInputOver.add(this.sm.playHoverClick, this.sm);
	this.shopButton.onInputDown.add(this.sm.playDownClick, this.sm);
   // create text
   this.moneyText = this.game.add.text(this.shopButton.x - 8, this.shopButton.y + 48, this.money);
   this.moneyText.font = 'VT323';
   this.moneyText.fontSize = 24;
   this.moneyText.fill = '#ffffff';
   this.moneyText.text = this.money;
	this.be = this.game.add.image(this.moneyText.x + this.moneyText.width + 8, this.moneyText.y, 'be');
   // create sounds
   this.cashRegister = this.game.add.audio('cashRegister');
   this.cashRegister.allowMultiple = true;
   this.error = this.game.add.audio('error');
   // add controls
   this.addMoneyKey = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
	this.addMoneyKey.onDown.add(this.debugAddMoney, this);
   // create buttons
	this.shopPanel = this.game.add.image(this.cam.x + this.cam.width + 256 + 16, this.cam.y + 16, 'shopPanel');
	this.shopPanel.kill();
	this.shieldButton = this.game.add.button(this.cam.x + this.cam.width - this.diff, this.cam.y + 52 + (88 * 1), 'shieldButton', this.purchaseModule, {state: this, key: 'shield'}, 1, 0, 2);
	this.formatButton(this.shieldButton);
	this.solarPanelButton = this.game.add.button(this.cam.x + this.cam.width - this.diff, this.cam.y + 52 + (88 * 2), 'solarPanelButton', this.purchaseModule, {state: this, key: 'solarPanel'}, 1, 0, 2);
	this.formatButton(this.solarPanelButton);
	this.thrusterButton = this.game.add.button(this.cam.x + this.cam.width - this.diff, this.cam.y + 52 + (88 * 3), 'thrusterButton', this.purchaseModule, {state: this, key: 'thruster'}, 1, 0, 2);
	this.formatButton(this.thrusterButton);
	this.gunButton = this.game.add.button(this.cam.x + this.cam.width - this.diff, this.cam.y + 52 + (88 * 4), 'gunButton', this.purchaseModule, {state: this, key: 'gun'}, 1, 0, 2);
	this.formatButton(this.gunButton);
	this.hackButton = this.game.add.button(this.cam.x + this.cam.width - this.diff, this.cam.y + 52 + (88 * 5), 'hackButton', this.purchaseModule, {state: this, key: 'hacker'}, 1, 0, 2);
	this.formatButton(this.hackButton);
	this.shopButton = this.game.add.button(this.cam.x + this.cam.width - 48, 16, 'shopButton', this.useShopButton, this, 1, 0, 2);
	this.shopButton.onInputOver.add(this.sm.playHoverClick, this.sm);
	this.shopButton.onInputDown.add(this.sm.playDownClick, this.sm);
};

Shop.prototype.constructor = Shop;

Shop.prototype.update = function() {
   // find diff
	if(this.shopMenuOpening === true) {	
      this.diff += this.shopSpeed * this.game.time.elapsed;
		if(this.diff >= 276) {
			this.shopMenuOpening = false;
			this.addShopButtons();
		}
	}
	else if(this.shopMenuClosing === true) {
      this.diff -= this.shopSpeed * this.game.time.elapsed;
		if(this.diff <= 0) {
			this.shopPanel.kill();
			this.shopMenuClosing = false;
		}
	}
   // update opening button position
   this.shopButton.x = this.cam.x + this.cam.width - 48 - this.diff;
	this.shopButton.y = this.cam.y + 16;
   // update text position
   this.moneyText.x = this.shopButton.x - 16;
	this.moneyText.y = this.shopButton.y + 48;
	this.be.x = this.moneyText.x + this.moneyText.width + 8;
	this.be.y = this.moneyText.y;
   // update purchasing button position
   this.shopPanel.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.shopPanel.y = this.cam.y + 16;
	this.shieldButton.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.shieldButton.y = this.cam.y + 70 + (86 * 0);
	this.solarPanelButton.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.solarPanelButton.y = this.cam.y + 70 + (86 * 1);
	this.thrusterButton.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.thrusterButton.y = this.cam.y + 70 + (86 * 2);
	this.gunButton.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.gunButton.y = this.cam.y + 70 + (86 * 3);
	this.hackButton.x = this.cam.x + this.cam.width + 16 - this.diff;
	this.hackButton.y = this.cam.y + 70 + (86 * 4);
};

Shop.prototype.purchaseModule = function() {
   var randY = this.state.game.rnd.integerInRange(100, this.state.cam.height - 100);
   if(this.key === 'shield' && this.state.mouse.x > this.state.shieldButton.x && this.state.mouse.x < this.state.shieldButton.x + 256 && this.state.mouse.y > this.state.shieldButton.y && this.state.mouse.y < this.state.shieldButton.y + 82) {
      if(this.state.money >= 45) {
         this.state.addModule(this.state.cam.x + this.state.cam.width + 80, this.state.cam.y + randY, this.key);
         this.state.money -= 45;
         this.state.cashRegister.play();
      }
      else {
         this.state.error.play();
      }
   }
   else if(this.key === 'solarPanel' && this.state.mouse.x > this.state.solarPanelButton.x && this.state.mouse.x < this.state.solarPanelButton.x + 256 && this.state.mouse.y > this.state.solarPanelButton.y && this.state.mouse.y < this.state.solarPanelButton.y + 82) {
      if(this.state.money >= 105) {
         this.state.addModule(this.state.cam.x + this.state.cam.width + 80, this.state.cam.y + randY, this.key);
         this.state.money -= 105;
         this.state.cashRegister.play();
      }
      else {
         this.state.error.play();
      }
   }
   else if(this.key === 'thruster' && this.state.mouse.x > this.state.thrusterButton.x && this.state.mouse.x < this.state.thrusterButton.x + 256 && this.state.mouse.y > this.state.thrusterButton.y && this.state.mouse.y < this.state.thrusterButton.y + 82) {
      if(this.state.money >= 90) {
         this.state.addModule(this.state.cam.x + this.state.cam.width + 80, this.state.cam.y + randY, this.key);
         this.state.money -= 90;
         this.state.cashRegister.play();
      }
      else {
         this.state.error.play();
      }
   }
   else if(this.key === 'gun' && this.state.mouse.x > this.state.gunButton.x && this.state.mouse.x < this.state.gunButton.x + 256 && this.state.mouse.y > this.state.gunButton.y && this.state.mouse.y < this.state.gunButton.y + 82) {
      if(this.state.money >= 120) {
         this.state.addModule(this.state.cam.x + this.state.cam.width + 80, this.state.cam.y + randY, this.key);
         this.state.money -= 120;
         this.state.cashRegister.play();
      }
      else {
         this.state.error.play();
      }
   }
   else if(this.key === 'hacker' && this.state.mouse.x > this.state.hackButton.x && this.state.mouse.x < this.state.hackButton.x + 256 && this.state.mouse.y > this.state.hackButton.y && this.state.mouse.y < this.state.hackButton.y + 82) {
      if(this.state.money >= 200) {
         this.state.addModule(this.state.cam.x + this.state.cam.width + 80, this.state.cam.y + randY, this.key);
         this.state.money -= 200;
         this.state.cashRegister.play();
      }
      else {
         this.state.error.play();
      }
   }
   this.state.moneyText.text = this.state.money; 
};

Shop.prototype.addModule = function (x, y, key) {
   var newModule = this.state.moduleBuilder.build(key, x, y, true);
   newModule.cube.body.moveLeft(this.newModuleSpeed);
};

Shop.prototype.addShopButtons = function() {
   this.shieldButton.revive();
   this.solarPanelButton.revive();
   this.thrusterButton.revive();
   this.gunButton.revive();
   this.hackButton.revive(); 
};

Shop.prototype.formatButton = function(button) {
   button.onInputOver.add(this.sm.playHoverClick, this.sm);
   button.onInputDown.add(this.sm.playDownClick, this.sm);
   button.kill();
};

Shop.prototype.addMoney = function(amt) {
   this.money += amt;
   this.moneyText.text = this.money;
   this.cashRegister.play();
};

Shop.prototype.debugAddMoney = function() {
  this.addMoney(1000); 
};

Shop.prototype.useShopButton = function() {
   if(!this.shopPanel.alive && !this.shopMenuOpening && !this.shopMenuClosing) {
      this.shopPanel.revive();
      this.diff = 0;
      this.shopMenuOpening = true;
   }
   else if(this.shopPanel.alive&& !this.shopMenuClosing && !this.shopMenuOpening) {
      this.shopMenuClosing = true;
   }
};

module.exports = Shop;





// //Shop Movement Code
	// if(shopMenuOpening === true) {	
		// // diff += 4;
      // diff += this.shopSpeed * this.game.time.elapsed;
		// if(diff >= 276) {
			// shopMenuOpening = false;
			// this.addShopButtons();
		// }
	// }
	// else if(shopMenuClosing === true) {
		// // diff -= 4;
      // diff -= this.shopSpeed * this.game.time.elapsed;
		// if(diff <= 0) {
			// shopPanel.kill();
			// shopMenuClosing = false;
		// }
	// }



