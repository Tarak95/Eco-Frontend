import axios from 'axios';
import { API_URL } from '../config';
import { getStoredUser, getToken, setSession, clearSession } from '../utils/storage';

// Real backend calls. (The old version was a browser-only fake that decided "admin" by looking for the word
// "admin" in the email, which is not safe.)  The role always comes from the server.
const fail = (err, fallback) => {
  const e = new Error(err?.response?.data?.message || fallback);
  e.response = err?.response;
  return e;
};

export const authApi = {
  login: async ({ email, password }) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      if (!res.data?.success) throw new Error(res.data?.message || 'Login failed');
      setSession(res.data.token, res.data.data);
      window.dispatchEvent(new Event('authChange'));
      return { success: true, user: res.data.data, token: res.data.token, message: res.data.message };
    } catch (err) {
      throw fail(err, err?.message || 'Login failed');
    }
  },

  // Registration never sends a role: every new account is a normal "user".
  register: async ({ name, email, phone, password, confirmPassword }) => {
    try {
      const res = await axios.post(`${API_URL}/registration`, {
        name, email, phone, password, confirmPassword: confirmPassword ?? password,
      });
      if (!res.data?.success) throw new Error(res.data?.message || 'Registration failed');
      return await authApi.login({ email, password });
    } catch (err) {
      throw fail(err, err?.message || 'Registration failed');
    }
  },

  logout: async () => {
    clearSession();
    window.dispatchEvent(new Event('authChange'));
    return { success: true, message: 'Logged out successfully' };
  },

  // asks the server who I am (fresh role). Returns null if not logged in.
  fetchMe: async () => {
    if (!getToken()) return null;
    const res = await axios.get(`${API_URL}/me`, { timeout: 8000, skipAuthRedirect: true });
    return res.data?.data || null;
  },

  getCurrentUser: async () => getStoredUser(),
};
