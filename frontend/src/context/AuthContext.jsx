import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('visioai_token');
    const saved = localStorage.getItem('visioai_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      // Refresh from server
      userAPI.me().then(r => {
        setUser(r.data);
        localStorage.setItem('visioai_user', JSON.stringify(r.data));
      }).catch(() => logout());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('visioai_token', data.token);
    localStorage.setItem('visioai_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('visioai_token', data.token);
    localStorage.setItem('visioai_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const demoLogin = async () => {
    const { data } = await authAPI.demo();
    localStorage.setItem('visioai_token', data.token);
    localStorage.setItem('visioai_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('visioai_token');
    localStorage.removeItem('visioai_user');
    setUser(null);
  };

  const refreshUser = async () => {
    const { data } = await userAPI.me();
    setUser(data);
    localStorage.setItem('visioai_user', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
