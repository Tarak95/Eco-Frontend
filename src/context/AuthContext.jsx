import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getStoredUser, getToken, setStoredUser, clearSession } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));
  // true only while we double-check the saved login with the server (so /admin is never shown on a stale role)
  const [loading, setLoading] = useState(() => !!getToken());

  // keep React state in sync whenever login / logout / profile save happens anywhere in the app
  useEffect(() => {
    const sync = () => setUser(getToken() ? getStoredUser() : null);
    window.addEventListener('authChange', sync);
    return () => window.removeEventListener('authChange', sync);
  }, []);

  // on first load: ask the server for the real, current account (role may have changed since last login)
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!getToken()) {
        if (getStoredUser()) { clearSession(); window.dispatchEvent(new Event('authChange')); } // user without token = broken/old session
        if (!cancelled) { setUser(null); setLoading(false); }
        return;
      }
      try {
        const fresh = await authApi.fetchMe();
        if (cancelled) return;
        if (fresh) {
          setStoredUser({ ...getStoredUser(), ...fresh });
          setUser(getStoredUser());
          window.dispatchEvent(new Event('authChange')); // Navbar etc. pick up the fresh role
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          clearSession();
          window.dispatchEvent(new Event('authChange'));
          if (!cancelled) setUser(null);
        }
        // network error: keep the saved login, the server will still check every request
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verify();
    return () => { cancelled = true; };
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    return res;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateUserProfile = useCallback((updatedUser) => {
    const newUser = typeof updatedUser === 'object' ? { ...getStoredUser(), ...updatedUser } : updatedUser;
    setUser(newUser);
    setStoredUser(newUser);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        updateProfile: updateUserProfile,
        isAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
