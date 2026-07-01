import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, LogOut, Sun, Moon } from 'lucide-react';
import { logoutUser } from '../../store/authSlice';

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold">Access Denied</h1>
          <p className="text-sm text-neutral-400">
            You do not have administrative privileges to access this area.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/" className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs rounded-xl font-semibold text-white">
              Go to Store
            </Link>
            <button
              onClick={() => {
                dispatch(logoutUser());
                navigate('/admin/login');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs rounded-xl font-semibold text-white cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 transition-colors duration-300">
      {/* Admin Header */}
      <header className="h-16 border-b border-neutral-200 dark:border-neutral-850 bg-white dark:bg-neutral-900 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/25">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-neutral-850 dark:text-white">NOVACART</h1>
            <p className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider">Admin Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850 rounded-full transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 flex items-center justify-center text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <Outlet />
      </main>
    </div>
  );
}
