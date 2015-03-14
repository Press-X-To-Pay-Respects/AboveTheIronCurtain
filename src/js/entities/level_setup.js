var Renderables = require('../functionAccess/Renderables');
var UIBuilder = require('../ui/UIBuilder');
var ModuleBuilder = require('../entities/ModuleBuilder');
var CubeGroup = require('../entities/cube_group');
var Emitter = require('../effects/Emitter');
var Mouse = require('../entities/mouse');
var SoundManager = require('../entities/sound_manager');
var Shop = require('../ui/shop');
var Helper = require('../entities/helper');
var Cheating = require('../entities/cheating');
var Asteroids = require('../entities/asteroids');
var Warning = require('../entities/warning');
var MissionPrompt = require('../ui/MissionPrompt');

var LevelSetup = function(state, level) {
	// initialise
	this.state = state;
   this.game = this.state.game;
   this.level = level;
   // simplify
   this.simplify = false;
   // setup
   this.game.world.setBounds(0, 0, 8000, 4000);
   this.bg = this.game.add.sprite(0, 0, 'earthNight');
	this.bg2 = this.game.add.sprite(-8000, 0, 'earthNight');
   this.game.physics.startSystem(Phaser.Physics.P2JS);
	this.game.physics.p2.setImpactEvents(true);
   this.state.collisionGroup = this.game.physics.p2.createCollisionGroup();
   this.updateDependents = [];
   this.renderables = new Renderables();
   this.state.uiBuilder = new UIBuilder(this.state, this.renderables);
   this.state.moduleBuilder = new ModuleBuilder(this.state);
   this.state.coreModule = this.state.moduleBuilder.build('core', 1200, 1200, true);
	this.cubeWidth = this.state.coreModule.cube.width;
	this.cubeBuffer = 2;
	var playerGroup = new CubeGroup(this.state, this.state.coreModule.cube);
	this.updateDependents.push(playerGroup);
	this.state.player = playerGroup;
	this.state.player.isPlayer = true;
   this.state.BinaryEmitter = new Emitter(this.state);
   this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
   this.levelData = JSON.parse(this.game.cache.getText(this.level));
   if (!this.simplify) { this.loadLevel(); }
   this.game.juicy = this.game.plugins.add(new Phaser.Plugin.Juicy(this.state));
   this.game.camera.follow(this.state.coreModule.cube);
   this.state.mouse = new Mouse(this.game, this.state.input, this.state.player);
   this.updateDependents.push(this.state.mouse);
   this.state.soundManager = new SoundManager(this.state);
   this.state.shop = new Shop(this.state);
   this.updateDependents.push(this.state.shop);
   this.helper = new Helper(this.state);
   this.updateDependents.push(this.helper);
   this.cheating = new Cheating(this.state);
   this.asteroids = new Asteroids(this.state, this.simplify);
   this.updateDependents.push(this.asteroids);
   this.warning = new Warning(this.state);
   this.updateDependents.push(this.warning);
   this.missionPrompt = new MissionPrompt(this.state);
   this.missionPrompt.setDescription('Destroy Enemies');
   this.missionPrompt.setProgress(this.state.numKilled + '/' + this.state.numEnemies);
};

LevelSetup.prototype.constructor = LevelSetup;

LevelSetup.prototype.update = function() {
   if(this.state.coreModule.cube.body) {
	   if(this.leftKey.isDown) {
			if(this.state.coreModule.cube.body.angularVelocity > -9) { 
				this.state.coreModule.cube.body.angularForce += -7.5 * Math.pow(this.state.player.numCubes, 1.65);
			}
		}
		if(this.rightKey.isDown) {
			if(this.state.coreModule.cube.body.angularVelocity < 9) {
				this.state.coreModule.cube.body.angularForce += 7.5 * Math.pow(this.state.player.numCubes, 1.65);
			}
		}
	}
   this.bg.x += 0.125;
   if (this.bg.x >= 8000) {
      this.bg.x = 0;
   }
   this.bg2.x += 0.125;
   if (this.bg2.x >= 8000) {
      this.bg2.x = 0;
   }
   for (var i = 0; i < this.updateDependents.length; i++) {
		if (this.updateDependents[i].update) {
			this.updateDependents[i].update();
		}
	}
	if(this.state.numKilled === this.state.numEnemies && this.state.numKilled !== 0 && this.state.complete === false) {
		this.state.levelComplete();
	}
};

LevelSetup.prototype.loadLevel = function() {
   var myLevel = this.levelData[this.level];
   for (var key in myLevel) {
      if (myLevel.hasOwnProperty(key)) {
         var element = myLevel[key];
         if (element.hasOwnProperty('blueprint')) { // enemy type
            var enemyX = element['x_pos'];
            var enemyY = element['y_pos'];
            var enemyGroup = new CubeGroup(this.state, undefined);
            this.updateDependents.push(enemyGroup);
            var blueprint = element['blueprint'];
            for (var row = 0; row < blueprint.length; row++) {
               for (var col = 0; col < blueprint[row].length; col++) {
                  var type = blueprint[row][col];
                  if (type !== 'none') {
                     var newModule = this.state.moduleBuilder.build(type, enemyX + row * (this.cubeWidth + this.cubeBuffer),
                     enemyY - col * (this.cubeWidth + this.cubeBuffer), false);
                     newModule.cube.tag = 'enemy_module';
                     var point = new Phaser.Point(row, col);
                     enemyGroup.add(newModule.cube, point);
                  }
               }
            }
            var aiType = element['type'];
            enemyGroup.giveAI(aiType, this.state.player);
			this.state.numEnemies++;
         }
      }
   }
};

LevelSetup.prototype.render = function() {
   this.state.mouse.render();
   this.renderables.renderAll(); 
};

module.exports = LevelSetup;

















