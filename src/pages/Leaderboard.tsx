import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  username: string;
  rating: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
}

const Leaderboard: React.FC = () => {
  const [timeControl, setTimeControl] = useState('blitz');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/leaderboard/${timeControl}`);
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [timeControl, API_BASE_URL]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      
      <div className="time-control-selector">
        <button 
          className={timeControl === 'bullet' ? 'active' : ''}
          onClick={() => setTimeControl('bullet')}
        >
          Bullet
        </button>
        <button 
          className={timeControl === 'blitz' ? 'active' : ''}
          onClick={() => setTimeControl('blitz')}
        >
          Blitz
        </button>
        <button 
          className={timeControl === 'rapid' ? 'active' : ''}
          onClick={() => setTimeControl('rapid')}
        >
          Rapid
        </button>
        <button 
          className={timeControl === 'classical' ? 'active' : ''}
          onClick={() => setTimeControl('classical')}
        >
          Classical
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Rating</th>
              <th>Games</th>
              <th>W/L/D</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td className="rating-cell">{entry.rating}</td>
                <td>{entry.total_games}</td>
                <td>{entry.wins}/{entry.losses}/{entry.draws}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
