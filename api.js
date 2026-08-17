import axios from 'axios';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  getMe:          ()     => api.get('/auth/me'),
  updateProfile:  (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll:               (params) => api.get('/events', { params }),
  getOne:               (id)     => api.get(`/events/${id}`),
  create:               (data)   => api.post('/events', data),
  update:               (id, data) => api.put(`/events/${id}`, data),
  remove:               (id)     => api.delete(`/events/${id}`),
  getRegistrations:     (id)     => api.get(`/events/${id}/registrations`),
  markAttendance:       (eventId, studentId) => api.put(`/events/${eventId}/attendance/${studentId}`),
};

// ── Registrations ─────────────────────────────────────────────────────────────
export const registrationsAPI = {
  register:           (data) => api.post('/registrations', data),
  cancel:             (id)   => api.delete(`/registrations/${id}`),
  getMine:            ()     => api.get('/registrations/my'),
  getPendingOverrides:()     => api.get('/registrations/pending-overrides'),
  reviewOverride:     (id, data) => api.put(`/registrations/${id}/override`, data),
};

// ── Users / Dashboard ─────────────────────────────────────────────────────────
export const usersAPI = {
  getStudentDashboard:  ()       => api.get('/users/dashboard'),
  getTeacherDashboard:  (params) => api.get('/users/teacher-dashboard', { params }),
  getStudents:          (params) => api.get('/users/students', { params }),
  getLeaderboard:       (params) => api.get('/users/leaderboard', { params }),
  getProfile:           (id)     => api.get(`/users/${id}/profile`),
};

// ── Coding ────────────────────────────────────────────────────────────────────
export const codingAPI = {
  getMyStats:       ()       => api.get('/coding/stats'),
  getUserStats:     (id)     => api.get(`/coding/stats/${id}`),
  getLeaderboard:   (params) => api.get('/coding/leaderboard', { params }),
};

// ── Resume ────────────────────────────────────────────────────────────────────
export const resumeAPI = {
  getData: () => api.get('/resume/data'),
};
