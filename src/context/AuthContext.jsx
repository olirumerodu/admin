import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sh_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sh_admin_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sh_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sh_admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sh_admin_token', token);
    } else {
      localStorage.removeItem('sh_admin_token');
    }
  }, [token]);

  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      if (data && data.user) {
        setUser(data.user);
        setToken(data.token || 'demo-admin-token');
        return { success: true, user: data.user };
      }
      throw new Error('Invalid response from server');
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (role = 'admin') => {
    const demoUser = {
      id: 'admin_gokul',
      name: 'Super Administrator',
      email: 'admin@oehealth.org',
      role: role,
      assigned_cluster_id: 'cluster_erode',
      created_at: new Date().toISOString()
    };
    setUser(demoUser);
    setToken('token_demo_admin_session');
    return demoUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sh_admin_user');
    localStorage.removeItem('sh_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
