// api/axios.js
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import React from 'react';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

// Custom hook to get token from AuthContext
// export const useApi = () => {
//   const { auth } = React.useContext(AuthContext);

//   const instance = axios.create({
//     baseURL: 'http://localhost:3000/api',
//     withCredentials: true,
//   });

//   instance.interceptors.request.use((config) => {
//     if (auth?.accessToken) {
//       config.headers.Authorization = `Bearer ${auth.accessToken}`;
//     }
//     return config;
//   });

//   return instance;
// };

export default api;
