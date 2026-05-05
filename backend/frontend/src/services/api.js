import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', 
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

export function setAuthToken(token) {
  if (token) {
    API.defaults.headers.common.Authorization = `Token ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
}

setAuthToken(localStorage.getItem('access_token'));

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => API.post('auth/login/', credentials),
  register: (payload) => API.post('auth/register/', payload),
  profile: () => API.get('auth/profile/'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuthToken(null);
  },
};

export const dashboardService = {
  getStats: () => API.get('dashboard/stats/'),
  getAdvancedStats: () => API.get('dashboard/advanced-stats/'),
};

export const patientService = {
  getAll: (params = {}) => API.get('patients/', { params }),
  getOne: (id) => API.get(`patients/${id}/`),
  create: (data) => API.post('patients/', data),
  update: (id, data) => API.put(`patients/${id}/`, data),
  delete: (id) => API.delete(`patients/${id}/`),
};

export const appointmentService = {
  getAll: () => API.get('rendez-vous/'),
  calendar: () => API.get('rendez-vous/calendar/'),
  create: (data) => API.post('rendez-vous/', data),
  update: (id, data) => API.put(`rendez-vous/${id}/`, data),
  delete: (id) => API.delete(`rendez-vous/${id}/`),
  confirm: (id) => API.post(`rendez-vous/${id}/confirm/`),
  cancel: (id) => API.post(`rendez-vous/${id}/cancel/`),
  getAvailableSlots: (params) => API.get('rendez-vous/available-slots/', { params }),
  autoSchedule: (data) => API.post('rendez-vous/auto-schedule/', data),
};

export const userService = {
  getAll: (params = {}) => API.get('users/', { params }),
};

export const consultationService = {
  getAll: () => API.get('consultations/'),
  getOne: (id) => API.get(`consultations/${id}/`),
  create: (data) => API.post('consultations/', data),
  update: (id, data) => API.put(`consultations/${id}/`, data),
  delete: (id) => API.delete(`consultations/${id}/`),
};

export const billingService = {
  getAll: () => API.get('factures/'),
  getOne: (id) => API.get(`factures/${id}/`),
  create: (data) => API.post('factures/', data),
  update: (id, data) => API.put(`factures/${id}/`, data),
  delete: (id) => API.delete(`factures/${id}/`),
  pay: (id, montant_paye) => API.post(`factures/${id}/payer/`, { montant_paye }),
};

export default API;
