import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Key, 
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
  Edit3, 
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
  AlertCircle 
} from 'lucide-react';

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
  onNavigateBack, 
  onUpdateUser 
}) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // Base user state initialized from props or standard fallback
  const [user, setUser] = useState({
    id: initialUserData?.id || 'USR-1024',
    name: initialUserData?.name || 'Arun Kumar',
    email: initialUserData?.email || 'arun.kumar@school.com',
    phone: initialUserData?.phone || '+91 98765 43210',
    role: initialUserData?.role || 'Admin',
    cluster: initialUserData?.cluster || 'Cluster A',
    school: initialUserData?.school || 'Greenwood Public School',
    status: initialUserData?.status || 'Active',
    joinedOn: initialUserData?.joinedOn || '12 Aug 2026',
  });

  // Edit Personal Information state
  const [isEditingPersonal, setIsEditingPersonal] = useState(Boolean(initialEditMode));
  const [editFormData, setEditFormData] = useState({ ...user });

  // Modules permission switches state
  const [moduleAccess, setModuleAccess] = useState({
    dashboard: true,
    students: true,
    assessment: true,
    tracking: true,
    history: true,
    reports: false,
    notifications: false,
  });

  // Modals & Feedback
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  // Timeline Activity items
  const [activities] = useState([
    {
      id: 1,
      title: 'Account Created',
      timestamp: '12 Aug 2026, 10:24 AM',
      description: 'Account created by Karthikeyan (Administrator)',
      color: '#10B981',
    },
    {
      id: 2,
      title: 'Last Login',
      timestamp: '29 Sep 2026, 09:12 AM',
      description: 'Logged in from Chrome on Windows',
      color: '#3B82F6',
    },
    {
      id: 3,
      title: 'Last Permission Update',
      timestamp: '25 Sep 2026, 04:18 PM',
      description: 'Module permissions updated by Karthikeyan',
      color: '#F59E0B',
    },
  ]);

  // Compute initials
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AK';

  // Toggle Module Permission
  const handleToggleModule = (key) => {
    setModuleAccess(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle Active / Deactivate User
  const handleToggleUserStatus = () => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...user, status: nextStatus };
    setUser(updated);
    if (onUpdateUser) onUpdateUser(updated);
    setFeedbackToast(`User status updated to ${nextStatus}.`);
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  // Save Personal Info
  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    setUser({ ...editFormData });
    setIsEditingPersonal(false);
    if (onUpdateUser) onUpdateUser({ ...editFormData });
    setFeedbackToast('Personal information updated successfully.');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  // Save All Changes (triggers save button at top right)
  const handleSaveAllChanges = () => {
    const finalUser = isEditingPersonal ? { ...user, ...editFormData } : user;
    setUser(finalUser);
    setIsEditingPersonal(false);
    if (onUpdateUser) {
      onUpdateUser({
        ...finalUser,
        moduleAccess
      });
    }
    setFeedbackToast('All user changes saved successfully.');
    setTimeout(() => setFeedbackToast(''), 4000);
  };

  // Reset Password Action
  const handleResetPassword = (e) => {
    e.preventDefault();
    setShowResetModal(false);
    setNewPassword('');
    setFeedbackToast(`Password reset successfully for ${user.name}.`);
    setTimeout(() => setFeedbackToast(''), 4000);
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
          {/* Reset Password Button */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            style={{
              height: '38px',
              padding: '0 14px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#1E293B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            <Key size={14} color="#64748B" />
            <span>Reset Password</span>
          </button>

          {/* Deactivate / Activate Button */}
          <button
            type="button"
            onClick={handleToggleUserStatus}
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

          {/* Save Changes Button */}
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

              {!isEditingPersonal ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData({ ...user });
                    setIsEditingPersonal(true);
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
                >
                  <Edit3 size={13} color="#64748B" />
                  <span>Edit</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePersonalInfo}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#EB5A1D',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Content: View or Edit Mode */}
            {!isEditingPersonal ? (
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
            ) : (
              /* Inline Edit Mode */
              <form onSubmit={handleSavePersonalInfo} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '4px' }}>
                <div>
                  <label style={editLabelStyle}>Full Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    style={editInputStyle}
                  />
                </div>
                <div>
                  <label style={editLabelStyle}>Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={editInputStyle}
                  />
                </div>
                <div>
                  <label style={editLabelStyle}>Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={editInputStyle}
                  />
                </div>
                <div>
                  <label style={editLabelStyle}>Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    style={editInputStyle}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="School Staff">School Staff</option>
                    <option value="Staff">Staff</option>
                    <option value="View Only">View Only</option>
                  </select>
                </div>
              </form>
            )}
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

            {/* List of 7 Modules with Toggle Switches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
              <ModuleToggleRow
                icon={BarChart2}
                iconColor="#0D9488"
                title="Dashboard"
                description="View system overview and analytics"
                enabled={moduleAccess.dashboard}
                onToggle={() => handleToggleModule('dashboard')}
              />

              <ModuleToggleRow
                icon={Users}
                iconColor="#0D9488"
                title="Students"
                description="View and manage student data"
                enabled={moduleAccess.students}
                onToggle={() => handleToggleModule('students')}
              />

              <ModuleToggleRow
                icon={ClipboardCheck}
                iconColor="#0D9488"
                title="Student Assessment"
                description="View assessment data and reports"
                enabled={moduleAccess.assessment}
                onToggle={() => handleToggleModule('assessment')}
              />

              <ModuleToggleRow
                icon={Calendar}
                iconColor="#0D9488"
                title="Monthly Tracking"
                description="View monthly tracking data"
                enabled={moduleAccess.tracking}
                onToggle={() => handleToggleModule('tracking')}
              />

              <ModuleToggleRow
                icon={Heart}
                iconColor="#EA580C"
                title="Health History"
                description="View student health history"
                enabled={moduleAccess.history}
                onToggle={() => handleToggleModule('history')}
              />

              <ModuleToggleRow
                icon={PieChart}
                iconColor="#64748B"
                title="Reports"
                description="Access reports and analytics"
                enabled={moduleAccess.reports}
                onToggle={() => handleToggleModule('reports')}
              />

              <ModuleToggleRow
                icon={Bell}
                iconColor="#EA580C"
                title="Notifications"
                description="Manage and send notifications"
                enabled={moduleAccess.notifications}
                onToggle={() => handleToggleModule('notifications')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= RESET PASSWORD MODAL ================= */}
      {showResetModal && (
        <div style={modalBackdropStyle} onClick={() => setShowResetModal(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} color="#EA580C" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Reset Password
                </h3>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '12px 0 16px 0' }}>
              Set a new temporary password for <strong>{user.name}</strong> ({user.email}).
            </p>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={editLabelStyle}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password (min. 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={editInputStyle}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  style={modalCancelBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={modalSubmitBtnStyle}
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= HELPER SUB-COMPONENT: MODULE TOGGLE ROW ================= */
function ModuleToggleRow({ icon: Icon, iconColor, title, description, enabled, onToggle }) {
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
        cursor: 'pointer'
      }}
      onClick={onToggle}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
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
