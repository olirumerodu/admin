import React, { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  AlertTriangle,
  UserCheck,
  X,
  Key,
  ShieldCheck,
  ArrowLeft
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

  // Form State - Real-time initialization
  const [fullName, setFullName] = useState('');
  // username = Login Username, auto-filled from email (readonly)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // userId = Sequential USR001 format, fetched from backend (readonly)
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // On-field Validation States
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

  // Dynamic Clusters & Schools from backend
  const [clustersList, setClustersList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [cluster, setCluster] = useState('');
  const [school, setSchool] = useState('');
  const [scopeType, setScopeType] = useState('cluster'); // 'cluster' or 'school'
  const [role, setRole] = useState('School Staff');

  // Confirmation Pop-up states
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);

  useEffect(() => {
    async function loadScope() {
      try {
        const [cData, sData, nextIdData] = await Promise.allSettled([
          api.getClusters(),
          api.getSchools(),
          api.getNextUserId()
        ]);
        if (cData.status === 'fulfilled' && Array.isArray(cData.value) && cData.value.length > 0) {
          setClustersList(cData.value);
          setCluster(cData.value[0].name || cData.value[0].id);
        }
        if (sData.status === 'fulfilled' && Array.isArray(sData.value) && sData.value.length > 0) {
          setSchoolsList(sData.value);
          setSchool('All Assigned Schools');
        }
        // Pre-fill User ID with next sequential USR-format ID
        if (nextIdData.status === 'fulfilled' && nextIdData.value?.next_user_id) {
          setUserId(nextIdData.value.next_user_id);
        } else {
          setUserId('USR001');
        }
      } catch (err) {
        console.warn('Scope loading notice:', err);
        setUserId('USR001');
      }
    }
    loadScope();
  }, []);

  // Filter schools in real-time based on the selected cluster from database
  const filteredSchools = React.useMemo(() => {
    if (!cluster || cluster === 'All Clusters') return schoolsList;
    const selectedClusterObj = clustersList.find(c => c.name === cluster || c.id === cluster);
    return schoolsList.filter(s => 
      (selectedClusterObj && s.cluster_id === selectedClusterObj.id) ||
      s.cluster_name === cluster ||
      s.cluster === cluster
    );
  }, [cluster, clustersList, schoolsList]);

  // Permissions State - default to full module access enabled for seamless integration
  const [permissions, setPermissions] = useState({
    dashboard: true,
    schools: true,
    students: true,
    assessment: true,
    tracking: true,
    history: true,
    reports: true,
    notifications: true,
  });

  // Change detection for unsaved confirmation dialog
  const hasEnteredDetails = Boolean(
    fullName.trim() !== '' ||
    email.trim() !== '' ||
    phone.trim() !== '' ||
    password !== '' ||
    confirmPassword !== '' ||
    scopeType !== 'cluster' ||
    role !== 'School Staff' ||
    Object.values(permissions).some(Boolean)
  );

  const handleAttemptBack = () => {
    if (hasEnteredDetails) {
      setShowLeaveConfirmModal(true);
    } else {
      onNavigateBack();
    }
  };

  const [isModulesExpanded, setIsModulesExpanded] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time password rules evaluation
  const passwordRules = [
    { id: 'minLen', label: '8 to 32 characters long', valid: password.length >= 8 && password.length <= 32 },
    { id: 'hasUpper', label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { id: 'hasLower', label: 'At least one lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { id: 'hasNum', label: 'At least one numeric digit (0-9)', valid: /[0-9]/.test(password) },
    { id: 'hasSpecial', label: 'At least one special character (!@#$%^&*...)', valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  // Field validator function with strict character length and invalid error messages
  const validateField = (name, value, values = {}) => {
    const val = (value !== undefined && value !== null) ? String(value).trim() : '';
    switch (name) {
      case 'fullName':
        if (!val) return 'Full name is required.';
        if (val.length < 3) return 'Full name must be at least 3 characters (3 to 50 characters allowed).';
        if (val.length > 50) return 'Full name cannot exceed 50 characters.';
        if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Full name can only contain letters, spaces, dots, and hyphens (no numbers or symbols).';
        return '';

      case 'email':
        if (!val) return 'Email address is required.';
        if (/\s/.test(val)) return 'Email address cannot contain spaces.';
        if (val.length > 64) return 'Email address cannot exceed 64 characters.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
          return 'Please enter a valid email address (e.g. name@domain.com).';
        }
        return '';

      case 'phone': {
        const cleanPhone = (value || '').replace(/\D/g, '');
        if (!cleanPhone) return 'Phone number is required.';
        if (cleanPhone.length !== 10) return `Phone number must be exactly 10 digits (${cleanPhone.length}/10 entered).`;
        if (!/^[6-9]/.test(cleanPhone)) return 'Phone number must start with 6, 7, 8, or 9 (valid Indian mobile number).';
        return '';
      }

      case 'userId':
        if (!val) return 'User ID is required.';
        if (!/^USR\d+$/i.test(val)) return 'User ID must be in USR001 format (auto-generated).';
        return '';

      case 'username':
        // Login username is auto-filled from email — validate as email
        if (!val) return 'Login username is required.';
        if (val.length > 64) return 'Login username cannot exceed 64 characters.';
        if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val)) {
          return 'Login username must be a valid email (auto-filled from Email field).';
        }
        return '';

      case 'password':
        if (!value) return 'Password is required.';
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (value.length > 32) return 'Password cannot exceed 32 characters.';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter (A-Z).';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter (a-z).';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one numeric digit (0-9).';
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) return 'Password must contain at least one special character (!@#$%^&*...).';
        return '';

      case 'confirmPassword': {
        const pwd = values.password !== undefined ? values.password : password;
        if (!value) return 'Please confirm your password.';
        if (value !== pwd) return 'Passwords do not match. Please verify both passwords are identical.';
        return '';
      }

      case 'cluster':
        if (!val) return 'Please select an assigned cluster.';
        return '';

      case 'school':
        if ((values.scopeType || scopeType) === 'school' && !val) {
          return 'Please select a specific school.';
        }
        return '';

      default:
        return '';
    }
  };

  // Validate entire form
  const validateAll = () => {
    const errs = {
      fullName: validateField('fullName', fullName),
      email: validateField('email', email),
      phone: validateField('phone', phone),
      userId: validateField('userId', userId),
      username: validateField('username', username),
      password: validateField('password', password),
      confirmPassword: validateField('confirmPassword', confirmPassword, { password }),
      cluster: validateField('cluster', cluster),
      school: validateField('school', school, { scopeType }),
    };

    if (selectedModulesList.length === 0) {
      errs.permissions = 'Please select at least one module permission.';
    }

    const clean = {};
    Object.keys(errs).forEach((k) => {
      if (errs[k]) clean[k] = errs[k];
    });
    return clean;
  };

  // Real-time Field change handler
  const handleFieldChange = (name, value) => {
    if (name === 'fullName') {
      setFullName(value);
    } else if (name === 'email') {
      setEmail(value);
      const cleanEmail = value.trim().toLowerCase();
      // Login Username is always auto-filled from email (readonly in UI)
      setUsername(cleanEmail);
      // Validate username live if touched
      if (touched.username || fieldErrors.username) {
        const uErr = validateField('username', cleanEmail, { password, scopeType });
        setFieldErrors((prev) => ({ ...prev, username: uErr }));
      }
    } else if (name === 'phone') {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 10);
      setPhone(cleanDigits);
      if (touched.phone || fieldErrors.phone) {
        const pErr = validateField('phone', cleanDigits, { password, scopeType });
        setFieldErrors((prev) => ({ ...prev, phone: pErr }));
      }
      return;
    } else if (name === 'userId') {
      setUserId(value);
    } else if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
      if (confirmPassword) {
        const cpErr = validateField('confirmPassword', confirmPassword, { password: value });
        setFieldErrors((prev) => ({ ...prev, confirmPassword: cpErr }));
      }
    } else if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else if (name === 'cluster') {
      setCluster(value);
    } else if (name === 'school') {
      setSchool(value);
    }

    // Live validation if field was touched or has an active error
    if (touched[name] || fieldErrors[name]) {
      const err = validateField(name, value, { password, scopeType });
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // On-blur handler to mark touched and validate immediately
  const handleBlur = (name, valOverride) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentVal =
      valOverride !== undefined
        ? valOverride
        : name === 'fullName'
        ? fullName
        : name === 'email'
        ? email
        : name === 'phone'
        ? phone
        : name === 'userId'
        ? userId
        : name === 'username'
        ? username
        : name === 'password'
        ? password
        : name === 'confirmPassword'
        ? confirmPassword
        : name === 'cluster'
        ? cluster
        : name === 'school'
        ? school
        : '';
    const err = validateField(name, currentVal, { password, scopeType });
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  // Helper for dynamic input container border and background style
  const getInputContainerStyle = (fieldName) => {
    const isTouched = Boolean(touched[fieldName]);
    const hasError = isTouched && Boolean(fieldErrors[fieldName]);
    const val =
      fieldName === 'fullName'
        ? fullName
        : fieldName === 'email'
        ? email
        : fieldName === 'phone'
        ? phone
        : fieldName === 'userId'
        ? userId
        : fieldName === 'username'
        ? username
        : fieldName === 'password'
        ? password
        : fieldName === 'confirmPassword'
        ? confirmPassword
        : fieldName === 'cluster'
        ? cluster
        : fieldName === 'school'
        ? school
        : '';
    const isValid = isTouched && !hasError && Boolean(val);

    return {
      height: '38px',
      border: hasError
        ? '1.5px solid #EF4444'
        : isValid
        ? '1.5px solid #10B981'
        : '1.5px solid #E2E8F0',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: '8px',
      backgroundColor: hasError ? '#FEF2F2' : isValid ? '#F0FDF4' : '#FFFFFF',
      boxSizing: 'border-box',
      transition: 'all 0.15s ease',
    };
  };


  // Toggle single permission
  const handleTogglePermission = (key) => {
    setPermissions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const hasAny = Object.values(next).some(Boolean);
      if (touched.permissions) {
        setFieldErrors((f) => ({
          ...f,
          permissions: hasAny ? '' : 'Please select at least one module permission.',
        }));
      }
      return next;
    });
  };

  // Toggle Select All permissions
  const allSelected = Object.values(permissions).every(Boolean);
  const handleToggleSelectAll = () => {
    const nextVal = !allSelected;
    setPermissions({
      dashboard: nextVal,
      schools: nextVal,
      students: nextVal,
      assessment: nextVal,
      tracking: nextVal,
      history: nextVal,
      reports: nextVal,
      notifications: nextVal,
    });
    if (touched.permissions) {
      setFieldErrors((f) => ({
        ...f,
        permissions: nextVal ? '' : 'Please select at least one module permission.',
      }));
    }
  };

  // Selected module names for live preview
  const selectedModulesList = [
    permissions.dashboard && 'Dashboard',
    permissions.schools && 'Schools',
    permissions.students && 'Students',
    permissions.assessment && 'Student Assessment',
    permissions.tracking && 'Monthly Tracking',
    permissions.history && 'Health History',
    permissions.reports && 'Reports',
    permissions.notifications && 'Notifications',
  ].filter(Boolean);

  // Initials for avatar preview
  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

  // Form Submit Handler: Validates and triggers confirmation pop-up
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Mark all as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      userId: true,
      username: true,
      password: true,
      confirmPassword: true,
      cluster: true,
      school: true,
      permissions: true,
    });

    const allErrors = validateAll();
    setFieldErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const firstErr = Object.values(allErrors)[0];
      setErrorMsg(firstErr || 'Please resolve the highlighted validation errors.');
      return;
    }

    // Open confirmation pop-up
    setShowCreateConfirm(true);
  };

  // Confirmed creation handler: persists in PostgreSQL backend
  const handleConfirmCreateUser = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const foundClusterId = clustersList.find(c => c.name === cluster || c.id === cluster)?.id;
      const assignedCluster = (cluster === 'All Clusters' || !cluster) ? null : (foundClusterId || null);
      // Login username is the email; User ID is the USR-format sequential ID
      const loginUsername = email.trim().toLowerCase();
      const finalPassword = password;

      const createdUser = await api.createUser({
        id: userId.trim() || undefined,   // USR001, USR002...
        username: loginUsername,          // email is the login username
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: role === 'Super Admin' ? 'admin' : 'health_officer',
        assigned_cluster_id: assignedCluster,
        school_name: scopeType === 'school' ? school : null,
        scope_type: scopeType,
        permissions: selectedModulesList,
        password: finalPassword,
        is_active: true
      });

      const newUserRecord = {
        id: createdUser.id || userId,
        name: createdUser.name,
        username: createdUser.username || loginUsername,
        email: createdUser.email,
        phone: createdUser.phone,
        rawPassword: finalPassword,
        cluster: cluster || (scopeType === 'cluster' ? 'All Clusters' : 'None'),
        school: scopeType === 'school' ? school : 'All Assigned Schools',
        role: role,
        status: 'Active',
        lastLoginDate: 'Just now',
        lastLoginTime: '',
        accessType: scopeType === 'cluster' ? 'Full Access' : 'Limited Access',
        permissions: selectedModulesList,
      };

      setCreatedUserData(newUserRecord);
      setShowCreateConfirm(false);
      setShowSuccessModal(true);
    } catch (err) {
      setShowCreateConfirm(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', textDecoration: 'none' }}
            onClick={handleAttemptBack}
          >
            User Management
          </span>
          <span>&gt;</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Create User</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleAttemptBack}
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
                color: '#475569',
                transition: 'all 0.15s ease'
              }}
              title="Go Back"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Create User
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Create accounts and control mobile application access
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleAttemptBack}
              style={{
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                height: '38px',
                padding: '0 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(235, 90, 29, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <UserPlus size={15} />
              <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
            </button>
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

      {/* ================= MAIN FORM ================= */}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                  <label style={inputLabelStyle}>
                    Full Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={getInputContainerStyle('fullName')}>
                    <User size={16} color={touched.fullName && fieldErrors.fullName ? '#EF4444' : touched.fullName && fullName && !fieldErrors.fullName ? '#10B981' : '#94A3B8'} />
                    <input
                      type="text"
                      placeholder="Enter full name (letters only)"
                      value={fullName}
                      maxLength={50}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      style={cleanInputStyle}
                    />
                    {touched.fullName && !fieldErrors.fullName && fullName && (
                      <Check size={14} color="#10B981" strokeWidth={2.5} />
                    )}
                    {touched.fullName && fieldErrors.fullName && (
                      <AlertCircle size={15} color="#EF4444" />
                    )}
                  </div>
                  {touched.fullName && fieldErrors.fullName && (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={12} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={inputLabelStyle}>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={getInputContainerStyle('email')}>
                    <Mail size={16} color={touched.email && fieldErrors.email ? '#EF4444' : touched.email && email && !fieldErrors.email ? '#10B981' : '#94A3B8'} />
                    <input
                      type="email"
                      placeholder="e.g. name@organization.org"
                      value={email}
                      maxLength={64}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      style={cleanInputStyle}
                    />
                    {touched.email && !fieldErrors.email && email && (
                      <Check size={14} color="#10B981" strokeWidth={2.5} />
                    )}
                    {touched.email && fieldErrors.email && (
                      <AlertCircle size={15} color="#EF4444" />
                    )}
                  </div>
                  {touched.email && fieldErrors.email && (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={12} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Phone Number & User ID */}
              <div style={twoColInputGrid}>
                <div>
                  <label style={inputLabelStyle}>
                    Phone Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={getInputContainerStyle('phone')}>
                    <Phone size={16} color={touched.phone && fieldErrors.phone ? '#EF4444' : touched.phone && phone.length === 10 ? '#10B981' : '#94A3B8'} />
                    <input
                      type="text"
                      placeholder="10-digit mobile number"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        handleFieldChange('phone', val);
                      }}
                      onBlur={() => handleBlur('phone')}
                      style={cleanInputStyle}
                    />
                    {touched.phone && !fieldErrors.phone && phone.length === 10 && (
                      <Check size={14} color="#10B981" strokeWidth={2.5} />
                    )}
                    {touched.phone && fieldErrors.phone && (
                      <AlertCircle size={15} color="#EF4444" />
                    )}
                  </div>
                  {touched.phone && fieldErrors.phone ? (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={12} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.phone}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', display: 'block' }}>
                      10-digit Indian mobile number (e.g. 9876543210)
                    </span>
                  )}
                </div>

                <div>
                  <label style={inputLabelStyle}>
                    User ID <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ ...getInputContainerStyle('userId'), border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <Key size={16} color="#64748B" />
                    <input
                      type="text"
                      placeholder="USR001"
                      value={userId}
                      readOnly
                      style={{ ...cleanInputStyle, color: '#334155', fontWeight: 600, cursor: 'default' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2.5: Login Username (auto-filled from email, readonly) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label style={{ ...inputLabelStyle, marginBottom: 0 }}>
                    Login Username <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span 
                    style={{ 
                      fontSize: '10.5px', 
                      color: '#059669', 
                      backgroundColor: '#ECFDF5', 
                      border: '1px solid #A7F3D0',
                      padding: '1px 7px', 
                      borderRadius: '99px', 
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Check size={11} strokeWidth={3} /> Auto-filled from Email
                  </span>
                </div>
                <div style={{ ...getInputContainerStyle('username'), border: username && !fieldErrors.username ? '1.5px solid #10B981' : '1.5px solid #E2E8F0', backgroundColor: '#F0FDF4' }}>
                  <Mail size={16} color={username && !fieldErrors.username ? '#10B981' : '#94A3B8'} />
                  <input
                    type="text"
                    placeholder="Auto-filled from Email field above"
                    value={username}
                    readOnly
                    style={{ ...cleanInputStyle, color: '#065F46', cursor: 'default' }}
                  />
                  {username && !fieldErrors.username && (
                    <Check size={14} color="#10B981" strokeWidth={2.5} />
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#059669', marginTop: '3px', display: 'block', fontWeight: 500 }}>
                  Login username is the Email ID entered above.
                </span>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div style={twoColInputGrid}>
                <div>
                  <label style={inputLabelStyle}>
                    Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={getInputContainerStyle('password')}>
                    <Lock size={16} color={touched.password && fieldErrors.password ? '#EF4444' : touched.password && password && !fieldErrors.password ? '#10B981' : '#94A3B8'} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create secure password (8–32 chars)"
                      value={password}
                      maxLength={32}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      style={cleanInputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={iconBtnStyle}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  {touched.password && fieldErrors.password && (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={12} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.password}</span>
                    </div>
                  )}

                  {/* Real-time Password Rules Checklist */}
                  <div 
                    style={{
                      marginTop: '8px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                      Password Creation Rules:
                    </div>
                    {passwordRules.map(rule => (
                      <div 
                        key={rule.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '11px', 
                          color: rule.valid ? '#059669' : '#64748B',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        {rule.valid ? (
                          <Check size={12} color="#059669" strokeWidth={3} style={{ flexShrink: 0 }} />
                        ) : (
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#CBD5E1', display: 'inline-block', margin: '0 3.5px', flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: rule.valid ? 600 : 400 }}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>
                    Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={getInputContainerStyle('confirmPassword')}>
                    <Lock size={16} color={touched.confirmPassword && fieldErrors.confirmPassword ? '#EF4444' : touched.confirmPassword && confirmPassword && !fieldErrors.confirmPassword ? '#10B981' : '#94A3B8'} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      maxLength={32}
                      onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      style={cleanInputStyle}
                    />
                    {touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword && (
                      <Check size={14} color="#10B981" strokeWidth={2.5} style={{ marginRight: '4px' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={iconBtnStyle}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                  {touched.confirmPassword && fieldErrors.confirmPassword ? (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={12} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.confirmPassword}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', display: 'block' }}>
                      Must match the password entered above exactly.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

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
                    <label style={inputLabelStyle}>
                      Cluster <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={getInputContainerStyle('cluster')}>
                      <User size={15} color={touched.cluster && fieldErrors.cluster ? '#EF4444' : '#94A3B8'} />
                      <select 
                        value={cluster} 
                        onChange={(e) => handleFieldChange('cluster', e.target.value)} 
                        onBlur={() => handleBlur('cluster')}
                        style={cleanSelectStyle}
                      >
                        <option value="">-- Select Cluster --</option>
                        {clustersList.length > 0 ? (
                          <>
                            <option value="All Clusters">All Clusters</option>
                            {clustersList.map(c => (
                              <option key={c.id || c.name} value={c.name}>{c.name}</option>
                            ))}
                          </>
                        ) : (
                          <option value="" disabled>No clusters available</option>
                        )}
                      </select>
                      {touched.cluster && !fieldErrors.cluster && cluster && (
                        <Check size={14} color="#10B981" strokeWidth={2.5} />
                      )}
                    </div>
                    {touched.cluster && fieldErrors.cluster && (
                      <div style={inlineErrorStyle}>
                        <AlertCircle size={12} style={{ flexShrink: 0 }} />
                        <span>{fieldErrors.cluster}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={inputLabelStyle}>
                      School {scopeType === 'school' && <span style={{ color: '#EF4444' }}>*</span>}
                    </label>
                    <div style={getInputContainerStyle('school')}>
                      <School size={15} color={touched.school && fieldErrors.school ? '#EF4444' : '#94A3B8'} />
                      <select 
                        value={scopeType === 'cluster' ? 'All Assigned Schools' : school} 
                        onChange={(e) => handleFieldChange('school', e.target.value)} 
                        onBlur={() => handleBlur('school')}
                        disabled={scopeType === 'cluster'}
                        style={{
                          ...cleanSelectStyle,
                          cursor: scopeType === 'cluster' ? 'default' : 'pointer',
                          color: scopeType === 'cluster' ? '#64748B' : '#0F172A'
                        }}
                      >
                        {scopeType === 'cluster' ? (
                          <option value="All Assigned Schools">
                            {cluster && cluster !== 'All Clusters' ? `All Schools in ${cluster}` : 'All Assigned Schools'}
                          </option>
                        ) : (
                          <>
                            <option value="">-- Select Specific School --</option>
                            {filteredSchools.map(s => (
                              <option key={s.id || s.name} value={s.name}>{s.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                      {touched.school && !fieldErrors.school && school && (
                        <Check size={14} color="#10B981" strokeWidth={2.5} />
                      )}
                    </div>
                    {touched.school && fieldErrors.school && (
                      <div style={inlineErrorStyle}>
                        <AlertCircle size={12} style={{ flexShrink: 0 }} />
                        <span>{fieldErrors.school}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={inputLabelStyle}>Allow access to: <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    {/* Radio 1: All schools in selected cluster */}
                    <label 
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}
                      onClick={() => {
                        setScopeType('cluster');
                        if (touched.school) {
                          setFieldErrors((prev) => ({ ...prev, school: '' }));
                        }
                      }}
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
                      onClick={() => {
                        setScopeType('school');
                        if (!school) {
                          setFieldErrors((prev) => ({ ...prev, school: 'Please select a specific school.' }));
                        }
                      }}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                <PermissionCheckboxRow
                  icon={LayoutGrid}
                  label="Dashboard"
                  checked={permissions.dashboard}
                  onChange={() => handleTogglePermission('dashboard')}
                />
                <PermissionCheckboxRow
                  icon={School}
                  label="Schools & Clusters"
                  checked={permissions.schools}
                  onChange={() => handleTogglePermission('schools')}
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

              {touched.permissions && fieldErrors.permissions && (
                <div style={{ ...inlineErrorStyle, marginTop: '8px' }}>
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>{fieldErrors.permissions}</span>
                </div>
              )}
            </div>

        {/* Bottom Form Actions Bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #ECEEF2',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
            marginTop: '4px'
          }}
        >
          <button
            type="button"
            onClick={handleAttemptBack}
            style={{
              height: '40px',
              padding: '0 20px',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
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
              height: '40px',
              padding: '0 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#EB5A1D',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(235, 90, 29, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={16} />
            <span>{isSubmitting ? 'Creating User...' : 'Create User'}</span>
          </button>
        </div>
      </form>

      {/* ================= UNSAVED CHANGES CONFIRMATION POP-UP MODAL ================= */}
      {showLeaveConfirmModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowLeaveConfirmModal(false)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FEF2F2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Discard Unsaved Changes?
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Unsaved user details will be lost
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowLeaveConfirmModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                You have entered details for this user account. If you leave now without submitting, all entered information will be discarded.
              </p>
            </div>

            {/* Modal Actions */}
            <div 
              style={{
                padding: '14px 20px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #ECEEF2',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Keep Editing
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirmModal(false);
                  onNavigateBack();
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)'
                }}
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRM USER CREATION POP-UP MODAL ================= */}
      {showCreateConfirm && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowCreateConfirm(false)}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #ECEEF2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#FFF7ED'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFEDD5',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Confirm User Creation
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Review user details before adding to database
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setShowCreateConfirm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                Are you sure you want to create a new user account with active login privileges?
              </p>

              <div 
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  fontSize: '12.5px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>User ID:</span>
                  <strong style={{ color: '#EA580C', fontFamily: 'monospace', fontSize: '13px' }}>{userId || email || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Full Name:</span>
                  <strong style={{ color: '#0F172A' }}>{fullName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Login Username:</span>
                  <strong style={{ color: '#0F172A' }}>{username || userId || email || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Email Address:</span>
                  <strong style={{ color: '#0F172A' }}>{email}</strong>
                </div>
                {phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Phone:</span>
                    <strong style={{ color: '#0F172A' }}>{phone}</strong>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Assigned Scope:</span>
                  <strong style={{ color: '#0F172A', textAlign: 'right' }}>{cluster || 'All Clusters'} ({school || 'All Schools'})</strong>
                </div>
              </div>

              {/* Login Notice */}
              <div 
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#1E40AF',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Key size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#2563EB' }} />
                <span>
                  <strong>Application Login:</strong> This user will immediately be able to log in to the mobile application using Username: <strong>{username || userId}</strong> (or User ID: <strong>{userId}</strong>) and password.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: '12px 20px 16px 20px',
                borderTop: '1px solid #ECEEF2',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}
            >
              <button
                type="button"
                onClick={() => setShowCreateConfirm(false)}
                style={{
                  padding: '9px 16px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel / Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateUser}
                disabled={isSubmitting}
                style={{
                  padding: '9px 20px',
                  backgroundColor: '#EB5A1D',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(235, 90, 29, 0.3)'
                }}
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Confirm & Create User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUCCESS CREDENTIALS MODAL ================= */}
      {showSuccessModal && createdUserData && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              padding: '24px'
            }}
          >
            <div 
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto'
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              User Created Successfully!
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px 0' }}>
              Account for <strong>{createdUserData.name}</strong> is live and active in PostgreSQL.
            </p>

            <div 
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '12.5px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>User ID:</span>
                <span style={{ backgroundColor: '#FFEDD5', color: '#C2410C', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                  {createdUserData.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Username:</span>
                <strong style={{ color: '#0F172A' }}>{createdUserData.username || createdUserData.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Password:</span>
                <strong style={{ color: '#0F172A', fontFamily: 'monospace' }}>{createdUserData.rawPassword}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Email:</span>
                <span style={{ color: '#334155' }}>{createdUserData.email}</span>
              </div>

            </div>

            <div 
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#15803D',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <Mail size={16} style={{ flexShrink: 0 }} />
              <span>Login credentials (Username & Initial Password) have been sent to <strong>{createdUserData.email}</strong>!</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onUserCreated) {
                  onUserCreated(createdUserData);
                } else if (onNavigateBack) {
                  onNavigateBack();
                }
              }}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#EB5A1D',
                border: 'none',
                borderRadius: '9px',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(235, 90, 29, 0.35)'
              }}
            >
              Done — Return to Users List
            </button>
          </div>
        </div>
      )}
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
        padding: '10px 14px',
        cursor: 'pointer',
        borderRadius: '8px',
        backgroundColor: checked ? '#FFF7ED' : '#F8FAFC',
        border: checked ? '1.5px solid #FDBA74' : '1px solid #E2E8F0',
        transition: 'all 0.15s ease'
      }}
      onClick={onChange}
    >
      <div 
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '5px',
          backgroundColor: checked ? '#EA580C' : '#FFFFFF',
          border: checked ? '1.5px solid #EA580C' : '1.5px solid #CBD5E1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          flexShrink: 0
        }}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </div>
      <Icon size={16} color={checked ? '#EA580C' : '#64748B'} style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: checked ? '#0F172A' : '#475569', fontWeight: checked ? 700 : 500 }}>{label}</span>
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


const inlineErrorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  marginTop: '4px',
  fontSize: '11.5px',
  color: '#DC2626',
  fontWeight: 500,
  lineHeight: 1.2
};

const inlineSuccessStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginTop: '3px',
  fontSize: '11px',
  color: '#16A34A',
  fontWeight: 500
};
