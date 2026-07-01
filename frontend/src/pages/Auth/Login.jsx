import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { loginUser, clearError, logoutUser } from '../../store/authSlice';

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const isValidRole = role === 'customer' || role === 'seller';

  const { user, isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    dispatch(clearError());
    setLocalError(null);
    if (!isValidRole) {
      navigate('/login');
    }
  }, [dispatch, role, isValidRole, navigate]);

  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user && isValidRole) {
      if (user.role !== role) {
        // Enforce strict separation of authentication flows
        dispatch(logoutUser());
        setLocalError(
          `This account is registered as a ${user.role}. Please sign in using the ${
            user.role === 'customer' ? 'Customer' : 'Seller'
          } Portal.`
        );
        return;
      }

      setLocalError(null);
      if (redirect) {
        navigate(`/${redirect}`);
      } else {
        navigate(user.role === 'seller' ? '/seller' : '/customer');
      }
    }
  }, [user, role, isValidRole, navigate, redirect, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(loginUser({ email, password }));
  };

  if (!isValidRole) return null;

  const isSeller = role === 'seller';
  const displayError = localError || error;

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
            {isSeller ? 'Merchant Login' : 'Customer Login'}
          </h1>
          <p className="text-xs text-neutral-400">
            {isSeller 
              ? 'Access your sales dashboard and manage products' 
              : 'Sign in to access your cart, wishlist, and checkouts'}
          </p>
        </div>

        {displayError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/30 text-rose-500 rounded-xl flex items-start gap-2 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> 
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSeller ? 'merchant@novacart.com' : 'shopper@novacart.com'}
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-11 rounded-full text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isSeller 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' 
                : 'bg-violet-600 hover:bg-violet-750 shadow-violet-500/10'
            }`}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-450 dark:text-neutral-500">
          Don't have an account?{' '}
          <Link 
            to={`/register/${role}`} 
            className={`font-bold hover:underline ${
              isSeller ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'
            }`}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
