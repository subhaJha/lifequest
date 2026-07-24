import React from 'react';
import { GameContainer } from '../components/GameContainer';
import { PageLayout } from '../components/layout/PageLayout';


export const Game: React.FC = () => {
  const handleXPGained = (xp: number) => {
    console.log(`XP Gained: ${xp}`);
    // You can add additional logic here
  };

  const handleCharacterUpdate = (characterData: any) => {
    console.log('Character Updated:', characterData);
    // Handle character updates
  };

  return (
    <PageLayout title="Kingdom">
      <GameContainer
        onXPGained={handleXPGained}
        onCharacterUpdate={handleCharacterUpdate}
      />
    </PageLayout>
  );
};

export default Game;
