import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ForgotPasswordProps {
  onSwitchView: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onSwitchView }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setMessage('If an account exists for that email, a password reset link has been sent.');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reset Password</h2>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{message}</p>}
      
      {!message && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email-reset" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email-reset"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{' '}
        <button onClick={onSwitchView} className="font-medium text-blue-600 hover:text-blue-500">
          Back to Sign In
        </button>
      </p>
    </div>
  );
};

export default ForgotPassword;