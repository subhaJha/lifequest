import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type AppLayoutProps = {
  children: React.ReactNode;
};

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const xpForNextLevel = 100;
  const xpInCurrentLevel = (user?.xp ?? 0) % 100;
  const progressPercent = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">⚔️ LifeQuest</h1>
            <div className="text-gray-300">
              <p className="font-semibold">{user?.username}</p>
              <p className="text-sm">Level {user?.level} Adventurer</p>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Page */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg p-6 text-white">
            <p className="text-gray-300 text-sm">LEVEL</p>
            <p className="text-4xl font-bold">{user?.level}</p>
            <div className="mt-4 bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 mt-2">{(user?.xp ?? 0) % 100} / 100 XP</p>
          </div>

          {/* XP Card */}
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 text-white">
            <p className="text-gray-300 text-sm">TOTAL XP</p>
            <p className="text-4xl font-bold">{user?.xp}</p>
            <p className="text-xs text-gray-300 mt-4">Experience Points</p>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-800 to-orange-900 rounded-lg p-6 text-white">
            <p className="text-gray-300 text-sm">STREAK</p>
            <p className="text-4xl font-bold">🔥 {user?.streak}</p>
            <p className="text-xs text-gray-300 mt-4">Days in a row</p>
          </div>

          {/* Gold Card */}
          <div className="bg-gradient-to-br from-yellow-700 to-yellow-800 rounded-lg p-6 text-white">
            <p className="text-gray-300 text-sm">GOLD</p>
            <p className="text-4xl font-bold">💰 {user?.gold}</p>
            <p className="text-xs text-gray-300 mt-4">Currency</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};
