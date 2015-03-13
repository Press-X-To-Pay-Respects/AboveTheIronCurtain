var game = new Phaser.Game(window.innerWidth, window.innerHeigh, Phaser.AUTO, 'atic-game');

window.playerState = {
    currentLevel: 'Menu'
};

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = { // jshint ignore:line
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Roboto::latin', 'VT323::latin']
    }
};

game.state.add('Boot', require('./states/boot'));
game.state.add('Splash', require('./states/splash'));
game.state.add('Preloader', require('./states/preloader'));
game.state.add('Menu', require('./states/menu'));
game.state.add('levelOne', require('./states/levelOne'));
game.state.add('levelTwo', require('./states/levelTwo'));
game.state.add('levelThree', require('./states/levelThree'));

game.state.start('Boot');