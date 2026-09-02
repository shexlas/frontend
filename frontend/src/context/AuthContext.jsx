import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data;
  }

  async function register(username, email, password) {
    // Email verification is off: the backend creates the account already
    // verified and sets the auth cookie, so registering logs the user in
    // immediately.
    const res = await api.post('/auth/register', { username, email, password });
    setUser(res.data.user);
    return res.data;
  }

  async function verifyEmail(token) {
    const res = await api.post('/auth/verify-email', { token });
    setUser(res.data.user);
    return res.data;
  }

  async function resendVerification(email) {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser, verifyEmail, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
