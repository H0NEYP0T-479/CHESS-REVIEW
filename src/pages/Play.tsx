import React from 'react';
import { Link } from 'react-router-dom';

const Play: React.FC = () => {
  return (
    <div className="play-container">
      <h1>Play Chess</h1>
      
      <div className="play-modes">
        <div className="play-mode-card">
          <h2>🎮 Play vs Computer</h2>
          <p>Challenge the chess engine at various difficulty levels</p>
          <Link to="/play/computer" className="btn-primary">
            Play Now
          </Link>
        </div>
        
        <div className="play-mode-card">
          <h2>👥 Play vs Player</h2>
          <p>Play against another human player online</p>
          <Link to="/play/online" className="btn-primary">
            Find Match
          </Link>
        </div>
        
        <div className="play-mode-card">
          <h2>🔗 Create Challenge</h2>
          <p>Create a private challenge link to share with friends</p>
          <Link to="/play/challenge" className="btn-primary">
            Create Challenge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Play;
