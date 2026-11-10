import axios from 'axios';
import { API_URL } from '../config';
import { getToken } from '../utils/storage';

// Plain axios client for the real backend.
// (The old version filled localStorage with fake products / users / orders - the shop now uses the database.)
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach the bearer token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
