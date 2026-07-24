import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private xpText: Phaser.GameObjects.Text | null = null;
  private levelText: Phaser.GameObjects.Text | null = null;
  private levelBar: Phaser.GameObjects.Graphics | null = null;
  private currentXP: number = 0;
  private currentLevel: number = 1;
  private xpToNextLevel: number = 100;
  private totalXP: number = 0;

  constructor() {
    super({
      key: 'UIScene',
      active: true,
    });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create background panel for HUD
    const hudPanel = this.add.rectangle(
      width - 120,
      height - 60,
      220,
      100,
      0x000000,
      0.8
    );
    hudPanel.setScrollFactor(0); // Don't scroll with camera

    // XP Text
    this.xpText = this.add.text(width - 200, height - 80, 'XP: 0', {
      font: '16px Arial',
      color: '#ffff00',
      fontStyle: 'bold',
    });
    this.xpText.setScrollFactor(0);
    this.xpText.setDepth(1001);

    // Level Text
    this.levelText = this.add.text(width - 200, height - 50, 'LVL: 1', {
      font: '16px Arial',
      color: '#00ff00',
      fontStyle: 'bold',
    });
    this.levelText.setScrollFactor(0);
    this.levelText.setDepth(1001);

    // Experience bar background
    const barBg = this.add.rectangle(
      width - 120,
      height - 20,
      200,
      20,
      0x333333,
      1
    );
    barBg.setScrollFactor(0);
    barBg.setDepth(1000);

    // Experience bar fill
    this.levelBar = this.add.graphics();
    this.levelBar.setScrollFactor(0);
    this.levelBar.setDepth(1001);
    this.updateXPBar();

    // Listen for XP gained events from KingdomScene
    const kingdomScene = this.scene.get('KingdomScene');
    if (kingdomScene) {
      kingdomScene.events.on('xp-gained', (amount: number) => {
        this.addXP(amount);
      });
    }

    // Instructions text
    const instructions = this.add.text(10, 10, 'Click to move | Scroll to zoom | WASD for movement', {
      font: '14px Arial',
      color: '#ffffff',
    });
    instructions.setScrollFactor(0);
    instructions.setDepth(1001);
  }

  private addXP(amount: number): void {
    this.totalXP += amount;
    this.currentXP += amount;

    // Check for level up
    while (this.currentXP >= this.xpToNextLevel) {
      this.currentXP -= this.xpToNextLevel;
      this.levelUp();
    }

    this.updateDisplay();
  }

  private levelUp(): void {
    this.currentLevel += 1;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.1);

    // Visual effect
    const text = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'LEVEL UP!',
      {
        font: 'bold 48px Arial',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(2000);

    this.tweens.add({
      targets: text,
      y: text.y - 100,
      alpha: 0,
      duration: 2000,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });

    // Emit level up event
    const kingdomScene = this.scene.get('KingdomScene');
    if (kingdomScene) {
      kingdomScene.events.emit('level-up', this.currentLevel);
    }
  }

  private updateDisplay(): void {
    if (this.xpText) {
      this.xpText.setText(`XP: ${this.currentXP}/${this.xpToNextLevel}`);
    }

    if (this.levelText) {
      this.levelText.setText(`LVL: ${this.currentLevel}`);
    }

    this.updateXPBar();
  }

  private updateXPBar(): void {
    if (!this.levelBar) return;

    this.levelBar.clear();
    this.levelBar.fillStyle(0x00ff00, 1);

    const barWidth = 200;
    const percentage = this.currentXP / this.xpToNextLevel;
    const fillWidth = barWidth * Math.min(percentage, 1);

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.levelBar.fillRect(
      width - 220,
      height - 28,
      fillWidth,
      16
    );
  }

  public getCurrentXP(): number {
    return this.currentXP;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public getTotalXP(): number {
    return this.totalXP;
  }
}
