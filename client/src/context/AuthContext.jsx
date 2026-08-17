import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize and check for existing token on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('applytrack_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await authAPI.getProfile();
      if (res.success) {
        setUser(res.data);
        setIsAuthenticated(true);
      } else {
        // Token was invalid or expired
        localStorage.removeItem('applytrack_token');
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const res = await authAPI.login(email, password);
    if (res.success) {
      localStorage.setItem('applytrack_token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const register = async (name, email, password) => {
    setLoading(true);
    const res = await authAPI.register(name, email, password);
    if (res.success) {
      localStorage.setItem('applytrack_token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const loginDemo = async () => {
    setLoading(true);
    const res = await authAPI.loginDemo();
    if (res.success) {
      localStorage.setItem('applytrack_token', res.data.token);
      setUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('applytrack_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    const res = await authAPI.updateProfile(profileData);
    if (res.success) {
      setUser(prev => ({
        ...prev,
        name: res.data.name,
        profile: res.data.profile,
        preferences: res.data.preferences,
      }));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
