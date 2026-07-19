import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import { hideToast } from '../../store/toastSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOpen, title, message, type, image, actionLink, actionLabel, duration } = useSelector(
    (state) => state.toast
  );

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, duration || 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, dispatch]);

  const handleActionClick = () => {
    if (actionLink) {
      navigate(actionLink);
    }
    dispatch(hideToast());
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 animate-bounce" />,
    info: <Info className="h-5 w-5 text-violet-500 shrink-0" />,
    cart: <ShoppingCart className="h-5 w-5 text-violet-500 shrink-0" />,
    favorite: <Heart className="h-5 w-5 text-rose-500 fill-rose-500 shrink-0 animate-pulse" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/30 dark:border-emerald-500/20 shadow-emerald-500/10',
    error: 'border-rose-500/30 dark:border-rose-500/20 shadow-rose-500/10',
    info: 'border-violet-500/30 dark:border-violet-500/20 shadow-violet-500/10',
    cart: 'border-violet-500/40 dark:border-violet-500/30 shadow-violet-500/15',
    favorite: 'border-rose-500/40 dark:border-rose-500/30 shadow-rose-500/15',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-violet-500',
    cart: 'bg-violet-600',
    favorite: 'bg-rose-500',
  };

  const headerBadgeColors = {
    cart: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-800',
    favorite: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    success: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    error: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    info: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] pointer-events-none flex justify-center sm:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.18 } }}
            className={`pointer-events-auto relative overflow-hidden flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl w-full max-w-sm sm:w-[380px] transition-all duration-300 ${borderStyles[type]}`}
          >
            <div className="flex items-start gap-3">
              {/* Image thumbnail if present */}
              {image ? (
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
                  <img src={image} alt="Product" className="h-full w-full object-cover" />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-neutral-900 rounded-full shadow-sm">
                    {type === 'favorite' ? (
                      <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
                    ) : (
                      <ShoppingCart className="h-3 w-3 text-violet-600" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 shrink-0">
                  {icons[type]}
                </div>
              )}

              {/* Text details */}
              <div className="flex-1 min-w-0 pt-0.5">
                {title ? (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border tracking-wide uppercase ${headerBadgeColors[type]}`}
                    >
                      {title}
                    </span>
                  </div>
                ) : null}
                <p className="text-xs font-semibold text-neutral-850 dark:text-neutral-150 leading-snug line-clamp-2">
                  {message}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => dispatch(hideToast())}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shrink-0 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Action Button (e.g. View Cart / View Favorites) */}
            {actionLink && actionLabel ? (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] text-neutral-400 font-medium">Quick Navigation</span>
                <button
                  onClick={handleActionClick}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-violet-500/20 active:scale-95 cursor-pointer"
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            {/* Auto-dismiss progress timer bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: (duration || 3500) / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 right-0 h-1 origin-left ${progressColors[type]}`}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
