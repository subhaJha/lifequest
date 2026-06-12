import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { taskAPI } from '../services/api';

interface CreateTaskProps {
  onTaskCreated: () => void;
}

export const CreateTask: React.FC<CreateTaskProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [xpReward, setXpReward] = useState(50);
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await taskAPI.createTask(title, description, category, xpReward, priority);
      setTitle('');
      setDescription('');
      setCategory('other');
      setXpReward(50);
      setPriority('medium');
      toast.success(`Quest created! +${xpReward} XP ⚔️`);
      onTaskCreated();
    } catch (err: unknown) {
      const maybeAxiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(maybeAxiosErr.response?.data?.message || 'Failed to create quest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4">Create New Quest</h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Quest Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="workout">🏋️ Workout</option>
            <option value="coding">💻 Coding</option>
            <option value="reading">📚 Reading</option>
            <option value="work">💼 Work</option>
            <option value="other">🎯 Other</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <input
          type="number"
          min="10"
          max="500"
          value={xpReward}
          onChange={(e) => setXpReward(parseInt(e.target.value))}
          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          placeholder="XP Reward"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
        >
          {loading ? 'Creating...' : 'Create Quest'}
        </button>
      </div>
    </form>
  );
};