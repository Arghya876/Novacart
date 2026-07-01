import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Mail, Lock, AlertTriangle, Loader2, Home } from 'lucide-react';
import { loginUser, clearError, logoutUser } from '../../store/authSlice';

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(clearError());
    setLocalError(null);
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        // Enforce administrative checks
        dispatch(logoutUser());
        setLocalError('Access Denied. Only administrative accounts can access this console.');
        return;
      }
      setLocalError(null);
      navigate('/admin');
    }
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(loginUser({ email, password }));
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* Decorative cyber grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-10" />

      {/* Neon glowing center blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-violet-650/10 blur-3xl opacity-60" />

      <div className="w-full max-w-md p-8 border border-neutral-800 bg-neutral-900/80 rounded-3xl shadow-2xl space-y-6 backdrop-blur-xl z-10">
        
        {/* Return to storefront button */}
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <Home className="h-3 w-3" /> Storefront
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-455 border border-rose-500/20">
            Secure Area
          </div>
        </div>

        <div className="text-center space-y-3 pt-2">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-violet-600/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Admin Portal</h1>
            <p className="text-[10px] text-neutral-450 uppercase tracking-wider font-semibold">Authorized Management Console</p>
          </div>
        </div>

        {displayError && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Admin Username / Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novacart.com"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Access Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-900/20 flex items-center justify-center gap-2 cursor-pointer border border-violet-500/20"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Authenticate Console'}
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-neutral-500">
          This system is restricted to authorized users. Fixed ID: <span className="text-neutral-400">admin@novacart.com</span>
        </div>
      </div>
    </div>
  );
}
