import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const persistSession = useCallback((data) => {
    localStorage.setItem('access_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    persistSession(response.data);
    return response.data;
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);
    persistSession(response.data);
    return response.data;
  }, [persistSession]);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
    register,
  }), [user, token, login, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
