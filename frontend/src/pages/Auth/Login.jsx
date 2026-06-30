import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { loginUser, clearError } from '../../store/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirect]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl space-y-6 backdrop-blur">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-neutral-400">Sign in to your NovaCart account to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 text-rose-500 rounded-xl flex items-center gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
