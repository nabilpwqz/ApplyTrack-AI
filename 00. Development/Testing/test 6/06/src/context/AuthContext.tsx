/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const saved = localStorage.getItem('applytrack_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string) => {
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('applytrack_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('applytrack_user');
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
