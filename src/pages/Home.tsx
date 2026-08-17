import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="page-container home-page">
      <section className="hero-section">
        <h1 className="hero-title animate-fade-in">
          Track Smarter. <br />
          <span className="gradient-text">Apply Faster.</span>
        </h1>
        <p className="hero-subtitle animate-fade-in-delayed">
          Manage your job applications, automate follow-ups, and match with the best public and private sector jobs using our AI-driven tracker.
        </p>
        <div className="hero-cta animate-fade-in-delayed">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary btn-large">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary btn-large">
              Get Started for Free
            </Link>
          )}
          <Link to="/govt-jobs" className="btn-secondary btn-large">
            Explore Jobs
          </Link>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI Application Scoring</h3>
          <p>Instantly compare your resume against job requirements to see match probability.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Centralized Tracking</h3>
          <p>Organize applications across government and private portals in a single dashboard.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Deadline Reminders</h3>
          <p>Get automated alerts so you never miss a submission or interview date.</p>
        </div>
      </section>

      <section className="job-types-section">
        <h2>Find Your Next Career Move</h2>
        <p className="section-desc">We aggregate and organize job listings across the web to simplify your search.</p>
        <div className="jobs-split">
          <div className="job-type-card govt">
            <h3>🏛️ Government Jobs</h3>
            <p>Access federal, state, and local government announcements, standard forms, and test requirements.</p>
            <Link to="/govt-jobs" className="btn-text">View Government Openings &rarr;</Link>
          </div>
          <div className="job-type-card private">
            <h3>💼 Private Sector Jobs</h3>
            <p>Explore high-growth opportunities in tech, healthcare, finance, and other major private industries.</p>
            <Link to="/private-jobs" className="btn-text">View Private Openings &rarr;</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
