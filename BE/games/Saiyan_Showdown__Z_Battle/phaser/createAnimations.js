function createAnimations(scene) {
  console.log("✅ createAnimations is running");

  // Goku Animations
  scene.anims.create({
    key: 'goku_idle',
    frames: scene.anims.generateFrameNumbers('goku_ssj_spritesheet', {
      start: 0,
      end: 0
    }),
    frameRate: 1,
    repeat: -1
  });
  scene.anims.create({
    key: 'goku_walk',
    frames: scene.anims.generateFrameNumbers('goku_ssj_spritesheet', {
      start: 1,
      end: 5
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: 'goku_punch',
    frames: scene.anims.generateFrameNumbers('goku_ssj_spritesheet', {
      start: 6,
      end: 10
    }),
    frameRate: 15,
    repeat: 0
  });

  // Vegeta Animations
  scene.anims.create({
    key: 'vegeta_idle',
    frames: scene.anims.generateFrameNumbers('vegeta_spritesheet', {
      start: 0,
      end: 0
    }),
    frameRate: 1,
    repeat: -1
  });
  scene.anims.create({
    key: 'vegeta_walk',
    frames: scene.anims.generateFrameNumbers('vegeta_spritesheet', {
      start: 1,
      end: 5
    }),
    frameRate: 10,
    repeat: -1
  });
  scene.anims.create({
    key: 'vegeta_punch',
    frames: scene.anims.generateFrameNumbers('vegeta_spritesheet', {
      start: 6,
      end: 10
    }),
    frameRate: 15,
    repeat: 0
  });
}
window.createAnimations = createAnimations;