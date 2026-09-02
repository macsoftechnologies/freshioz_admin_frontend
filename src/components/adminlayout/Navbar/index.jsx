import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, LogOut, User } from 'lucide-react';
import './Navbar.css';

import { logout, getUser } from '../../../services/authService';

const Navbar = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const user = getUser();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const userName = user?.employeeName || user?.username || 'User';
  const userInitials = userName.charAt(0).toUpperCase();
  const userRole = user?.designation || (user?.role ? user.role.replace('_', ' ') : 'Guest');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products, orders, suppliers..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="notification-wrapper">
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <span className="notification-badge">3</span>
        </div>
        <div className="user-profile-container" ref={dropdownRef}>
          <div className="user-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
            <div className="avatar">{userInitials}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role capitalize">{userRole}</span>
            </div>
          </div>
          
          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <User size={16} />
                <span>My Profile</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;