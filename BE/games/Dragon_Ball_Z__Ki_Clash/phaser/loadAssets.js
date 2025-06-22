function loadAssets(scene) {

    console.log("✅ loadAssets is running");

    // Background
    scene.load.image('battle_arena_desert', 'assets/backgrounds/battle_arena_desert.png');

    // Characters (assuming 512x512 frames for now, adjust based on actual spritesheets)
    scene.load.spritesheet('goku_ssj', 'assets/characters/goku_ssj_spritesheet.png', {
        frameWidth: 140,
        frameHeight: 218
    });
    scene.load.spritesheet('vegeta_ssj', 'assets/characters/vegeta_ssj_spritesheet.png', {
        frameWidth: 85,
        frameHeight: 117
    });

    // Special Effects
    scene.load.spritesheet('kamehameha_fx', 'assets/effects/kamehameha_fx.png', {
        frameWidth: 512,
        frameHeight: 256 // Adjust as per asset prompt for beam segment
    });
    scene.load.spritesheet('spirit_bomb_fx', 'assets/effects/spirit_bomb_fx.png', {
        frameWidth: 512,
        frameHeight: 512
    });
    scene.load.spritesheet('galick_gun_fx', 'assets/effects/galick_gun_fx.png', {
        frameWidth: 556,
        frameHeight: 406
    });
    scene.load.spritesheet('final_flash_fx', 'assets/effects/final_flash_fx.png', {
        frameWidth: 1024,
        frameHeight: 512
    });
    scene.load.spritesheet('hit_fx', 'assets/effects/hit_fx.png', {
        frameWidth: 256,
        frameHeight: 256
    });
    scene.load.spritesheet('dust_fx', 'assets/effects/dust_fx.png', {
        frameWidth: 128,
        frameHeight: 64
    });

    // UI Elements (if any static images are needed, e.g., portraits for HUD)
    scene.load.image('goku_portrait', 'assets/ui/goku_portrait.png');
    scene.load.image('vegeta_portrait', 'assets/ui/vegeta_portrait.png');

    // Audio
    // scene.load.audio('battle_music', '/assets/audio/battle_music.mp3');
    // scene.load.audio('kamehameha_sfx', '/assets/audio/kamehameha.wav');
    // scene.load.audio('punch_sfx', '/assets/audio/punch.wav');
    // scene.load.audio('hit_sfx', '/assets/audio/hit.wav');
    // ... more SFX
}
window.loadAssets = loadAssets;
