function createScene(scene) {
  console.log("✅ createScene is running");
  const gameWidth = scene.sys.game.config.width;
  const gameHeight = scene.sys.game.config.height;
  const groundY = gameHeight - 60; // Ground level based on origin 0.5,1 for characters

  // Add Background
  scene.add.image(gameWidth / 2, gameHeight / 2, 'battle_arena_wasteland').setOrigin(0.5).setScrollFactor(0).setDepth(0);

  // Setup World Bounds
  scene.physics.world.setBounds(0, 0, 1920, 1080); // Example larger world than viewport
  scene.physics.world.gravity.y = 0; // As per instruction to keep physics simple for fighting games

  // Draw visible ground
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x654321, 1); // Brown color for ground
  graphics.fillRect(0, groundY, gameWidth, 60);

  // Create invisible ground for physics
  scene.ground = scene.add.rectangle(gameWidth / 2, groundY + 30, gameWidth, 60, 0x000000, 0); // CenterX, CenterY, Width, Height, Color, Alpha
  scene.physics.add.existing(scene.ground, true); // true makes it static/immovable
  scene.ground.body.allowGravity = false;
  scene.ground.body.immovable = true;

  // Create Player 1 (Goku)
  scene.player = scene.physics.add.sprite(400, groundY, 'goku_ssj_spritesheet').setScale(0.8).setOrigin(0.5, 1).setDepth(10);
  scene.player.setCollideWorldBounds(true);
  scene.player.setBounce(0.1);
  scene.player.setData('health', 1000);
  scene.player.setData('energy', 500);
  scene.player.setData('isAttacking', false);
  scene.player.play('goku_idle');

  // Create Player 2 (Vegeta) as opponent
  scene.opponent = scene.physics.add.sprite(gameWidth - 400, groundY, 'vegeta_spritesheet').setScale(0.8).setOrigin(0.5, 1).setFlipX(true).setDepth(10);
  scene.opponent.setCollideWorldBounds(true);
  scene.opponent.setBounce(0.1);
  scene.opponent.setData('health', 1000);
  scene.opponent.setData('energy', 500);
  scene.opponent.setData('isAttacking', false);
  scene.opponent.play('vegeta_idle');

  // Add Collisions
  scene.physics.add.collider(scene.player, scene.ground);
  scene.physics.add.collider(scene.opponent, scene.ground);
  scene.physics.add.collider(scene.player, scene.opponent);

  // Setup Round Delay
  scene.roundStarted = false;
  scene.time.delayedCall(2000, () => {
    scene.roundStarted = true;
    console.log("Round Started!");
  }, null, scene);

  // Setup Camera
  // Bounded camera that smoothly pans to keep both players in view, or zooms out slightly
  scene.cameras.main.startFollow(scene.player, true, 0.05, 0.05);
  scene.cameras.main.setZoom(1);
  scene.cameras.main.setBounds(0, 0, 1920, 1080);

  // Create Projectile Groups
  scene.playerProjectiles = scene.physics.add.group({
    classType: Phaser.GameObjects.Sprite,
    runChildUpdate: true
  });
  scene.opponentProjectiles = scene.physics.add.group({
    classType: Phaser.GameObjects.Sprite,
    runChildUpdate: true
  });

  // Add projectile-player collision (placeholders for actual hit logic)
  scene.physics.add.overlap(scene.opponent, scene.playerProjectiles, (opponent, projectile) => {
    if (!opponent.getData('isInvulnerable')) {
        scene.events.emit('player_hit', opponent, 50);
        projectile.destroy();
    }
  }, null, scene);
  scene.physics.add.overlap(scene.player, scene.opponentProjectiles, (player, projectile) => {
    if (!player.getData('isInvulnerable')) {
        scene.events.emit('player_hit', player, 50);
        projectile.destroy();
    }
  }, null, scene);

  // Add Event Listeners for UI / Game Logic
  scene.events.on('player_hit', (target, damage) => {
    let currentHealth = target.getData('health');
    currentHealth -= damage;
    if (currentHealth < 0) currentHealth = 0;
    target.setData('health', currentHealth);
    console.log(`${target.texture.key} hit! Health: ${currentHealth}`);

    // Example: Play hit animation and effect
    if (!target.getData('isAttacking')) { // Don't override attack animation immediately
        target.play(target.texture.key.includes('goku') ? 'goku_hurt' : 'vegeta_hurt', true);
        target.once('animationcomplete', () => {
            if (!target.getData('isAttacking')) {
                target.play(target.texture.key.includes('goku') ? 'goku_idle' : 'vegeta_idle', true);
            }
        });
    }
    scene.add.sprite(target.x, target.y - 50, 'hit_impact_fx').play('hit_impact').once('animationcomplete', (animation, frame) => { frame.gameObject.destroy(); });

    if (currentHealth === 0) {
      scene.events.emit('round_end', target);
    }
  }, scene);

  scene.events.on('round_end', (loser) => {
    scene.roundStarted = false;
    console.log(`Round ended! ${loser.texture.key} defeated!`);
    scene.time.delayedCall(3000, () => { /* Transition to game over/round end screen */ }, null, scene);
  }, scene);

  // Store game config for easy access in update loop
  scene.gameplay = scene.sys.game.config.gameplayConfig; // Assuming config injected or retrieved
}
window.createScene = createScene;