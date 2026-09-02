import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(true);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        isCollapsed={sidebarCollapsed} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="layout-content">
        <Navbar onMenuClick={handleMenuClick} />
        <main className="main-area">
          <Outlet />
        </main>
        <Footer />
      </div>
      
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Layout;