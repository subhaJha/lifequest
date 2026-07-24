import { useEffect, useState } from 'react';
import { LifeQuestGame } from '../Game';

export const useGameScene = (game: LifeQuestGame | null, sceneKey: string) => {
  const [scene, setScene] = useState<Phaser.Scene | undefined>(undefined);

  useEffect(() => {
    if (!game) return;

    const gameInstance = game.getGame();
    if (!gameInstance) return;

    // Wait for scene to be available
    const checkScene = () => {
      const scene = game.getScene(sceneKey);
      if (scene) {
        setScene(scene);
      } else {
        // Retry after a short delay
        setTimeout(checkScene, 100);
      }
    };

    checkScene();
  }, [game, sceneKey]);

  return scene;
};
