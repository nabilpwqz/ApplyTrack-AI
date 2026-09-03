import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get the redirect path from location state, or default to '/dashboard'
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // Mock successful authentication
    login(username.trim());
    navigate(from, { replace: true });
  };

  return (
    <div className="page-container login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to manage and track your job applications with AI insights</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="form-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. johndoe"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary btn-full">
            Log In
          </button>
        </form>
        <div className="login-footer">
          <p>Use any mock username and password (min. 4 chars) to log in.</p>
        </div>
      </div>
    </div>
  );
};
export default Login;
