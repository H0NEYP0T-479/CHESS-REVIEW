import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="home-container">
      <h1>Welcome to Chess Review{user ? `, ${user.username}` : ''}!</h1>
      
      {profile && (
        <div className="stats-overview">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Blitz Rating</h3>
              <p className="rating">{profile.rating_blitz}</p>
            </div>
            <div className="stat-card">
              <h3>Rapid Rating</h3>
              <p className="rating">{profile.rating_rapid}</p>
            </div>
            <div className="stat-card">
              <h3>Games Played</h3>
              <p className="rating">{profile.total_games}</p>
            </div>
            <div className="stat-card">
              <h3>Win Rate</h3>
              <p className="rating">
                {profile.total_games > 0 
                  ? Math.round((profile.wins / profile.total_games) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="features-grid">
        <Link to="/play" className="feature-card">
          <h2>⚔️ Play Chess</h2>
          <p>Challenge players or play against the engine</p>
        </Link>
        
        <Link to="/analysis" className="feature-card">
          <h2>📊 Game Analysis</h2>
          <p>Analyze your games with engine evaluation</p>
        </Link>
        
        <Link to="/puzzles" className="feature-card">
          <h2>🧩 Puzzles</h2>
          <p>Solve tactical puzzles and improve your skills</p>
        </Link>
        
        <Link to="/leaderboard" className="feature-card">
          <h2>🏆 Leaderboard</h2>
          <p>See top rated players</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;
