import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Icon } from '../ui/Icon';

export const LoginScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Sign up successful! Please check your email to verify your account.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-xl shadow-2xl">
        <div className="text-center">
            <div className="flex justify-center items-center gap-2">
                <Icon name="box" className="text-primary" size={32}/>
                <h1 className="text-3xl font-bold text-on-surface">AI Studio</h1>
            </div>
            <p className="mt-2 text-on-surface-secondary">
                {isSignUp ? 'Create an account to get started.' : 'Welcome back! Sign in to continue.'}
            </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-on-surface-secondary">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-on-surface placeholder-on-surface-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-on-surface-secondary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-on-surface placeholder-on-surface-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="********"
            />
          </div>
          {isSignUp && (
            <div>
              <label htmlFor="confirm-password" className="text-sm font-medium text-on-surface-secondary">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md text-on-surface placeholder-on-surface-secondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="********"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-hover focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
        </form>
        <div className="text-center text-sm">
            <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(''); }} className="font-medium text-primary hover:text-primary-hover">
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};