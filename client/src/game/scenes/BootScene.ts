import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Create simple graphics for hero placeholder textures.
    // These are single-frame textures (images), not spritesheets.
    const heroGraphics = this.make.graphics({ x: 0, y: 0 });

    // hero-idle
    heroGraphics.fillStyle(0x4169e1, 1); // Royal blue
    heroGraphics.fillRect(0, 0, 32, 32);
    heroGraphics.generateTexture('hero-idle', 32, 32);

    // hero-walk
    heroGraphics.clear();
    heroGraphics.fillStyle(0x1e90ff, 1);
    heroGraphics.fillRect(0, 0, 32, 32);
    heroGraphics.generateTexture('hero-walk', 32, 32);

    // hero-celebrate
    heroGraphics.clear();
    heroGraphics.fillStyle(0xffd700, 1);
    heroGraphics.fillRect(0, 0, 32, 32);
    heroGraphics.generateTexture('hero-celebrate', 32, 32);

    heroGraphics.destroy();

    // Create simple graphics for building placeholder
    const buildingGraphics = this.make.graphics({ x: 0, y: 0 });
    buildingGraphics.fillStyle(0x8b4513, 1); // Brown for castle
    buildingGraphics.fillRect(0, 0, 64, 64);
    buildingGraphics.lineStyle(2, 0x654321, 1);
    buildingGraphics.strokeRect(16, 8, 32, 32); // Door
    buildingGraphics.generateTexture('castle-idle', 64, 64);
    buildingGraphics.destroy();

    // Placeholder background grid
    const gridGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    gridGraphics.fillStyle(0x2d5a2d, 1); // Dark green
    gridGraphics.fillRect(0, 0, 1024, 1024);
    gridGraphics.lineStyle(1, 0x4a7c4e, 0.5); // Grid lines
    for (let x = 0; x < 1024; x += 64) {
      gridGraphics.lineBetween(x, 0, x, 1024);
    }
    for (let y = 0; y < 1024; y += 64) {
      gridGraphics.lineBetween(0, y, 1024, y);
    }
    gridGraphics.generateTexture('kingdom-map', 1024, 1024);
    gridGraphics.destroy();
  }

  create(): void {
    // Start the Kingdom Scene
    this.scene.start('KingdomScene');
    this.scene.launch('UIScene');
  }
}

