import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 antialiased font-sans text-slate-800">
      <div id="page-progress-bar" className={navigating ? 'active' : ''} style={{ width: navigating ? '80%' : '0%' }} />

      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

      <div className="flex-1 flex w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
          <main
            id="main-content"
            tabIndex={-1}
            key={location.pathname}
            className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 focus:outline-none animate-fade-in"
          >
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
