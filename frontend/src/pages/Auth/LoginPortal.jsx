import React from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPortal() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-400/10 dark:bg-violet-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-100 dark:bg-violet-900/40 text-violet-650 dark:text-violet-400">
            <Sparkles className="h-3 w-3" /> Account Portals
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Welcome to NovaCart Portal
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            Select your account type below to sign in or create a new account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Customer Portal Card */}
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/70 p-6 sm:p-8 shadow-md hover:shadow-xl dark:shadow-neutral-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                <User className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  Customer Sign In & Portal
                </h2>
                <p className="text-xs text-neutral-450 dark:text-neutral-450 leading-relaxed">
                  Shop premium items, manage your cart & wishlist, track orders, and experience personalized checkouts.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Link
                  to="/login/customer"
                  className="w-[92%] sm:w-full sm:flex-1 h-16 sm:h-11 px-5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 active:scale-[0.98] mx-auto sm:mx-0"
                >
                  Customer Login <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  to="/register/customer"
                  className="w-[92%] sm:w-full sm:flex-1 h-16 sm:h-11 px-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm font-bold flex items-center justify-center transition-all active:scale-[0.98] mx-auto sm:mx-0"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Seller Portal Card */}
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/70 p-6 sm:p-8 shadow-md hover:shadow-xl dark:shadow-neutral-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <Store className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  Seller Sign In & Portal
                </h2>
                <p className="text-xs text-neutral-450 dark:text-neutral-450 leading-relaxed">
                  Open your storefront, manage products, view sales reports, fulfill buyer orders, and access key merchant insights.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                <Link
                  to="/login/seller"
                  className="w-[92%] sm:w-full sm:flex-1 h-16 sm:h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 active:scale-[0.98] mx-auto sm:mx-0"
                >
                  Merchant Login <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  to="/register/seller"
                  className="w-[92%] sm:w-full sm:flex-1 h-16 sm:h-11 px-5 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-100 text-sm font-bold flex items-center justify-center transition-all active:scale-[0.98] mx-auto sm:mx-0"
                >
                  Register Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
