// api/axios.js
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import React from 'react';

const api = axios.create({
  baseURL: 'http://localhost:2500/api',
  // baseURL: 'http://192.168.8.101:2500/api',
  //baseURL: 'https://apmt.apivcm.shop',
  withCredentials: true,
});

export default api;
