import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import KingdomScene from './scenes/KingdomScene';
import UIScene from './scenes/UIScene';

export interface GameConfig {
  containerId: string;
  onXPGained?: (xp: number) => void;
  onCharacterUpdate?: (characterData: any) => void;
}

export class LifeQuestGame {
  private game: Phaser.Game | null = null;
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  async initialize(): Promise<Phaser.Game> {
    if (this.game) {
      return this.game;
    }

    const phaserConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: this.config.containerId,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
      },
      scene: [BootScene, KingdomScene, UIScene],
      // Store config in the registry for access from scenes
      registry: {
        onXPGained: this.config.onXPGained,
        onCharacterUpdate: this.config.onCharacterUpdate,
      },
    };

    this.game = new Phaser.Game(phaserConfig);

    // Wait for game to be ready
    return new Promise((resolve) => {
      if (this.game) {
        this.game.events.once('ready', () => {
          resolve(this.game as Phaser.Game);
        });
      }
    });
  }

  public getGame(): Phaser.Game | null {
    return this.game;
  }

  public getScene(key: string): Phaser.Scene | undefined {
    return this.game?.scene.getScene(key);
  }

  public destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  public resize(width: number, height: number): void {
    if (this.game) {
      this.game.scale.resize(width, height);
    }
  }
}

export default LifeQuestGame;
