import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('applytrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Error handler
const handleError = (error) => {
  const message = error.response?.data?.message || 'Something went wrong. Please try again.';
  const code = error.response?.data?.error || 'UNKNOWN_ERROR';
  return { success: false, message, code };
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  register: async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  loginDemo: async () => {
    try {
      const res = await api.post('/auth/demo');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  getProfile: async () => {
    try {
      const res = await api.get('/auth/profile');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  updateProfile: async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const applicationsAPI = {
  getAll: async (params) => {
    try {
      const res = await api.get('/applications', { params });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/applications/${id}`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/applications', data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(`/applications/${id}`, data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(`/applications/${id}`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  addTimelineEvent: async (id, event) => {
    try {
      const res = await api.post(`/applications/${id}/timeline`, event);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const companiesAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/companies');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/companies/${id}`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  analyze: async (id) => {
    try {
      const res = await api.post(`/companies/${id}/analyze`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const interviewsAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/interviews');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/interviews', data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(`/interviews/${id}`, data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(`/interviews/${id}`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const remindersAPI = {
  getAll: async (params) => {
    try {
      const res = await api.get('/reminders', { params });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  create: async (data) => {
    try {
      const res = await api.post('/reminders', data);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  toggleComplete: async (id) => {
    try {
      const res = await api.patch(`/reminders/${id}/complete`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(`/reminders/${id}`);
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const analyticsAPI = {
  getSummary: async () => {
    try {
      const res = await api.get('/analytics');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const aiAPI = {
  generateFollowUp: async (applicationId, tone, customInfo) => {
    try {
      const res = await api.post('/ai/follow-up', { applicationId, tone, customInfo });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  getInterviewPrep: async (applicationId) => {
    try {
      const res = await api.get('/ai/interview-prep', { params: { applicationId } });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  analyzeSalary: async (offerAmount, role, location, experienceLevel) => {
    try {
      const res = await api.post('/ai/salary-analysis', { offerAmount, role, location, experienceLevel });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  checkJobMatch: async (jobTitle, companyName, description) => {
    try {
      const res = await api.post('/ai/job-match', { jobTitle, companyName, description });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export const emailAPI = {
  sync: async () => {
    try {
      const res = await api.post('/email/sync');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  getEvents: async () => {
    try {
      const res = await api.get('/email/events');
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
  process: async (eventId, action, applicationId = null) => {
    try {
      const res = await api.post(`/email/events/${eventId}/process`, { action, applicationId });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },
};

export default api;
