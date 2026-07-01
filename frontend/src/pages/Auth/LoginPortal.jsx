import React from 'react';
import { Link } from 'react-router-dom';
import { User, Store, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPortal() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Decorative gradient blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-violet-400/10 dark:bg-violet-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl" />

      <div className="w-full max-w-4xl space-y-8 z-10">
        <div className="text-center space-y-3 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-violet-100 dark:bg-violet-900/40 text-violet-650 dark:text-violet-400">
            <Sparkles className="h-3 w-3" /> Account Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Choose Your Destination
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to your specialized dashboard or create a new account to experience premium commerce.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Customer Portal Card */}
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/70 p-8 shadow-md hover:shadow-xl dark:shadow-neutral-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                <User className="h-6 w-6" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  Customer Portal
                </h2>
                <p className="text-xs text-neutral-450 dark:text-neutral-450 leading-relaxed">
                  Shop premium items, manage your cart & wishlist, track orders, and experience personalized checkouts.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login/customer"
                  className="flex-1 h-10 rounded-xl bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  Sign In <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/register/customer"
                  className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>

          {/* Seller Portal Card */}
          <div className="group relative rounded-3xl border border-neutral-200/80 dark:border-neutral-850 bg-white/70 dark:bg-neutral-900/70 p-8 shadow-md hover:shadow-xl dark:shadow-neutral-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <Store className="h-6 w-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  Seller Portal
                </h2>
                <p className="text-xs text-neutral-450 dark:text-neutral-450 leading-relaxed">
                  Open your storefront, manage products, view sales reports, fulfill buyer orders, and access key merchant insights.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login/seller"
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  Merchant Sign In <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to="/register/seller"
                  className="flex-1 h-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center justify-center transition-all"
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
