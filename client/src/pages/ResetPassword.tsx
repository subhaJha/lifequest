import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { authAPI } from '../services/api';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      if (!token) {
        setError('Missing reset token');
        return;
      }

      await authAPI.resetPassword(token, password);
      setStatus('Password updated. You can now log in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: unknown) {
      const maybeAxiosErr = err as { response?: { data?: { message?: string } } };
      setError(maybeAxiosErr.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout variant="auth">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full p-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Reset Password</h1>
        <p className="text-gray-400 text-center mb-8">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {status && <p className="text-green-400 text-sm">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Back to{' '}
          <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 font-semibold">
            Login
          </button>
        </p>
      </div>
    </PageLayout>
  );
};
