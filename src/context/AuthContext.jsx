import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE, getAuthHeaders } from '../services/api';

const AuthContext = createContext(null);

/**
 * Resolves the initial auth user & token for this browser tab.
 * Uses sessionStorage first (for tab isolation and parallel sessions),
 * falling back to localStorage if this is a newly opened tab without an active session.
 */
function getInitialAuth() {
  if (typeof window === 'undefined') return { user: null, token: null };

  try {
    // 1. If explicit fresh parallel session requested via URL param (e.g. ?new_session=true)
    const params = new URLSearchParams(window.location.search);
    if (params.get('new_session') === 'true' || params.get('switch_admin') === 'true' || params.get('parallel') === 'true') {
      sessionStorage.removeItem('sh_admin_user');
      sessionStorage.removeItem('sh_admin_token');
      sessionStorage.setItem('sh_admin_signed_out', 'true');
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return { user: null, token: null };
    }

    // 2. Tab-specific session always takes priority (enables parallel logins in separate tabs)
    const sessionUserStr = sessionStorage.getItem('sh_admin_user');
    const sessionToken = sessionStorage.getItem('sh_admin_token');
    if (sessionUserStr && sessionToken) {
      return { user: JSON.parse(sessionUserStr), token: sessionToken };
    }

    // 3. If this tab was explicitly signed out, do not auto-restore from localStorage
    if (sessionStorage.getItem('sh_admin_signed_out') === 'true') {
      return { user: null, token: null };
    }

    // 4. Fallback to localStorage for remembered session on initial browser launch
    const localUserStr = localStorage.getItem('sh_admin_user');
    const localToken = localStorage.getItem('sh_admin_token');
    if (localUserStr && localToken) {
      const parsed = JSON.parse(localUserStr);
      // Seed this tab's sessionStorage from localStorage
      sessionStorage.setItem('sh_admin_user', localUserStr);
      sessionStorage.setItem('sh_admin_token', localToken);
      return { user: parsed, token: localToken };
    }
  } catch (e) {
    console.warn('[AuthContext] Error reading initial auth state:', e);
  }

  return { user: null, token: null };
}

export function AuthProvider({ children }) {
  const initialAuth = getInitialAuth();
  const [user, setUser] = useState(initialAuth.user);
  const [token, setToken] = useState(initialAuth.token);
  const [loading, setLoading] = useState(false);

  // Maintain tab-isolated session storage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('sh_admin_user', JSON.stringify(user));
      sessionStorage.removeItem('sh_admin_signed_out');
    } else {
      sessionStorage.removeItem('sh_admin_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('sh_admin_token', token);
    } else {
      sessionStorage.removeItem('sh_admin_token');
    }
  }, [token]);

  // Real-time synchronization of user profile, access scope, and permissions from PostgreSQL backend
  useEffect(() => {
    if (!user || !user.id || user.id.startsWith('admin_demo')) return;

    let isMounted = true;
    const syncUserProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me?user_id=${encodeURIComponent(user.id)}`, {
          headers: getAuthHeaders(),
        });
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
            sessionStorage.setItem('sh_admin_user', JSON.stringify(merged));
            try {
              const localSaved = localStorage.getItem('sh_admin_user');
              if (localSaved) {
                const parsedLocal = JSON.parse(localSaved);
                if (parsedLocal?.id === merged.id) {
                  localStorage.setItem('sh_admin_user', JSON.stringify(merged));
                }
              }
            } catch (e) {}
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

        const loggedInUser = data.user;
        const loggedInToken = data.token || 'demo-admin-token';

        // Clear any previous tab-signed-out state
        sessionStorage.removeItem('sh_admin_signed_out');

        // Always store in current tab's sessionStorage (isolated from other tabs)
        sessionStorage.setItem('sh_admin_user', JSON.stringify(loggedInUser));
        sessionStorage.setItem('sh_admin_token', loggedInToken);

        // Store in localStorage if rememberMe is enabled
        if (rememberMe) {
          localStorage.setItem('sh_admin_user', JSON.stringify(loggedInUser));
          localStorage.setItem('sh_admin_token', loggedInToken);
        }

        setUser(loggedInUser);
        setToken(loggedInToken);
        return { success: true, user: loggedInUser };
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
    sessionStorage.setItem('sh_admin_user', JSON.stringify(demoUser));
    sessionStorage.setItem('sh_admin_token', 'token_demo_admin_session');
    sessionStorage.removeItem('sh_admin_signed_out');
    setUser(demoUser);
    setToken('token_demo_admin_session');
    return demoUser;
  };

  const logout = () => {
    const currentUserId = user?.id;
    setUser(null);
    setToken(null);

    // Clear this specific tab's session
    sessionStorage.removeItem('sh_admin_user');
    sessionStorage.removeItem('sh_admin_token');
    sessionStorage.setItem('sh_admin_signed_out', 'true');

    // Only clear localStorage if it belongs to this specific user (so other tabs aren't kicked out)
    try {
      const localSaved = localStorage.getItem('sh_admin_user');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed?.id === currentUserId) {
          localStorage.removeItem('sh_admin_user');
          localStorage.removeItem('sh_admin_token');
        }
      }
    } catch (e) {}
  };

  // Helper to open a parallel admin session in a new browser tab without logging out this tab
  const openParallelSession = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?new_session=true`;
      window.open(url, '_blank');
    }
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
        openParallelSession,
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
