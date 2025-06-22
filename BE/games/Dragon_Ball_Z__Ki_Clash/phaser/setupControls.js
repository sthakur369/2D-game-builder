function setupControls(scene) {
    scene.keys = scene.input.keyboard.addKeys({
        'up': Phaser.Input.Keyboard.KeyCodes.W,
        'left': Phaser.Input.Keyboard.KeyCodes.A,
        'down': Phaser.Input.Keyboard.KeyCodes.S,
        'right': Phaser.Input.Keyboard.KeyCodes.D,
        'jump': Phaser.Input.Keyboard.KeyCodes.W, // W for jump
        'attack_light': Phaser.Input.Keyboard.KeyCodes.J,
        'attack_heavy': Phaser.Input.Keyboard.KeyCodes.K,
        'special_attack': Phaser.Input.Keyboard.KeyCodes.L,
        'ultimate_attack': Phaser.Input.Keyboard.KeyCodes.I,
        'dash': Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Remove all special, jump, and dash handlers that reference undefined animations
    // Only left/right movement and attack_light (J) for punch are supported with current assets
    // scene.keys.special_attack.on('down', ...);
    // scene.keys.jump.on('down', ...);
    // scene.keys.dash.on('down', ...);

}

window.setupControls = setupControls;
