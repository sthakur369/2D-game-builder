function runCombatLoop(scene, delta) {
    // Defensive null checks
    if (!scene) { console.error('Scene is undefined in runCombatLoop'); return; }
    const player = scene.player;
    const opponent = scene.opponent;
    const keys = scene.keys;
    if (!player || !player.body) { console.error('Player or player.body is undefined'); return; }
    if (!opponent || !opponent.body) { console.error('Opponent or opponent.body is undefined'); return; }
    if (!keys) { console.error('Keys are undefined'); return; }

    // Wait until round actually starts
    if (!scene.roundStarted) {
        player.setVelocityX(0);
        player.play('goku_idle', true);
        opponent.setVelocityX(0);
        opponent.play('vegeta_idle', true);
        return;
    }

    // Player Movement and Animation Logic
    if (!player.body.enable) return; // If player is knocked out, disable controls

    // Only idle and punch animations are defined for Goku
    if (keys.left && keys.left.isDown) {
        player.setVelocityX(-200);
        player.setFlipX(true);
        if (player.body.onFloor()) player.play('goku_walk', true);
    } else if (keys.right && keys.right.isDown) {
        player.setVelocityX(200);
        player.setFlipX(false);
        if (player.body.onFloor()) player.play('goku_walk', true);
    } else {
        player.setVelocityX(0);
        if (player.body.onFloor()) player.play('goku_idle', true);
    }

    // Jump input (W)
    if (keys.jump && Phaser.Input.Keyboard.JustDown(keys.jump) && player.body.onFloor()) {
        player.setVelocityY(-350); // Adjust jump strength as needed
    }

    // Punch input (J)
    if (Phaser.Input.Keyboard.JustDown(keys.attack_light)) {
        player.play('goku_punch', true);
    }

    // Kick input (K)
    if (Phaser.Input.Keyboard.JustDown(keys.attack_heavy)) {
        player.play('goku_kick', true);
    }

    // Clamp Vegeta's Y position to the ground to prevent falling
    const groundY = scene.sys.game.config.height - 60;
    if (opponent.y > groundY) {
        opponent.y = groundY;
        opponent.setVelocityY(0);
    }

    // Fireball input (L)
    if (Phaser.Input.Keyboard.JustDown(keys.special_attack)) {
        // Spawn fireball projectile (static frame 0) using galick_gun_fx
        const fireball = scene.playerProjectiles.create(player.x + 80, player.y - 60, 'galick_gun_fx', 0); // Use frame 0
        fireball.setVelocityX(500);
        fireball.setScale(0.4);
        fireball.setDepth(20);
        fireball.body.allowGravity = false;
        fireball.setCollideWorldBounds(false); // Let it go off screen
    }

    // Destroy fireballs that leave the screen
    scene.playerProjectiles.children.each(function(fireball) {
        if (fireball.x > scene.sys.game.config.width || fireball.x < 0) {
            fireball.destroy();
        }
    }, this);

    // Vegeta AI movement and attack
    if (opponent.body.enable) {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
        const speed = 200;
        if (distance > 120) {
            // Move toward Goku
            if (player.x < opponent.x) {
                opponent.setVelocityX(-speed);
                opponent.setFlipX(true);
                opponent.play('vegeta_walk', true);
            } else if (player.x > opponent.x) {
                opponent.setVelocityX(speed);
                opponent.setFlipX(false);
                opponent.play('vegeta_walk', true);
            }
        } else {
            // Attack if close
            opponent.setVelocityX(0);
            opponent.play('vegeta_punch', true);
        }
    }

    // Health Reduction Logic (example, typically handled by collision callbacks)
    scene.events.on('player_hit', (target, damage) => {
        let currentHealth = target.getData('health');
        currentHealth -= damage;
        target.setData('health', currentHealth);
        target.play(target === player ? 'goku_hit' : 'vegeta_hit', true);
        scene.sound.play('hit_sfx');
        // Emit update to React UI
        scene.events.emit('update_health', target === player ? 'player' : 'opponent', currentHealth);

        if (currentHealth <= 0) {
            target.setVelocityX(0);
            target.setVelocityY(0);
            target.body.enable = false; // Disable physics body
            target.play(target === player ? 'goku_knocked_down' : 'vegeta_knocked_down', true);
            scene.events.emit('round_end', target === player ? 'opponent' : 'player');
        }

        // Display hit effect visually
        const hitEffect = scene.add.sprite(target.x, target.y - 50, 'hit_fx');
        hitEffect.play('hit_impact');
        hitEffect.once('animationcomplete', () => hitEffect.destroy());
    });
}

window.runCombatLoop = runCombatLoop;
