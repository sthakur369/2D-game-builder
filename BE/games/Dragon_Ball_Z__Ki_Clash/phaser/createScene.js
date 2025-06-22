function createScene(scene) {

    console.log("✅ createScene is running");
    
    // Add background
    scene.add.image(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, 'battle_arena_desert').setOrigin(0.5).setScrollFactor(0).setDepth(0);

    // Setup world bounds
    scene.physics.world.setBounds(0, 0, 1920, 1080); // Assuming background width 1920

    // Draw a visible ground using Phaser graphics (for debugging)

    const graphics = scene.add.graphics();
    graphics.fillStyle(0x654321, 1); // brown color
    graphics.fillRect(0, scene.sys.game.config.height - 60, scene.sys.game.config.width, 60);
    graphics.setDepth(1);

    // Add invisible ground for physics
    
    // Create invisible ground manually
    const groundRect = scene.add.rectangle(
        scene.sys.game.config.width / 2,
        scene.sys.game.config.height - 30,
        scene.sys.game.config.width,
        60,
        0x000000,
        0 // alpha = 0 to make it invisible
    );
    
    // Enable physics on that shape
    scene.physics.add.existing(groundRect, true); // true = static
    
    scene.ground = groundRect; // save reference
    

  

    // Player Character
    scene.player = scene.physics.add.sprite(400, scene.sys.game.config.height - 60, 'goku_ssj').setScale(1).setOrigin(0.5, 1).setDepth(10); // Align feet to ground
    scene.player.setCollideWorldBounds(true);
    scene.player.setGravityY(0); // No gravity
    // scene.player.body.setSize(150, 400); // Remove custom hitbox
    // scene.player.body.offset.x = 180;
    // scene.player.body.offset.y = 100;
    scene.player.setBounce(0.1);
    scene.player.setData('health', 1000);
    scene.player.setData('energy', 0);
    scene.player.play('goku_idle');
    scene.player.body.setVelocity(0, 0);
    scene.player.body.moves = true;
    // Do not set immovable for player
    
    console.log("Playing idle animation:", scene.player.anims.currentAnim?.key);


    // AI Character
    scene.opponent = scene.physics.add.sprite(scene.sys.game.config.width - 400, scene.sys.game.config.height - 60, 'vegeta_ssj').setScale(1).setOrigin(0.5, 1).setDepth(10); // Align feet to ground
    scene.opponent.setCollideWorldBounds(true);
    scene.opponent.setGravityY(0); // No gravity
    // scene.opponent.body.setSize(150, 400); // Remove custom hitbox
    // scene.opponent.body.offset.x = 180;
    // scene.opponent.body.offset.y = 100;
    scene.opponent.setBounce(0.1);
    scene.opponent.setData('health', 1000);
    scene.opponent.setData('energy', 0);
    scene.opponent.setFlipX(true); // Face player
    scene.opponent.play('vegeta_idle');
    scene.opponent.body.setVelocity(0, 0);
    scene.opponent.body.immovable = true;
    scene.opponent.body.moves = true; // Enable AI movement

    // Collide player and opponent with the ground
    scene.physics.add.collider(scene.player, scene.ground);
    scene.physics.add.collider(scene.opponent, scene.ground);

    // Round start delay – keep everyone idle for first 2 seconds
    scene.roundStarted = false;
    scene.time.delayedCall(2000, () => { scene.roundStarted = true; }, null, scene);

    // UI portraits (static)
    
    

    // Camera Setup
    scene.cameras.main.startFollow(scene.player, true, 0.05, 0.05);
    scene.cameras.main.setBounds(0, 0, 1920, scene.sys.game.config.height);
    scene.cameras.main.setZoom(1); // Default zoom

    // Music
    // scene.music = scene.sound.add('battle_music', { loop: true, volume: 0.6 });
    // scene.music.play();

    // Add physics collider between player and opponent
    scene.physics.add.collider(scene.player, scene.opponent);

    // Group for projectiles (Kamehameha, etc.)
    scene.playerProjectiles = scene.physics.add.group({
        classType: Phaser.Physics.Arcade.Sprite,
        runChildUpdate: true
    });
    scene.opponentProjectiles = scene.physics.add.group({
        classType: Phaser.Physics.Arcade.Sprite,
        runChildUpdate: true
    });

    // Setup collision for player fireballs hitting opponent (Vegeta)
    scene.physics.add.overlap(scene.playerProjectiles, scene.opponent, (projectile, target) => {
        projectile.destroy();
        // Optionally, trigger hit effect or damage here
    });

    // Setup collision for projectiles
    scene.physics.add.overlap(scene.playerProjectiles, scene.opponent, (projectile, target) => {
        projectile.destroy();
        scene.events.emit('player_hit', target, projectile.getData('damage'));
    }, null, scene);
    scene.physics.add.overlap(scene.opponentProjectiles, scene.player, (projectile, target) => {
        projectile.destroy();
        scene.events.emit('player_hit', target, projectile.getData('damage'));
    }, null, scene);

    // Dummy event listeners for UI updates (handled by React)
    scene.events.on('update_health', (characterName, healthValue) => {
        // This event will be caught by React UI component
        // console.log(`${characterName} health: ${healthValue}`);
    });
    scene.events.on('update_energy', (characterName, energyValue) => {
        // This event will be caught by React UI component
        // console.log(`${characterName} energy: ${energyValue}`);
    });
    scene.events.on('display_combo', (count) => {
        // console.log(`Combo: ${count}`);
    });
    scene.events.on('round_end', (winner) => {
        // console.log(`Round ended. Winner: ${winner}`);
    });
}

window.createScene = createScene;
