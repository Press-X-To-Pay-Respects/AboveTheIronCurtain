var game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'P2-Test', { preload: preload, create: create, update: update, render: render });

function preload() { //Load sprites, music, & collision polygons
	game.load.spritesheet('squareSheet', 'sprites/squareSheet.png', 32, 32, 2);
	game.load.image('circle', 'sprites/asteroid.png');
	game.load.image('earth', 'sprites/bg_earth.jpg');
	game.load.audio('FlyLo', 'music/17 Galaxy In Janaki.mp3');
}

//Global Variables
var square;
var bg;

var keys;
var space;

var asteroids;
var maxRoids = 100; //Determines the number of asteroids
var numRoids = 0;

var asteroidsCG;
var playerCG;

var music;

var clickDebug;

function create() {
	game.world.setBounds(0, 0, 3605, 3605);
	
	game.physics.startSystem(Phaser.Physics.P2JS); //Add P2 physics
	//The coefficient of restitution that determines how elastic/inelastic collisions are (1 being perfectly elastic, & 0 being completely inelastic)
	//The effect of game.physics.p2.restitution is secondary to contact materials in a collision pair; something that we should be using moving forward
	game.physics.p2.restitution = .5;
	
	//Creates collision groups for the player and the asteroids
	playerCG = game.physics.p2.createCollisionGroup();
	asteroidCG = game.physics.p2.createCollisionGroup();
	
	bg = game.add.sprite(0, 0, 'earth');
	
	asteroids = game.add.group();
	asteroids.enableBody = true;
	asteroids.physicsBodyType = Phaser.Physics.P2JS;
	
	generateAsteroids();
	
	square = game.add.sprite(game.world.centerX, game.world.centerY, 'squareSheet', 0); //Add sprite
	
	//Input definitions
	keys = game.input.keyboard.createCursorKeys();
	space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	game.input.keyboard.addKeyCapture([keys, space]);
	game.input.onDown.add(toggleSquare, this);
	
	//Enable P2 physics for the object (this also enables physics for all of its children)
	//By default, this will give the sprite a rectangular physics body the size of the sprite (which should be fine for modules)
	game.physics.p2.enable(square);
	square.body.setCollisionGroup(playerCG); //Assign the square to a collision group
	square.body.collides(asteroidCG); //Set the square to collide with asteroids
	square.body.damping = .75; //This value (from 0 to 1) determines the proportion of velocity lost per second
	square.body.angularDamping = .90;  //Same but for angular velocity
	square.body.collideWorldBounds = false;
	
	game.camera.follow(square); //Camera follows the module
	
	music = game.add.audio('FlyLo', .2, true); //Add the music to the game
}

function toggleSquare(pointer) {
	//hitTest is used to check collision on a body and returns the body clicked on, or nothing if a blank space is clicked on
	//The second argument can be an array of sprites or bodies that hitTest will check against, otherwise hitTest will check against all bodies
	var point = new Phaser.Point(pointer.x + game.camera.x, pointer.y + game.camera.y);
	var clicked = game.physics.p2.hitTest(point, [square]);
	clickDebug = clicked[0].parent.sprite.key;
	
	if(clicked[0].parent.sprite === square) {
		if(clicked[0].parent.sprite.frame == 0) {
			clicked[0].parent.sprite.frame = 1;
		}
		else {
			clicked[0].parent.sprite.frame = 0;
		}
	}
}

function generateAsteroids() {
	var xRand = 0;
	var yRand = 0;
	if(maxRoids > numRoids) {
		for(;numRoids < maxRoids; numRoids++) {
			xRand = Math.random();
			yRand = Math.random();
			
			if(xRand > .5) {
				if(yRand > .5) {
					var asteroid = asteroids.create((Math.random() * 100) + (game.camera.x + (game.camera.width / 2)), 
										(Math.random() * 100) + (game.camera.y + (game.camera.height / 2)), 'circle');
				}
				else {
					var asteroid = asteroids.create((Math.random() * 100) + (game.camera.x + (game.camera.width / 2)), 
										(Math.random() * 100) - (game.camera.y + (game.camera.height / 2)), 'circle');
				}
			}
			else {
				if(yRand > .5) {
					var asteroid = asteroids.create((Math.random() * 100) - (game.camera.x + (game.camera.width / 2)), 
										(Math.random() * 100) + (game.camera.y + (game.camera.height / 2)), 'circle');
				}
				else {
					var asteroid = asteroids.create((Math.random() * 100) - (game.camera.x + (game.camera.width / 2)), 
										(Math.random() * 100) - (game.camera.y + (game.camera.height / 2)), 'circle');
				}
			}
			asteroid.body.setCircle(16); //Change the collision detection from an AABB to a circle
			asteroid.body.angularDamping = 0;
			asteroid.body.setCollisionGroup(asteroidCG); //Set each asteroid to use the asteroid collision group
			asteroid.body.collides([asteroidCG, playerCG]); //Sets what the asteroids will collide with. Can be an array or just a single collision group
		}
	}
}

function update() {
	if(keys.left.isDown) {
	//Angular force & angular velocity are measured in radians/second where positive is clockwise & negative is counter-clockwise
		if(square.body.angularVelocity > -9) { 
			square.body.angularForce += -3;
		}
	}
	if(keys.right.isDown) {
		if(square.body.angularVelocity < 9) {
			square.body.angularForce += 3;
		}
	}
	if(space.isDown && square.frame == 0) {
		//thrust(x) makes the object accelerate forwards (relative to its direction) up to a velocity of x pixels/second
		//I'm not sure if P2 takes mass into account when translating thrust to velocity for an object, I'll have to check
		//If not, we'll have to calculate thrust depending on number of number of modules & number of thrusters
		square.body.thrust(300); 
	}
	if(maxRoids > numRoids) {
		generateAsteroids();
	}
}

function render() {
	game.debug.cameraInfo(game.camera, 32, 128);
	game.debug.spriteInfo(square, 32, 32);
	game.debug.text(clickDebug, 32, 256);
}
