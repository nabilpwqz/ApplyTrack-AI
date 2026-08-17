import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserProfile, UserPreferences } from '../types/index.ts';
import { authAPI } from '../services/api.ts';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  loginDemo: () => Promise<boolean>;
  logout: () => void;
  updateProfile: (name?: string, profile?: UserProfile, preferences?: UserPreferences) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('applytrack_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('applytrack_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getProfile();
          if (res.success && res.data) {
            // Keep local user name if backend fallback is generic
            const savedLocal = localStorage.getItem('applytrack_user');
            let finalUser = res.data;
            if (savedLocal) {
              try {
                const parsed = JSON.parse(savedLocal);
                if (parsed.name && parsed.name !== 'Guest') {
                  finalUser = { ...res.data, name: parsed.name };
                }
              } catch {}
            }
            setUser(finalUser);
            localStorage.setItem('applytrack_user', JSON.stringify(finalUser));
          }
        } catch {
          // Keep current state from initial state
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const saveUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('applytrack_user', JSON.stringify(userData));
    if (userData.token) {
      setToken(userData.token);
      localStorage.setItem('applytrack_token', userData.token);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.data) {
        const rawName = email.split('@')[0];
        const formattedName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : 'User';
        
        const loggedUser: User = {
          ...res.data,
          name: res.data.name && res.data.name !== 'Guest' ? res.data.name : formattedName,
        };

        saveUserSession(loggedUser);
        toast.success(`Welcome back, ${loggedUser.name}!`);
        return true;
      }
      toast.error(res.message || 'Login failed');
      return false;
    } catch {
      toast.error('Connection error during login');
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      const res = await authAPI.register({ name, email, password });
      if (res.success && res.data) {
        const registeredUser: User = {
          ...res.data,
          name: name || res.data.name || 'User',
        };

        saveUserSession(registeredUser);
        toast.success(`Welcome, ${registeredUser.name}! Account created.`);
        return true;
      }
      toast.error(res.message || 'Registration failed');
      return false;
    } catch {
      toast.error('Connection error during registration');
      return false;
    }
  };

  const loginDemo = async (): Promise<boolean> => {
    try {
      const res = await authAPI.loginDemo();
      if (res.success && res.data) {
        const demoUser: User = {
          _id: res.data._id || 'demo_guest_id',
          name: 'Guest',
          email: res.data.email || 'guest@applytrack.ai',
          token: res.data.token || 'mock_demo_jwt_token_2026',
          profile: res.data.profile || {
            headline: 'Frontend Engineer | React Specialist',
            location: 'Austin, TX',
          },
        };
        saveUserSession(demoUser);
        toast.success('Accessed Guest Demo Session!');
        return true;
      }
      toast.error('Failed to start demo session');
      return false;
    } catch {
      const demoUser: User = {
        _id: 'demo_guest_fallback',
        name: 'Guest',
        email: 'guest@applytrack.ai',
        token: 'mock_demo_jwt_token_2026',
      };
      saveUserSession(demoUser);
      toast.success('Accessed Guest Demo Session!');
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('applytrack_token');
    localStorage.removeItem('applytrack_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (name?: string, profile?: UserProfile, preferences?: UserPreferences): Promise<boolean> => {
    try {
      const res = await authAPI.updateProfile({ name, profile, preferences });
      if (res.success && res.data) {
        const updatedUser: User = {
          ...res.data,
          name: name || res.data.name || user?.name || 'User',
        };
        saveUserSession(updatedUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
