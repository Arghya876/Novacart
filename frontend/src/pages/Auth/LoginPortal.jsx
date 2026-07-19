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
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/80 dark:bg-neutral-900/80 p-6 sm:p-7 shadow-md hover:shadow-xl dark:shadow-neutral-950/30 backdrop-blur-md transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-violet-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                <User className="h-5.5 w-5.5" />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Customer Sign In & Portal
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Shop premium items, manage your cart & wishlist, track orders, and experience personalized checkouts.
                </p>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Link
                to="/login/customer"
                className="h-11 sm:h-10.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] w-full"
              >
                Customer Login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register/customer"
                className="h-11 sm:h-10.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center transition-all active:scale-[0.98] w-full"
              >
                Create Account
              </Link>
            </div>
          </div>

          {/* Seller Portal Card */}
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/80 dark:bg-neutral-900/80 p-6 sm:p-7 shadow-md hover:shadow-xl dark:shadow-neutral-950/30 backdrop-blur-md transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-emerald-500 to-teal-500 opacity-80 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Store className="h-5.5 w-5.5" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Seller Sign In & Portal
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Open your storefront, manage products, view sales reports, fulfill buyer orders, and access key merchant insights.
                </p>
              </div>
            </div>

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <Link
                to="/login/seller"
                className="h-11 sm:h-10.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] w-full"
              >
                Merchant Login <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register/seller"
                className="h-11 sm:h-10.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center transition-all active:scale-[0.98] w-full"
              >
                Register Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
