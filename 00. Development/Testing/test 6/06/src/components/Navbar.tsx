import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-accent">applyTrack</span>
          <span className="logo-suffix">-ai</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link
            to="/govt-jobs"
            className={`nav-link ${isActive('/govt-jobs') ? 'active' : ''}`}
          >
            Govt Jobs
          </Link>
          <Link
            to="/private-jobs"
            className={`nav-link ${isActive('/private-jobs') ? 'active' : ''}`}
          >
            Private Jobs
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="welcome-msg">Hi, {user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
