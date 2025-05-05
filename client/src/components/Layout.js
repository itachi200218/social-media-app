import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const [activeLink, setActiveLink] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // Controls dropdown visibility
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveLink('dashboard');
    else if (path.includes('post')) setActiveLink('posts');
    else if (path.includes('feed')) setActiveLink('feed');
    else if (path.includes('notifications')) setActiveLink('notifications');
    else if (path.includes('chiku-chat')) setActiveLink('chiku-chat');
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false); // Close the menu if clicked outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
    setMenuOpen(false); // Close menu after selecting a link
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen); // Toggle dropdown visibility
  };

  return (
    <div className="layout-container">
     <div
  className={`top-left-menu ${menuOpen ? 'open' : ''}`} // changed here
  ref={menuRef}
>

        <i
          className={`fas fa-bars menu-icon ${menuOpen ? 'open' : ''}`} // Add 'open' class to rotate icon
          onClick={toggleMenu} // Toggle dropdown menu
        ></i>

        {menuOpen && (
          <div className="dropdown">
            <Link
              to="/dashboard"
              className={activeLink === 'dashboard' ? 'active' : ''}
              onClick={() => handleLinkClick('dashboard')}
            >
              <i className="fas fa-user"></i> Profile
            </Link>
            <Link
              to="/post/1"
              className={activeLink === 'posts' ? 'active' : ''}
              onClick={() => handleLinkClick('posts')}
            >
              <i className="fas fa-file-alt"></i> Posts
            </Link>
            <Link
              to="/feed"
              className={activeLink === 'feed' ? 'active' : ''}
              onClick={() => handleLinkClick('feed')}
            >
              <i className="fas fa-home"></i> Feed
            </Link>
            <Link
              to="/notifications"
              className={activeLink === 'notifications' ? 'active' : ''}
              onClick={() => handleLinkClick('notifications')}
            >
              <i className="fas fa-bell"></i> Notifications
            </Link>
            <Link
              to="/chiku-chat"
              className={activeLink === 'chiku-chat' ? 'active' : ''}
              onClick={() => handleLinkClick('chiku-chat')}
            >
              <i className="fas fa-comments"></i> Chiku AI
            </Link>
            <Link
              to="/login"
              className="logout-link"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                navigate('/login');
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </Link>
          </div>
        )}
      </div>

      <div className="content">{children}</div>
    </div>
  );
};

export default Layout;
