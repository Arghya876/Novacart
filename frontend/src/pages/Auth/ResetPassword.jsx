import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, AlertTriangle, Loader2, ArrowLeft, CheckCircle, Key } from 'lucide-react';
import { resetPassword, clearError } from '../../store/authSlice';

export default function ResetPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { isLoading, error } = useSelector((state) => state.auth);

  const emailParam = searchParams.get('email') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    dispatch(clearError());
    setLocalError(null);
    setSuccessMsg(null);
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (otp.length !== 6 || isNaN(otp)) {
      setLocalError('OTP must be a 6-digit number');
      return;
    }

    const resetData = { email, otp, password };
    const result = await dispatch(resetPassword(resetData));
    
    if (resetPassword.fulfilled.match(result)) {
      setSuccessMsg('Your password has been successfully reset.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md p-8 border border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl space-y-6 backdrop-blur">
        
        {/* Back navigation */}
        <Link 
          to="/forgot-password" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to OTP request
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-400">
            Enter the 6-digit OTP code sent to your email to configure your new password.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/30 text-emerald-500 rounded-xl flex items-start gap-2 text-xs">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{successMsg} Redirecting to login portal...</span>
          </div>
        )}

        {(localError || error) && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-500 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email Address - Editable if not provided, otherwise read-only */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              disabled={!!emailParam}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none disabled:opacity-65 disabled:cursor-not-allowed"
              placeholder="email@example.com"
            />
          </div>

          {/* OTP Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">6-Digit OTP</label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white tracking-[0.25em] font-mono text-center focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || successMsg}
            className="w-full h-11 bg-violet-600 hover:bg-violet-750 shadow-violet-500/10 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
