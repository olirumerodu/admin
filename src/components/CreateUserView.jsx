import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  RotateCw, 
  GraduationCap, 
  School, 
  Settings, 
  FileText, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  UserPlus, 
  LayoutGrid, 
  Users, 
  ClipboardCheck, 
  BarChart2, 
  Heart, 
  Upload, 
  Bell, 
  Network, 
  CheckCircle2, 
  AlertCircle 
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

export default function CreateUserView({ onNavigateBack, onUserCreated }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // Form State
  const [fullName, setFullName] = useState('Arun Kumar');
  const [email, setEmail] = useState('arun.kumar@school.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [userId, setUserId] = useState('USR009');
  const [password, setPassword] = useState('Admin@2026!');
  const [confirmPassword, setConfirmPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Access Scope State
  const [cluster, setCluster] = useState('Cluster A');
  const [school, setSchool] = useState('Greenwood Public School');
  const [scopeType, setScopeType] = useState('cluster'); // 'cluster' or 'school'

  // Permissions State
  const [permissions, setPermissions] = useState({
    dashboard: true,
    students: true,
    assessment: true,
    tracking: false,
    history: false,
    reports: true,
    notifications: true,
  });

  const [isModulesExpanded, setIsModulesExpanded] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate unique User ID
  const handleGenerateId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setUserId(`USR${randomNum}`);
  };

  // Generate secure password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
  };

  // Toggle single permission
  const handleTogglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle Select All permissions
  const allSelected = Object.values(permissions).every(Boolean);
  const handleToggleSelectAll = () => {
    const nextVal = !allSelected;
    setPermissions({
      dashboard: nextVal,
      students: nextVal,
      assessment: nextVal,
      tracking: nextVal,
      history: nextVal,
      reports: nextVal,
      notifications: nextVal,
    });
  };

  // Selected module names for live preview
  const selectedModulesList = [
    permissions.dashboard && 'Dashboard',
    permissions.students && 'Students',
    permissions.assessment && 'Student Assessment',
    permissions.tracking && 'Monthly Tracking',
    permissions.history && 'Health History',
    permissions.reports && 'Reports',
    permissions.notifications && 'Notifications',
  ].filter(Boolean);

  // Initials for avatar preview
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AK';

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter user full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter email address.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newUserRecord = {
        id: userId,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cluster: cluster,
        school: school,
        role: permissions.dashboard && permissions.reports ? 'Admin' : 'Staff',
        status: 'Active',
        lastLoginDate: 'Just now',
        lastLoginTime: '',
        accessType: scopeType === 'cluster' ? 'Full Access' : 'Limited Access',
        permissions: selectedModulesList,
      };

      if (onUserCreated) onUserCreated(newUserRecord);
      if (onNavigateBack) onNavigateBack();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* ================= BREADCRUMB & HEADER ================= */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', textDecoration: 'none' }}
            onClick={onNavigateBack}
          >
            User Management
          </span>
          <span>&gt;</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Create User</span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
          Create User
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
          Create accounts and control mobile application access
        </p>
      </div>

      {/* ================= STEPPER PROGRESS BAR ================= */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '8px 0',
          width: '100%',
          overflowX: 'auto'
        }}
      >
        {/* Step 01 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)'
            }}
          >
            01
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Account Information</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Basic user details</div>
          </div>
        </div>

        <div style={{ width: '60px', height: '1.5px', backgroundColor: '#E2E8F0' }} />

        {/* Step 02 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1.5px solid #CBD5E1',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            02
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Access Scope</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Cluster and school access</div>
          </div>
        </div>

        <div style={{ width: '60px', height: '1.5px', backgroundColor: '#E2E8F0' }} />

        {/* Step 03 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1.5px solid #CBD5E1',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            03
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Module Permissions</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Assign module access</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div 
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ================= MAIN 2-COLUMN FORM GRID ================= */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.85fr) minmax(0, 1fr)', gap: '16px', width: '100%', alignItems: 'start' }}>
        {/* LEFT COLUMN: Sections 01, 02, 03 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          {/* Card 01: Account Information */}
          <div style={formCardStyle}>
            <div style={cardHeaderRow}>
              <div style={{ ...sectionIconBox, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={sectionHeadingStyle}>01. Account Information</h3>
                <p style={sectionSubStyle}>Enter the basic details for the user account.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Row 1: Full Name & Email */}
              <div style={twoColInputGrid}>
                <div>
                  <label style={inputLabelStyle}>Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputContainerStyle}>
                    <User size={16} color="#94A3B8" />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={cleanInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>Email <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputContainerStyle}>
                    <Mail size={16} color="#94A3B8" />
                    <input
                      type="email"
                      required
                      placeholder="Enter email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={cleanInputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Phone Number & User ID */}
              <div style={twoColInputGrid}>
                <div>
                  <label style={inputLabelStyle}>Phone Number <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputContainerStyle}>
                    <Phone size={16} color="#94A3B8" />
                    <input
                      type="text"
                      required
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={cleanInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>User ID <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ ...inputContainerStyle, flex: 1, backgroundColor: '#F8FAFC' }}>
                      <User size={16} color="#94A3B8" />
                      <input
                        type="text"
                        required
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        style={cleanInputStyle}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateId}
                      style={generateBtnStyle}
                      title="Generate new unique User ID"
                    >
                      <RotateCw size={13} color="#EA580C" />
                      <span>Generate ID</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div style={twoColInputGrid}>
                <div>
                  <label style={inputLabelStyle}>Password <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ ...inputContainerStyle, flex: 1 }}>
                      <Lock size={16} color="#94A3B8" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={cleanInputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={iconBtnStyle}
                      >
                        {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      style={generateBtnStyle}
                      title="Generate secure random password"
                    >
                      <RotateCw size={13} color="#EA580C" />
                      <span>Generate Password</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>Confirm Password <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={inputContainerStyle}>
                    <Lock size={16} color="#94A3B8" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={cleanInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={iconBtnStyle}
                    >
                      {showConfirmPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Split Row: Section 02 (Access Scope) & Section 03 (Module Permissions) */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.05fr)', gap: '14px', width: '100%' }}>
            {/* Section 02. Access Scope */}
            <div style={formCardStyle}>
              <div style={cardHeaderRow}>
                <div style={{ ...sectionIconBox, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 style={sectionHeadingStyle}>02. Access Scope</h3>
                  <p style={sectionSubStyle}>Define the cluster and school access for this user.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={twoColInputGrid}>
                  <div>
                    <label style={inputLabelStyle}>Cluster <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={inputContainerStyle}>
                      <User size={15} color="#94A3B8" />
                      <select 
                        value={cluster} 
                        onChange={(e) => setCluster(e.target.value)} 
                        style={cleanSelectStyle}
                      >
                        <option value="Cluster A">Cluster A</option>
                        <option value="North Cluster">North Cluster</option>
                        <option value="East Cluster">East Cluster</option>
                        <option value="West Cluster">West Cluster</option>
                        <option value="Central Cluster">Central Cluster</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={inputLabelStyle}>School <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={inputContainerStyle}>
                      <School size={15} color="#94A3B8" />
                      <select 
                        value={school} 
                        onChange={(e) => setSchool(e.target.value)} 
                        style={cleanSelectStyle}
                      >
                        <option value="Greenwood Public School">Greenwood Public School</option>
                        <option value="Sunrise International School">Sunrise International School</option>
                        <option value="Riverdale Higher Secondary">Riverdale Higher Secondary</option>
                        <option value="Maple Leaf Public School">Maple Leaf Public School</option>
                        <option value="St. Mary's Matriculation School">St. Mary's Matriculation School</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>Allow access to: <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    {/* Radio 1: All schools in selected cluster */}
                    <label 
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}
                      onClick={() => setScopeType('cluster')}
                    >
                      <div 
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: scopeType === 'cluster' ? '5px solid #EA580C' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          marginTop: '2px',
                          flexShrink: 0,
                          transition: 'border 0.15s ease'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          All schools in selected cluster
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          User will have access to all schools under the selected cluster.
                        </div>
                      </div>
                    </label>

                    {/* Radio 2: Specific school */}
                    <label 
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}
                      onClick={() => setScopeType('school')}
                    >
                      <div 
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: scopeType === 'school' ? '5px solid #EA580C' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          marginTop: '2px',
                          flexShrink: 0,
                          transition: 'border 0.15s ease'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          Specific school
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          User will have access to the selected school only.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 03. Module Permissions */}
            <div style={formCardStyle}>
              <div style={cardHeaderRow}>
                <div style={{ ...sectionIconBox, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                  <Settings size={18} />
                </div>
                <div>
                  <h3 style={sectionHeadingStyle}>03. Module Permissions</h3>
                  <p style={sectionSubStyle}>Select the modules this user can access.</p>
                </div>
              </div>

              {/* Select All Row */}
              <div 
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
                onClick={handleToggleSelectAll}
              >
                <div 
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '5px',
                    backgroundColor: allSelected ? '#EA580C' : '#FFFFFF',
                    border: allSelected ? '1px solid #EA580C' : '1.5px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}
                >
                  {allSelected && <Check size={12} strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Select All</span>
              </div>

              {/* Module Checkbox Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <PermissionCheckboxRow
                  icon={LayoutGrid}
                  label="Dashboard"
                  checked={permissions.dashboard}
                  onChange={() => handleTogglePermission('dashboard')}
                />
                <PermissionCheckboxRow
                  icon={Users}
                  label="Students"
                  checked={permissions.students}
                  onChange={() => handleTogglePermission('students')}
                />
                <PermissionCheckboxRow
                  icon={ClipboardCheck}
                  label="Student Assessment"
                  checked={permissions.assessment}
                  onChange={() => handleTogglePermission('assessment')}
                />
                <PermissionCheckboxRow
                  icon={BarChart2}
                  label="Monthly Tracking"
                  checked={permissions.tracking}
                  onChange={() => handleTogglePermission('tracking')}
                />
                <PermissionCheckboxRow
                  icon={Heart}
                  label="Health History"
                  checked={permissions.history}
                  onChange={() => handleTogglePermission('history')}
                />
                <PermissionCheckboxRow
                  icon={Upload}
                  label="Reports"
                  checked={permissions.reports}
                  onChange={() => handleTogglePermission('reports')}
                />
                <PermissionCheckboxRow
                  icon={Bell}
                  label="Notifications"
                  checked={permissions.notifications}
                  onChange={() => handleTogglePermission('notifications')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: User Access Summary Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ ...formCardStyle, padding: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={17} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>User Access Summary</h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Review the details before creating the user.</p>
              </div>
            </div>

            {/* User Profile Pill Preview */}
            <div 
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FFEDD5',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#FFEDD5',
                  color: '#EA580C',
                  fontSize: '16px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {fullName || 'User Name'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', wordBreak: 'break-all' }}>
                  {email || 'email@school.com'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {phone || '+91 98765 43210'}
                </div>
              </div>
            </div>

            {/* Access Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* User ID */}
              <div style={summaryRowStyle}>
                <div style={summaryLeftStyle}>
                  <User size={15} color="#64748B" />
                  <span style={summaryLabelStyle}>User ID</span>
                </div>
                <span style={summaryValueStyle}>{userId}</span>
              </div>

              {/* Cluster */}
              <div style={summaryRowStyle}>
                <div style={summaryLeftStyle}>
                  <Network size={15} color="#64748B" />
                  <span style={summaryLabelStyle}>Cluster</span>
                </div>
                <span style={summaryValueStyle}>{cluster}</span>
              </div>

              {/* School */}
              <div style={summaryRowStyle}>
                <div style={summaryLeftStyle}>
                  <School size={15} color="#64748B" />
                  <span style={summaryLabelStyle}>School</span>
                </div>
                <span style={{ ...summaryValueStyle, maxWidth: '170px', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {school}
                </span>
              </div>

              {/* Modules Dropdown List */}
              <div>
                <div 
                  style={{ ...summaryRowStyle, cursor: 'pointer' }}
                  onClick={() => setIsModulesExpanded(!isModulesExpanded)}
                >
                  <div style={summaryLeftStyle}>
                    <LayoutGrid size={15} color="#64748B" />
                    <span style={summaryLabelStyle}>Modules</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={summaryValueStyle}>{selectedModulesList.length} selected</span>
                    {isModulesExpanded ? <ChevronUp size={14} color="#64748B" /> : <ChevronDown size={14} color="#64748B" />}
                  </div>
                </div>

                {/* Collapsible Orange Bullet List */}
                {isModulesExpanded && (
                  <div 
                    style={{
                      backgroundColor: '#FFF7ED',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {selectedModulesList.length > 0 ? (
                      selectedModulesList.map((mod) => (
                        <div key={mod} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155' }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#EA580C', display: 'inline-block' }} />
                          <span>{mod}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>No modules selected</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={onNavigateBack}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '9px',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1.4,
                  height: '42px',
                  backgroundColor: '#EB5A1D',
                  border: 'none',
                  borderRadius: '9px',
                  color: '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(235, 90, 29, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <UserPlus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Sub-component for individual permission row
function PermissionCheckboxRow({ icon: Icon, label, checked, onChange }) {
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '5px 4px',
        cursor: 'pointer'
      }}
      onClick={onChange}
    >
      <div 
        style={{
          width: '17px',
          height: '17px',
          borderRadius: '4px',
          backgroundColor: checked ? '#EA580C' : '#FFFFFF',
          border: checked ? '1px solid #EA580C' : '1.5px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0
        }}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </div>
      <Icon size={15} color="#64748B" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ================= STYLES ================= */

const formCardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '12px',
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  boxSizing: 'border-box'
};

const cardHeaderRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '14px'
};

const sectionIconBox = {
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const sectionHeadingStyle = {
  fontSize: '14.5px',
  fontWeight: 800,
  color: '#0F172A',
  margin: 0
};

const sectionSubStyle = {
  fontSize: '11.5px',
  color: '#64748B',
  margin: '2px 0 0 0'
};

const twoColInputGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  gap: '12px'
};

const inputLabelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#334155',
  display: 'block',
  marginBottom: '4px'
};

const inputContainerStyle = {
  height: '38px',
  border: '1.5px solid #E2E8F0',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 10px',
  gap: '8px',
  backgroundColor: '#FFFFFF',
  boxSizing: 'border-box'
};

const cleanInputStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '12.5px',
  color: '#0F172A',
  width: '100%',
  fontFamily: 'inherit'
};

const cleanSelectStyle = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '12px',
  color: '#0F172A',
  cursor: 'pointer',
  fontFamily: 'inherit'
};

const generateBtnStyle = {
  height: '38px',
  padding: '0 10px',
  backgroundColor: '#FFF7ED',
  border: '1px solid #FDBA74',
  borderRadius: '8px',
  color: '#EA580C',
  fontSize: '11.5px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const iconBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#94A3B8',
  cursor: 'pointer',
  padding: '2px',
  display: 'flex',
  alignItems: 'center'
};

const summaryRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  padding: '4px 0'
};

const summaryLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const summaryLabelStyle = {
  fontSize: '12.5px',
  color: '#64748B',
  fontWeight: 500
};

const summaryValueStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0F172A'
};
