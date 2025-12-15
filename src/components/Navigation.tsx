import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, profile, logout } = useAuth();

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <Link to="/">♟️ Chess Review</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/play">Play</Link>
        <Link to="/analysis">Analysis</Link>
        <Link to="/puzzles">Puzzles</Link>
        <Link to="/leaderboard">Leaderboard</Link>
      </div>
      
      <div className="nav-user">
        {user ? (
          <>
            <span className="user-info">
              {user.username} 
              {profile && <span className="user-rating">({profile.rating_blitz})</span>}
            </span>
            <button onClick={logout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
