import Phaser from 'phaser';

export interface BuildingConfig {
  name: string;
  type: 'castle' | 'tower' | 'house' | 'market';
  x: number;
  y: number;
  level: number;
  resourcesProduced?: number;
}

export class Building extends Phaser.Physics.Arcade.Sprite {
  private name: string;
  private buildingType: string;
  private level: number;
  private resourcesProduced: number = 0;
  private isSelected: boolean = false;
  private selectionGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, config: BuildingConfig) {
    const texture = config.type === 'castle' ? 'castle-idle' : `${config.type}-idle`;
    super(scene, config.x, config.y, texture);

    this.name = config.name;
    this.buildingType = config.type;
    this.level = config.level;
    this.resourcesProduced = config.resourcesProduced || 0;

    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Setup physics body as static (buildings don't move)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);

    this.setInteractive();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('pointerdown', () => {
      this.select();
      this.scene.events.emit('building-selected', this);
    });

    this.on('pointerover', () => {
      if (!this.isSelected) {
        this.setTint(0xcccccc);
      }
    });

    this.on('pointerout', () => {
      if (!this.isSelected) {
        this.clearTint();
      }
    });
  }

  public select(): void {
    this.isSelected = true;
    this.setTint(0xffff00);

    // Draw selection circle
    if (!this.selectionGraphics) {
      this.selectionGraphics = this.scene.add.graphics();
    }

    this.selectionGraphics.clear();
    this.selectionGraphics.lineStyle(2, 0xffff00, 1);
    this.selectionGraphics.strokeCircle(this.x, this.y, 50);
  }

  public deselect(): void {
    this.isSelected = false;
    this.clearTint();

    if (this.selectionGraphics) {
      this.selectionGraphics.clear();
    }
  }

  public upgrade(): void {
    this.level += 1;
    this.resourcesProduced = Math.floor(this.resourcesProduced * 1.5);

    // Visual feedback for upgrade
    this.scene.tweens.add({
      targets: this,
      scale: 1.2,
      duration: 300,
      yoyo: true,
    });

    this.scene.events.emit('building-upgraded', {
      name: this.name,
      level: this.level,
      resourcesProduced: this.resourcesProduced,
    });
  }

  public produce(): number {
    return this.resourcesProduced;
  }

  // Getters
  public getName(): string {
    return this.name;
  }

  public getType(): string {
    return this.buildingType;
  }

  public getLevel(): number {
    return this.level;
  }

  public getResourcesProduced(): number {
    return this.resourcesProduced;
  }

  public isPlayerSelected(): boolean {
    return this.isSelected;
  }

  public cleanup(): void {
    if (this.selectionGraphics) {
      this.selectionGraphics.destroy();
      this.selectionGraphics = null;
    }
  }
}
