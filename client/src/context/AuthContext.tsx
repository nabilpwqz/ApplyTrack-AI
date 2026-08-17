import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api.js';
import { User, ApiResponse } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<User>>;
  register: (name: string, email: string, password: string) => Promise<ApiResponse<User>>;
  loginDemo: () => Promise<ApiResponse<User>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      const token = localStorage.getItem('applytrack_token');
      if (token) {
        const res = await authAPI.getProfile();
        if (res.success && res.data) {
          setUser(res.data);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('applytrack_token');
        }
      }
      setLoading(false);
    };

    checkLoggedInUser();
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse<User>> => {
    setLoading(true);
    const res = await authAPI.login(email, password);
    if (res.success && res.data) {
      if (res.data.token) {
        localStorage.setItem('applytrack_token', res.data.token);
      }
      setUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const register = async (name: string, email: string, password: string): Promise<ApiResponse<User>> => {
    setLoading(true);
    const res = await authAPI.register(name, email, password);
    if (res.success && res.data) {
      if (res.data.token) {
        localStorage.setItem('applytrack_token', res.data.token);
      }
      setUser(res.data);
      setIsAuthenticated(true);
    }
    setLoading(false);
    return res;
  };

  const loginDemo = async (): Promise<ApiResponse<User>> => {
    setLoading(true);
    const res = await authAPI.loginDemo();
    if (res.success && res.data) {
      if (res.data.token) {
        localStorage.setItem('applytrack_token', res.data.token);
      }
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
