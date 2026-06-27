import { create } from 'zustand';
import { registerUser, loginUser, logoutUser, getMe } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  initialized: false,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await registerUser(userData);
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      set({ error: errMsg, loading: false });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await loginUser(credentials);
      localStorage.setItem('token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed';
      set({ error: errMsg, loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logoutUser();
    } catch (err) {
      // Even if API logout fails, clear local state
      console.error('API logout error:', err);
    } finally {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ initialized: true });
      return;
    }
    set({ loading: true, error: null });
    try {
      const user = await getMe();
      set({ user, loading: false, initialized: true });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false, initialized: true });
    }
  },
}));
