// Runs once at start (imported in main.jsx).
// 1) Every request automatically carries the login token  ->  Authorization: Bearer <token>
// 2) If the server says the token is invalid/expired (401), the saved login is removed and the user goes to /login.
import axios from 'axios';
import { getToken, clearSession } from '../utils/storage';

const AUTH_PAGES = /^\/(login|register|forgot-password|reset-password|resetpassword)/;

axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || '');
    const sentToken = !!err?.config?.headers?.Authorization;
    const isLoginCall = /\/(login|registration)$/.test(url);

    if (status === 401 && sentToken && !isLoginCall) {
      clearSession();
      window.dispatchEvent(new Event('authChange'));
      if (!err.config.skipAuthRedirect && !AUTH_PAGES.test(window.location.pathname)) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);
