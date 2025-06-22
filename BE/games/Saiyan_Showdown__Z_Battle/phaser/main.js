// Auto-generated main.js (game boot)
// Phaser and GameScene are loaded globally via CDN and script tags.

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000',
    parent: 'phaser-game',
    scene: [window.GameScene || GameScene],
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    new Phaser.Game(config);
});
