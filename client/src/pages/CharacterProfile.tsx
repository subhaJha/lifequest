import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/useAuth';
import { characterAPI } from '../services/api';
import { getLevelTitle } from '../utils/characterTitles';


type CharacterProfileResponse = {
  currentCharacterId: string;
  unlockedCharacterIds: string[];
  avatarConfig: Record<string, unknown>;
};

type AvatarOption = {
  avatarId: string;
  label: string;
  preview: string;
};

const AVATARS: AvatarOption[] = [
  { avatarId: 'AVATAR_1', label: 'Mage', preview: '🧙' },
  { avatarId: 'AVATAR_2', label: 'Warrior', preview: '🛡️' },
  { avatarId: 'AVATAR_3', label: 'Rogue', preview: '🗡️' },
];

export const CharacterProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CharacterProfileResponse | null>(null);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('AVATAR_1');

  const levelTitle = useMemo(() => {
    const level = user?.level ?? 1;
    return getLevelTitle(level);
  }, [user?.level]);

  const characterIdToAvatarId = (characterId?: string) => {
    // Mapping table used by the UI.
    // NOTE: Backend currently defaults currentCharacterId/unlockedCharacterIds to `NOVICE`.
    // The UI only knows about AVATAR_1..AVATAR_3.
    const map: Record<string, string> = {
      NOVICE: 'AVATAR_1',
      // Future character ids could be added here.
      // Example: MAGE: 'AVATAR_1'
    };

    if (characterId && map[characterId]) return map[characterId];
    return 'AVATAR_1';
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await characterAPI.getProfile();
        const data = res.data as Partial<CharacterProfileResponse>;

        // Defensive defaulting for legacy/empty users
        const currentCharacterId =
          typeof data.currentCharacterId === 'string' && data.currentCharacterId.length > 0
            ? data.currentCharacterId
            : 'NOVICE';

        const unlockedCharacterIds = Array.isArray(data.unlockedCharacterIds)
          ? data.unlockedCharacterIds.filter((x) => typeof x === 'string' && x.length > 0)
          : ['NOVICE'];

        const avatarConfig =
          data.avatarConfig && typeof data.avatarConfig === 'object' ? data.avatarConfig : {};

        const normalized: CharacterProfileResponse = {
          currentCharacterId,
          unlockedCharacterIds: unlockedCharacterIds.length > 0 ? unlockedCharacterIds : ['NOVICE'],
          avatarConfig,
        };

        setProfile(normalized);

        // 1) Prefer avatarConfig.avatarId if valid
        const avatarConfigAny = avatarConfig as Record<string, unknown>;
        const maybeAvatarId = avatarConfigAny?.avatarId as unknown;

        const validAvatarIds = new Set(AVATARS.map((a) => a.avatarId));

        const avatarIdFromConfig =
          typeof maybeAvatarId === 'string' && validAvatarIds.has(maybeAvatarId)
            ? maybeAvatarId
            : null;

        // 2) Fall back to mapped currentCharacterId
        const avatarIdFromCurrent = characterIdToAvatarId(currentCharacterId);

        setSelectedAvatarId(avatarIdFromConfig ?? avatarIdFromCurrent ?? 'AVATAR_1');
      } catch (e) {
        console.error(e);
        toast.error('Failed to load character profile');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const handleSave = async () => {
    try {
      if (!profile) return;

      await characterAPI.selectCharacter({
        currentCharacterId: profile.currentCharacterId,
        avatarConfig: {
          ...(profile.avatarConfig ?? {}),
          avatarId: selectedAvatarId,
        },
      });

      toast.success('Character updated');

      // refresh local state
      const res = await characterAPI.getProfile();
      const data = res.data as Partial<CharacterProfileResponse>;

      const currentCharacterId =
        typeof data.currentCharacterId === 'string' && data.currentCharacterId.length > 0
          ? data.currentCharacterId
          : 'NOVICE';

      const unlockedCharacterIds = Array.isArray(data.unlockedCharacterIds)
        ? data.unlockedCharacterIds.filter((x) => typeof x === 'string' && x.length > 0)
        : ['NOVICE'];

      const avatarConfig =
        data.avatarConfig && typeof data.avatarConfig === 'object' ? data.avatarConfig : {};

      setProfile({
        currentCharacterId,
        unlockedCharacterIds: unlockedCharacterIds.length > 0 ? unlockedCharacterIds : ['NOVICE'],
        avatarConfig,
      });

      // update selected avatar based on returned profile
      const avatarConfigAny = avatarConfig as Record<string, unknown>;
      const maybeAvatarId = avatarConfigAny?.avatarId as unknown;
      const validAvatarIds = new Set(AVATARS.map((a) => a.avatarId));
      const avatarIdFromConfig =
        typeof maybeAvatarId === 'string' && validAvatarIds.has(maybeAvatarId)
          ? maybeAvatarId
          : null;
      const avatarIdFromCurrent = characterIdToAvatarId(currentCharacterId);

      setSelectedAvatarId(avatarIdFromConfig ?? avatarIdFromCurrent ?? 'AVATAR_1');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save character');
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;

  if (!profile) return <div className="text-white p-6">No character profile found.</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-gray-300 hover:text-white mb-4"
      >
        ← Back
      </button>

      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-300">Current title</div>
            <div className="text-2xl font-bold text-white">{levelTitle}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Character</div>
            <div className="text-lg font-semibold text-white">{profile.currentCharacterId}</div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 mb-4">
          <div className="text-white font-bold mb-2">XP Progress</div>
          {user ? (
            <div className="text-gray-300 text-sm">
              Level {user.level} • {user.xp} XP
            </div>
          ) : (
            <div className="text-gray-300 text-sm">Sign in to view XP progress.</div>
          )}
        </div>

        <div>
          <div className="text-white font-bold mb-2">Avatar Selection</div>
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((a) => (
              <button
                key={a.avatarId}
                onClick={() => setSelectedAvatarId(a.avatarId)}
                className={
                  selectedAvatarId === a.avatarId
                    ? 'bg-purple-700 text-white rounded-lg p-3 border border-purple-300'
                    : 'bg-gray-700 text-gray-200 rounded-lg p-3 hover:bg-gray-600'
                }
              >
                <div className="text-2xl mb-1">{a.preview}</div>
                <div className="text-sm font-semibold">{a.label}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

