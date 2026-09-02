import React from 'react';
import { NavLink } from 'react-router-dom';
import { sidebarData } from '../../../data/sidebarData';
import { X, Hexagon, Circle } from 'lucide-react';
import { getUser } from '../../../services/authService';
import './Sidebar.css';

import logoImg from '../../../assets/logo/freshioz_logo.png';

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand">
          {!isCollapsed ? (
            <img src={logoImg} alt="Freshioz" className="brand-logo-img" />
          ) : (
            <div className="brand-icon-collapsed">
              <span className="brand-z" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ff9800' }}>Fz</span>
            </div>
          )}
        </div>
        <button className="close-btn lg-hidden" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {sidebarData.map((item, index) => {
          const user = getUser();
          const isAdmin = user?.role === 'admin' || user?.role?.toLowerCase().includes('admin');
          if (item.reqAdmin && !isAdmin) return null;

          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.title}</span>
              {item.title === 'Orders' && (
                <span className="nav-badge">12</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer-bg"></div>
    </aside>
  );
};

export default Sidebar;