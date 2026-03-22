import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-colors duration-300">
      {/* Left: hamburger */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200 cursor-pointer relative">
          <Bell className="w-5 h-5" strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <User className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {user?.username || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;