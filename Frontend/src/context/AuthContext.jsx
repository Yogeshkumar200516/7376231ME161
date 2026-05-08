import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const AuthContext = createContext(null);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const applyToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete axios.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('notification_user');
      const storedToken = localStorage.getItem('notification_token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        applyToken(storedToken);
      } else {
        applyToken(null);
      }
    } catch (_error) {
      localStorage.removeItem('notification_user');
      localStorage.removeItem('notification_token');
      applyToken(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('notification_user', JSON.stringify(userData));
    localStorage.setItem('notification_token', authToken);
    setUser(userData);
    setToken(authToken);
    applyToken(authToken);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/api/auth/logout');
      }
    } catch (_error) {
      // Ignore logout API failure and clear local state anyway.
    } finally {
      localStorage.removeItem('notification_user');
      localStorage.removeItem('notification_token');
      setUser(null);
      setToken(null);
      applyToken(null);
    }
  };

  const value = useMemo(
    () => ({
      api,
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBootstrapping,
      login,
      logout,
    }),
    [user, token, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
