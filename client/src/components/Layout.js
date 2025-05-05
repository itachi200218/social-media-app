import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Layout.css'; // Ensure your CSS file is properly linked

const Layout = ({ children }) => {
  const [isShrunk, setIsShrunk] = useState(true); // Start with footer shrunk
  const [isHovered, setIsHovered] = useState(false); // Track footer hover state
  const [activeLink, setActiveLink] = useState(''); // Track active link
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null); // Reference to the shrink timer

  // Start shrink timer (after 2 seconds)
  const startShrinkTimer = () => {
    if (!isHovered) {
      timerRef.current = setTimeout(() => {
        setIsShrunk(true);
      }, 2000);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // Handle mouse enter (expand footer)
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsShrunk(false);
    clearTimeout(timerRef.current);
  };

  // Handle mouse leave (start shrink timer)
  const handleMouseLeave = () => {
    setIsHovered(false);
    startShrinkTimer();
  };

  // Handle link click to set active link manually
  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
  };

  // Automatically set active link based on current path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard')) setActiveLink('dashboard');
    else if (path.includes('post')) setActiveLink('posts');
    else if (path.includes('feed')) setActiveLink('feed');
    else if (path.includes('notifications')) setActiveLink('notifications');
    else if (path.includes('chiku-chat')) setActiveLink('chiku-chat');
  }, [location.pathname]);

  // Restart shrink timer when hover state changes
  useEffect(() => {
    startShrinkTimer();
    return () => clearTimeout(timerRef.current);
  }, [isHovered]);

  return (
    <div className="layout-container">
      <div className="content">
        {children}
      </div>

      <footer
        className={`feed-footer ${isShrunk ? 'shrunk' : 'expanded'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="footer-links">
          <Link
            to="/dashboard" // Navigate to /dashboard instead of /user-profile
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

        <div className="footer-arrow" onClick={() => setIsShrunk(false)}>
          <i className="fas fa-arrow-up"></i>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

