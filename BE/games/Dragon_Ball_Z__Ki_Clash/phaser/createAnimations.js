function createAnimations(scene) {
    // Goku (Super Saiyan) Animations
    // ----- GOKU ANIMATIONS -----
    scene.anims.create({
        key: 'goku_idle',
        frames: scene.anims.generateFrameNumbers('goku_ssj', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1
    });

    scene.anims.create({
        key: 'goku_walk',
        frames: scene.anims.generateFrameNumbers('goku_ssj', { start: 1, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'goku_punch',
        frames: scene.anims.generateFrameNumbers('goku_ssj', { start: 6, end: 10 }),
        frameRate: 15,
        repeat: 0
    });

    scene.anims.create({
        key: 'goku_kick',
        frames: scene.anims.generateFrameNumbers('goku_ssj', { start: 11, end: 15 }),
        frameRate: 15,
        repeat: 0
    });

    // Vegeta (Super Saiyan) Animations
    // ----- VEGETA ANIMATIONS -----
    scene.anims.create({
        key: 'vegeta_idle',
        frames: scene.anims.generateFrameNumbers('vegeta_ssj', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1
    });

    scene.anims.create({
        key: 'vegeta_walk',
        frames: scene.anims.generateFrameNumbers('vegeta_ssj', { start: 1, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    scene.anims.create({
        key: 'vegeta_punch',
        frames: scene.anims.generateFrameNumbers('vegeta_ssj', { start: 6, end: 10 }),
        frameRate: 15,
        repeat: 0
    });

    // FX Animations (if you know frame count, adjust accordingly)
    scene.anims.create({
        key: 'kamehameha_beam',
        frames: scene.anims.generateFrameNumbers('kamehameha_fx', { start: 0, end: 0 }),
        frameRate: 1,
        repeat: -1
    });
}
window.createAnimations = createAnimations;

