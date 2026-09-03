import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: string;
  title: string;
  agency: string;
  location: string;
  salary: string;
  postedDate: string;
  deadline: string;
  category: string;
  grade: string;
}

const MOCK_GOVT_JOBS: Job[] = [
  {
    id: 'g1',
    title: 'Senior Data Scientist',
    agency: 'Department of Energy',
    location: 'Washington, DC (Hybrid)',
    salary: '$120,000 - $155,000',
    postedDate: '2026-08-15',
    deadline: '2026-09-15',
    category: 'Technology',
    grade: 'GS-14'
  },
  {
    id: 'g2',
    title: 'IT Project Manager',
    agency: 'Federal Aviation Administration',
    location: 'Oklahoma City, OK',
    salary: '$98,000 - $130,000',
    postedDate: '2026-08-12',
    deadline: '2026-09-10',
    category: 'Project Management',
    grade: 'GS-13'
  },
  {
    id: 'g3',
    title: 'Cybersecurity Analyst',
    agency: 'Cybersecurity and Infrastructure Security Agency',
    location: 'Remote',
    salary: '$105,000 - $140,000',
    postedDate: '2026-08-16',
    deadline: '2026-09-30',
    category: 'Cybersecurity',
    grade: 'GS-13'
  },
  {
    id: 'g4',
    title: 'Administrative Officer',
    agency: 'National Institutes of Health',
    location: 'Bethesda, MD',
    salary: '$82,000 - $106,000',
    postedDate: '2026-08-10',
    deadline: '2026-09-01',
    category: 'Administration',
    grade: 'GS-12'
  },
  {
    id: 'g5',
    title: 'Research Analyst',
    agency: 'Environmental Protection Agency',
    location: 'Denver, CO (Hybrid)',
    salary: '$75,000 - $98,000',
    postedDate: '2026-08-14',
    deadline: '2026-09-14',
    category: 'Research',
    grade: 'GS-11'
  }
];

export const GovtJobs: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredJobs = MOCK_GOVT_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTrackJob = (job: Job) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/govt-jobs' } } });
      return;
    }
    // Track job logic: Save to local storage
    const stored = localStorage.getItem('applytrack_applications');
    const list = stored ? JSON.parse(stored) : [];
    
    // Check if already tracked
    if (list.some((item: any) => item.jobId === job.id)) {
      alert(`You are already tracking "${job.title}"!`);
      return;
    }

    const newApp = {
      id: Math.random().toString(36).substr(2, 9),
      jobId: job.id,
      company: job.agency,
      role: job.title,
      status: 'Applied',
      dateApplied: new Date().toISOString().split('T')[0],
      source: 'Government Job Portal',
      salary: job.salary
    };

    localStorage.setItem('applytrack_applications', JSON.stringify([...list, newApp]));
    alert(`"${job.title}" successfully added to your Dashboard!`);
  };

  const categories = ['All', ...Array.from(new Set(MOCK_GOVT_JOBS.map((j) => j.category)))];

  return (
    <div className="page-container jobs-page">
      <header className="page-header">
        <h1 className="page-title">🏛️ Government Jobs</h1>
        <p className="page-subtitle">Official federal and state opportunities matching your track.</p>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search agency, title, or location..."
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
            <div key={job.id} className="job-card govt-job-card">
              <div className="job-card-header">
                <div>
                  <span className="badge badge-govt">{job.grade}</span>
                  <h3>{job.title}</h3>
                  <p className="job-meta-main">{job.agency}</p>
                </div>
                <div className="job-salary">{job.salary}</div>
              </div>
              <div className="job-details">
                <span className="detail-item">📍 {job.location}</span>
                <span className="detail-item">📅 Deadline: {job.deadline}</span>
              </div>
              <div className="job-card-actions">
                <a
                  href="https://www.usajobs.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-small"
                >
                  Apply on USAJobs
                </a>
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
export default GovtJobs;
