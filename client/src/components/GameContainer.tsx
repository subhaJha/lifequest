import React, { useEffect, useState } from 'react';
import { useGameInstance } from '../game/hooks/useGameInstance';
import { useAuth } from '../contexts/useAuth';
import { characterAPI } from '../services/api';

import '../styles/GameContainer.css';

interface GameContainerProps {
  onXPGained?: (xp: number) => void;
  onCharacterUpdate?: (characterData: any) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  onXPGained,
  onCharacterUpdate,
}) => {
  const { user } = useAuth();
  const [gameReady, setGameReady] = useState(false);
  const [characterXP, setCharacterXP] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const game = useGameInstance('phaser-container', {
    onXPGained: (xp: number) => {
      setCharacterXP((prev) => prev + xp);
      onXPGained?.(xp);
    },
    onCharacterUpdate,
  });

  useEffect(() => {
    if (game) {
      setGameReady(true);
    }
  }, [game]);

  useEffect(() => {
    const loadCharacterData = async () => {
      if (!user) return;

      try {
        const characterResponse = await characterAPI.getProfile();
        const character = characterResponse.data;

        if (character && character.xp) {
          setCharacterXP(character.xp);
        }
      } catch (err) {
        console.error('Failed to load character data:', err);
        setError('Failed to load character data');
      }
    };

    loadCharacterData();
  }, [user]);

  if (error) {
    return <div className="game-error">{error}</div>;
  }

  return (
    <div className="game-container-wrapper">
      <div id="phaser-container" className="phaser-container" />
      {!gameReady && (
        <div className="game-loading">
          <div className="spinner"></div>
          <p>Initializing Kingdom...</p>
        </div>
      )}
      <div className="game-info">
        <h3>Character XP: {characterXP}</h3>
      </div>
    </div>
  );
};

export default GameContainer;
