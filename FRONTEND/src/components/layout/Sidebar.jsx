import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, User, LogOut, BrainCircuit, BookOpen, X, Settings, BarChart3, Sun, Moon, Activity, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/flashcards', label: 'Flashcards', icon: BookOpen },
  { to: '/study-sessions', label: 'Study Sessions', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: Activity },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/usage', label: 'Usage', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isSideBarOpen, toggleSideBar }) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Backdrop overlay (mobile) */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSideBar}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl
          border-r border-gray-100 dark:border-gray-800
          shadow-xl shadow-indigo-100/30 dark:shadow-black/30
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isSideBarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-300/50">
              <BrainCircuit className="w-5 h-5 text-white" strokeWidth={1.8} />
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100 text-base tracking-tight">MindSpark</span>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={toggleSideBar}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (isSideBarOpen) toggleSideBar(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}
                    strokeWidth={isActive ? 2 : 1.8}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Theme Toggle + Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 flex-shrink-0" strokeWidth={1.8} />
            ) : (
              <Moon className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={1.8} />
            )}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
