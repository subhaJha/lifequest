import Phaser from 'phaser';
import { BattleHero } from '../entities/BattleHero';
import { BattleMonster } from '../entities/BattleMonster';
import battleAPI from '../../services/battleApi';
import type {
  Battle,
  MonsterTemplate,
  BattleStatus,
} from '../types/battleTypes';

/**
 * Battle Scene
 * Main Phaser scene for quest battles
 */
export class BattleScene extends Phaser.Scene {
  private hero: BattleHero | null = null;
  private monster: BattleMonster | null = null;
  private battleId: string = '';
  private battle: Battle | null = null;
  private monsterTemplate: MonsterTemplate | null = null;

  // UI Elements
  private battleLogText: Phaser.GameObjects.Text | null = null;
  private statusText: Phaser.GameObjects.Text | null = null;
  private attackButton: Phaser.GameObjects.Rectangle | null = null;
  private forfeitButton: Phaser.GameObjects.Rectangle | null = null;

  private isPlayerTurn: boolean = true;
  private battleEnded: boolean = false;
  private animatingAction: boolean = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  /**
   * Initialize scene with battle data
   */
  init(data: any) {
    this.battleId = data.battleId;
  }

  /**
   * Preload assets
   */
  preload() {
    // Battle backgrounds
    if (!this.textures.exists('battle-background')) {
      this.make.graphics({
        x: 0,
        y: 0,
        add: false,
      });

      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0x1a1a2e, 1);
      graphics.fillRect(0, 0, 1280, 720);
      graphics.generateTexture('battle-background', 1280, 720);
      graphics.destroy();
    }

