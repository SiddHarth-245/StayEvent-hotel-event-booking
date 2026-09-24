import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('se_token'));

  // On page load: if a token exists, fetch the profile
  useEffect(() => {
    if (!localStorage.getItem('se_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('se_token'))
      .finally(() => setLoading(false));
  }, []);

  const save = (data) => { localStorage.setItem('se_token', data.token); setUser(data.user); return data.user; };
  const login = async (userId, password) => save((await api.post('/auth/login', { userId, password })).data);
  const register = async (form) => save((await api.post('/auth/register', form)).data);
  const logout = () => { localStorage.removeItem('se_token'); setUser(null); };

  return <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
