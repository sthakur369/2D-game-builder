function setupControls(scene) {
  console.log("✅ setupControls is running");

  // Player 1 (Goku) Controls
  scene.playerKeys = scene.input.keyboard.addKeys({
    'up': Phaser.Input.Keyboard.KeyCodes.W,
    'left': Phaser.Input.Keyboard.KeyCodes.A,
    'down': Phaser.Input.Keyboard.KeyCodes.S,
    'right': Phaser.Input.Keyboard.KeyCodes.D,
    'jump': Phaser.Input.Keyboard.KeyCodes.W,
    'light_punch': Phaser.Input.Keyboard.KeyCodes.J,
    'heavy_punch': Phaser.Input.Keyboard.KeyCodes.U,
    'light_kick': Phaser.Input.Keyboard.KeyCodes.K,
    'heavy_kick': Phaser.Input.Keyboard.KeyCodes.I,
    'energy_blast': Phaser.Input.Keyboard.KeyCodes.L,
    'special_modifier': Phaser.Input.Keyboard.KeyCodes.SPACE // Used for Space + L combo
  });

  // Player 2 (Vegeta) Controls (for multiplayer testing or AI control reference)
  scene.opponentKeys = scene.input.keyboard.addKeys({
    'up': Phaser.Input.Keyboard.KeyCodes.UP,
    'left': Phaser.Input.Keyboard.KeyCodes.LEFT,
    'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
    'right': Phaser.Input.Keyboard.KeyCodes.RIGHT,
    'jump': Phaser.Input.Keyboard.KeyCodes.UP,
    'light_punch': Phaser.Input.Keyboard.KeyCodes.NUMPAD_4,
    'heavy_punch': Phaser.Input.Keyboard.KeyCodes.NUMPAD_7,
    'light_kick': Phaser.Input.Keyboard.KeyCodes.NUMPAD_5,
    'heavy_kick': Phaser.Input.Keyboard.KeyCodes.NUMPAD_8,
    'energy_blast': Phaser.Input.Keyboard.KeyCodes.NUMPAD_6,
    'special_modifier': Phaser.Input.Keyboard.KeyCodes.NUMPAD_0 // Used for NumPad 0 + NumPad 6 combo
  });
}
window.setupControls = setupControls;