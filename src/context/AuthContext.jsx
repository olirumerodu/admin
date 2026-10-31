import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE } from '../services/api';

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

  // Real-time synchronization of user profile, access scope, and permissions from PostgreSQL backend
  useEffect(() => {
    if (!user || !user.id || user.id.startsWith('admin_demo')) return;

    let isMounted = true;
    const syncUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me?user_id=${encodeURIComponent(user.id)}`);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403 || res.status === 404) {
            logout();
          }
          return;
        }
        const freshUser = await res.json();
        if (!freshUser || !isMounted) return;

        if (freshUser.is_active === false) {
          logout();
          return;
        }

        // Compare freshUser with current user state
        setUser(prevUser => {
          if (!prevUser) return prevUser;
          const cIdsPrev = JSON.stringify(prevUser.assigned_cluster_ids || []);
          const cIdsFresh = JSON.stringify(freshUser.assigned_cluster_ids || []);
          const sIdsPrev = JSON.stringify(prevUser.assigned_school_ids || []);
          const sIdsFresh = JSON.stringify(freshUser.assigned_school_ids || []);
          const clusterPrev = String(prevUser.cluster_name || prevUser.assigned_cluster_id || '');
          const clusterFresh = String(freshUser.cluster_name || freshUser.assigned_cluster_id || '');
          const schoolPrev = String(prevUser.school_name || '');
          const schoolFresh = String(freshUser.school_name || '');
          const permsPrev = JSON.stringify(prevUser.permissions || []);
          const permsFresh = JSON.stringify(freshUser.permissions || []);
          const rolePrev = String(prevUser.role || '');
          const roleFresh = String(freshUser.role || '');

          const changed = (
            cIdsPrev !== cIdsFresh ||
            sIdsPrev !== sIdsFresh ||
            clusterPrev !== clusterFresh ||
            schoolPrev !== schoolFresh ||
            permsPrev !== permsFresh ||
            rolePrev !== roleFresh
          );

          if (changed) {
            const merged = { ...prevUser, ...freshUser };
            localStorage.setItem('sh_admin_user', JSON.stringify(merged));
            window.dispatchEvent(new CustomEvent('sh_scope_updated', { detail: merged }));
            return merged;
          }
          return prevUser;
        });
      } catch (err) {
        // Silent network retry
      }
    };

    // Run immediately on mount
    syncUserProfile();

    // Active heartbeat polling every 10 seconds when tab is active
    const interval = setInterval(() => {
      if (!document.hidden) {
        syncUserProfile();
      }
    }, 10000);

    // Also sync whenever the window/tab gets focused
    const handleFocus = () => syncUserProfile();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id]);

  const login = async (username, password, rememberMe = true) => {
    setLoading(true);
    try {
      const data = await api.login(username, password);
      if (data && data.user) {
        if (data.user.is_active === false) {
          throw new Error('Account is deactivated. Please contact your administrator.');
        }
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

  // Super Admin: root system accounts or role === 'super_admin'
  const isSuperAdmin = Boolean(
    user && (
      ['super_admin', 'superadmin', 'super admin'].includes(String(user.role || '').toLowerCase().trim()) ||
      ['admin', 'ksvadmin'].includes(String(user.username || '').toLowerCase().trim()) ||
      ['admin@gmail.com', 'admin@oehealth.org'].includes(String(user.email || '').toLowerCase().trim()) ||
      ['admin-001', 'admin-002'].includes(String(user.id || '').toLowerCase().trim())
    )
  );

  // Cluster Admin: all other administrator accounts (e.g. ADM001, ADM002, etc.)
  const isClusterAdmin = Boolean(
    user && !isSuperAdmin && (
      ['admin', 'administrator', 'cluster_admin', 'cluster_administrator', 'cluster_coordinator', 'coordinator']
        .includes(String(user.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_')) ||
      String(user.id || '').toUpperCase().startsWith('ADM')
    )
  );

  const assignedClusterIds = React.useMemo(() => {
    if (!user) return [];
    let raw = user.assigned_cluster_ids;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
      } catch (e) {}
    }
    const invalidClusters = ['all clusters', 'all', 'unassigned', 'unassigned (pending scope)', 'none', 'pending scope'];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter(x => {
        const s = String(x || '').trim().toLowerCase();
        return s && !invalidClusters.includes(s);
      });
    }
    if (user.assigned_cluster_id) {
      const s = String(user.assigned_cluster_id).trim().toLowerCase();
      if (s && !invalidClusters.includes(s)) {
        return [user.assigned_cluster_id];
      }
    }
    return [];
  }, [user]);

  const assignedSchoolIds = React.useMemo(() => {
    if (!user) return [];
    let raw = user.assigned_school_ids;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) raw = parsed;
      } catch (e) {}
    }
    const invalidSchools = ['all assigned schools', 'all schools', 'all', 'unassigned', 'none'];
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map(x => String(x || '').trim()).filter(x => {
        const s = x.toLowerCase();
        return s && !invalidSchools.includes(s);
      });
    }
    if (user.school_name) {
      const s = String(user.school_name).trim().toLowerCase();
      if (s && !invalidSchools.includes(s)) {
        return user.school_name.split(',').map(x => x.trim()).filter(Boolean);
      }
    }
    return [];
  }, [user]);

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
        isSuperAdmin,
        isClusterAdmin,
        assignedClusterIds,
        assignedSchoolIds,
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
