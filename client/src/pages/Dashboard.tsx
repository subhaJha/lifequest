import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, taskAPI } from '../services/api';
import { TaskList } from '../components/TaskList';
import { CreateTask } from '../components/CreateTask';
import { AppLayout } from '../components/layout/AppLayout';

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
  const { updateUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);

  const loadData = async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([userAPI.getProfile(), taskAPI.getTasks()]);
      updateUser(userRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial dashboard load (defer to avoid lint warnings about sync state updates in effects)
    const id = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskCreated = async () => {
    await loadData();
    setShowCreateTask(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

  return (
    <AppLayout>
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
            <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">🌟 First Quest Completed</div>
            <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">💪 50 XP Earned</div>
            <div className="bg-gray-700 p-3 rounded text-gray-300 text-sm">🎯 Level Up!</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
