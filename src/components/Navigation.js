import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Map War Game
        </Link>
        
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link 
                to="/run" 
                className={`nav-link ${isActive('/run') ? 'active' : ''}`}
              >
                Run
              </Link>
            </li>
          )}
          <li>
            <Link 
              to="/leaderboard" 
              className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
            >
              Leaderboard
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link 
                  to="/profile" 
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="nav-link"
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link 
                to="/login" 
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
