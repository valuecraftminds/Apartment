// api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true // important: send refresh cookie
});

export default api;
