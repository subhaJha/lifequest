import Phaser from 'phaser';
import { MonsterStats, MonsterTemplate } from '../types/battleTypes';

/**
 * Monster Battle Entity
 * Represents an enemy in combat
 */
export class BattleMonster {
  scene: Phaser.Scene;
  sprite: Phaser.Physics.Arcade.Sprite;
  stats: MonsterStats;
  template: MonsterTemplate;
  healthBar: Phaser.GameObjects.Graphics;
  healthText: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;
  position: { x: number; y: number };
  particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: MonsterStats,
    template: MonsterTemplate
  ) {
    this.scene = scene;
    this.stats = { ...stats };
    this.template = template;
    this.position = { x, y };

    // Create sprite
    this.sprite = scene.physics.add.sprite(
      x,
      y,
      template.spriteKey || 'monster-placeholder'
    );
    this.sprite.setScale(2.5);
    this.sprite.setTint(parseInt(template.color.replace('#', '0x')));

    // Create health bar background
    this.healthBar = scene.add.graphics();
    this.drawHealthBar();

    // Health text
    this.healthText = scene.add.text(
      x - 50,
      y + 90,
      `${this.stats.currentHealth}/${this.stats.maxHealth}`,
      {
        font: 'bold 14px Arial',
        color: '#FF4444',
        backgroundColor: '#000000',
        padding: { x: 5, y: 3 },
      }
    );
    this.healthText.setOrigin(0.5);
    this.healthText.setDepth(10);

    // Name text
    this.nameText = scene.add.text(x, y - 80, template.description, {
      font: 'bold 16px Arial',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(10);
  }

  /**
   * Draw the health bar
   */
  drawHealthBar(): void {
    const barWidth = 120;
    const barHeight = 15;
    const x = this.position.x - barWidth / 2;
    const y = this.position.y + 75;

    this.healthBar.clear();

    // Background (red)
    this.healthBar.fillStyle(0xff0000, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // Health fill (red to yellow gradient effect)
    const healthPercent = this.stats.currentHealth / this.stats.maxHealth;
    const fillColor = healthPercent > 0.5 ? 0xff6600 : 0xff0000;
    this.healthBar.fillStyle(fillColor, 0.8);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 0.8);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);

    this.healthBar.setDepth(10);
  }

  /**
   * Update health display
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

    // Flash sprite white
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(100, () => {
      this.sprite.setTint(parseInt(this.template.color.replace('#', '0x')));
    });

    // Shake effect
    this.scene.cameras.main.shake(150, 0.01);
  }

  /**
   * Play attack animation
   */
  playAttackAnimation(): void {
    this.sprite.x += 20; // Lunge forward

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
      x: this.position.x + 30,
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
      rotation: Math.PI / 2,
      duration: 1000,
      ease: 'Power2.in',
    });

    // Explosion effect
    if (this.particles) {
      this.particles.emitParticleAt(this.position.x, this.position.y, 20);
    }
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
    this.nameText.destroy();
    if (this.particles) {
      this.particles.destroy();
    }
  }
}

export default BattleMonster;
