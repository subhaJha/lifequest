import React, { useState, useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BattleScene } from '../game/scenes/BattleScene';
import battleAPI from '../services/battleApi';
import { Battle, BattleStatus, MonsterTemplate } from '../game/types/battleTypes';
import './BattleContainer.css';

interface BattleContainerProps {
  taskId: string;
  taskDifficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  characterLevel: number;
  onBattleComplete: (
    result: 'victory' | 'defeat' | 'forfeit',
    rewards?: any
  ) => void;
  onBattleCancel: () => void;
}

/**
 * Battle Container Component
 * Manages Phaser game instance and battle state
 */
export const BattleContainer: React.FC<BattleContainerProps> = ({
  taskId,
  taskDifficulty,
  characterLevel,
  onBattleComplete,
  onBattleCancel,
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [battleId, setBattleId] = useState<string>('');
  const [battle, setBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [battleStatus, setBattleStatus] = useState<BattleStatus | null>(null);

  /**
   * Initialize battle
   */
  useEffect(() => {
    const initBattle = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await battleAPI.startBattle(taskId, taskDifficulty);

        if (response.success && response.battle) {
          setBattleId(response.battle._id);
          setBattle(response.battle);
          initializePhaser(response.battle._id);
        } else {
          setError('Failed to start battle');
        }
      } catch (err) {
        console.error('Error initializing battle:', err);
        setError((err as Error).message || 'Failed to initialize battle');
      } finally {
        setIsLoading(false);
      }
    };

    initBattle();
  }, [taskId, taskDifficulty]);

  /**
   * Initialize Phaser game
   */
  const initializePhaser = (battleId: string) => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
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
        width: 1280,
        height: 720,
        parent: containerRef.current,
      },
      scene: [BattleScene],
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Listen for battle completion events
    const scene = game.scene.getScene('BattleScene') as BattleScene;
    if (scene) {
      scene.events.on('battleComplete', (data: any) => {
        handleBattleComplete(data.status, battleId);
      });
    }

    // Launch battle scene with data
    game.scene.start('BattleScene', { battleId });
  };

  /**
   * Handle battle completion
   */
  const handleBattleComplete = async (
    result: 'victory' | 'defeat' | 'forfeit',
    battleId: string
  ) => {
    try {
      if (result === 'victory') {
        // Complete battle and get rewards
        const response = await battleAPI.completeBattle(battleId, taskId);

        if (response.success) {
          setBattle(response.battle);
          setBattleStatus(BattleStatus.VICTORY);
          onBattleComplete('victory', response.rewards);
        }
      } else if (result === 'defeat') {
        setBattleStatus(BattleStatus.DEFEAT);
        onBattleComplete('defeat');
      } else if (result === 'forfeit') {
        setBattleStatus(BattleStatus.DEFEAT);
        onBattleComplete('forfeit');
      }
    } catch (err) {
      console.error('Error completing battle:', err);
      setError((err as Error).message || 'Failed to complete battle');
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="battle-loading">
        <h2>Initializing Battle...</h2>
        <p>Summoning your enemy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="battle-error">
        <h2>Battle Error</h2>
        <p>{error}</p>
        <button onClick={onBattleCancel}>Return</button>
      </div>
    );
  }

  return (
    <div className="battle-container">
      <div className="battle-header">
        <h1>Quest Battle</h1>
        <button className="close-btn" onClick={onBattleCancel}>
          ✕
        </button>
      </div>

      <div className="battle-game" ref={containerRef} />

      {battleStatus && (
        <div className={`battle-result ${battleStatus.toLowerCase()}`}>
          <h2>{battleStatus.toUpperCase()}</h2>
          {battle?.rewards && (
            <div className="rewards">
              <p>
                XP Gained:{' '}
                <span className="xp">{battle.rewards.xpGained}</span>
              </p>
              <p>
                Gold Gained:{' '}
                <span className="gold">{battle.rewards.goldGained}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleContainer;
