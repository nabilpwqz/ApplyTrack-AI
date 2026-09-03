import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="enhanced-footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <Link to="/" className="navbar-logo footer-logo">
            <span className="logo-accent">applyTrack</span>
            <span className="logo-suffix">-ai</span>
          </Link>
          <p className="footer-desc">
            Your intelligent career companion. Simplify application tracking, get matches, and land your next role with AI.
          </p>
        </div>

        <div className="footer-links-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/govt-jobs">Government Jobs</Link></li>
            <li><Link to="/private-jobs">Private Sector Jobs</Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#cookies">Cookie Settings</a></li>
          </ul>
        </div>

        <div className="footer-newsletter-col">
          <h4>Job Alerts</h4>
          <p className="newsletter-desc">Get the latest public and private job listings sent directly to your inbox weekly.</p>
          {subscribed ? (
            <div className="newsletter-success">🎉 Subscribed successfully!</div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary btn-newsletter">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} applyTrack-ai. All rights reserved.</p>
        <div className="footer-socials">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">🐱 GitHub</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">🐦 Twitter</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">💼 LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
