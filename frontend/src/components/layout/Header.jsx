import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Sparkles, Package, ShoppingBag, X, TrendingUp, ArrowRight } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import useDebounce from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/formatCurrency';

const POPULAR_SEARCHES = [
  'Samsung Watch',
  'Smart Watch',
  'Electronics',
  'Fashion',
  'Footwear',
  'Home',
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { cartItems = [] } = useSelector((state) => state.cart || {});
  const { wishlistItems = [] } = useSelector((state) => state.wishlist || {});

  const [animateCart, setAnimateCart] = useState(false);
  const [animateWishlist, setAnimateWishlist] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      setAnimateWishlist(true);
      const timer = setTimeout(() => setAnimateWishlist(false), 300);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [suggestions, setSuggestions] = useState([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchInputRef = useRef(null);
  const searchModalRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Auto-close dropdown & search modal popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (
        searchModalRef.current && 
        !searchModalRef.current.contains(e.target) &&
        !e.target.closest('.search-trigger')
      ) {
        setSearchModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Handle ESC key to close search modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search modal opens
  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`/api/products/autocomplete?q=${debouncedSearchQuery}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setSearchModalOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 dark:border-neutral-900 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer select-none shrink-0">
            <div className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-violet-700 text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3z" />
                <path d="M9.2 10.5v5.8h1.4v-3.6l2.5 3.6h1.4v-5.8h-1.4v3.6l-2.5-3.6H9.2z" fill="#FFFFFF" />
              </svg>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-neutral-950 animate-pulse" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center font-extrabold text-xl sm:text-2xl tracking-tight text-neutral-900 dark:text-white leading-none">
                <span className="text-violet-600 dark:text-violet-400 font-black">Nova</span>
                <span className="text-neutral-900 dark:text-white font-extrabold">Cart</span>
              </div>
              <svg className="w-16 h-1.5 text-violet-500 fill-none stroke-current mt-0.5" viewBox="0 0 60 6">
                <path d="M 2 2 Q 30 6, 58 2" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </Link>

          {/* Desktop Search Bar Trigger */}
          <div className="hidden sm:block flex-1 max-w-md relative mx-2">
            <button
              onClick={() => setSearchModalOpen(!searchModalOpen)}
              className="search-trigger w-full h-10 pl-4 pr-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-left text-xs text-neutral-400 dark:text-neutral-500 hover:border-violet-400 dark:hover:border-violet-600 transition-all flex items-center justify-between cursor-pointer"
            >
              <span>Search products, categories, brands...</span>
              <Search className="h-4 w-4 text-neutral-400 shrink-0" />
            </button>
          </div>

          {/* Action Navigation Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Mobile Search Button (Triggers Search Floating Popup on Phones) */}
            <button
              onClick={() => setSearchModalOpen(!searchModalOpen)}
              className="search-trigger p-2 sm:hidden text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition-colors"
              title="Search Products"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist Icon Button */}
            <Link
              to="/wishlist"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full relative transition-colors"
            >
              <motion.div animate={animateWishlist ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.3 }}>
                <Heart className="h-5 w-5" />
              </motion.div>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon Button */}
            <Link
              to="/cart"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full relative transition-colors"
            >
              <motion.div animate={animateCart ? { scale: [1, 1.25, 1], y: [0, -4, 0] } : {}} transition={{ duration: 0.3 }}>
                <ShoppingCart className="h-5 w-5" />
              </motion.div>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Rounded Profile Avatar Dropdown Button (Contains All Navigation & Functions) */}
            <div ref={userDropdownRef} className="relative ml-0.5">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-violet-500/40 dark:border-violet-400/40 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 overflow-hidden hover:scale-105 transition-all shadow-xs cursor-pointer"
                title="Account Menu"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  style={{ display: user?.avatar ? 'none' : 'flex' }}
                  className="h-full w-full rounded-full items-center justify-center font-bold text-xs"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4.5 w-4.5" />}
                </div>
              </button>

              {/* Combined Dropdown Menu with ALL Functions */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50">
                  {user ? (
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-850">
                      <p className="text-xs font-bold text-neutral-850 dark:text-neutral-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                        {user.role} Account
                      </span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-850">
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Welcome Guest</p>
                      <p className="text-[10px] text-neutral-400">Sign in to access your dashboard</p>
                    </div>
                  )}

                  {/* Catalog Navigation */}
                  <Link 
                    to="/products" 
                    onClick={() => setUserDropdownOpen(false)} 
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4 text-violet-500" /> Shop Catalog
                  </Link>

                  {user ? (
                    <>
                      <Link 
                        to="/profile" 
                        onClick={() => setUserDropdownOpen(false)} 
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                      >
                        <User className="h-4 w-4 text-neutral-400" /> My Profile
                      </Link>

                      {user.role === 'customer' && (
                        <Link 
                          to="/profile?tab=orders" 
                          onClick={() => setUserDropdownOpen(false)} 
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                        >
                          <Package className="h-4 w-4 text-neutral-400" /> My Orders
                        </Link>
                      )}

                      {user.role === 'seller' && (
                        <Link 
                          to="/seller/dashboard" 
                          onClick={() => setUserDropdownOpen(false)} 
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                        >
                          <Sparkles className="h-4 w-4 text-emerald-500" /> Seller Dashboard
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setUserDropdownOpen(false)} 
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                        >
                          <Sparkles className="h-4 w-4 text-violet-500" /> Admin Console
                        </Link>
                      )}
                    </>
                  ) : null}

                  {/* Dark Mode Toggle inside Profile Dropdown */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors border-t border-neutral-100 dark:border-neutral-850 mt-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-400" />} 
                      {darkMode ? 'Light Theme' : 'Dark Theme'}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase font-bold">{darkMode ? 'On' : 'Off'}</span>
                  </button>

                  {/* Auth Actions */}
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-colors border-t border-neutral-100 dark:border-neutral-850 mt-1 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors border-t border-neutral-100 dark:border-neutral-850 mt-1"
                    >
                      <User className="h-4 w-4" /> Sign In / Register
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Clean Search Panel Popup (Navbar stays 100% visible & bright!) */}
      <AnimatePresence>
        {searchModalOpen && (
          <div className="absolute top-16 left-0 right-0 z-50 px-4 pt-2 pb-6">
            {/* Transparent backdrop for outside clicks */}
            <div 
              onClick={() => setSearchModalOpen(false)}
              className="fixed inset-0 top-16 z-40 bg-transparent" 
            />

            {/* Floating Glassmorphic Search Card */}
            <motion.div
              ref={searchModalRef}
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative max-w-xl mx-auto bg-white/95 dark:bg-neutral-900/95 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl z-50"
            >
              {/* Form Input Header with ONLY ONE single X clear button */}
              <form onSubmit={handleSearchSubmit} className="p-3.5 sm:p-4 border-b border-neutral-150 dark:border-neutral-850 flex items-center gap-3">
                <Search className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400 shrink-0 ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none font-medium"
                />
                
                {/* Single X button: clears typed search text if present, or closes modal if empty */}
                <button
                  type="button"
                  onClick={() => {
                    if (searchQuery) {
                      setSearchQuery('');
                    } else {
                      setSearchModalOpen(false);
                    }
                  }}
                  className="p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear search text / Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>

              {/* Suggestions / Available Catalog Items Body */}
              <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-4">
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2">Matching Catalog Items</div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {suggestions.map((item) => (
                        <button
                          key={item.slug}
                          onClick={() => {
                            navigate(`/product/${item.slug}`);
                            setSuggestions([]);
                            setSearchQuery('');
                            setSearchModalOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-850 flex items-center justify-between gap-3 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img src={item.images?.[0]} alt="" className="w-9 h-9 rounded-xl object-cover bg-neutral-50" />
                            <div>
                              <h4 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-1 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-neutral-400 capitalize">{item.category?.name || item.brand}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">{formatPrice(item.discountPrice > 0 ? item.discountPrice : item.price)}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      <TrendingUp className="h-3.5 w-3.5 text-violet-500" /> Popular Catalog Searches
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchQuery(term);
                            navigate(`/products?q=${encodeURIComponent(term)}`);
                            setSearchModalOpen(false);
                          }}
                          className="px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-850 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-neutral-700 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-medium transition-all cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
