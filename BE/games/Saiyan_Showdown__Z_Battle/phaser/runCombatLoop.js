function runCombatLoop(scene) {
  if (!scene || !scene.player || !scene.opponent || !scene.playerKeys) {
    console.error('Scene, player, opponent, or keys are undefined in runCombatLoop');
    return;
  }

  const player = scene.player;
  const opponent = scene.opponent;
  const playerKeys = scene.playerKeys;
  const groundY = scene.sys.game.config.height - 60;
  const playerSpeed = 350;
  const jumpHeight = 450;
  const energyBlastCost = 100;
  const specialMoveCost = 300;

  // Prevent actions if round hasn't started
  if (!scene.roundStarted) {
    player.setVelocityX(0);
    player.play('goku_idle', true);
    opponent.setVelocityX(0);
    opponent.play('vegeta_idle', true);
    return;
  }

  // --- Player 1 (Goku) Controls and Logic ---
  player.body.setVelocityX(0);

  // Ensure player is at ground level if not jumping
  if (player.body.velocity.y === 0 && player.y !== groundY) {
      player.y = groundY;
  }

  let isMoving = false;
  if (playerKeys.left.isDown) {
    player.setVelocityX(-playerSpeed);
    player.setFlipX(true);
    isMoving = true;
  } else if (playerKeys.right.isDown) {
    player.setVelocityX(playerSpeed);
    player.setFlipX(false);
    isMoving = true;
  }

  if (playerKeys.jump.isDown && player.body.y >= groundY - 10) { // Simple jump check to simulate onFloor with setGravityY(0)
    player.setVelocityY(-jumpHeight);
  }

  // Animations (only if not attacking)
  if (!player.getData('isAttacking')) {
    if (isMoving) {
      player.play('goku_walk', true);
    } else {
      player.play('goku_idle', true);
    }
  }

  // Attacks
  if (Phaser.Input.Keyboard.JustDown(playerKeys.light_punch)) {
    if (!player.getData('isAttacking')) {
      player.setData('isAttacking', true);
      player.play('goku_punch', true);
      // Simulate hit detection for light punch
      if (Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y) < 150) {
        scene.events.emit('player_hit', opponent, 10); // Light damage
      }
      player.once('animationcomplete', () => {
        player.setData('isAttacking', false);
        player.play('goku_idle', true);
      });
    }
  } else if (Phaser.Input.Keyboard.JustDown(playerKeys.energy_blast)) {
    if (!player.getData('isAttacking') && player.getData('energy') >= energyBlastCost) {
      player.setData('isAttacking', true);
      player.setData('energy', player.getData('energy') - energyBlastCost);
      player.play('goku_punch', true); // Using punch anim as placeholder for energy blast charge
      scene.time.delayedCall(500, () => {
        // Create Kamehameha blast (simple projectile example)
        const blast = scene.playerProjectiles.create(player.x + (player.flipX ? -70 : 70), player.y - 100, 'kamehameha_fx');
        blast.setScale(0.5);
        blast.setVelocityX(player.flipX ? -500 : 500);
        blast.setCollideWorldBounds(true);
        blast.body.onWorldBounds = true; // Mark to destroy when out of bounds
        blast.body.allowGravity = false;
        blast.play('kamehameha_fx_anim', true); // Assuming an animation key for the effect

        blast.once('animationcomplete', () => { blast.destroy(); });
        blast.body.world.on('worldbounds', (body) => {
            if (body.gameObject === blast) { blast.destroy(); }
        });
      }, null, scene);

      player.once('animationcomplete', () => {
        player.setData('isAttacking', false);
        player.play('goku_idle', true);
      });
    }
  } else if (playerKeys.special_modifier.isDown && Phaser.Input.Keyboard.JustDown(playerKeys.energy_blast)) {
      if (!player.getData('isAttacking') && player.getData('energy') >= specialMoveCost) {
          player.setData('isAttacking', true);
          player.setData('energy', player.getData('energy') - specialMoveCost);
          player.play('goku_punch', true); // Placeholder for a 'charging' animation
          scene.time.delayedCall(1000, () => {
              // Spirit Bomb example: just damage opponent directly for now
              scene.events.emit('player_hit', opponent, 100); // Heavy damage
              scene.add.sprite(opponent.x, opponent.y - 150, 'spirit_bomb_fx').play('spirit_bomb_fx_anim').once('animationcomplete', (animation, frame) => { frame.gameObject.destroy(); });
          }, null, scene);
          player.once('animationcomplete', () => {
              player.setData('isAttacking', false);
              player.play('goku_idle', true);
          });
      }
  }

  // --- Opponent (Vegeta) AI Logic ---
  opponent.body.setVelocityX(0);
  // Clamp opponent to ground
  if (opponent.body.velocity.y === 0 && opponent.y !== groundY) {
      opponent.y = groundY;
  }

  const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
  const aggroRange = 400;
  const attackRange = 120;

  if (!opponent.getData('isAttacking')) {
    if (distance > aggroRange) {
      // Move towards player
      if (player.x < opponent.x) {
        opponent.setVelocityX(-playerSpeed * 0.8);
        opponent.setFlipX(true);
      } else {
        opponent.setVelocityX(playerSpeed * 0.8);
        opponent.setFlipX(false);
      }
      opponent.play('vegeta_walk', true);
    } else if (distance > attackRange) {
        // Dash towards player if within aggro but not attack range
        if (player.x < opponent.x) {
            opponent.setVelocityX(-700); // Dash speed
            opponent.setFlipX(true);
        } else {
            opponent.setVelocityX(700); // Dash speed
            opponent.setFlipX(false);
        }
        opponent.play('vegeta_walk', true);
    } else {
      // Attack if close enough
      opponent.setVelocityX(0);
      opponent.play('vegeta_punch', true);
      opponent.setData('isAttacking', true);
      if (Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y) < 150) {
        scene.events.emit('player_hit', player, 15); // AI heavy damage
      }
      opponent.once('animationcomplete', () => {
        opponent.setData('isAttacking', false);
        opponent.play('vegeta_idle', true);
      });
    }
  } else {
    opponent.setVelocityX(0);
  }

  // Camera follow logic (simplified for single-player follow, blueprint asks for dual player follow/zoom)
  // This would need more complex logic to calculate mid-point and zoom level
  const midX = (player.x + opponent.x) / 2;
  const minX = Math.min(player.x, opponent.x);
  const maxX = Math.max(player.x, opponent.x);
  const distanceBetweenPlayers = maxX - minX;
  const targetZoom = Phaser.Math.Clamp(1 - (distanceBetweenPlayers / (gameWidth * 2)), 0.7, 1);
  scene.cameras.main.setZoom(targetZoom);
  scene.cameras.main.centerOn(midX, gameHeight / 2 - 100); // Offset Y slightly for better view

}
window.runCombatLoop = runCombatLoop;