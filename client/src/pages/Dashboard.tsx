import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/useAuth';

import { progressAPI, userAPI, taskAPI } from '../services/api';
import { CharacterCard } from '../components/CharacterCard';

import { TaskList } from '../components/TaskList';
import { CreateTask } from '../components/CreateTask';
import { AppLayout } from '../components/layout/AppLayout';
import { kingdomAPI, type KingdomOverviewResponse } from '../services/kingdomApi';
import { KingdomOverviewWidget } from '../components/Kingdom/KingdomOverviewWidget';
import { GameContainer } from '../components/GameContainer';






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
  const { updateUser, user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [todayStreak, setTodayStreak] = useState(0);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  const [kingdomLoading, setKingdomLoading] = useState(true);
  const [kingdomData, setKingdomData] = useState<KingdomOverviewResponse | null>(null);

  const loadData = async () => {

    // Progress (streak + achievements)
    setAchievementsLoading(true);
    try {

      const [todayRes, achievementsRes] = await Promise.all([
        progressAPI.getToday(),
        progressAPI.getAchievements(),
      ]);
      setTodayStreak(todayRes.data.streak ?? 0);
      setUnlockedAchievements(
        Array.isArray(achievementsRes.data?.items)
          ? achievementsRes.data.items.map((x: { achievementId: string }) => x.achievementId)
          : []

      );

      setAchievementsLoading(false);
    } catch (err) {
      console.error('Failed to load progress:', err);
      setAchievementsLoading(false);
    }


    try {
      const [userRes, tasksRes] = await Promise.all([userAPI.getProfile(), taskAPI.getTasks()]);
      updateUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }

    // Kingdom Overview (compact widget)
    setKingdomLoading(true);
    try {
      const kingdomRes = await kingdomAPI.getOverview();
      setKingdomData(kingdomRes.data);
    } catch (err) {
      console.error('Failed to load kingdom overview:', err);
      // Keep as null to trigger empty/error state in UI component.
      setKingdomData(null);
      toast.error('Failed to load kingdom overview.');
    } finally {
      setKingdomLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskCreated = async () => {
    await loadData();
    setShowCreateTask(false);
    toast.success('Quest created! ⚔️');
  };

  const achievementLabel = (id: string) => {
    const map: Record<string, string> = {
      FIRST_QUEST_COMPLETED: '🌟 First Quest Completed',
      XP_50_EARNED: '💪 50 XP Earned',
      LEVEL_UP: '🎯 Level Up!',
    };
    return map[id] ?? id;
  };

  const handleTaskCompleted = async () => {
    await loadData();
    toast.success('Quest completed! +XP 🌟');
  };


  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }


  return (
    <AppLayout>
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

          <div className="mb-4">
            <CharacterCard
              level={user?.level ?? 1}
              xp={user?.xp ?? 0}
              currentCharacterId={'NOVICE'}
            />
          </div>

          <TaskList tasks={tasks} onTaskCompleted={handleTaskCompleted} />

          <div className="mt-6">
            <GameContainer />
          </div>
        </div>


        {/* Sidebar */}
        <div className="space-y-6">
          {/* Kingdom Overview widget */}
          {kingdomLoading ? (
            <div className="bg-gray-800 rounded-lg p-6 text-white">Loading kingdom...</div>
          ) : kingdomData ? (
            <KingdomOverviewWidget data={kingdomData} />
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 text-white text-sm text-gray-300">
              No kingdom data yet.
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-300">Today</div>
              <div className="text-lg font-bold text-white">
                Streak: {todayStreak > 0 ? `${todayStreak} 🔥` : '0'}

              </div>
            </div>

            <div className="space-y-3">
              {achievementsLoading ? (
                <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">Loading...</div>
              ) : unlockedAchievements.length === 0 ? (
                <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">No achievements yet.</div>
              ) : (
                unlockedAchievements.map((id) => (
                  <div key={id} className="bg-gray-700 p-3 rounded text-gray-300 text-sm">
                    {achievementLabel(id)}
                  </div>
                ))
              )}
            </div>
           
          </div>
        </div>
      </div>
    </AppLayout>


  );
};


