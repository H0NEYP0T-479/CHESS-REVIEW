import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface UserProfile {
  rating_bullet: number;
  rating_blitz: number;
  rating_rapid: number;
  rating_classical: number;
  puzzle_rating: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  preferred_time_control: string;
  board_theme: string;
  piece_style: string;
  sound_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      setProfile(null);
      setToken(null);
      localStorage.removeItem('token');
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me/profile`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, []);

  // Set up axios interceptor for auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUser();
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, fetchUser, fetchProfile]);

  const login = async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post(`${API_BASE_URL}/token`, formData);
    const newToken = response.data.access_token;
    
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const register = async (username: string, email: string, password: string) => {
    await axios.post(`${API_BASE_URL}/register`, { username, email, password });
    // Auto-login after registration
    await login(username, password);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const response = await axios.put(`${API_BASE_URL}/users/me/profile`, updates);
    setProfile(response.data);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      token, 
      login, 
      register, 
      logout, 
      updateProfile,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the hook separately to avoid fast refresh issues
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
