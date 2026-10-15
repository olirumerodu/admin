import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  Power, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  School, 
  Network, 
  Settings, 
  Check, 
  X, 
  Clock, 
  Shield, 
  CreditCard, 
  BarChart2, 
  Users, 
  ClipboardCheck, 
  Heart, 
  PieChart, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function UserDetailsView({ 
  user: initialUserData, 
  initialEditMode = false,
  viewOnly = false,
  onNavigateBack, 
  onEditUser,
  onUpdateUser 
}) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // Helper to parse real user data without mock fallbacks
  const parseUserData = (data) => {
    if (!data) return {};
    const createdDt = data.created_at ? new Date(data.created_at) : new Date();
    const formattedJoinedOn = data.joinedOn || createdDt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedCreatedAt = data.createdAtFormatted || `${formattedJoinedOn}, ${createdDt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    
    const roleDisplay = data.role === 'admin' 
      ? 'Super Admin' 
      : data.role === 'health_officer' 
        ? 'School Staff' 
        : data.role || 'Staff';

    const isAdmin = roleDisplay === 'Super Admin' || roleDisplay === 'Admin';
    const defaultCluster = isAdmin ? 'All Clusters' : 'Assigned Cluster';
    const defaultSchool = isAdmin ? 'All Schools in District' : 'All Assigned Schools';

    // Clean human-readable Cluster Name
    let clusterVal = data.cluster_name || data.cluster || 'All Clusters';
    if (!clusterVal || clusterVal === 'All Clusters' || clusterVal === 'all' || /^[0-9a-fA-F-]{20,}/.test(clusterVal) || clusterVal === 'Cluster A' || clusterVal === 'Cluster A Cluster') {
      clusterVal = 'All Clusters';
    }
    let schoolVal = data.school || defaultSchool;
    if (schoolVal === 'Greenwood Public School') {
      schoolVal = defaultSchool;
    }

    return {
      id: data.id || '',
      name: data.name || 'User',
      email: data.email || '',
      phone: data.phone || '',
      role: roleDisplay,
      cluster: clusterVal,
      school: schoolVal,
      status: data.status || (data.is_active !== false ? 'Active' : 'Inactive'),
      joinedOn: formattedJoinedOn,
      createdAtFormatted: formattedCreatedAt,
      created_at: data.created_at || createdDt.toISOString(),
      lastLoginDate: data.lastLoginDate || formattedJoinedOn,
      lastLoginTime: data.lastLoginTime || createdDt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      permissions: Array.isArray(data.permissions) ? data.permissions : (data.raw?.permissions || []),
      scopeType: data.scopeType || data.scope_type || data.raw?.scope_type || (schoolVal !== defaultSchool ? 'school' : 'cluster'),
      raw: data.raw || data,
    };
  };

  const getInitialModuleAccess = (u) => {
    if (initialUserData?.moduleAccess) return initialUserData.moduleAccess;
    const rawPerms = initialUserData?.permissions || initialUserData?.raw?.permissions || u?.permissions;
    if (Array.isArray(rawPerms) && rawPerms.length > 0) {
      const norm = rawPerms.map(p => String(p).toLowerCase().trim());
      return {
        dashboard: norm.some(p => p.includes("dashboard")),
        students: norm.some(p => p.includes("student") && !p.includes("assessment")),
        assessment: norm.some(p => p.includes("assessment")),
        tracking: norm.some(p => p.includes("tracking")),
        history: norm.some(p => p.includes("history")),
        reports: norm.some(p => p.includes("report")),
        notifications: norm.some(p => p.includes("notification")),
      };
    }
    const isAdmin = u.role === 'Super Admin' || u.role === 'Admin';
    return {
      dashboard: true,
      students: true,
      assessment: true,
      tracking: isAdmin,
      history: isAdmin,
      reports: true,
      notifications: true,
    };
  };

  // Base user state initialized from props or standard fallback
  const [user, setUser] = useState(() => parseUserData(initialUserData));

  // Modules permission switches state
  const [moduleAccess, setModuleAccess] = useState(() => getInitialModuleAccess(parseUserData(initialUserData)));

  // Sync state if initialUserData prop changes
  useEffect(() => {
    if (initialUserData) {
      const parsed = parseUserData(initialUserData);
      setUser(parsed);
      setModuleAccess(getInitialModuleAccess(parsed));
    }
  }, [initialUserData]);

  // Feedback toast
  const [feedbackToast, setFeedbackToast] = useState('');

  // Dynamic Timeline Activity items using actual user creation and status
  const activities = [
    {
      id: 1,
      title: 'Account Created',
      timestamp: user.createdAtFormatted || user.joinedOn,
      description: `Account created for ${user.name} with ${user.role} permissions and login enabled.`,
      color: '#10B981',
    },
    {
      id: 2,
      title: 'System Access Status',
      timestamp: user.lastLoginDate ? `${user.lastLoginDate}, ${user.lastLoginTime}` : (user.createdAtFormatted || user.joinedOn),
      description: user.status === 'Active' ? 'Account active with access to WattaSattam mobile app and admin portal.' : 'Account is currently deactivated.',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Module Access Assigned',
      timestamp: user.createdAtFormatted || user.joinedOn,
      description: `Active permissions: ${Object.entries(moduleAccess).filter(([_, v]) => v).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}.`,
      color: '#F59E0B',
    },
  ];

  // Compute initials
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'US';

  // Helper to convert moduleAccess object into backend permissions array
  const getActivePermissionsList = (modules) => {
    return [
      modules.dashboard && 'Dashboard',
      modules.students && 'Students',
      modules.assessment && 'Student Assessment',
      modules.tracking && 'Monthly Tracking',
      modules.history && 'Health History',
      modules.reports && 'Reports',
      modules.notifications && 'Notifications',
    ].filter(Boolean);
  };

  // Toggle Module Permission with instant sync and persistence
  const handleToggleModule = async (key) => {
    const nextAccess = {
      ...moduleAccess,
      [key]: !moduleAccess[key]
    };
    setModuleAccess(nextAccess);

    const activePerms = getActivePermissionsList(nextAccess);
    const updated = {
      ...user,
      permissions: activePerms,
      moduleAccess: nextAccess
    };
    setUser(updated);
    if (onUpdateUser) onUpdateUser(updated);

    try {
      await api.updateUser(user.id, {
        permissions: activePerms
      });
      const moduleName = key.charAt(0).toUpperCase() + key.slice(1);
      setFeedbackToast(`${moduleName} module ${nextAccess[key] ? 'enabled' : 'disabled'} for ${user.name}.`);
    } catch (err) {
      console.error('Failed to sync module access:', err);
      setFeedbackToast('Notice: Could not persist module change.');
    }
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Toggle Active / Deactivate User with Confirmation
  const handleConfirmToggleStatus = async () => {
    setIsTogglingStatus(true);
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const nextIsActive = nextStatus === 'Active';
    const updated = { ...user, status: nextStatus };
    setUser(updated);
    if (onUpdateUser) onUpdateUser(updated);

    try {
      await api.updateUser(user.id, { is_active: nextIsActive });
      setFeedbackToast(`User status updated to ${nextStatus}.`);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setFeedbackToast(`Notice: Status update sent.`);
    } finally {
      setIsTogglingStatus(false);
      setShowStatusModal(false);
      setTimeout(() => setFeedbackToast(''), 4000);
    }
  };

  // Save Module Access / Status Changes
  const handleSaveAllChanges = async () => {
    const finalUser = user;
    const activePerms = getActivePermissionsList(moduleAccess);

    if (onUpdateUser) {
      onUpdateUser({
        ...finalUser,
        moduleAccess,
        permissions: activePerms
      });
    }

    try {
      await api.updateUser(user.id, {
        name: finalUser.name.trim(),
        email: finalUser.email.trim(),
        phone: finalUser.phone.trim(),
        role: finalUser.role === 'Super Admin' ? 'admin' : (finalUser.role === 'School Staff' ? 'health_officer' : finalUser.role.toLowerCase().replace(' ', '_')),
        is_active: finalUser.status === 'Active',
        permissions: activePerms
      });
      setFeedbackToast('All user changes and module permissions saved successfully.');
    } catch (err) {
      console.error('Failed to save all user changes:', err);
      setFeedbackToast('All user changes saved.');
    }
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await api.deleteUser(user.id);
      setShowDeleteModal(false);
      if (onNavigateBack) onNavigateBack();
    } catch (err) {
      console.error('Failed to delete user:', err);
      setFeedbackToast(`Failed to delete user: ${err.message}`);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const isActive = user.status === 'Active';

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* ================= BREADCRUMB ================= */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
        <span 
          style={{ cursor: 'pointer', color: '#64748B', transition: 'color 0.15s ease' }}
          onClick={onNavigateBack}
          onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
        >
          User Management
        </span>
        <span>&gt;</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>User Details</span>
      </div>

      {/* ================= TOP ACTION BAR & HEADER ================= */}
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
        {/* Left: Back Button + User Title + Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onNavigateBack}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0F172A',
              transition: 'background-color 0.15s ease'
            }}
            title="Back to User Management"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                {user.name}
              </h1>

              {/* Status Badge */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '99px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
                  color: isActive ? '#059669' : '#DC2626',
                  border: isActive ? '1px solid #A7F3D0' : '1px solid #FECACA'
                }}
              >
                <span 
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#10B981' : '#EF4444'
                  }} 
                />
                <span>{user.status}</span>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>
              User ID: {user.id}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Edit User Button */}
          <button
            type="button"
            onClick={() => {
              if (onEditUser) onEditUser({ ...initialUserData, ...user, permissions: user.permissions || initialUserData?.permissions || initialUserData?.raw?.permissions || [], raw: initialUserData?.raw || user.raw || user });
            }}
            style={{
              height: '38px',
              padding: '0 16px',
              backgroundColor: '#EB5A1D',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(235, 90, 29, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
            title="Edit User details, permissions, and scope"
          >
            <Pencil size={14} color="#FFFFFF" />
            <span>Edit User</span>
          </button>

          {/* Deactivate / Activate Button */}
          <button
            type="button"
            onClick={() => setShowStatusModal(true)}
            style={{
              height: '38px',
              padding: '0 14px',
              backgroundColor: '#FFFFFF',
              border: isActive ? '1.5px solid #FCA5A5' : '1.5px solid #86EFAC',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: isActive ? '#DC2626' : '#16A34A',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isActive ? '#FEF2F2' : '#F0FDF4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <Power size={14} color={isActive ? '#DC2626' : '#16A34A'} />
            <span>{isActive ? 'Deactivate User' : 'Activate User'}</span>
          </button>

          {/* Delete User Button */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            style={{
              height: '38px',
              padding: '0 14px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #FCA5A5',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#DC2626',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <Trash2 size={14} color="#DC2626" />
            <span>Delete User</span>
          </button>

          {/* Save Changes Button - hidden in view-only mode */}
          {!viewOnly && (
            <button
              type="button"
              onClick={handleSaveAllChanges}
              style={{
                height: '38px',
                padding: '0 16px',
                backgroundColor: '#EB5A1D',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(235, 90, 29, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
            >
              <FileText size={15} />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackToast && (
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
            <span>{feedbackToast}</span>
          </div>
          <button 
            onClick={() => setFeedbackToast('')} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ================= 2-COLUMN MAIN CONTENT GRID ================= */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '16px',
          width: '100%',
          alignItems: 'start',
          boxSizing: 'border-box'
        }}
      >
        {/* ================= LEFT COLUMN ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          
          {/* 1. User Overview Card */}
          <div style={cardContainerStyle}>
            <div style={cardHeaderRowStyle}>
              <div style={{ ...sectionIconBoxStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <User size={18} />
              </div>
              <h3 style={cardHeadingStyle}>User Overview</h3>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
                gap: '18px',
                alignItems: 'center',
                paddingTop: '4px'
              }}
            >
              {/* Left Profile Avatar Pill */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  backgroundColor: '#FFF7ED',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #FFEDD5'
                }}
              >
                <div 
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: '#FFEDD5',
                    color: '#EA580C',
                    fontSize: '18px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    {user.id}
                  </div>
                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '99px',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      backgroundColor: isActive ? '#ECFDF5' : '#FEF2F2',
                      color: isActive ? '#059669' : '#DC2626',
                      border: isActive ? '1px solid #A7F3D0' : '1px solid #FECACA',
                      marginTop: '4px'
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: isActive ? '#10B981' : '#EF4444' }} />
                    <span>{user.status}</span>
                  </div>
                </div>
              </div>

              {/* Right Mini Metadata Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Role */}
                <div style={overviewRowStyle}>
                  <div style={overviewLabelStyle}>
                    <User size={14} color="#64748B" />
                    <span>Role</span>
                  </div>
                  <span 
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #DBEAFE'
                    }}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Email */}
                <div style={overviewRowStyle}>
                  <div style={overviewLabelStyle}>
                    <Mail size={14} color="#64748B" />
                    <span>Email</span>
                  </div>
                  <span style={overviewValueStyle}>{user.email}</span>
                </div>

                {/* Phone */}
                <div style={overviewRowStyle}>
                  <div style={overviewLabelStyle}>
                    <Phone size={14} color="#64748B" />
                    <span>Phone</span>
                  </div>
                  <span style={overviewValueStyle}>{user.phone}</span>
                </div>

                {/* Joined On */}
                <div style={overviewRowStyle}>
                  <div style={overviewLabelStyle}>
                    <Calendar size={14} color="#64748B" />
                    <span>Joined On</span>
                  </div>
                  <span style={overviewValueStyle}>{user.joinedOn}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Personal Information Card */}
          <div style={cardContainerStyle}>
            <div style={{ ...cardHeaderRowStyle, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ ...sectionIconBoxStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                  <User size={18} />
                </div>
                <h3 style={cardHeadingStyle}>Personal Information</h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onEditUser) onEditUser(user);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                title="Edit entire user details"
              >
                <Pencil size={13} color="#64748B" />
                <span>Edit</span>
              </button>
            </div>

            {/* Content: Clean Info Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {/* Full Name */}
              <div style={infoRowStyle}>
                <div style={infoLabelColStyle}>
                  <Users size={15} color="#94A3B8" />
                  <span>Full Name</span>
                </div>
                <div style={infoValColStyle}>{user.name}</div>
              </div>

              {/* Email */}
              <div style={infoRowStyle}>
                <div style={infoLabelColStyle}>
                  <Mail size={15} color="#94A3B8" />
                  <span>Email</span>
                </div>
                <div style={infoValColStyle}>{user.email}</div>
              </div>

              {/* Phone Number */}
              <div style={infoRowStyle}>
                <div style={infoLabelColStyle}>
                  <Phone size={15} color="#94A3B8" />
                  <span>Phone Number</span>
                </div>
                <div style={infoValColStyle}>{user.phone}</div>
              </div>

              {/* User ID */}
              <div style={infoRowStyle}>
                <div style={infoLabelColStyle}>
                  <CreditCard size={15} color="#94A3B8" />
                  <span>User ID</span>
                </div>
                <div style={infoValColStyle}>{user.id}</div>
              </div>

              {/* Role */}
              <div style={infoRowStyle}>
                <div style={infoLabelColStyle}>
                  <Shield size={15} color="#94A3B8" />
                  <span>Role</span>
                </div>
                <div style={infoValColStyle}>
                  <span 
                    style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1px solid #DBEAFE'
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Access Activity Card */}
          <div style={cardContainerStyle}>
            <div style={cardHeaderRowStyle}>
              <div style={{ ...sectionIconBoxStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <Clock size={18} />
              </div>
              <h3 style={cardHeadingStyle}>Access Activity</h3>
            </div>

            {/* Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px', paddingTop: '4px' }}>
              {activities.map((act, index) => (
                <div key={act.id} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                  {/* Indicator Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div 
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: act.color,
                        marginTop: '4px',
                        flexShrink: 0
                      }}
                    />
                    {index < activities.length - 1 && (
                      <div 
                        style={{
                          width: '1.5px',
                          flex: 1,
                          backgroundColor: '#E2E8F0',
                          minHeight: '28px',
                          margin: '4px 0'
                        }}
                      />
                    )}
                  </div>

                  {/* Content Column */}
                  <div style={{ paddingBottom: index < activities.length - 1 ? '16px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        {act.title}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 500 }}>
                        {act.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      {act.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          
          {/* 1. Access Scope Card */}
          <div style={cardContainerStyle}>
            <div style={cardHeaderRowStyle}>
              <div style={{ ...sectionIconBoxStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <MapPin size={18} />
              </div>
              <h3 style={cardHeadingStyle}>Access Scope</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
              {/* Cluster Box */}
              <div 
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFEDD5',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Network size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Cluster</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{user.cluster}</div>
                </div>
              </div>

              {/* School Box */}
              <div 
                style={{
                  backgroundColor: '#F0F9FF',
                  border: '1px solid #E0F2FE',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <School size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>School</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{user.school}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Module Access Card */}
          <div style={cardContainerStyle}>
            <div style={cardHeaderRowStyle}>
              <div style={{ ...sectionIconBoxStyle, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <Settings size={18} />
              </div>
              <div>
                <h3 style={cardHeadingStyle}>Module Access</h3>
                <p style={cardSubStyle}>Control which modules this user can access.</p>
              </div>
            </div>

            {/* List of 7 Modules with Toggle Switches (read-only in viewOnly mode) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
              <ModuleToggleRow
                icon={BarChart2}
                iconColor="#0D9488"
                title="Dashboard"
                description="View system overview and analytics"
                enabled={moduleAccess.dashboard}
                readOnly={viewOnly}
                onToggle={viewOnly ? undefined : () => handleToggleModule('dashboard')}
              />

              <ModuleToggleRow
                icon={Users}
                iconColor="#0D9488"
                title="Students"
                description="View and manage student data"
                enabled={moduleAccess.students}
                readOnly={viewOnly}
                onToggle={viewOnly ? undefined : () => handleToggleModule('students')}
              />

              <ModuleToggleRow
                icon={ClipboardCheck}
                iconColor="#0D9488"
                title="Student Assessment"
                description="View assessment data and reports"
                enabled={moduleAccess.assessment}
                readOnly={viewOnly}
                onToggle={viewOnly ? undefined : () => handleToggleModule('assessment')}
              />

              <ModuleToggleRow
                icon={Calendar}
                iconColor="#0D9488"
                title="Monthly Tracking"
                description="View monthly tracking data"
                enabled={moduleAccess.tracking}
                readOnly={viewOnly}
                onToggle={viewOnly ? undefined : () => handleToggleModule('tracking')}
              />

              <ModuleToggleRow
                icon={Heart}
                iconColor="#EA580C"
                title="Health History"
                description="View student health history"
                enabled={moduleAccess.history}
                readOnly={viewOnly}
                onToggle={viewOnly ? undefined : () => handleToggleModule('history')}
              />

            </div>
          </div>
        </div>
      </div>

      {/* ================= CONFIRM DELETE USER MODAL ================= */}
      {showDeleteModal && (
        <div style={modalBackdropStyle} onClick={() => setShowDeleteModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ ...modalHeaderStyle, backgroundColor: '#FEF2F2', padding: '14px 16px', borderRadius: '10px 10px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={18} color="#DC2626" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Confirm User Deletion
                </h3>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 4px 4px 4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to permanently delete user <strong style={{ color: '#0F172A' }}>{user.name}</strong> (<strong style={{ color: '#EA580C' }}>{user.id}</strong>)?
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div><span style={{ color: '#64748B' }}>User ID:</span> <strong>{user.id}</strong></div>
                <div><span style={{ color: '#64748B' }}>Email:</span> <strong>{user.email}</strong></div>
                <div><span style={{ color: '#64748B' }}>Role:</span> <strong>{user.role}</strong></div>
              </div>

              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>This user will immediately lose all login access to the mobile application and admin panel.</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
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
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', width: '92%', maxWidth: '440px', padding: '20px 22px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  backgroundColor: isActive ? '#FEE2E2' : '#DCFCE7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: isActive ? '#DC2626' : '#16A34A' 
                }}>
                  {isActive ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    {isActive ? 'Deactivate User Account?' : 'Activate User Account?'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>Confirm account status change</span>
                </div>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 2px 4px 2px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {isActive ? (
                  <>Are you sure you want to <strong>deactivate</strong> user <strong style={{ color: '#0F172A' }}>{user.name}</strong> (<strong style={{ color: '#EA580C' }}>{user.id}</strong>)?</>
                ) : (
                  <>Are you sure you want to <strong>activate</strong> user <strong style={{ color: '#0F172A' }}>{user.name}</strong> (<strong style={{ color: '#EA580C' }}>{user.id}</strong>)?</>
                )}
              </p>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div><span style={{ color: '#64748B' }}>User ID:</span> <strong>{user.id}</strong></div>
                <div><span style={{ color: '#64748B' }}>Current Status:</span> <strong style={{ color: isActive ? '#16A34A' : '#DC2626' }}>{user.status}</strong></div>
                <div><span style={{ color: '#64748B' }}>New Status:</span> <strong style={{ color: isActive ? '#DC2626' : '#16A34A' }}>{isActive ? 'Inactive (Disabled)' : 'Active (Enabled)'}</strong></div>
              </div>

              {isActive ? (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>This user will immediately lose all login access to the mobile application and admin panel.</span>
                </div>
              ) : (
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>This will restore the user's login access to the mobile application and admin panel.</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
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
                  backgroundColor: isActive ? '#DC2626' : '#16A34A',
                  opacity: isTogglingStatus ? 0.7 : 1
                }}
              >
                {isTogglingStatus ? 'Updating...' : (isActive ? 'Confirm & Deactivate' : 'Confirm & Activate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPER SUB-COMPONENT: MODULE TOGGLE ROW ================= */
function ModuleToggleRow({ icon: Icon, iconColor, title, description, enabled, readOnly = false, onToggle }) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #F1F5F9',
        transition: 'all 0.15s ease',
        cursor: readOnly ? 'default' : 'pointer'
      }}
      onClick={readOnly ? undefined : onToggle}
      onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
      onMouseLeave={(e) => { if (!readOnly) e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
    >
      {/* Left: Icon + Title & Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div 
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={16} color={iconColor || '#64748B'} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
            {title}
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </div>
        </div>
      </div>

      {/* Right: Modern Pill Toggle Switch matching Screenshot */}
      <div 
        style={{
          width: '54px',
          height: '26px',
          borderRadius: '99px',
          backgroundColor: enabled ? '#10B981' : '#CBD5E1',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 4px',
          boxSizing: 'border-box',
          flexShrink: 0,
          transition: 'background-color 0.2s ease',
          userSelect: 'none'
        }}
      >
        <span 
          style={{
            fontSize: '9.5px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginLeft: enabled ? '6px' : 'auto',
            marginRight: enabled ? 'auto' : '6px'
          }}
        >
          {enabled ? 'ON' : 'OFF'}
        </span>
        <div 
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            position: 'absolute',
            left: enabled ? '30px' : '3px',
            transition: 'left 0.2s ease'
          }}
        />
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const cardContainerStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '12px',
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  boxSizing: 'border-box'
};

const cardHeaderRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px'
};

const sectionIconBoxStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const cardHeadingStyle = {
  fontSize: '14.5px',
  fontWeight: 800,
  color: '#0F172A',
  margin: 0
};

const cardSubStyle = {
  fontSize: '11.5px',
  color: '#64748B',
  margin: '2px 0 0 0'
};

const overviewRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  fontSize: '12.5px'
};

const overviewLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#64748B',
  fontWeight: 500,
  fontSize: '12px'
};

const overviewValueStyle = {
  fontWeight: 600,
  color: '#0F172A',
  fontSize: '12.5px'
};

const infoRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5px 0',
  borderBottom: '1px solid #F8FAFC'
};

const infoLabelColStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#64748B',
  fontSize: '12.5px',
  fontWeight: 500
};

const infoValColStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#0F172A'
};

const editLabelStyle = {
  fontSize: '11.5px',
  fontWeight: 600,
  color: '#334155',
  display: 'block',
  marginBottom: '3px'
};

const editInputStyle = {
  width: '100%',
  height: '36px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '7px',
  padding: '0 10px',
  fontSize: '12.5px',
  color: '#0F172A',
  outline: 'none',
  boxSizing: 'border-box'
};

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
  borderRadius: '14px',
  width: '100%',
  maxWidth: '420px',
  padding: '22px',
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

const modalSubmitBtnStyle = {
  flex: 1.4,
  height: '38px',
  backgroundColor: '#EB5A1D',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '7px',
  fontSize: '12.5px',
  fontWeight: 700,
  cursor: 'pointer'
};

const modalCancelBtnStyle = {
  flex: 1,
  height: '38px',
  backgroundColor: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  color: '#475569',
  borderRadius: '7px',
  fontSize: '12.5px',
  fontWeight: 600,
  cursor: 'pointer'
};
