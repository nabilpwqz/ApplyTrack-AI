import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  postedDate: string;
  category: string;
  type: string;
}

const MOCK_PRIVATE_JOBS: Job[] = [
  {
    id: 'p1',
    title: 'Senior Frontend Architect',
    company: 'InnovateTech',
    location: 'San Francisco, CA (Remote)',
    salary: '$140,000 - $180,000',
    postedDate: '2026-08-16',
    category: 'Technology',
    type: 'Full-time'
  },
  {
    id: 'p2',
    title: 'Product Designer',
    company: 'DesignFlow',
    location: 'New York, NY (Hybrid)',
    salary: '$110,000 - $145,000',
    postedDate: '2026-08-14',
    category: 'Design',
    type: 'Full-time'
  },
  {
    id: 'p3',
    title: 'Financial Analyst',
    company: 'Apex Capital',
    location: 'Chicago, IL',
    salary: '$90,000 - $120,000',
    postedDate: '2026-08-11',
    category: 'Finance',
    type: 'Full-time'
  },
  {
    id: 'p4',
    title: 'Growth Marketing Manager',
    company: 'ScaleUp Solutions',
    location: 'Austin, TX (Hybrid)',
    salary: '$85,000 - $115,000',
    postedDate: '2026-08-15',
    category: 'Marketing',
    type: 'Full-time'
  },
  {
    id: 'p5',
    title: 'Backend Engineer (Node/TS)',
    company: 'CloudNative Corp',
    location: 'Remote (US/Canada)',
    salary: '$130,000 - $160,000',
    postedDate: '2026-08-17',
    category: 'Technology',
    type: 'Full-time'
  }
];

export const PrivateJobs: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredJobs = MOCK_PRIVATE_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTrackJob = (job: Job) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/private-jobs' } } });
      return;
    }

    const stored = localStorage.getItem('applytrack_applications');
    const list = stored ? JSON.parse(stored) : [];

    if (list.some((item: any) => item.jobId === job.id)) {
      alert(`You are already tracking "${job.title}"!`);
      return;
    }

    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: job.id,
      company: job.company,
      role: job.title,
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      source: 'Private Job Board',
      salary: job.salary
    };

    localStorage.setItem('applytrack_applications', JSON.stringify([...list, newApp]));
    alert(`"${job.title}" successfully added to your Dashboard!`);
  };

  const categories = ['All', ...Array.from(new Set(MOCK_PRIVATE_JOBS.map((j) => j.category)))];

  return (
    <div className="page-container jobs-page">
      <header className="page-header">
        <h1 className="page-title">💼 Private Sector Jobs</h1>
        <p className="page-subtitle">Premium industry postings from tech startups to enterprise leaders.</p>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search company, title, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="jobs-list">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="job-card private-job-card">
              <div className="job-card-header">
                <div>
                  <span className="badge badge-private">{job.type}</span>
                  <h3>{job.title}</h3>
                  <p className="job-meta-main">{job.company}</p>
                </div>
                <div className="job-salary">{job.salary}</div>
              </div>
              <div className="job-details">
                <span className="detail-item">📍 {job.location}</span>
                <span className="detail-item">📅 Posted: {job.postedDate}</span>
              </div>
              <div className="job-card-actions">
                <button
                  onClick={() => alert(`Redirecting to ${job.company}'s career portal...`)}
                  className="btn-secondary btn-small"
                >
                  Quick Apply
                </button>
                <button
                  onClick={() => handleTrackJob(job)}
                  className="btn-primary btn-small"
                >
                  Track Application
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">No jobs matching your search criteria.</div>
        )}
      </div>
    </div>
  );
};
export default PrivateJobs;
