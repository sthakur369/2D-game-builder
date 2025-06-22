function loadAssets(scene) {
  console.log("✅ loadAssets is running");

  // Load Background
  scene.load.image('battle_arena_wasteland', 'assets/backgrounds/battle_arena_wasteland.png');

  // Load Characters (assuming 140x218 for game frames from 512x512 source)
  scene.load.spritesheet('goku_ssj_spritesheet', 'assets/characters/goku_ssj_spritesheet.png', {
    frameWidth: 140,
    frameHeight: 218
  });
  scene.load.spritesheet('vegeta_spritesheet', 'assets/characters/vegeta_spritesheet.png', {
    frameWidth: 140,
    frameHeight: 218
  });

  // Load UI elements
  scene.load.image('goku_portrait', 'assets/ui/goku_portrait.png');
  scene.load.image('vegeta_portrait', 'assets/ui/vegeta_portrait.png');
  scene.load.image('health_bar_fill', 'assets/ui/health_bar_fill.png');
  scene.load.image('energy_bar_fill', 'assets/ui/energy_bar_fill.png');
  scene.load.image('round_counter_bg', 'assets/ui/round_counter_bg.png');

  // Load Effects
  scene.load.spritesheet('kamehameha_fx', 'assets/effects/kamehameha_fx.png', {
    frameWidth: 512,
    frameHeight: 256
  });
  scene.load.spritesheet('galick_gun_fx', 'assets/effects/galick_gun_fx.png', {
    frameWidth: 512,
    frameHeight: 256
  });
  scene.load.spritesheet('spirit_bomb_fx', 'assets/effects/spirit_bomb_fx.png', {
    frameWidth: 512,
    frameHeight: 512
  });
  scene.load.spritesheet('final_flash_fx', 'assets/effects/final_flash_fx.png', {
    frameWidth: 1024,
    frameHeight: 512
  });
  scene.load.spritesheet('hit_impact_fx', 'assets/effects/hit_impact_fx.png', {
    frameWidth: 256,
    frameHeight: 256
  });

  // Note: Audio files are not loaded as per strict instruction (unless they exist).
  // They would typically be loaded here if available.
}
window.loadAssets = loadAssets;