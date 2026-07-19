import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Sparkles, Package, ShoppingBag } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import { motion } from 'framer-motion';
import axios from 'axios';

import useDebounce from '../../hooks/useDebounce';

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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const autocompleteRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Auto-close dropdown popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (autocompleteRef.current && !autocompleteRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl text-neutral-900 dark:text-white shrink-0 group">
            <div className="rounded-full bg-violet-100 dark:bg-violet-900/40 p-1.5 sm:p-2 shadow-xs">
              <Sparkles className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-violet-600 dark:text-violet-400 transition-transform group-hover:rotate-12" />
            </div>
            <span className="bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              NovaCart
            </span>
          </Link>

          {/* Search Input Bar (Visible on all mobile & desktop screens) */}
          <div ref={autocompleteRef} className="flex-1 max-w-xs sm:max-w-md relative mx-1">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 sm:h-10 pl-3.5 pr-9 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 text-xs text-neutral-950 dark:text-white transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </form>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-850 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 backdrop-blur">
                {suggestions.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => {
                      navigate(`/product/${item.slug}`);
                      setSuggestions([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 flex items-center gap-2.5 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="line-clamp-1">{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Navigation Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
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
    </header>
  );
}
