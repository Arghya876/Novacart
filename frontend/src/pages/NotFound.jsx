import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Search, Home, ShoppingBag, ArrowLeft, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Helmet>
        <title>404 - Page Not Found | NovaCart</title>
        <meta name="description" content="The page you requested could not be found." />
      </Helmet>

      {/* Decorative Gradient Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 dark:bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/15 dark:bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-xl w-full text-center space-y-8 p-8 sm:p-12 rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white/80 dark:bg-neutral-900/80 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated Badge / Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="mx-auto w-24 h-24 rounded-3xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-850 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-lg shadow-violet-500/10"
        >
          <Compass className="h-12 w-12 stroke-[1.5]" />
        </motion.div>

        {/* Text Details */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-50 dark:bg-violet-950/50 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-850">
            Error Code 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Lost in Cyberspace?
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Product Search Box */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Looking for something specific? Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-24 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-semibold focus:outline-none focus:border-violet-500 transition-colors shadow-inner"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="h-10 px-5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          
          <Link
            to="/"
            className="h-10 px-5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-500/10"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>

          <Link
            to="/products"
            className="h-10 px-5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" /> Browse Catalog
          </Link>
        </div>

        {/* Help Link */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850">
          <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-medium text-neutral-450 hover:text-violet-600 transition-colors">
            <HelpCircle className="h-3.5 w-3.5" /> Need help? Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
