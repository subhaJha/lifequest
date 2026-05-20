import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PageLayout } from '../components/layout/PageLayout';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login(email, password);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: unknown) {
      const maybeAxiosErr = err as { response?: { data?: { msg?: string } } };
      setError(maybeAxiosErr.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout variant="auth">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full p-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">⚔️ LifeQuest</h1>
        <p className="text-gray-400 text-center mb-8">Your Life. Your RPG. Your Quest.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Forgot password?
          </button>
        </p>

        <p className="text-gray-400 text-center mt-3">
          No account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Register
          </button>
        </p>
      </div>
    </PageLayout>
  );
};
