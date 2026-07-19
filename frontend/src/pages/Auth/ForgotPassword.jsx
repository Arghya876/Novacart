import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, AlertTriangle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPassword, clearError } from '../../store/authSlice';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    dispatch(clearError());
    setSuccessMsg(null);
    setPreviewUrl(null);
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccessMsg(null);
    setPreviewUrl(null);

    const result = await dispatch(forgotPassword(email));
    if (forgotPassword.fulfilled.match(result)) {
      const data = result.payload;
      setSuccessMsg('OTP request processed successfully.');
      
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      } else {
        setSuccessMsg('A 6-digit verification OTP has been sent to your email.');
        // Auto redirect to reset password page after 2 seconds
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl space-y-6 backdrop-blur">
        
        {/* Back navigation */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to portal
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Forgot Password?
          </h1>
          <p className="text-xs text-neutral-400">
            Enter your email address and we'll send you a 6-digit OTP to reset your password.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/30 text-emerald-500 rounded-xl flex flex-col gap-2.5 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
              <span>{successMsg}</span>
            </div>
            
            {previewUrl && (
              <div className="mt-1 p-3 bg-emerald-100/50 dark:bg-emerald-950/50 border border-emerald-250 dark:border-emerald-900 rounded-xl text-[11px] space-y-2">
                <p className="font-semibold text-emerald-700 dark:text-emerald-350">
                  [Development Mode] Ethereal SMTP sent an email! Open it to see the 6-digit OTP:
                </p>
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-block px-3 py-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg font-bold underline transition-colors"
                >
                  View Email & OTP ↗
                </a>
                <button
                  type="button"
                  onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full mt-2.5 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold text-center block cursor-pointer transition-colors shadow-md shadow-violet-500/10"
                >
                  Proceed to Reset Screen
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-500 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{error}</span>
          </div>
        )}

        {!previewUrl && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourmail@example.com"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || successMsg}
              className="w-full h-11 bg-violet-600 hover:bg-violet-750 shadow-violet-500/10 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Remembered your password?{' '}
          <Link 
            to="/login" 
            className="font-bold hover:underline text-violet-600 dark:text-violet-400"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