    // Particle textures
    if (!this.textures.exists('particle')) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffd700);
      graphics.fillCircle(4, 4, 4);
      graphics.generateTexture('particle', 8, 8);
      graphics.destroy();
    }
  }

  /**
   * Create the battle scene
   */
  async create() {
    // Set background
    this.add.image(640, 360, 'battle-background');

    // Draw arena
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x0f3460);
    graphics.strokeRect(100, 150, 1080, 450);

    try {
      // Fetch current battle state
      const response = await battleAPI.getBattle(this.battleId);
      this.battle = response.battle;

      // Create hero and monster
      this.createBattleEntities();
      this.createUI();

      // Add input listeners
      this.setupInputHandlers();

      // Start battle message
      this.addBattleLog('Battle Start!');
      this.updateStatusText();
    } catch (error) {
      console.error('Error creating battle scene:', error);
      this.addBattleLog('Error loading battle: ' + (error as Error).message);
    }
  }

  /**
   * Create hero and monster entities
   */
  private createBattleEntities() {
    if (!this.battle) return;

    // Create hero
    this.hero = new BattleHero(
      this,
      250,
      360,
      this.battle.heroStats,
      'hero-idle'
    );

    // Create monster
    this.monster = new BattleMonster(
      this,
      1030,
      360,
      this.battle.monsterStats,
      this.monsterTemplate || {
        type: this.battle.monsterType,
        difficulty: this.battle.monsterDifficulty,
        baseHealth: this.battle.monsterStats.maxHealth,
        baseDamage: this.battle.monsterStats.damage,
        baseArmor: this.battle.monsterStats.armor,
        attackCooldown: 1500,
        xpReward: 100,
        goldReward: 50,
        spriteKey: `${this.battle.monsterType}-idle`,
        color: '#FF4500',
        description: `${this.battle.monsterDifficulty} ${this.battle.monsterType}`,
        abilities: [],
      }
    );
  }

  /**
   * Create UI elements
   */
  private createUI() {
    const screenCenterX = this.cameras.main.centerX;
    const screenCenterY = this.cameras.main.centerY;

    // Battle log
    this.battleLogText = this.add.text(100, 620, '', {
      font: '12px Arial',
      color: '#90EE90',
      backgroundColor: '#0a0a1a',
      padding: { x: 10, y: 5 },
      wordWrap: { width: 700 },
    });
    this.battleLogText.setDepth(20);

    // Status text (turn indicator)
    this.statusText = this.add.text(screenCenterX, 100, '', {
      font: 'bold 18px Arial',
      color: '#FFD700',
      align: 'center',
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setDepth(20);

    // Attack button
    this.attackButton = this.add.rectangle(
      screenCenterX - 100,
      650,
      150,
      40,
      0x44ff44
    );
    this.attackButton.setInteractive({ useHandCursor: true });
    this.attackButton.on('pointerover', () => {
      this.attackButton?.setFillStyle(0x66ff66);
    });
    this.attackButton.on('pointerout', () => {
      this.attackButton?.setFillStyle(0x44ff44);
    });
    this.attackButton.on('pointerdown', () => this.handlePlayerAttack());
    this.attackButton.setDepth(20);

    const attackText = this.add.text(
      screenCenterX - 100,
      650,
      'ATTACK',
      {
        font: 'bold 14px Arial',
        color: '#000000',
      }
    );
    attackText.setOrigin(0.5);
    attackText.setDepth(21);

    // Forfeit button
    this.forfeitButton = this.add.rectangle(
      screenCenterX + 100,
      650,
      150,
      40,
      0xff4444
    );
    this.forfeitButton.setInteractive({ useHandCursor: true });
    this.forfeitButton.on('pointerover', () => {
      this.forfeitButton?.setFillStyle(0xff6666);
    });
    this.forfeitButton.on('pointerout', () => {
      this.forfeitButton?.setFillStyle(0xff4444);
    });
    this.forfeitButton.on('pointerdown', () => this.handleForfeit());
    this.forfeitButton.setDepth(20);

    const forfeitText = this.add.text(
      screenCenterX + 100,
      650,
      'FORFEIT',
      {
        font: 'bold 14px Arial',
        color: '#ffffff',
      }
    );
    forfeitText.setOrigin(0.5);
    forfeitText.setDepth(21);
  }

  /**
   * Setup input handlers
   */
  private setupInputHandlers() {
    // Space bar to attack
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.isPlayerTurn && !this.battleEnded && !this.animatingAction) {
        this.handlePlayerAttack();
      }
    });

    // Escape to forfeit
    this.input.keyboard?.on('keydown-ESC', () => {
      this.handleForfeit();
    });
  }

  /**
   * Handle player attack
   */
  private async handlePlayerAttack() {
    if (!this.isPlayerTurn || this.battleEnded || this.animatingAction) {
      return;
    }

    this.animatingAction = true;
    this.isPlayerTurn = false;

    try {
      // Play attack animation
      if (this.hero) {
        this.hero.playAttackAnimation();
      }

      // Send attack to server
      const response = await battleAPI.heroAttack(this.battleId);
      this.battle = response.battle;

      // Play hit animation on monster
      if (this.monster && response.damage > 0) {
        this.monster.playHitAnimation();
        this.monster.takeDamage(response.damage);
      }

      // Add log entry
      const logMsg = response.isCritical
        ? `⚡ CRITICAL HIT for ${response.damage} damage!`
        : `🗡️ Attack for ${response.damage} damage`;
      this.addBattleLog(logMsg);

      // Check if monster defeated
      if (response.monsterDefeated) {
        this.handleVictory();
      } else {
        // Wait then let monster attack
        this.time.delayedCall(800, () => {
          this.handleMonsterAttack();
        });
      }
    } catch (error) {
      console.error('Error in player attack:', error);
      this.addBattleLog('Attack failed: ' + (error as Error).message);
      this.isPlayerTurn = true;
      this.animatingAction = false;
    }
  }

  /**
   * Handle monster attack
   */
  private async handleMonsterAttack() {
    if (this.battleEnded || !this.monster) return;

    try {
      // Play attack animation
      this.monster.playAttackAnimation();

      // Send attack to server
      const response = await battleAPI.monsterAttack(this.battleId);
      this.battle = response.battle;

      // Play hit animation on hero
      if (this.hero && response.damage > 0) {
        this.hero.playHitAnimation();
        this.hero.takeDamage(response.damage);
      }

      // Add log entry
      const logMsg = response.isCritical
        ? `💢 CRITICAL MONSTER HIT for ${response.damage} damage!`
        : `💥 Monster attack for ${response.damage} damage`;
      this.addBattleLog(logMsg);

      // Check if hero defeated
      if (response.heroDefeated) {
        this.handleDefeat();
      } else {
        // Return to player turn
        this.time.delayedCall(800, () => {
          this.isPlayerTurn = true;
          this.animatingAction = false;
          this.updateStatusText();
        });
      }
    } catch (error) {
      console.error('Error in monster attack:', error);
      this.addBattleLog('Monster attack failed: ' + (error as Error).message);
      this.animatingAction = false;
    }
  }

  /**
   * Handle victory
   */
  private handleVictory() {
    this.battleEnded = true;

    if (this.monster) {
      this.monster.playDeathAnimation();
    }

    this.addBattleLog('🎉 VICTORY! Monster defeated!');

    // Emit event for completion
    this.events.emit('battleComplete', { status: 'victory', battleId: this.battleId });
  }

  /**
   * Handle defeat
   */
  private handleDefeat() {
    this.battleEnded = true;

    if (this.hero) {
      this.hero.playDeathAnimation();
    }

    this.addBattleLog('💀 DEFEAT! You were defeated!');

    // Emit event for completion
    this.events.emit('battleComplete', { status: 'defeat', battleId: this.battleId });
  }

  /**
   * Handle forfeit
   */
  private async handleForfeit() {
    if (this.battleEnded) return;

    try {
      await battleAPI.forfeitBattle(this.battleId);
      this.addBattleLog('⚠️ Battle forfeited');
      this.battleEnded = true;

      this.events.emit('battleComplete', { status: 'forfeit', battleId: this.battleId });
    } catch (error) {
      console.error('Error forfeiting:', error);
    }
  }

  /**
   * Add message to battle log
   */
  private addBattleLog(message: string) {
    if (!this.battleLogText) return;

    const currentText = this.battleLogText.text;
    const lines = currentText.split('\n').slice(-4); // Keep last 4 lines
    lines.push(message);
    this.battleLogText.setText(lines.join('\n'));
  }

  /**
   * Update status text
   */
  private updateStatusText() {
    if (!this.statusText) return;

    if (this.battleEnded) {
      if (this.battle?.status === BattleStatus.VICTORY) {
        this.statusText.setText('VICTORY!');
        this.statusText.setColor('#44ff44');
      } else {
        this.statusText.setText('DEFEAT!');
        this.statusText.setColor('#ff4444');
      }
    } else {
      this.statusText.setText(
        this.isPlayerTurn ? 'Your Turn - Attack!' : 'Monster Turn...'
      );
      this.statusText.setColor(this.isPlayerTurn ? '#44ff44' : '#ff4444');
    }
  }

  /**
   * Update loop
   */
  update() {
    this.updateStatusText();
  }

  /**
   * Cleanup
   */
  shutdown() {
    if (this.hero) this.hero.destroy();
    if (this.monster) this.monster.destroy();
  }

  /**
   * Cleanup on scene stop
   */
  stop() {
    this.shutdown();
  }
}

export default BattleScene;
