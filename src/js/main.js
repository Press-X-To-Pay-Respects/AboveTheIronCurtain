var game = new Phaser.Game(window.innerWidth, window.innerHeigh, Phaser.AUTO, 'atic-game');

window.playerState = {
    currentLevel: 'Game'
};

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = { // jshint ignore:line
    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Montserrat::latin']
    }
};

game.state.add('Boot', require('./states/boot'));
game.state.add('Splash', require('./states/splash'));
game.state.add('Preloader', require('./states/preloader'));
game.state.add('Menu', require('./states/menu'));
game.state.add('Game', require('./states/game'));

game.state.start('Boot');