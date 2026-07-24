import { useEffect, useRef } from 'react';
import { LifeQuestGame } from '../Game';
import type { GameConfig } from '../Game';


export const useGameInstance = (
  containerId: string,
  config?: Partial<GameConfig>
) => {
  const gameRef = useRef<LifeQuestGame | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;

    const initializeGame = async () => {
      try {
        gameRef.current = new LifeQuestGame({
          containerId,
          ...config,
        });

        await gameRef.current.initialize();
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize Phaser game:', error);
      }
    };

    initializeGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, [containerId, config]);

  return gameRef.current;
};
