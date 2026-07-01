import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, Heart, User, Sun, Moon, LogOut, Menu, X, ChevronDown, Sparkles, Package } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import axios from 'axios';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: cartItems = [] } = useSelector((state) => state.cart || {});
  const { items: wishlistItems = [] } = useSelector((state) => state.wishlist || {});

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const autocompleteRef = useRef(null);

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
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`/api/products/autocomplete?q=${searchQuery}`);
        setSuggestions(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 dark:border-neutral-900 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900 dark:text-white shrink-0 group">
            <div className="rounded-full bg-violet-100 dark:bg-violet-900/40 p-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400 transition-transform group-hover:rotate-12" />
            </div>
            <span className="bg-linear-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              NovaCart
            </span>
          </Link>

          <div ref={autocompleteRef} className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 text-xs text-neutral-950 dark:text-white transition-all"
                />
                <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                  <Search className="h-4 w-4" />
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
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link
              to="/wishlist"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full relative transition-colors"
            >
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full relative transition-colors mr-1"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-violet-600 text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-1.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover border border-neutral-200" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 flex items-center justify-center font-semibold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-850">
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{user.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                    </div>

                    <Link to="/customer" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors">
                      <User className="h-4 w-4 text-neutral-400" /> My Profile
                    </Link>

                    <Link to="/customer?tab=orders" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors">
                      <Package className="h-4 w-4 text-neutral-400" /> My Orders
                    </Link>

                    {user.role === 'seller' && (
                      <Link to="/seller" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors">
                        <Sparkles className="h-4 w-4 text-violet-500" /> Seller Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 transition-colors border-t border-neutral-100 dark:border-neutral-850 mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-full text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="flex flex-col gap-2">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl">
              Shop Catalog
            </Link>
            
            {user ? (
              <>
                <div className="border-t border-neutral-150 dark:border-neutral-800 my-2" />
                <div className="px-3 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Account ({user.name})
                </div>
                <Link to="/customer?tab=orders" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl flex items-center gap-2">
                  <Package className="h-4 w-4 text-neutral-400" /> My Orders
                </Link>
                <Link to="/customer" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-355 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl flex items-center gap-2">
                  <User className="h-4 w-4 text-neutral-400" /> My Profile
                </Link>
                {user.role === 'seller' && (
                  <Link to="/seller" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-xl flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-500" /> Seller Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-xl flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mx-3 mt-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center justify-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
