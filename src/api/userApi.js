import axios from 'axios';
import { API_URL } from '../config';

const BASE_URL = API_URL;

export const userApi = {
  getUsers: async () => {
    return await axios.get(`${BASE_URL}/allusers`);
  },

  getUserById: async (id) => {
    return await axios.get(`${BASE_URL}/singleuser/${id}`);
  },

  updateUser: async (id, userData) => {
    return await axios.post(`${BASE_URL}/update/${id}`, userData);
  },

  deleteUser: async (id) => {
    return await axios.delete(`${BASE_URL}/deleteuser/${id}`);
  },

  // role: 'admin' | 'user'   (admin only; the server enforces this)
  setRole: async (id, role) => {
    return await axios.put(`${BASE_URL}/admin/users/${id}/role`, { role });
  }
};