// api/axios.js
import axios from 'axios';
import React from 'react';
import { AuthContext } from '../contexts/AuthContext';

const api = axios.create({
  //baseURL: 'http://localhost:2500/api',
  // baseURL: 'http://192.168.8.101:2500/api',
  baseURL: 'https://apmt.apivcm.shop/api',
  withCredentials: true,
});

// Attach Authorization header from storage if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) { /* ignore storage errors */ }
  return config;
}, (err) => Promise.reject(err));

// On 401 try to refresh once, then retry original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh'); // withCredentials true sends refresh cookie
        const newAccess = refreshRes.data?.accessToken;
        if (newAccess) {
          try { localStorage.setItem('accessToken', newAccess); } catch(e){/*ignore*/ }
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        // fallback: navigate to login (client-side) so user can re-authenticate
        try { window.location.href = '/login'; } catch(e){/*ignore*/ }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
