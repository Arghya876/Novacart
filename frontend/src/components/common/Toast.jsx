import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { hideToast } from '../../store/toastSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const { isOpen, message, type, duration } = useSelector((state) => state.toast);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, dispatch]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 animate-pulse" />,
    error: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 animate-bounce" />,
    info: <Info className="h-5 w-5 text-violet-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20 dark:border-emerald-500/10 shadow-emerald-500/5',
    error: 'border-rose-500/20 dark:border-rose-500/10 shadow-rose-500/5',
    info: 'border-violet-500/20 dark:border-violet-500/10 shadow-violet-500/5',
  };

  const progressColors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-violet-500',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotate: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto relative overflow-hidden flex items-center gap-3.5 pl-4.5 pr-3 py-4.5 rounded-2xl border bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl max-w-sm min-w-[320px] transition-colors ${borders[type]}`}
          >
            {icons[type]}
            
            <div className="flex-1">
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-normal pr-4">
                {message}
              </p>
            </div>

            <button
              onClick={() => dispatch(hideToast())}
              className="p-1 rounded-xl text-neutral-450 hover:text-neutral-600 dark:hover:text-neutral-205 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Time progress bar line */}
            <motion.div 
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={`absolute bottom-0 left-0 right-0 h-0.75 origin-left ${progressColors[type]}`}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
