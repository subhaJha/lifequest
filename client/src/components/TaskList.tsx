import React, { useState } from 'react';
import { taskAPI } from '../services/api';

interface Task {
  _id: string;
  title: string;
  description: string;
  xpReward: number;
  category: string;
  completed: boolean;
  priority: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskCompleted: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskCompleted }) => {
  const [loading, setLoading] = useState('');

  const handleCompleteTask = async (taskId: string) => {
    setLoading(taskId);
    try {
      await taskAPI.completeTask(taskId);
      onTaskCompleted();
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setLoading('');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this quest?')) {
      try {
        await taskAPI.deleteTask(taskId);
        onTaskCompleted();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const categoryEmoji: { [key: string]: string } = {
    workout: '🏋️',
    coding: '💻',
    reading: '📚',
    work: '💼',
    other: '🎯',
  };

  const priorityColor: { [key: string]: string } = {
    low: 'bg-blue-900',
    medium: 'bg-yellow-900',
    high: 'bg-red-900',
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-4">
      {/* Active Quests */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Active Quests ({incompleteTasks.length})</h3>
        {incompleteTasks.length === 0 ? (
          <div className="bg-gray-700 rounded-lg p-6 text-gray-400 text-center">
            No active quests. Create one to start earning XP!
          </div>
        ) : (
          <div className="space-y-3">
            {incompleteTasks.map((task) => (
              <div key={task._id} className={`${priorityColor[task.priority]} rounded-lg p-4 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{categoryEmoji[task.category]}</span>
                      <h4 className="text-lg font-semibold">{task.title}</h4>
                      <span className="bg-purple-600 px-2 py-1 rounded text-xs">+{task.xpReward} XP</span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-300">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCompleteTask(task._id)}
                      disabled={loading === task._id}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                    >
                      {loading === task._id ? '✓ Completing...' : '✓ Complete'}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Quests */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-400 mb-3">Completed ({completedTasks.length})</h3>
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div key={task._id} className="bg-gray-700 rounded-lg p-3 text-gray-400 line-through">
                <div className="flex items-center justify-between">
                  <span>{categoryEmoji[task.category]} {task.title}</span>
                  <span className="text-sm">+{task.xpReward} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
