import Phaser from 'phaser';
import { HeroStats } from '../types/battleTypes';

/**
 * Hero Battle Entity
 * Represents the player's character in combat
 */
export class BattleHero {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  stats: HeroStats;
  healthBar: Phaser.GameObjects.Graphics;
  healthText: Phaser.GameObjects.Text;
  position: { x: number; y: number };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: HeroStats,
    spriteKey: string = 'hero-idle'
  ) {
    this.scene = scene;
    this.stats = { ...stats };
    this.position = { x, y };

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, spriteKey);
    this.sprite.setScale(2);
    this.sprite.setTint(0xffffff);

    // Create health bar background
    this.healthBar = scene.add.graphics();
    this.drawHealthBar();

    // Health text
    this.healthText = scene.add.text(
      x - 50,
      y + 80,
      `${this.stats.currentHealth}/${this.stats.maxHealth}`,
      {
        font: 'bold 14px Arial',
        color: '#90EE90',
        backgroundColor: '#000000',
        padding: { x: 5, y: 3 },
      }
    );
    this.healthText.setOrigin(0.5);
    this.healthText.setDepth(10);
  }

  /**
   * Draw the health bar
   */
  drawHealthBar(): void {
    const barWidth = 100;
    const barHeight = 15;
    const x = this.position.x - barWidth / 2;
    const y = this.position.y + 60;

    this.healthBar.clear();

    // Background (red)
    this.healthBar.fillStyle(0xff0000, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // Health fill (green)
    const healthPercent = this.stats.currentHealth / this.stats.maxHealth;
    this.healthBar.fillStyle(0x00ff00, 0.8);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 0.8);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);

    this.healthBar.setDepth(10);
  }

  /**
   * Update health text
   */
  updateHealthDisplay(): void {
    this.healthText.setText(
      `${this.stats.currentHealth}/${this.stats.maxHealth}`
    );
    this.drawHealthBar();
  }

  /**
   * Take damage
   */
  takeDamage(damage: number): void {
    this.stats.currentHealth = Math.max(0, this.stats.currentHealth - damage);
    this.updateHealthDisplay();

    // Flash sprite red
    this.sprite.setTint(0xff6666);
    this.scene.time.delayedCall(200, () => {
      this.sprite.setTint(0xffffff);
    });
  }

  /**
   * Heal
   */
  heal(amount: number): void {
    this.stats.currentHealth = Math.min(
      this.stats.maxHealth,
      this.stats.currentHealth + amount
    );
    this.updateHealthDisplay();
  }

  /**
   * Play attack animation
   */
  playAttackAnimation(): void {
    this.sprite.x -= 20; // Lunge forward

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.position.x,
      duration: 300,
      ease: 'Power2.easeOut',
    });
  }

  /**
   * Play hit animation
   */
  playHitAnimation(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.position.x - 30,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });
  }

  /**
   * Play death animation
   */
  playDeathAnimation(): void {
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.position.y + 50,
      duration: 1000,
      ease: 'Power2.in',
    });
  }

  /**
   * Get alive status
   */
  isAlive(): boolean {
    return this.stats.currentHealth > 0;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.sprite.destroy();
    this.healthBar.destroy();
    this.healthText.destroy();
  }
}

export default BattleHero;
