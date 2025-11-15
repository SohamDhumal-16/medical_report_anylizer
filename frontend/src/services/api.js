/**
 * API Service
 * Handles all backend communication
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      // But don't redirect if we're already on login/signup page or making auth requests
      const isAuthRequest = error.config.url.includes('/auth/login') ||
                           error.config.url.includes('/auth/signup') ||
                           error.config.url.includes('/auth/google-login');

      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', null, {
      params: {
        full_name: profileData.fullName,
        phone: profileData.phone || null,
        date_of_birth: profileData.dateOfBirth || null,
        gender: profileData.gender || null,
        bio: profileData.bio || null
      }
    });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', null, {
      params: {
        current_password: currentPassword,
        new_password: newPassword
      }
    });
    return response.data;
  },

  googleLogin: async (googleToken) => {
    const response = await api.post('/auth/google-login', {
      token: googleToken
    });
    return response.data;
  },
};

// Upload APIs
export const uploadAPI = {
  getAllowedFormats: async () => {
    const response = await api.get('/upload/allowed-formats');
    return response.data;
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Analysis APIs
export const analysisAPI = {
  processReport: async (file, reportType = 'blood_test') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', reportType);

    const response = await api.post('/analysis/process-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // NEW: Process report with Gemini AI (FREE!)
  processReportWithGemini: async (file, reportType = 'blood_test') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', reportType);

    const response = await api.post('/gemini-analysis/process-report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getReportAnalysis: async (reportId) => {
    const response = await api.get(`/gemini-analysis/${reportId}`);
    return response.data;
  },

  getUserReports: async () => {
    const response = await api.get('/gemini-analysis/user/reports');
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/gemini-analysis/${reportId}`);
    return response.data;
  },
};

// Comparison APIs
export const comparisonAPI = {
  compareReports: async (userId, oldReportId, newReportId) => {
    const response = await api.get(`/compare/${userId}`, {
      params: {
        old_report_id: oldReportId,
        new_report_id: newReportId,
      },
    });
    return response.data;
  },

  getLatestComparison: async (userId) => {
    const response = await api.get(`/compare/user/${userId}/latest-comparison`);
    return response.data;
  },
};

export default api;
