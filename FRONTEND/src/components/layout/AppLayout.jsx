import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = () => {
  // Start open so desktop users immediately see navigation; on mobile it will slide in/out.
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSideBarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar isSideBarOpen={isSideBarOpen} toggleSideBar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;