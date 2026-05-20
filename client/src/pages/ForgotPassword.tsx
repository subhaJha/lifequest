import React, { useState } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setStatus('If the account exists, you will receive reset instructions.');
    } catch (err: unknown) {
      const maybeAxiosErr = err as { response?: { data?: { message?: string } } };
      setError(maybeAxiosErr.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout variant="auth">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full p-8">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">Reset Password</h1>
        <p className="text-gray-400 text-center mb-8">Enter your email to receive a reset link.</p>

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

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {status && <p className="text-green-400 text-sm">{status}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 rounded transition"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Remembered your password?{' '}
          <button onClick={() => navigate('/login')} className="text-purple-400 hover:text-purple-300 font-semibold">
            Login
          </button>
        </p>
      </div>
    </PageLayout>
  );
};
