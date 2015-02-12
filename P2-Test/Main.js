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

var numRoids = 10; //Determines the number of asteroids
var asteroidArr;

var music;

function create() {
	game.world.setBounds(0, 0, 3605, 3605);
	
	game.physics.startSystem(Phaser.Physics.P2JS); //Add P2 physics
	//The coefficient of restitution that determines how elastic/inelastic collisions are (1 being perfectly elastic, & 0 being completely inelastic)
	//The effect of game.physics.p2.restitution is secondary to contact materials in a collision pair; something that we should be using moving forward
	game.physics.p2.restitution = .5;
	
	bg = game.add.sprite(0, 0, 'earth');
	square = game.add.sprite(400, 400, 'squareSheet', 0); //Add sprite
	asteroidArr = new Array();
	for(i = 0; i < numRoids; i++) {
		var asteroid = game.add.sprite(Math.random() * 3580, Math.random() * 3580, 'circle');
		asteroidArr.push(asteroid);
	}
		
	
	//Input definitions
	keys = game.input.keyboard.createCursorKeys();
	space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	game.input.keyboard.addKeyCapture([keys, space]);
	game.input.onDown.add(toggleSquare, this);
	
	//Enable P2 physics for the object (this also enables physics for all of its children)
	//By default, this will give the sprite a rectangular physics body the size of the sprite (which should be fine for modules)
	game.physics.p2.enable(square);
	for(i = 0; i < numRoids; i++) {
		game.physics.p2.enable(asteroidArr[i]);
		asteroidArr[i].body.setCircle(16); //Change the collision detection from an AABB to a circle
		asteroidArr[i].body.angularDamping = 0;
	}
	
	square.body.damping = .75; //This value (from 0 to 1) determines the proportion of velocity lost per second
	square.body.angularDamping = .90;  //Same but for angular velocity
	
	music = game.add.audio('FlyLo', .2, true); //Add the music to the game
	
	game.camera.follow(square); //Camera follows the module
}

function toggleSquare(pointer) {
	//hitTest is used to check collision on a body and returns the body clicked on, or nothing if a blank space is clicked on
	//The second argument can be an array of sprites or bodies that hitTest will check against, otherwise hitTest will check against all bodies
	var clicked = game.physics.p2.hitTest(pointer.position, [square]);
	
	if(clicked.length === 0) {
		if(!music.isPlaying) {
			if(music.paused){
				music.resume();
			}
			else {
				music.play(); //Play the music if no bodies are clicked
			}
		}
		else {
			music.pause();
		}
		
	}
	else {
		if(clicked[0].parent.sprite.frame == 0) {
			clicked[0].parent.sprite.frame = 1;
		}
		else {
			clicked[0].parent.sprite.frame = 0;
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
}

function render() {
	//This could probably be useful for something
}
