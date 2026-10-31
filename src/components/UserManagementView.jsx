import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Plus, 
  Search, 
  RotateCcw, 
  Eye, 
  Pencil, 
  MoreVertical, 
  ArrowUpDown, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { getSessionCache } from './StudentsManagementView';
import { useAuth } from '../context/AuthContext';
import CreateUserView from './CreateUserView';
import UserDetailsView from './UserDetailsView';
import EditUserView from './EditUserView';

export default function UserManagementView({
  initialUsers = null,
  initialClusters = null,
  initialSchools = null
}) {
  const { user: currentUser, isSuperAdmin, isClusterAdmin, assignedClusterIds, assignedSchoolIds } = useAuth();
  const [users, setUsers] = useState(() => {
    try {
      const cached = sessionStorage.getItem('sh_cache_formatted_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('sh_cache_formatted_users');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true;
  });

  // Safeguard: only hydrate initialUsers once if state is empty, and always format raw objects
  useEffect(() => {
    if (initialUsers && initialUsers.length > 0 && users.length === 0) {
      const filtered = initialUsers.filter(u => {
        const username = (u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const id = (u.id || '').toLowerCase();
        return !(username === 'admin' || username === 'ksvadmin' || email === 'admin@gmail.com' || id === 'admin-001' || id === 'admin-002');
      });
      const mapped = filtered.map((u, idx) => (u.status && u.role) ? u : formatUser(u, idx, clustersMap));
      setUsers(mapped);
      setLoading(false);
    }
  }, [initialUsers]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [clusterFilter, setClusterFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Navigation and Modal States
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'details' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [previousView, setPreviousView] = useState('list');
  const [successToast, setSuccessToast] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Confirmation Pop-up states for deletion, deactivation, and creation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showCreateConfirmModal, setShowCreateConfirmModal] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Staff',
    cluster: 'All Clusters',
    school: 'All Assigned Schools',
    status: 'Active'
  });

  // Dynamic clusters map for resolving IDs to human-readable names
  const [clustersMap, setClustersMap] = useState({});
  const [dbClusters, setDbClusters] = useState([]);
  const [dbSchools, setDbSchools] = useState([]);

  // Map backend user response into UI row representation
  const formatUser = (u, idx, clusterMap = null) => {
    const isRootAdmin = (u.username || '').toLowerCase() === 'admin' ||
                        (u.username || '').toLowerCase() === 'ksvadmin' ||
                        (u.email || '').toLowerCase() === 'admin@gmail.com' ||
                        (u.email || '').toLowerCase() === 'admin@oehealth.org' ||
                        (u.id || '').toLowerCase().startsWith('admin');

    const isClusterAdministrator = (u.role === 'admin' && !isRootAdmin) || u.role === 'Cluster Admin' || u.role === 'Cluster Administrator';

    const roleDisplay = isRootAdmin
      ? 'Super Admin'
      : isClusterAdministrator
        ? 'Cluster Admin'
        : u.role === 'health_officer'
          ? 'School Staff'
          : u.role || 'Staff';

    const isAct = u.is_active !== false;
    const createdDt = u.created_at ? new Date(u.created_at) : new Date();

    let clusterName = 'All Clusters';
    const effectiveMap = clusterMap || clustersMap;
    let parsedClusterIds = u.assigned_cluster_ids;
    if (typeof parsedClusterIds === 'string') {
      try { parsedClusterIds = JSON.parse(parsedClusterIds); } catch { parsedClusterIds = [parsedClusterIds]; }
    }
    const uniqueClusters = Array.isArray(parsedClusterIds)
      ? Array.from(new Set(parsedClusterIds.map(c => {
          const resolved = (effectiveMap && effectiveMap[c]) || c;
          return String(resolved || '').trim();
        }).filter(Boolean)))
      : [];

    if (uniqueClusters.length > 0) {
      clusterName = uniqueClusters.join(', ');
    } else if (isClusterAdministrator && (!u.assigned_cluster_ids || u.assigned_cluster_ids.length === 0) && (!u.assigned_cluster_id || u.assigned_cluster_id === 'All Clusters' || u.assigned_cluster_id === 'all')) {
      clusterName = 'Unassigned (Pending Scope)';
    } else if (u.cluster_name && u.cluster_name !== 'All Clusters' && !/^[0-9a-fA-F-]{20,}$/.test(u.cluster_name)) {
      clusterName = u.cluster_name;
    } else if (u.assigned_cluster_id && u.assigned_cluster_id !== 'All Clusters' && u.assigned_cluster_id !== 'all') {
      const resolved = effectiveMap ? effectiveMap[u.assigned_cluster_id] : null;
      if (resolved) {
        clusterName = resolved;
      } else if (!/^[0-9a-fA-F-]{20,}$/.test(u.assigned_cluster_id)) {
        clusterName = u.assigned_cluster_id;
      } else {
        clusterName = 'All Clusters';
      }
    } else {
      clusterName = 'All Clusters';
    }

    let parsedSchoolIds = u.assigned_school_ids;
    if (typeof parsedSchoolIds === 'string') {
      try { parsedSchoolIds = JSON.parse(parsedSchoolIds); } catch { parsedSchoolIds = [parsedSchoolIds]; }
    }
    const uniqueSchools = [];
    const seenSchools = new Set();
    if (Array.isArray(parsedSchoolIds)) {
      parsedSchoolIds.forEach(s => {
        const trimmed = String(s || '').trim();
        if (trimmed && !seenSchools.has(trimmed.toLowerCase())) {
          seenSchools.add(trimmed.toLowerCase());
          uniqueSchools.push(trimmed);
        }
      });
    }

    let schoolName = 'All Assigned Schools';
    if (clusterName === 'Unassigned (Pending Scope)') {
      schoolName = 'Unassigned';
    } else if (uniqueSchools.length > 0) {
      schoolName = uniqueSchools.join(', ');
    } else if (u.school_name && u.school_name !== 'All Assigned Schools' && u.school_name !== 'All Schools') {
      const parts = String(u.school_name).split(',').map(s => s.trim()).filter(Boolean);
      const dedupedParts = [];
      const seenParts = new Set();
      parts.forEach(p => {
        if (!seenParts.has(p.toLowerCase())) {
          seenParts.add(p.toLowerCase());
          dedupedParts.push(p);
        }
      });
      schoolName = dedupedParts.join(', ');
    } else if (roleDisplay === 'Super Admin') {
      schoolName = 'All Schools';
    } else if (roleDisplay === 'Cluster Admin') {
      schoolName = 'All Schools in Cluster';
    }

    return {
      id: u.id || `USR00${idx + 1}`,
      name: u.name || 'User',
      email: u.email || `${(u.id || '').toLowerCase()}@oehealth.org`,
      phone: u.phone || '',
      cluster: clusterName,
      school: schoolName,
      role: roleDisplay,
      status: isAct ? 'Active' : 'Inactive',
      joinedOn: createdDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAtFormatted: `${createdDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${createdDt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      created_at: u.created_at,
      lastLoginDate: createdDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      lastLoginTime: createdDt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      accessType: (roleDisplay === 'Super Admin' || roleDisplay === 'Cluster Admin' || roleDisplay === 'Admin') 
        ? 'Full Access' 
        : isAct ? 'Limited Access' : 'Inactive Users',
      permissions: Array.isArray(u.permissions) ? u.permissions : (u.raw?.permissions || []),
      scopeType: u.scope_type || (u.school_name && u.school_name !== 'All Assigned Schools' && u.school_name !== 'All Schools' ? 'school' : 'cluster'),
      assigned_cluster_id: u.assigned_cluster_id || null,
      assigned_cluster_ids: u.assigned_cluster_ids || [],
      assigned_school_ids: u.assigned_school_ids || [],
      raw: u
    };
  };

  // Sync real-time users from backend API
  const loadBackendUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [backendData, clustersData, schoolsData] = await Promise.allSettled([
        api.getUsers(),
        api.getClusters(),
        api.getSchools()
      ]);

      const cMap = {};
      if (clustersData.status === 'fulfilled' && Array.isArray(clustersData.value)) {
        clustersData.value.forEach(c => {
          if (c.id && c.name) cMap[c.id] = c.name;
          if (c.name) cMap[c.name] = c.name;
        });
        setClustersMap(cMap);
        setDbClusters(clustersData.value);
      }

      if (schoolsData.status === 'fulfilled' && Array.isArray(schoolsData.value)) {
        setDbSchools(schoolsData.value);
      }

      if (backendData.status === 'fulfilled' && Array.isArray(backendData.value)) {
        const visibleUsers = backendData.value.filter(u => {
          const username = (u.username || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          const id = (u.id || '').toLowerCase();
          // Exclude root system superadmin account from standard table
          const isRootSuper = username === 'admin' || username === 'ksvadmin' || email === 'admin@gmail.com' || id === 'admin-001' || id === 'admin-002';
          if (isRootSuper) return false;

          // If logged-in user is a Cluster Admin, restrict user list to their assigned scope
          if (isClusterAdmin) {
            // Unassigned / Pending Scope Cluster Admin has zero access
            if (assignedClusterIds.length === 0 && assignedSchoolIds.length === 0) {
              return false;
            }
            // Cannot see other Admins
            if (u.role === 'admin' || u.role === 'super_admin' || u.role === 'cluster_admin' || u.role === 'Cluster Admin') return false;

            const allowedClusterTokens = new Set();
            (assignedClusterIds || []).forEach(c => {
              const cl = String(c || '').toLowerCase().trim();
              if (cl && cl !== 'all' && cl !== 'all clusters') allowedClusterTokens.add(cl);
            });

            // Bidirectional resolution with dbClusters (IDs <-> Names)
            const cList = (clustersData.status === 'fulfilled' && Array.isArray(clustersData.value)) ? clustersData.value : dbClusters;
            (cList || []).forEach(cl => {
              const cName = String(cl.name || '').toLowerCase().trim();
              const cId = String(cl.id || '').toLowerCase().trim();
              if (allowedClusterTokens.has(cName) || allowedClusterTokens.has(cId)) {
                allowedClusterTokens.add(cName);
                allowedClusterTokens.add(cId);
              }
            });

            // Allowed schools within these clusters
            const sList = (schoolsData.status === 'fulfilled' && Array.isArray(schoolsData.value)) ? schoolsData.value : dbSchools;
            const allowedSchoolTokens = new Set();
            (sList || []).forEach(sch => {
              const sCId = String(sch.cluster_id || '').toLowerCase().trim();
              const sCName = String(sch.cluster_name || sch.cluster || '').toLowerCase().trim();
              if (allowedClusterTokens.has(sCId) || allowedClusterTokens.has(sCName)) {
                if (sch.name) allowedSchoolTokens.add(String(sch.name).toLowerCase().trim());
                if (sch.id) allowedSchoolTokens.add(String(sch.id).toLowerCase().trim());
                if (sch.code) allowedSchoolTokens.add(String(sch.code).toLowerCase().trim());
              }
            });

            // Check if user's cluster matches
            const uCId = String(u.assigned_cluster_id || '').toLowerCase().trim();
            const uCName = String(u.cluster_name || '').toLowerCase().trim();
            let matchCluster = (uCId && allowedClusterTokens.has(uCId)) || (uCName && allowedClusterTokens.has(uCName));

            let uClusters = u.assigned_cluster_ids;
            if (typeof uClusters === 'string') {
              try { uClusters = JSON.parse(uClusters); } catch { uClusters = uClusters.split(',').map(x => x.trim()); }
            }
            if (Array.isArray(uClusters)) {
              if (uClusters.some(uc => allowedClusterTokens.has(String(uc).toLowerCase().trim()))) {
                matchCluster = true;
              }
            }

            // Check if user's school matches
            const uSchool = String(u.school_name || '').toLowerCase().trim();
            let matchSchool = uSchool && allowedSchoolTokens.has(uSchool);
            let uSchools = u.assigned_school_ids;
            if (typeof uSchools === 'string') {
              try { uSchools = JSON.parse(uSchools); } catch { uSchools = uSchools.split(',').map(x => x.trim()); }
            }
            if (Array.isArray(uSchools)) {
              if (uSchools.some(us => allowedSchoolTokens.has(String(us).toLowerCase().trim()))) {
                matchSchool = true;
              }
            }

            return matchCluster || matchSchool;
          }

          return true;
        });

        const seenIds = new Set();
        const uniqueUsers = [];
        visibleUsers.forEach(u => {
          const key = (u.id || u.email || '').toLowerCase();
          if (key && !seenIds.has(key)) {
            seenIds.add(key);
            uniqueUsers.push(u);
          } else if (!key) {
            uniqueUsers.push(u);
          }
        });
        const mapped = uniqueUsers.map((u, idx) => formatUser(u, idx, cMap));
        setUsers(mapped);
        try {
          sessionStorage.setItem('sh_cache_formatted_users', JSON.stringify(mapped));
        } catch {}
      }
    } catch (err) {
      console.warn('Real-time Users sync notice:', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let hasCached = false;
    try {
      const cached = sessionStorage.getItem('sh_cache_formatted_users');
      if (cached && JSON.parse(cached).length > 0) hasCached = true;
    } catch {}
    loadBackendUsers(hasCached);
    // Real-time polling every 5 seconds to merge user application changes
    const timer = setInterval(() => {
      loadBackendUsers(true);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Pure dynamic KPI counts calculation directly from real database
  const totalUsersCount = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const inactiveCount = users.filter(u => u.status === 'Inactive').length;

  // Real-time clusters from database with user-assigned fallback
  const availableClusters = React.useMemo(() => {
    let list = dbClusters.map(c => c.name).filter(Boolean);
    users.forEach(u => {
      if (u.cluster && u.cluster !== 'All Clusters' && !list.includes(u.cluster)) {
        list.push(u.cluster);
      }
    });
    if (isClusterAdmin && assignedClusterIds.length > 0) {
      const normAssigned = assignedClusterIds.map(x => String(x).toLowerCase());
      list = list.filter(c => normAssigned.includes(String(c).toLowerCase()));
    }
    return Array.from(new Set(list)).sort();
  }, [dbClusters, users, isClusterAdmin, assignedClusterIds]);

  // Real-time schools from database, dynamically filtered when cluster is selected
  const availableSchools = React.useMemo(() => {
    let list = [];
    if (clusterFilter !== 'ALL') {
      const selectedClusterObj = dbClusters.find(c => c.name === clusterFilter || c.id === clusterFilter);
      const filtered = dbSchools.filter(s => 
        (selectedClusterObj && s.cluster_id === selectedClusterObj.id) ||
        s.cluster_name === clusterFilter ||
        s.cluster === clusterFilter
      );
      list = filtered.map(s => s.name).filter(Boolean);
      users.forEach(u => {
        if (u.cluster === clusterFilter && u.school && u.school !== 'All Assigned Schools' && u.school !== 'All Schools in District' && !list.includes(u.school)) {
          list.push(u.school);
        }
      });
    } else {
      list = dbSchools.map(s => s.name).filter(Boolean);
      users.forEach(u => {
        if (u.school && u.school !== 'All Assigned Schools' && u.school !== 'All Schools in District' && !list.includes(u.school)) {
          list.push(u.school);
        }
      });
    }
    if (isClusterAdmin && assignedSchoolIds.length > 0) {
      const normSchools = assignedSchoolIds.map(x => String(x).toLowerCase());
      list = list.filter(s => normSchools.includes(String(s).toLowerCase()));
    }
    return Array.from(new Set(list)).sort();
  }, [dbSchools, dbClusters, clusterFilter, users, isClusterAdmin, assignedSchoolIds]);

  const handleClusterFilterChange = (val) => {
    setClusterFilter(val);
    setSchoolFilter('ALL');
    setCurrentPage(1);
  };

  // Confirm and toggle user Active / Inactive status and persist to backend
  const handleConfirmToggleStatus = async () => {
    if (!userToToggleStatus) return;
    setIsTogglingStatus(true);
    const targetUser = userToToggleStatus;
    const nextStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
    const nextIsActive = nextStatus === 'Active';

    // Optimistic UI update
    setUsers(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        return { 
          ...u, 
          status: nextStatus, 
          accessType: nextIsActive ? ((u.role === 'Super Admin' || u.role === 'Admin') ? 'Full Access' : 'Limited Access') : 'Inactive Users' 
        };
      }
      return u;
    }));

    try {
      await api.updateUser(targetUser.id, { is_active: nextIsActive });
      setSuccessToast(`User ${targetUser.name} (${targetUser.id}) has been ${nextIsActive ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setUserToToggleStatus(null);
      await loadBackendUsers(true);
    } catch (err) {
      console.error('Failed to update status on server:', err);
      setSuccessToast(`Failed to update status: ${err.message}`);
      setTimeout(() => setSuccessToast(''), 4000);
      setUserToToggleStatus(null);
      loadBackendUsers(true);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setClusterFilter('ALL');
    setSchoolFilter('ALL');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  // Sort Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} color="#94A3B8" />;
    }
    return (
      <span style={{ color: '#EA580C', fontSize: '10px', fontWeight: 800, marginLeft: '2px' }}>
        {sortAsc ? '▲' : '▼'}
      </span>
    );
  };

  // Filtered & Sorted Users (with deduplication guard)
  const filteredUsers = React.useMemo(() => {
    const seen = new Set();
    return users
      .filter(u => {
        const key = (u.id || u.email || '').toLowerCase();
        if (key) {
          if (seen.has(key)) return false;
          seen.add(key);
        }
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q);
        
        const matchesCluster = clusterFilter === 'ALL' || u.cluster === clusterFilter || u.cluster === 'All Clusters';
        const matchesSchool = schoolFilter === 'ALL' || u.school === schoolFilter || u.school === 'All Schools in District' || u.school === 'All Assigned Schools';
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

        return matchesSearch && matchesCluster && matchesSchool && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [users, searchQuery, clusterFilter, schoolFilter, roleFilter, statusFilter, sortField, sortAsc]);

  // Accurate Pagination Slicing
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const paginatedUsers = React.useMemo(() => {
    return filteredUsers.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  }, [filteredUsers, safeCurrentPage, pageSize]);

  // Select all visible users on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedUsers.map(u => u.id);
      setSelectedUserIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedUsers.map(u => u.id));
      setSelectedUserIds(prev => prev.filter(id => !pageIds.has(id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Create User Handler with confirmation pop-up
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    setShowCreateConfirmModal(true);
  };

  const handleConfirmCreateUser = async () => {
    try {
      const defaultModules = [
        'Dashboard',
        'Schools',
        'Students',
        'Student Assessment',
        'Monthly Tracking',
        'Health History',
      ];
      const foundCluster = dbClusters.find(c => c.name === newUser.cluster || c.id === newUser.cluster);
      const assignedCluster = (newUser.cluster === 'All Clusters' || !newUser.cluster) ? null : (foundCluster?.id || newUser.cluster);

      const created = await api.createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        assigned_cluster_id: assignedCluster,
        school_name: newUser.school === 'All Assigned Schools' ? null : newUser.school,
        scope_type: newUser.school && newUser.school !== 'All Assigned Schools' ? 'school' : 'cluster',
        is_active: newUser.status === 'Active',
        permissions: defaultModules,
      });
      await loadBackendUsers(true);
      setShowCreateConfirmModal(false);
      setIsCreateModalOpen(false);
      setSuccessToast(`User ${created.name} (${created.id}) created successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setNewUser({
        name: '',
        email: '',
        role: 'Staff',
        cluster: 'All Clusters',
        school: 'All Assigned Schools',
        status: 'Active'
      });
    } catch (err) {
      console.error('Failed to create user:', err);
      setSuccessToast(`Error: ${err.message}`);
      setTimeout(() => setSuccessToast(''), 4000);
      setShowCreateConfirmModal(false);
    }
  };

  // Confirm delete user handler
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSuccessToast(`User ${userToDelete.name} (${userToDelete.id}) deleted successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setSuccessToast(`Failed to delete user: ${err.message}`);
      setTimeout(() => setSuccessToast(''), 4000);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open User Details full-screen view
  const handleOpenUserDetails = (targetUser) => {
    setSelectedUser(targetUser);
    setViewMode('details');
  };

  // Open Edit User full-screen form (pencil icon or Edit User button — full edit form)
  const handleOpenEditUser = (targetUser, fromView = 'list') => {
    setSelectedUser(targetUser);
    setPreviousView(fromView);
    setViewMode('edit');
  };

  // If in details view
  if (viewMode === 'details') {
    return (
      <UserDetailsView 
        user={selectedUser || users[0]}
        onNavigateBack={() => setViewMode('list')}
        onEditUser={(u) => handleOpenEditUser(u, 'details')}
        onUpdateUser={(updated) => {
          setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
          setSelectedUser(prev => ({ ...prev, ...updated }));
          setSuccessToast(`User ${updated.name} updated successfully.`);
          setTimeout(() => setSuccessToast(''), 4000);
        }}
      />
    );
  }

  // If in edit view (pencil icon or Edit User button) — full editable form without hiding anything
  if (viewMode === 'edit') {
    return (
      <EditUserView
        user={selectedUser}
        onNavigateBack={() => setViewMode(previousView === 'details' ? 'details' : 'list')}
        onUserUpdated={(updated) => {
          setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
          setSelectedUser(prev => ({ ...(prev || {}), ...updated }));
          setViewMode(previousView === 'details' ? 'details' : 'list');
          setSuccessToast(`User ${updated.name} updated successfully.`);
          setTimeout(() => setSuccessToast(''), 4000);
          loadBackendUsers(true);
        }}
      />
    );
  }

  // If in create view, render full-screen CreateUserView matching design flow
  if (viewMode === 'create') {
    return (
      <CreateUserView 
        onNavigateBack={() => {
          setViewMode('list');
          loadBackendUsers(true);
        }}
        onUserCreated={(created) => {
          setViewMode('list');
          setUsers(prev => {
            const alreadyExists = prev.some(u => 
              (created.id && u.id && u.id.toLowerCase() === created.id.toLowerCase()) ||
              (created.email && u.email && u.email.toLowerCase() === created.email.toLowerCase())
            );
            if (alreadyExists) return prev;
            return [created, ...prev];
          });
          loadBackendUsers(true);
          const isCreatedAdmin = created.role === 'admin' || created.role === 'Cluster Administrator' || String(created.id || '').toUpperCase().startsWith('ADM');
          setSuccessToast(`${isCreatedAdmin ? 'Administrator' : 'User'} ${created.name} (${created.id}) created successfully.`);
          setTimeout(() => setSuccessToast(''), 5000);
        }}
      />
    );
  }

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* ================= PAGE HEADER ROW ================= */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
            User Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
            Create accounts and control mobile application access
          </p>
        </div>

        <button
          onClick={() => setViewMode('create')}
          style={{
            backgroundColor: '#EB5A1D',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9px',
            padding: '9px 18px',
            fontSize: '13.5px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(235, 90, 29, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create User</span>
        </button>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div 
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{successToast}</span>
          </div>
          <button 
            onClick={() => setSuccessToast('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ================= ROW 1: 3 KPI METRIC CARDS ================= */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Card 1: Total Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }}>
              <Users size={19} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', backgroundColor: '#FFF7ED', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FFEDD5', letterSpacing: '0.02em' }}>
              DIRECTORY
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={kpiLabelStyle}>Total Users</span>
            <div style={kpiNumberStyle}>{totalUsersCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11.5px', color: '#64748B' }}>
              <span>Registered accounts in database</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #D1FAE5' }}>
              <UserCheck size={19} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '6px', border: '1px solid #D1FAE5', letterSpacing: '0.02em' }}>
              ● {totalUsersCount > 0 ? Math.round((activeCount / totalUsersCount) * 100) : 0}% ACTIVE
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={kpiLabelStyle}>Active Users</span>
            <div style={kpiNumberStyle}>{activeCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '11.5px', color: '#059669' }}>
              <span style={{ fontWeight: 600 }}>Operational</span>
              <span style={{ color: '#94A3B8' }}>• Full access enabled</span>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2' }}>
              <UserX size={19} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FEE2E2', letterSpacing: '0.02em' }}>
              ● {totalUsersCount > 0 ? Math.round((inactiveCount / totalUsersCount) * 100) : 0}% INACTIVE
            </span>
          </div>
          <div style={{ marginTop: '10px' }}>
            <span style={kpiLabelStyle}>Inactive Users</span>
            <div style={kpiNumberStyle}>{inactiveCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', fontSize: '11.5px', color: '#DC2626' }}>
              <span style={{ fontWeight: 600 }}>Disabled</span>
              <span style={{ color: '#94A3B8' }}>• Access revoked</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= ROW 2: FILTER TOOLBAR ================= */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #ECEEF2',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
        }}
      >
        {/* Search Input on Left */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0 12px',
            height: '36px',
            width: '280px',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name, email or ID..."
            value={searchQuery}
            maxLength={60}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: '#0F172A',
              width: '100%',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Dropdown Filters on Right - All cleanly aligned at 36px height */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Cluster Filter */}
          <div style={filterPillContainerStyle}>
            <span style={filterPillLabelStyle}>Cluster:</span>
            <select 
              style={filterPillSelectStyle}
              value={clusterFilter}
              onChange={(e) => handleClusterFilterChange(e.target.value)}
            >
              <option value="ALL">All Clusters</option>
              {availableClusters.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* School Filter */}
          <div style={filterPillContainerStyle}>
            <span style={filterPillLabelStyle}>School:</span>
            <select 
              style={filterPillSelectStyle}
              value={schoolFilter}
              onChange={(e) => {
                setSchoolFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">{clusterFilter !== 'ALL' ? `All in ${clusterFilter}` : 'All Schools'}</option>
              {availableSchools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div style={filterPillContainerStyle}>
            <span style={filterPillLabelStyle}>Role:</span>
            <select 
              style={filterPillSelectStyle}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="Cluster Admin">Cluster Admin</option>
              <option value="School Staff">School Staff</option>
              <option value="Staff">Staff</option>
              <option value="View Only">View Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={filterPillContainerStyle}>
            <span style={filterPillLabelStyle}>Status:</span>
            <select 
              style={filterPillSelectStyle}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '36px',
              border: (searchQuery || clusterFilter !== 'ALL' || schoolFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL')
                ? '1px solid #FED7AA'
                : '1px solid #E2E8F0',
              backgroundColor: (searchQuery || clusterFilter !== 'ALL' || schoolFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL')
                ? '#FFF7ED'
                : '#FFFFFF',
              borderRadius: '8px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: (searchQuery || clusterFilter !== 'ALL' || schoolFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL')
                ? '#EA580C'
                : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Reset Filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ================= ROW 3: USERS DATA TABLE ================= */}
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #ECEEF2',
          borderRadius: '12px',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '940px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #ECEEF2' }}>
                <th style={tableHeaderStyle} onClick={() => handleSort('id')}>
                  <div style={headerFlexStyle}>
                    <span>User ID</span>
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('name')}>
                  <div style={headerFlexStyle}>
                    <span>Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('email')}>
                  <div style={headerFlexStyle}>
                    <span>Email</span>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('cluster')}>
                  <div style={headerFlexStyle}>
                    <span>Cluster</span>
                    {renderSortIcon('cluster')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('school')}>
                  <div style={headerFlexStyle}>
                    <span>School</span>
                    {renderSortIcon('school')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('role')}>
                  <div style={headerFlexStyle}>
                    <span>Role</span>
                    {renderSortIcon('role')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('status')}>
                  <div style={headerFlexStyle}>
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('lastLoginDate')}>
                  <div style={headerFlexStyle}>
                    <span>Last Login</span>
                    {renderSortIcon('lastLoginDate')}
                  </div>
                </th>
                <th style={{ ...tableHeaderStyle, textAlign: 'center', cursor: 'default' }}>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((u) => {
                  const isActive = u.status === 'Active';
                  const initials = u.name ? u.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U';

                  return (
                    <tr 
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      {/* User ID */}
                      <td style={{ padding: '12px 14px', fontSize: '12px' }}>
                        <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600, color: '#475569', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                          {u.id}
                        </span>
                      </td>

                      {/* Name with Avatar */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div 
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#FFEDD5' : '#F1F5F9',
                              color: isActive ? '#EA580C' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              flexShrink: 0
                            }}
                          >
                            {initials}
                          </div>
                          <span 
                            style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', transition: 'color 0.15s ease' }} 
                            onClick={() => handleOpenUserDetails(u)}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'} 
                            onMouseLeave={(e) => e.currentTarget.style.color = '#0F172A'}
                            title="Click to view user details"
                          >
                            {u.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {u.email}
                      </td>

                      {/* Cluster */}
                      <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {u.cluster === 'Unassigned (Pending Scope)' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: '1px solid #FDE68A'
                          }}>
                            Pending Scope
                          </span>
                        ) : (!u.cluster || /^[0-9a-fA-F-]{20,}$/.test(u.cluster)) ? (
                          <span style={{ color: '#94A3B8' }}>All Clusters</span>
                        ) : (
                          <span style={{ fontWeight: 500, color: '#334155' }}>{u.cluster}</span>
                        )}
                      </td>

                      {/* School */}
                      <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                        {u.school === 'Unassigned' ? (
                          <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</span>
                        ) : (
                          u.school
                        )}
                      </td>

                      {/* Role Pill */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={getRoleBadgeStyle(u.role)}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={getStatusBadgeStyle(isActive)}>
                          <span 
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: isActive ? '#059669' : '#DC2626',
                              display: 'inline-block'
                            }}
                          />
                          <span>{u.status}</span>
                        </span>
                      </td>

                      {/* Last Login */}
                      <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#475569', lineHeight: 1.3 }}>
                        <div>{u.lastLoginDate}</div>
                        <div style={{ color: '#94A3B8' }}>{u.lastLoginTime}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {/* Eye / View */}
                          <button 
                            style={actionBtnStyle} 
                            onClick={() => handleOpenUserDetails(u)}
                            title="View User Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Pencil / Edit */}
                          <button 
                            style={actionBtnStyle} 
                            onClick={() => handleOpenEditUser(u)}
                            title="Edit User"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete User */}
                          <button 
                            style={{ ...actionBtnStyle, color: '#EF4444' }} 
                            onClick={() => {
                              setUserToDelete(u);
                              setShowDeleteModal(true);
                            }}
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>

                          {/* Toggle Switch */}
                          <div 
                            style={{
                              width: '32px',
                              height: '18px',
                              borderRadius: '99px',
                              backgroundColor: isActive ? '#EB5A1D' : '#E2E8F0',
                              padding: '2px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: isActive ? 'flex-end' : 'flex-start',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                            onClick={() => setUserToToggleStatus(u)}
                            title={`Click to ${isActive ? 'Deactivate' : 'Activate'} user (currently ${u.status})`}
                          >
                            <div 
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                        <Users size={22} />
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>No users found</div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', maxWidth: '340px' }}>
                        No user accounts match your search query or filter criteria.
                      </div>
                      <button
                        onClick={handleResetFilters}
                        style={{
                          marginTop: '8px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '7px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div 
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            backgroundColor: '#FFFFFF',
            fontSize: '12px',
            color: '#64748B'
          }}
        >
          <div>
            Showing <strong style={{ color: '#0F172A' }}>{filteredUsers.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</strong>–<strong style={{ color: '#0F172A' }}>{Math.min(safeCurrentPage * pageSize, filteredUsers.length)}</strong> of <strong style={{ color: '#0F172A' }}>{filteredUsers.length}</strong> users
            {filteredUsers.length !== totalUsersCount && (
              <span style={{ color: '#94A3B8', marginLeft: '6px' }}>(filtered from {totalUsersCount} total)</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Rows Per Page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>Rows:</span>
              <select 
                style={{
                  height: '30px',
                  padding: '0 8px',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#334155',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer'
                }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                type="button"
                style={{
                  ...paginationArrowStyle,
                  opacity: safeCurrentPage <= 1 ? 0.35 : 1,
                  cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1)
                .map((page, idx, arr) => {
                  const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span style={{ padding: '0 3px', color: '#94A3B8', fontSize: '12px' }}>…</span>}
                      <button 
                        type="button"
                        style={{
                          ...paginationPageStyle,
                          backgroundColor: safeCurrentPage === page ? '#EB5A1D' : '#FFFFFF',
                          color: safeCurrentPage === page ? '#FFFFFF' : '#475569',
                          borderColor: safeCurrentPage === page ? '#EB5A1D' : '#E2E8F0',
                          fontWeight: safeCurrentPage === page ? 700 : 500
                        }}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })
              }

              <button 
                type="button"
                style={{
                  ...paginationArrowStyle,
                  opacity: (safeCurrentPage >= totalPages || filteredUsers.length === 0) ? 0.35 : 1,
                  cursor: (safeCurrentPage >= totalPages || filteredUsers.length === 0) ? 'not-allowed' : 'pointer'
                }}
                disabled={safeCurrentPage >= totalPages || filteredUsers.length === 0}
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CREATE USER MODAL ================= */}
      {isCreateModalOpen && (
        <div style={modalBackdropStyle} onClick={() => setIsCreateModalOpen(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create User Account</h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Assign role, school access, and login credentials
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={modalLabelStyle}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Krishnan"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div>
                <label style={modalLabelStyle}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand.k@school.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={modalInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={modalLabelStyle}>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={modalInputStyle}
                  >
                    <option value="School Staff">School Staff</option>
                    <option value="Staff">Staff</option>
                    <option value="View Only">View Only</option>
                  </select>
                </div>

                <div>
                  <label style={modalLabelStyle}>Cluster</label>
                  <select
                    value={newUser.cluster}
                    onChange={(e) => setNewUser({ ...newUser, cluster: e.target.value })}
                    style={modalInputStyle}
                  >
                    <option value="All Clusters">All Clusters</option>
                    {dbClusters.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={modalLabelStyle}>Assigned School</label>
                <select
                  value={newUser.school}
                  onChange={(e) => setNewUser({ ...newUser, school: e.target.value })}
                  style={modalInputStyle}
                >
                  <option value="All Assigned Schools">All Assigned Schools</option>
                  {dbSchools.map(s => (
                    <option key={s.id || s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={modalCancelBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={modalSubmitBtnStyle}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM CREATE USER MODAL ================= */}
      {showCreateConfirmModal && (
        <div style={modalBackdropStyle} onClick={() => setShowCreateConfirmModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...modalHeaderStyle, backgroundColor: '#FFF7ED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Confirm User Creation</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Review user details before adding to database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateConfirmModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                Are you sure you want to create a new user account with active login privileges?
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><span style={{ color: '#64748B' }}>Full Name:</span> <strong style={{ color: '#0F172A' }}>{newUser.name}</strong></div>
                <div><span style={{ color: '#64748B' }}>Email:</span> <strong style={{ color: '#0F172A' }}>{newUser.email}</strong></div>
                <div><span style={{ color: '#64748B' }}>Role:</span> <strong style={{ color: '#0F172A' }}>{newUser.role}</strong></div>
                <div><span style={{ color: '#64748B' }}>Cluster:</span> <strong style={{ color: '#0F172A' }}>{newUser.cluster}</strong></div>
                <div><span style={{ color: '#64748B' }}>School:</span> <strong style={{ color: '#0F172A' }}>{newUser.school}</strong></div>
              </div>

              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#2563EB' }} />
                <span>The user will be assigned a unique sequential User ID starting from USR001 and will be able to log in to the application.</span>
              </div>
            </div>

            <div style={{ padding: '12px 20px 16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCreateConfirmModal(false)}
                style={modalCancelBtnStyle}
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateUser}
                style={modalSubmitBtnStyle}
              >
                Confirm & Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE USER MODAL ================= */}
      {showDeleteModal && userToDelete && (
        <div style={modalBackdropStyle} onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...modalHeaderStyle, backgroundColor: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Confirm User Deletion</h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>This action cannot be undone</span>
                </div>
              </div>
              <button 
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete user <strong style={{ color: '#0F172A' }}>{userToDelete.name}</strong> (<strong style={{ color: '#EA580C' }}>{userToDelete.id}</strong>)?
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><span style={{ color: '#64748B' }}>User ID:</span> <strong>{userToDelete.id}</strong></div>
                <div><span style={{ color: '#64748B' }}>Email:</span> <strong>{userToDelete.email}</strong></div>
                <div><span style={{ color: '#64748B' }}>Role:</span> <strong>{userToDelete.role}</strong></div>
                <div><span style={{ color: '#64748B' }}>Assigned Cluster:</span> <strong>{userToDelete.cluster || 'None'}</strong></div>
              </div>

              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>This user will immediately lose all login access to the mobile application and admin panel.</span>
              </div>
            </div>

            <div style={{ padding: '12px 20px 16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                style={modalCancelBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeleting}
                style={{
                  ...modalSubmitBtnStyle,
                  backgroundColor: '#DC2626',
                  borderColor: '#DC2626',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: STATUS (DEACTIVATE / ACTIVATE) CONFIRMATION ================= */}
      {userToToggleStatus && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', width: '92%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  backgroundColor: userToToggleStatus.status === 'Active' ? '#FEE2E2' : '#DCFCE7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: userToToggleStatus.status === 'Active' ? '#DC2626' : '#16A34A' 
                }}>
                  {userToToggleStatus.status === 'Active' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    {userToToggleStatus.status === 'Active' ? 'Deactivate User Account?' : 'Activate User Account?'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>Confirm account status change</span>
                </div>
              </div>
              <button 
                onClick={() => setUserToToggleStatus(null)} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {userToToggleStatus.status === 'Active' ? (
                  <>Are you sure you want to <strong>deactivate</strong> user <strong style={{ color: '#0F172A' }}>{userToToggleStatus.name}</strong> (<strong style={{ color: '#EA580C' }}>{userToToggleStatus.id}</strong>)?</>
                ) : (
                  <>Are you sure you want to <strong>activate</strong> user <strong style={{ color: '#0F172A' }}>{userToToggleStatus.name}</strong> (<strong style={{ color: '#EA580C' }}>{userToToggleStatus.id}</strong>)?</>
                )}
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><span style={{ color: '#64748B' }}>User ID:</span> <strong>{userToToggleStatus.id}</strong></div>
                <div><span style={{ color: '#64748B' }}>Email:</span> <strong>{userToToggleStatus.email}</strong></div>
                <div><span style={{ color: '#64748B' }}>Current Status:</span> <strong style={{ color: userToToggleStatus.status === 'Active' ? '#16A34A' : '#DC2626' }}>{userToToggleStatus.status}</strong></div>
                <div><span style={{ color: '#64748B' }}>New Status:</span> <strong style={{ color: userToToggleStatus.status === 'Active' ? '#DC2626' : '#16A34A' }}>{userToToggleStatus.status === 'Active' ? 'Inactive (Disabled)' : 'Active (Enabled)'}</strong></div>
              </div>

              {userToToggleStatus.status === 'Active' ? (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>This user will be immediately logged out and blocked from logging into the mobile application and admin panel.</span>
                </div>
              ) : (
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>This will restore the user's login access to the mobile application and admin panel.</span>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px 16px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUserToToggleStatus(null)}
                style={modalCancelBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleStatus}
                disabled={isTogglingStatus}
                style={{
                  ...modalSubmitBtnStyle,
                  backgroundColor: userToToggleStatus.status === 'Active' ? '#DC2626' : '#16A34A',
                  borderColor: userToToggleStatus.status === 'Active' ? '#DC2626' : '#16A34A',
                  opacity: isTogglingStatus ? 0.7 : 1
                }}
              >
                {isTogglingStatus ? 'Updating...' : (userToToggleStatus.status === 'Active' ? 'Confirm & Deactivate' : 'Confirm & Activate')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= STYLES ================= */

const kpiCardContainerStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  boxSizing: 'border-box'
};

const kpiIconStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '9px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const kpiOptionsBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#94A3B8',
  cursor: 'pointer',
  padding: '2px'
};

const kpiLabelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748B',
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const kpiNumberStyle = {
  fontSize: '28px',
  fontWeight: 800,
  color: '#0F172A',
  lineHeight: 1.1,
  marginTop: '3px'
};

const filterPillContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  height: '36px',
  padding: '0 8px 0 10px',
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  boxSizing: 'border-box'
};

const filterPillLabelStyle = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748B',
  whiteSpace: 'nowrap'
};

const filterPillSelectStyle = {
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: '12px',
  fontWeight: 500,
  color: '#0F172A',
  cursor: 'pointer',
  fontFamily: 'inherit',
  maxWidth: '170px'
};

const tableHeaderStyle = {
  padding: '12px 14px',
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#475569',
  cursor: 'pointer',
  userSelect: 'none',
  letterSpacing: '0.02em',
  whiteSpace: 'nowrap'
};

const headerFlexStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const actionBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#64748B',
  cursor: 'pointer',
  padding: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  transition: 'color 0.15s ease'
};

const paginationArrowStyle = {
  width: '26px',
  height: '26px',
  border: '1px solid #E2E8F0',
  borderRadius: '5px',
  backgroundColor: '#FFFFFF',
  color: '#64748B',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const paginationPageStyle = {
  width: '26px',
  height: '26px',
  border: '1px solid #E2E8F0',
  borderRadius: '5px',
  backgroundColor: '#FFFFFF',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

function getRoleBadgeStyle(role) {
  const base = {
    padding: '3px 9px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: 600,
    display: 'inline-block'
  };

  switch (role) {
    case 'Super Admin':
      return { ...base, backgroundColor: '#EEF2FF', color: '#4F46E5', border: '1px solid #E0E7FF' };
    case 'Admin':
    case 'Cluster Admin':
    case 'Cluster Administrator':
      return { ...base, backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' };
    case 'School Staff':
      return { ...base, backgroundColor: '#F0FDFA', color: '#0D9488', border: '1px solid #CCFBF1' };
    case 'View Only':
      return { ...base, backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' };
    case 'Staff':
    default:
      return { ...base, backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
  }
}

function getStatusBadgeStyle(isActive) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 9px',
    borderRadius: '99px',
    fontSize: '11.5px',
    fontWeight: 600,
    backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
    color: isActive ? '#059669' : '#DC2626',
    border: isActive ? '1px solid #A7F3D0' : '1px solid #FECACA'
  };
}

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.5)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '16px'
};

const modalBoxStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '460px',
  padding: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  border: '1px solid #ECEEF2'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '12px',
  borderBottom: '1px solid #F1F5F9'
};

const modalLabelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
  display: 'block',
  marginBottom: '4px'
};

const modalInputStyle = {
  width: '100%',
  height: '36px',
  border: '1px solid #E2E8F0',
  borderRadius: '7px',
  padding: '0 10px',
  fontSize: '12.5px',
  color: '#0F172A',
  outline: 'none',
  boxSizing: 'border-box'
};

const modalSubmitBtnStyle = {
  flex: 1,
  height: '38px',
  backgroundColor: '#EB5A1D',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '7px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const modalCancelBtnStyle = {
  flex: 1,
  height: '38px',
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  color: '#475569',
  borderRadius: '7px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

const viewDetailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 0',
  borderBottom: '1px solid #F8FAFC',
  fontSize: '12.5px',
  color: '#334155'
};
