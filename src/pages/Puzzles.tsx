import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

interface Puzzle {
  id: number;
  fen: string;
  moves: string;
  rating: number;
  themes: string | null;
  is_daily: boolean;
}

const Puzzles: React.FC = () => {
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const fetchDailyPuzzle = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/daily`);
      setDailyPuzzle(response.data);
    } catch (error) {
      console.error('Failed to fetch daily puzzle:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchDailyPuzzle();
  }, [fetchDailyPuzzle]);

  return (
    <div className="puzzles-container">
      <h1>Chess Puzzles</h1>
      
      {loading ? (
        <p>Loading puzzle...</p>
      ) : dailyPuzzle ? (
        <div className="puzzle-card">
          <h2>Daily Puzzle</h2>
          <p>Rating: {dailyPuzzle.rating}</p>
          <p>FEN: {dailyPuzzle.fen}</p>
          <p className="puzzle-hint">Find the best move!</p>
          <p className="puzzle-note">Full puzzle solver coming soon...</p>
        </div>
      ) : (
        <p>No puzzles available yet. Add puzzles to the database!</p>
      )}
    </div>
  );
};

export default Puzzles;
