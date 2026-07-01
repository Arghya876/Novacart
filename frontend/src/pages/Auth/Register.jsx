import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, User, AlertTriangle, Loader2, Check, X, ArrowLeft } from 'lucide-react';
import { registerUser, clearError } from '../../store/authSlice';

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isValidRole = role === 'customer' || role === 'seller';

  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
    if (!isValidRole) {
      navigate('/login');
    }
  }, [dispatch, role, isValidRole, navigate]);

  useEffect(() => {
    if (user && isValidRole) {
      navigate(user.role === 'seller' ? '/seller' : '/');
    }
  }, [user, isValidRole, navigate]);

  // Real-time password strength validation rules
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    specialChar: /[@$!%*?&]/.test(password),
  };

  const metRulesCount = Object.values(rules).filter(Boolean).length;
  const isPasswordValid = metRulesCount === 5;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (metRulesCount <= 2) return 'Weak';
    if (metRulesCount <= 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColorClass = () => {
    if (metRulesCount <= 2) return 'bg-rose-500';
    if (metRulesCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    dispatch(registerUser({ name, email, password, role }));
  };

  if (!isValidRole) return null;

  const isSeller = role === 'seller';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative">
      <div className="w-full max-w-md p-8 border border-neutral-200/80 dark:border-neutral-850 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl space-y-6 backdrop-blur">
        
        {/* Back navigation */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to choices
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {isSeller ? 'Create Seller Account' : 'Create Customer Account'}
          </h1>
          <p className="text-xs text-neutral-450 dark:text-neutral-400">
            {isSeller 
              ? 'Register your shop on NovaCart and sell your premium goods' 
              : 'Join NovaCart to buy exclusive products'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-500 rounded-xl flex items-center gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isSeller ? 'Shop Manager / Owner Name' : 'John Doe'}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSeller ? 'sales@yourbrand.com' : 'you@example.com'}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Password</label>
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

            {/* Visual Password Strength Checklist */}
            {password.length > 0 && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-850 rounded-xl space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Strength: {getStrengthLabel()}</span>
                  <span className="text-[9px] text-neutral-500">{metRulesCount}/5 rules met</span>
                </div>
                
                {/* Progress bar */}
                <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getStrengthColorClass()}`}
                    style={{ width: `${(metRulesCount / 5) * 100}%` }}
                  />
                </div>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10px] pt-1">
                  <li className="flex items-center gap-1.5">
                    {rules.length 
                      ? <Check className="h-3 w-3 text-emerald-500" /> 
                      : <X className="h-3 w-3 text-rose-500" />}
                    <span className={rules.length ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}>Min 8 characters</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {rules.uppercase 
                      ? <Check className="h-3 w-3 text-emerald-500" /> 
                      : <X className="h-3 w-3 text-rose-500" />}
                    <span className={rules.uppercase ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}>1 uppercase letter</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {rules.lowercase 
                      ? <Check className="h-3 w-3 text-emerald-500" /> 
                      : <X className="h-3 w-3 text-rose-500" />}
                    <span className={rules.lowercase ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}>1 lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    {rules.digit 
                      ? <Check className="h-3 w-3 text-emerald-500" /> 
                      : <X className="h-3 w-3 text-rose-500" />}
                    <span className={rules.digit ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}>1 numeric digit</span>
                  </li>
                  <li className="flex items-center gap-1.5 sm:col-span-2">
                    {rules.specialChar 
                      ? <Check className="h-3 w-3 text-emerald-500" /> 
                      : <X className="h-3 w-3 text-rose-500" />}
                    <span className={rules.specialChar ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400'}>1 special character (@$!%*?&)</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isPasswordValid}
            className={`w-full h-11 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              !isPasswordValid 
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-500 cursor-not-allowed shadow-none' 
                : isSeller
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                  : 'bg-violet-600 hover:bg-violet-750 shadow-violet-500/10'
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Already have an account?{' '}
          <Link 
            to={`/login/${role}`} 
            className={`font-bold hover:underline ${
              isSeller ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'
            }`}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
