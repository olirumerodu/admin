import React, { useState, useEffect } from 'react';
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
import CreateUserView from './CreateUserView';
import UserDetailsView from './UserDetailsView';
import EditUserView from './EditUserView';

export default function UserManagementView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Confirmation Pop-up states for deletion and creation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Map backend user response into UI row representation
  const formatUser = (u, idx, clusterMap = null) => {
    const roleDisplay = u.role === 'admin' 
      ? 'Super Admin' 
      : u.role === 'health_officer' 
        ? 'School Staff' 
        : u.role || 'Staff';
    const isAct = u.is_active !== false;
    const createdDt = u.created_at ? new Date(u.created_at) : new Date();

    // Resolve clean human-readable Cluster Name:
    // If admin selected "All Clusters" or cluster is null/empty, show "All Clusters".
    // Otherwise show the resolved cluster name (e.g. "ERODE"), NEVER a UUID hash!
    let clusterName = 'All Clusters';
    const effectiveMap = clusterMap || clustersMap;
    if (u.cluster_name && u.cluster_name !== 'All Clusters' && !/^[0-9a-fA-F-]{20,}$/.test(u.cluster_name)) {
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

    const schoolName = u.school_name || (roleDisplay === 'Super Admin' || roleDisplay === 'Admin' ? 'All Schools' : 'All Assigned Schools');

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
      accessType: (roleDisplay === 'Super Admin' || roleDisplay === 'Admin') 
        ? 'Full Access' 
        : isAct ? 'Limited Access' : 'Inactive Users',
      raw: u
    };
  };

  // Sync real-time users from backend API
  const loadBackendUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [backendData, clustersData] = await Promise.allSettled([
        api.getUsers(),
        api.getClusters()
      ]);

      const cMap = {};
      if (clustersData.status === 'fulfilled' && Array.isArray(clustersData.value)) {
        clustersData.value.forEach(c => {
          if (c.id && c.name) cMap[c.id] = c.name;
          if (c.name) cMap[c.name] = c.name;
        });
        setClustersMap(cMap);
      }

      if (backendData.status === 'fulfilled' && Array.isArray(backendData.value)) {
        const mapped = backendData.value.map((u, idx) => formatUser(u, idx, cMap));
        setUsers(mapped);
      }
    } catch (err) {
      console.warn('Real-time Users sync notice:', err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendUsers();
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
  const fullAccessCount = users.filter(u => u.accessType === 'Full Access').length;
  const limitedAccessCount = users.filter(u => u.accessType === 'Limited Access').length;

  // Real cluster and school options dynamically derived from users
  const uniqueClusters = Array.from(new Set(users.map(u => u.cluster).filter(Boolean)));
  const uniqueSchools = Array.from(new Set(users.map(u => u.school).filter(Boolean)));

  // Toggle user Active / Inactive status and persist to backend
  const handleToggleStatus = async (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;
    const nextStatus = targetUser.status === 'Active' ? 'Inactive' : 'Active';
    const nextIsActive = nextStatus === 'Active';

    // Optimistic UI update
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          status: nextStatus, 
          accessType: nextStatus === 'Active' ? ((u.role === 'Super Admin' || u.role === 'Admin') ? 'Full Access' : 'Limited Access') : 'Inactive Users' 
        };
      }
      return u;
    }));

    try {
      await api.updateUser(userId, { is_active: nextIsActive });
      setSuccessToast(`User ${targetUser.name} status updated to ${nextStatus}`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error('Failed to update status on server:', err);
      // Revert if error
      loadBackendUsers(true);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setClusterFilter('ALL');
    setSchoolFilter('ALL');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
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

  // Filtered & Sorted Users
  const filteredUsers = users
    .filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    } else {
      setSelectedUserIds([]);
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
      const created = await api.createUser({
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        assigned_cluster_id: newUser.cluster === 'All Clusters' ? null : newUser.cluster,
        is_active: newUser.status === 'Active'
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
          setSelectedUser(prev => ({ ...prev, ...updated }));
          setViewMode(previousView === 'details' ? 'details' : 'list');
          setSuccessToast(`User ${updated.name} updated successfully.`);
          setTimeout(() => setSuccessToast(''), 4000);
        }}
      />
    );
  }

  // If in create view, render full-screen CreateUserView matching design flow
  if (viewMode === 'create') {
    return (
      <CreateUserView 
        onNavigateBack={() => setViewMode('list')}
        onUserCreated={(created) => {
          setUsers(prev => [created, ...prev]);
          setViewMode('list');
          setSuccessToast(`User ${created.name} (${created.id}) created successfully.`);
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

      {/* ================= ROW 1: 4 KPI METRIC CARDS ================= */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Card 1: Total Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
              <Users size={18} />
            </div>
            <button style={kpiOptionsBtnStyle}><MoreVertical size={14} /></button>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={kpiLabelStyle}>Total Users</span>
            <div style={kpiNumberStyle}>{totalUsersCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '11px' }}>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>↑ 12%</span>
              <span style={{ color: '#94A3B8' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <UserCheck size={18} />
            </div>
            <button style={kpiOptionsBtnStyle}><MoreVertical size={14} /></button>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={kpiLabelStyle}>Active Users</span>
            <div style={kpiNumberStyle}>{activeCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '11px' }}>
              <span style={{ color: '#16A34A', fontWeight: 700 }}>↑ Live</span>
              <span style={{ color: '#94A3B8' }}>from database</span>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Users */}
        <div style={kpiCardContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ ...kpiIconStyle, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
              <UserX size={18} />
            </div>
            <button style={kpiOptionsBtnStyle}><MoreVertical size={14} /></button>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={kpiLabelStyle}>Inactive Users</span>
            <div style={kpiNumberStyle}>{inactiveCount}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', fontSize: '11px' }}>
              <span style={{ color: '#DC2626', fontWeight: 700 }}>•</span>
              <span style={{ color: '#94A3B8' }}>Deactivated accounts</span>
            </div>
          </div>
        </div>

        {/* Card 4: Access Summary (Wider card) */}
        <div style={{ ...kpiCardContainerStyle, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <ShieldCheck size={16} color="#059669" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Access Summary</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%' }}>
            {/* Full Access */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Full Access</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{fullAccessCount}</div>
              <div style={{ height: '3.5px', backgroundColor: '#10B981', borderRadius: '99px', marginTop: '4px' }} />
            </div>

            {/* Limited Access */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Limited Access</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{limitedAccessCount}</div>
              <div style={{ height: '3.5px', backgroundColor: '#F59E0B', borderRadius: '99px', marginTop: '4px' }} />
            </div>

            {/* Inactive Users */}
            <div>
              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Inactive Users</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>{inactiveCount}</div>
              <div style={{ height: '3.5px', backgroundColor: '#EF4444', borderRadius: '99px', marginTop: '4px' }} />
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
          boxSizing: 'border-box'
        }}
      >
        {/* Search Input */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '280px',
            boxSizing: 'border-box'
          }}
        >
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name, email or user ID..."
            value={searchQuery}
            maxLength={60}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Cluster */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={filterLabelStyle}>Cluster</span>
            <select 
              style={filterSelectStyle}
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
            >
              <option value="ALL">All Clusters</option>
              {uniqueClusters.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* School */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={filterLabelStyle}>School</span>
            <select 
              style={filterSelectStyle}
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            >
              <option value="ALL">All Schools</option>
              {uniqueSchools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={filterLabelStyle}>Role</span>
            <select 
              style={filterSelectStyle}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="School Staff">School Staff</option>
              <option value="Staff">Staff</option>
              <option value="View Only">View Only</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={filterLabelStyle}>Status</span>
            <select 
              style={filterSelectStyle}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              borderRadius: '7px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              marginTop: '14px',
              transition: 'all 0.15s ease'
            }}
          >
            <RotateCcw size={13} />
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #ECEEF2' }}>
                <th style={{ width: '40px', padding: '10px 14px' }}>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer', accentColor: '#EB5A1D' }}
                  />
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('id')}>
                  <div style={headerFlexStyle}>
                    <span>User ID</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('name')}>
                  <div style={headerFlexStyle}>
                    <span>Name</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('email')}>
                  <div style={headerFlexStyle}>
                    <span>Email</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('cluster')}>
                  <div style={headerFlexStyle}>
                    <span>Cluster</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('school')}>
                  <div style={headerFlexStyle}>
                    <span>School</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('role')}>
                  <div style={headerFlexStyle}>
                    <span>Role</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('status')}>
                  <div style={headerFlexStyle}>
                    <span>Status</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={tableHeaderStyle} onClick={() => handleSort('lastLoginDate')}>
                  <div style={headerFlexStyle}>
                    <span>Last Login</span>
                    <ArrowUpDown size={11} color="#94A3B8" />
                  </div>
                </th>
                <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  const isActive = u.status === 'Active';

                  return (
                    <tr 
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isChecked ? '#FFF7ED' : 'transparent',
                        transition: 'background-color 0.12s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '10px 14px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(u.id)}
                          style={{ cursor: 'pointer', accentColor: '#EB5A1D' }}
                        />
                      </td>

                      {/* User ID */}
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
                        {u.id}
                      </td>

                      {/* Name */}
                      <td 
                        style={{ padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}
                        onClick={() => handleOpenUserDetails(u)}
                        title="Click to view user details"
                      >
                        <span 
                          style={{ transition: 'color 0.15s ease' }} 
                          onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'} 
                          onMouseLeave={(e) => e.currentTarget.style.color = '#0F172A'}
                        >
                          {u.name}
                        </span>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {u.email}
                      </td>

                      {/* Cluster */}
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {(!u.cluster || /^[0-9a-fA-F-]{20,}$/.test(u.cluster)) ? 'All Clusters' : u.cluster}
                      </td>

                      {/* School */}
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                        {u.school}
                      </td>

                      {/* Role Pill */}
                      <td style={{ padding: '10px 14px' }}>
                        <span style={getRoleBadgeStyle(u.role)}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td style={{ padding: '10px 14px' }}>
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
                      <td style={{ padding: '10px 14px', fontSize: '11.5px', color: '#475569', lineHeight: 1.25 }}>
                        <div>{u.lastLoginDate}</div>
                        <div style={{ color: '#94A3B8' }}>{u.lastLoginTime}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 14px' }}>
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
                            onClick={() => handleToggleStatus(u.id)}
                            title={`Toggle Status (currently ${u.status})`}
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
                  <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                    No matching users found. Try clearing your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div 
          style={{
            padding: '10px 16px',
            borderTop: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            fontSize: '12px',
            color: '#64748B'
          }}
        >
          <div>
            Showing 1-{filteredUsers.length} of {totalUsersCount} users
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Rows Per Page */}
            <select 
              style={{
                height: '28px',
                padding: '0 8px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer'
              }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            {/* Pagination Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button 
                style={paginationArrowStyle}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <ChevronLeft size={14} />
              </button>

              <button style={{ ...paginationPageStyle, backgroundColor: '#EB5A1D', color: '#FFFFFF', borderColor: '#EB5A1D' }}>
                1
              </button>
              <button style={paginationPageStyle}>2</button>
              <button style={paginationPageStyle}>3</button>

              <button 
                style={paginationArrowStyle}
                onClick={() => setCurrentPage(prev => prev + 1)}
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
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
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
                    <option value="North Cluster">North Cluster</option>
                    <option value="East Cluster">East Cluster</option>
                    <option value="West Cluster">West Cluster</option>
                    <option value="Central Cluster">Central Cluster</option>
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
                  <option value="Greenwood Public School">Greenwood Public School</option>
                  <option value="Sunrise International School">Sunrise International School</option>
                  <option value="Riverdale Higher Secondary">Riverdale Higher Secondary</option>
                  <option value="Maple Leaf Public School">Maple Leaf Public School</option>
                  <option value="St. Mary's Matriculation School">St. Mary's Matriculation School</option>
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

    </div>
  );
}

/* ================= STYLES ================= */

const kpiCardContainerStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '12px',
  padding: '12px 14px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  boxSizing: 'border-box'
};

const kpiIconStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
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
  fontWeight: 600,
  color: '#64748B'
};

const kpiNumberStyle = {
  fontSize: '22px',
  fontWeight: 800,
  color: '#0F172A',
  lineHeight: 1.1,
  marginTop: '2px'
};

const filterLabelStyle = {
  fontSize: '10.5px',
  fontWeight: 600,
  color: '#64748B'
};

const filterSelectStyle = {
  height: '28px',
  padding: '0 8px',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  backgroundColor: '#FFFFFF',
  fontSize: '11.5px',
  color: '#334155',
  outline: 'none',
  cursor: 'pointer'
};

const tableHeaderStyle = {
  padding: '10px 14px',
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#64748B',
  cursor: 'pointer',
  userSelect: 'none'
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
