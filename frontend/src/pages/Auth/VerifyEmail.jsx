import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, AlertTriangle, Loader2, ArrowLeft, CheckCircle, Key, RotateCw } from 'lucide-react';
import { verifyEmail, resendVerificationOtp, clearError } from '../../store/authSlice';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { isLoading, error } = useSelector((state) => state.auth);

  const emailParam = searchParams.get('email') || '';
  const initialPreviewUrl = searchParams.get('previewUrl') || '';
  const redirect = searchParams.get('redirect') || '';
  
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);

  useEffect(() => {
    dispatch(clearError());
    setLocalError(null);
    setSuccessMsg(null);
    setResendMsg(null);
  }, [dispatch]);

  // Cooldown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);
    setResendMsg(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || isNaN(cleanOtp)) {
      setLocalError('OTP must be a 6-digit number');
      return;
    }

    const verifyData = { email: email.trim(), otp: cleanOtp };
    const result = await dispatch(verifyEmail(verifyData));
    
    if (verifyEmail.fulfilled.match(result)) {
      setSuccessMsg('Email verified successfully! Logging you in...');
      setTimeout(() => {
        const role = result.payload.user?.role || 'customer';
        if (redirect) {
          navigate(`/${redirect}`);
        } else {
          navigate(role === 'seller' ? '/my-products' : '/home');
        }
      }, 1500);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setLocalError('Please enter your email address to resend OTP.');
      return;
    }
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setLocalError(null);
    setResendMsg(null);

    try {
      const result = await dispatch(resendVerificationOtp(email.trim()));
      if (resendVerificationOtp.fulfilled.match(result)) {
        setResendMsg(result.payload.message || 'A new verification OTP has been sent to your email.');
        if (result.payload.previewUrl) {
          setPreviewUrl(result.payload.previewUrl);
        }
        setCooldown(60);
      } else {
        setLocalError(result.payload || 'Failed to resend verification OTP');
      }
    } catch (err) {
      setLocalError('An error occurred while requesting a new OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md p-8 border border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl space-y-6 backdrop-blur">
        
        {/* Back navigation */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to login
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Verify Your Email
          </h1>
          <p className="text-xs text-neutral-400">
            A 6-digit verification code has been sent to your email address. Enter it below to activate your account.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-start gap-2 text-xs">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{successMsg}</span>
          </div>
        )}

        {resendMsg && !successMsg && (
          <div className="p-3 bg-violet-50 dark:bg-violet-950/25 border border-violet-200 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-start gap-2 text-xs">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{resendMsg}</span>
          </div>
        )}

        {previewUrl && !successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/30 text-emerald-500 rounded-xl flex flex-col gap-2 text-xs">
            <p className="font-semibold text-emerald-700 dark:text-emerald-350">
              [Development Mode] Email sent! Click below to view the mail and copy your OTP:
            </p>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block px-3 py-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 text-white rounded-lg font-bold text-center underline transition-colors"
            >
              View Email & OTP ↗
            </a>
          </div>
        )}

        {(localError || error) && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-500 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email Address */}
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
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Verification OTP</label>
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

          <button
            type="submit"
            disabled={isLoading || successMsg}
            className="w-full h-11 bg-violet-600 hover:bg-violet-750 shadow-violet-500/10 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify Email'}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="pt-2 text-center text-xs text-neutral-450 dark:text-neutral-500 flex flex-col items-center gap-2">
          <span>Didn't receive the verification code?</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || resendLoading || !!successMsg}
            className="inline-flex items-center gap-1.5 font-bold text-violet-600 dark:text-violet-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : cooldown > 0 ? (
              <span>Resend OTP in {cooldown}s</span>
            ) : (
              <>
                <RotateCw className="h-3.5 w-3.5" />
                <span>Resend OTP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
