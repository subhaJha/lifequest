import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, taskAPI } from '../services/api';
import { TaskList } from '../components/TaskList';
import { CreateTask } from '../components/CreateTask';

interface User {
  _id: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
  gold: number;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  xpReward: number;
  category: string;
  completed: boolean;
  priority: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        userAPI.getProfile(),
        taskAPI.getTasks(),
      ]);
      updateUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = async () => {
    await loadData();
    setShowCreateTask(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  const xpForNextLevel = 100;
  const xpInCurrentLevel = user?.xp || 0 % 100;
  const progressPercent = ((xpInCurrentLevel) / xpForNextLevel) * 100;

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
              ></div>
            </div>
            <p className="text-xs text-gray-300 mt-2">{user?.xp % 100} / 100 XP</p>
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

        {/* Tasks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Quests</h2>
              <button
                onClick={() => setShowCreateTask(!showCreateTask)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                {showCreateTask ? 'Cancel' : '+ New Quest'}
              </button>
            </div>

            {showCreateTask && <CreateTask onTaskCreated={handleTaskCreated} />}

            <TaskList tasks={tasks} onTaskCompleted={loadData} />
          </div>

          {/* Sidebar */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">
                🌟 First Quest Completed
              </div>
              <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">
                💪 50 XP Earned
              </div>
              <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">
                🎯 Level Up!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
