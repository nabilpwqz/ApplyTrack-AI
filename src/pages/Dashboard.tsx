import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Application {
  id: string;
  jobId?: string;
  company: string;
  role: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  dateApplied: string;
  source: string;
  salary: string;
}

const DEFAULT_APPLICATIONS: Application[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Software Engineer',
    status: 'Interviewing',
    dateApplied: '2026-08-01',
    source: 'LinkedIn',
    salary: '$160,000'
  },
  {
    id: '2',
    company: 'Meta',
    role: 'Production Engineer',
    status: 'Applied',
    dateApplied: '2026-08-10',
    source: 'Referral',
    salary: '$150,000'
  },
  {
    id: '3',
    company: 'NASA',
    role: 'Aerospace Technical Lead',
    status: 'Offered',
    dateApplied: '2026-07-20',
    source: 'USAJobs',
    salary: '$142,000'
  }
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<'Applied' | 'Interviewing' | 'Offered' | 'Rejected'>('Applied');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [salary, setSalary] = useState('');

  // Load from local storage or defaults
  useEffect(() => {
    const stored = localStorage.getItem('applytrack_applications');
    if (stored) {
      setApplications(JSON.parse(stored));
    } else {
      setApplications(DEFAULT_APPLICATIONS);
      localStorage.setItem('applytrack_applications', JSON.stringify(DEFAULT_APPLICATIONS));
    }
  }, []);

  // Update localStorage when state changes
  const saveApps = (newApps: Application[]) => {
    setApplications(newApps);
    localStorage.setItem('applytrack_applications', JSON.stringify(newApps));
  };

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const newApp: Application = {
      id: Math.random().toString(36).substr(2, 9),
      company: company.trim(),
      role: role.trim(),
      status,
      dateApplied,
      source: source.trim() || 'Direct',
      salary: salary.trim() || 'N/A'
    };

    const updated = [...applications, newApp];
    saveApps(updated);

    // Reset Form
    setCompany('');
    setRole('');
    setStatus('Applied');
    setDateApplied(new Date().toISOString().split('T')[0]);
    setSource('');
    setSalary('');
    setShowAddForm(false);
  };

  const handleDeleteApplication = (id: string) => {
    if (window.confirm('Are you sure you want to stop tracking this application?')) {
      const updated = applications.filter((app) => app.id !== id);
      saveApps(updated);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected') => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    saveApps(updated);
  };

  // Stats calculation
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    interviewing: applications.filter((a) => a.status === 'Interviewing').length,
    offered: applications.filter((a) => a.status === 'Offered').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length
  };

  return (
    <div className="page-container dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-welcome">Welcome back, {user?.username}!</h1>
          <p className="dashboard-lead">Here is the latest status of your active job searches.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Close Form' : '+ Add Application'}
        </button>
      </header>

      {/* Stats Counter Section */}
      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Applications</span>
        </div>
        <div className="stat-card border-applied">
          <span className="stat-number text-applied">{stats.applied}</span>
          <span className="stat-label">Applied</span>
        </div>
        <div className="stat-card border-interviewing">
          <span className="stat-number text-interviewing">{stats.interviewing}</span>
          <span className="stat-label">Interviewing</span>
        </div>
        <div className="stat-card border-offered">
          <span className="stat-number text-offered">{stats.offered}</span>
          <span className="stat-label">Offers Received</span>
        </div>
        <div className="stat-card border-rejected">
          <span className="stat-number text-rejected">{stats.rejected}</span>
          <span className="stat-label">Archived/Rejected</span>
        </div>
      </section>

      {/* Add Form Dropdown */}
      {showAddForm && (
        <section className="add-app-section animate-slide-down">
          <form onSubmit={handleAddApplication} className="add-app-form">
            <h3>New Job Application</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role / Position *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Developer"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date Applied</label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Salary Package</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $120k/yr"
                />
              </div>
              <div className="form-group">
                <label>Source / Job Board</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Indeed, Referral"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Add to Tracker
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tracker Grid/Table */}
      <section className="tracker-table-section">
        {applications.length > 0 ? (
          <div className="table-responsive">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Date Applied</th>
                  <th>Source</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.company}</strong>
                    </td>
                    <td>{app.role}</td>
                    <td>{app.dateApplied}</td>
                    <td>
                      <span className="badge badge-source">{app.source}</span>
                    </td>
                    <td>{app.salary}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as any)}
                        className={`status-select status-${app.status.toLowerCase()}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="btn-delete"
                        title="Delete application"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-applications">
            <p>You aren't tracking any applications yet.</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              Track your first application
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
export default Dashboard;
