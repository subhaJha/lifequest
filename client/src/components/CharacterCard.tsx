import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  level: number;
  xp: number;
  currentCharacterId: string;
  avatarId?: string;
};

function avatarToEmoji(avatarId?: string) {
  switch (avatarId) {
    case 'AVATAR_1':
      return '🧙';
    case 'AVATAR_2':
      return '🛡️';
    case 'AVATAR_3':
      return '🗡️';
    default:
      return '✨';
  }
}

function getRank(level: number) {
  if (level <= 1) return 'Novice';
  if (level <= 3) return 'Apprentice';
  if (level <= 5) return 'Elite';
  return 'Legend';
}

export const CharacterCard: React.FC<Props> = ({ level, xp, currentCharacterId, avatarId }) => {
  const navigate = useNavigate();

  const title = useMemo(() => {
    const rank = getRank(level);
    return `${rank} • ${currentCharacterId}`;
  }, [level, currentCharacterId]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">{avatarToEmoji(avatarId)}</div>
        <div className="flex-1">
          <div className="text-sm text-gray-300">Your Character</div>
          <div className="text-xl font-bold text-white">{title}</div>
          <div className="text-sm text-gray-300 mt-1">Level {level} • {xp} XP</div>
        </div>
      </div>

      <button
        onClick={() => navigate('/character')}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded"
      >
        Manage Character
      </button>
    </div>
  );
};

