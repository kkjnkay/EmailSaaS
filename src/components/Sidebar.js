import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import '../styles/App.css';

const navItems = [
  { icon: '📤', label: 'Campaigns', path: '/campaigns' },
  { icon: '📧', label: 'Emails', path: '/emails' },
  { icon: '👥', label: 'Leads', path: '/leads' },
  { icon: '📨', label: 'Unibox', path: '/unibox' },
  { icon: '📊', label: 'Analytics', path: '/analytics' },
];

const Sidebar = () => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-icons">
        {navItems.map((item, index) => (
          <div
            key={index}
            className="tooltip-container"
            onClick={() => navigate(item.path)}
          >
            <div className={`sidebar-icon ${location.pathname === item.path ? 'active' : ''}`}>
              {item.icon}
            </div>
            <span className="tooltip-text">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="profile-section">
        <div className="sidebar-icon" onClick={() => setShowProfile(!showProfile)}>👤</div>
        {showProfile && <ProfileMenu />}
      </div>
    </div>
  );
};

export default Sidebar;
