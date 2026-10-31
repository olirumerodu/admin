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
  Key,
  ShieldCheck,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { isClusterAdmin: isCallerClusterAdmin, assignedClusterIds, assignedSchoolIds } = useAuth();
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
  // Role: 'Cluster Administrator' | 'School Staff'
  const [role, setRole] = useState('Cluster Administrator');

  // Multi-cluster & schools manual selection state for Cluster Administrator
  const [selectedClusterIds, setSelectedClusterIds] = useState([]);
  const [clusterSchoolsScope, setClusterSchoolsScope] = useState({});
  const [assignClustersLater, setAssignClustersLater] = useState(false);

  // Quick cluster creation modal state
  const [showQuickCreateClusterModal, setShowQuickCreateClusterModal] = useState(false);
  const [quickClusterName, setQuickClusterName] = useState('');
  const [quickClusterError, setQuickClusterError] = useState('');
  const [isCreatingQuickCluster, setIsCreatingQuickCluster] = useState(false);

  // Confirmation Pop-up states
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [createdUserData, setCreatedUserData] = useState(null);

  const loadScope = async () => {
    try {
      const [cData, sData, nextIdData] = await Promise.allSettled([
        api.getClusters(),
        api.getSchools(),
        api.getNextUserId(role === 'Cluster Administrator' ? 'admin' : 'health_officer')
      ]);
      if (cData.status === 'fulfilled' && Array.isArray(cData.value)) {
        let availableClusters = cData.value;
        if (isCallerClusterAdmin && assignedClusterIds.length > 0) {
          const normAllowed = new Set(assignedClusterIds.map(x => String(x).toLowerCase().trim()));
          availableClusters = availableClusters.filter(c =>
            normAllowed.has(String(c.id).toLowerCase().trim()) || normAllowed.has(String(c.name).toLowerCase().trim())
          );
        }
        setClustersList(availableClusters);
        if (cData.value.length > 0 && selectedClusterIds.length === 0 && !assignClustersLater) {
          const firstClusterName = cData.value[0].name || cData.value[0].id;
          setCluster(firstClusterName);
          setSelectedClusterIds([firstClusterName]);
          setClusterSchoolsScope({ [firstClusterName]: { all: true, schools: [] } });
        }
      }
      if (sData.status === 'fulfilled' && Array.isArray(sData.value)) {
        let availableSchools = sData.value;
        if (isCallerClusterAdmin) {
          if (assignedSchoolIds.length > 0) {
            const normSchools = new Set(assignedSchoolIds.map(x => String(x).toLowerCase().trim()));
            availableSchools = availableSchools.filter(s =>
              normSchools.has(String(s.id).toLowerCase().trim()) ||
              normSchools.has(String(s.name).toLowerCase().trim()) ||
              (s.code && normSchools.has(String(s.code).toLowerCase().trim()))
            );
          } else if (assignedClusterIds.length > 0) {
            const normClusters = new Set(assignedClusterIds.map(x => String(x).toLowerCase().trim()));
            availableSchools = availableSchools.filter(s => {
              const sc = String(s.cluster_name || s.cluster || s.cluster_id || '').toLowerCase().trim();
              const sCId = String(s.cluster_id || '').toLowerCase().trim();
              return normClusters.has(sc) || normClusters.has(sCId);
            });
          }
        }
        setSchoolsList(availableSchools);
        if (sData.value.length > 0 && !school) {
          setSchool('All Assigned Schools');
        }
      }
      // Pre-fill ID with next sequential format (ADM001... for admin, USR001... for staff)
      if (nextIdData.status === 'fulfilled' && nextIdData.value?.next_user_id) {
        setUserId(nextIdData.value.next_user_id);
      } else if (!userId) {
        setUserId(role === 'Cluster Administrator' ? 'ADM001' : 'USR001');
      }
    } catch (err) {
      console.warn('Scope loading notice:', err);
      if (!userId) setUserId(role === 'Cluster Administrator' ? 'ADM001' : 'USR001');
    }
  };

  useEffect(() => {
    loadScope();
  }, []);

  const handleRoleChange = async (newRole) => {
    setRole(newRole);
    setFieldErrors(prev => ({ ...prev, cluster: '', school: '', userId: '' }));
    try {
      const backendRole = newRole === 'Cluster Administrator' ? 'admin' : 'health_officer';
      const idRes = await api.getNextUserId(backendRole);
      if (idRes?.next_user_id) {
        setUserId(idRes.next_user_id);
      } else {
        setUserId(newRole === 'Cluster Administrator' ? 'ADM001' : 'USR001');
      }
    } catch (err) {
      console.warn('Failed to refresh next ID for role:', err);
      setUserId(newRole === 'Cluster Administrator' ? 'ADM001' : 'USR001');
    }
  };

  const handleQuickCreateCluster = async (e) => {
    if (e) e.preventDefault();
    const cleanName = quickClusterName.trim();
    if (!cleanName) {
      setQuickClusterError('Cluster name is required.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      setQuickClusterError('Cluster name can only contain alphabetic letters.');
      return;
    }
    setIsCreatingQuickCluster(true);
    setQuickClusterError('');
    try {
      const newCluster = await api.createCluster({ name: cleanName });
      await loadScope();
      const cName = newCluster.name || cleanName;
      setSelectedClusterIds([cName]);
      setClusterSchoolsScope({ [cName]: { all: true, schools: [] } });
      setCluster(cName);
      setAssignClustersLater(false);
      setShowQuickCreateClusterModal(false);
      setQuickClusterName('');
      setFieldErrors((prev) => ({ ...prev, cluster: '', school: '' }));
    } catch (err) {
      setQuickClusterError(err.message || 'Failed to create cluster.');
    } finally {
      setIsCreatingQuickCluster(false);
    }
  };

  // Handlers for manual cluster & school selection for Cluster Administrator
  const handleToggleCluster = (clusterName) => {
    setSelectedClusterIds((prev) => {
      const exists = prev.includes(clusterName);
      if (exists) {
        return prev.filter(c => c !== clusterName);
      } else {
        return [...prev, clusterName];
      }
    });
    setClusterSchoolsScope((prev) => {
      if (prev[clusterName]) {
        const copy = { ...prev };
        delete copy[clusterName];
        return copy;
      } else {
        return {
          ...prev,
          [clusterName]: { all: true, schools: [] }
        };
      }
    });
  };

  const handleToggleAllSchoolsForCluster = (clusterName) => {
    setClusterSchoolsScope((prev) => {
      const current = prev[clusterName] || { all: true, schools: [] };
      return {
        ...prev,
        [clusterName]: {
          all: !current.all,
          schools: !current.all ? [] : current.schools
        }
      };
    });
  };

  const handleToggleSpecificSchool = (clusterName, schoolName) => {
    setClusterSchoolsScope((prev) => {
      const current = prev[clusterName] || { all: false, schools: [] };
      const currentSchools = current.schools || [];
      const exists = currentSchools.includes(schoolName);
      const updatedSchools = exists 
        ? currentSchools.filter(s => s !== schoolName)
        : [...currentSchools, schoolName];
      return {
        ...prev,
        [clusterName]: {
          all: false,
          schools: updatedSchools
        }
      };
    });
  };

  // Filter schools in real-time based on the selected cluster from database
  const filteredSchools = React.useMemo(() => {
    if (!cluster || cluster === 'All Clusters') return schoolsList || [];
    const selectedClusterObj = (clustersList || []).find(c => {
      if (!c) return false;
      if (typeof c === 'string') return c === cluster;
      return c.name === cluster || c.id === cluster;
    });
    return (schoolsList || []).filter(s => {
      if (!s) return false;
      if (typeof s === 'string') return true;
      return (
        (selectedClusterObj && s.cluster_id === selectedClusterObj.id) ||
        s.cluster_name === cluster ||
        s.cluster === cluster
      );
    });
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
        if (!val) return role === 'Cluster Administrator' ? 'Admin ID is required.' : 'User ID is required.';
        if (!/^(ADM|USR)\d+$/i.test(val)) {
          return role === 'Cluster Administrator'
            ? 'Admin ID must be in ADM001 format (auto-generated).'
            : 'User ID must be in USR001 format (auto-generated).';
        }
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
    };

    if (assignClustersLater || !selectedClusterIds || selectedClusterIds.length === 0) {
      // Valid: Created unassigned for now, scope can be assigned later
    } else {
      for (const cName of selectedClusterIds) {
        const sc = clusterSchoolsScope[cName];
        if (sc && !sc.all && (!sc.schools || sc.schools.length === 0)) {
          errs.school = `Please select at least one school for ${cName}, or select "All Schools".`;
          break;
        }
      }
    }

    if (!isClusterAdmin && selectedModulesList.length === 0) {
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
      // Login username is the email; User ID is the USR-format sequential ID
      const loginUsername = email.trim().toLowerCase();
      const finalPassword = password;

      let assignedClusters = [];
      let assignedSchools = null;
      let finalRole = 'health_officer';
      let finalScopeType = scopeType;
      let primaryClusterId = null;
      let primarySchoolName = null;

      finalRole = role === 'Cluster Administrator' ? 'admin' : 'health_officer';
      if (assignClustersLater || !selectedClusterIds || selectedClusterIds.length === 0) {
        assignedClusters = [];
        assignedSchools = null;
        primaryClusterId = null;
        primarySchoolName = null;
        finalScopeType = 'cluster';
      } else {
        const effectiveClusterIds = selectedClusterIds.filter((cName) => {
          const sc = clusterSchoolsScope && clusterSchoolsScope[cName];
          if (sc && !sc.all && (!Array.isArray(sc.schools) || sc.schools.length === 0)) {
            return false;
          }
          return true;
        });

        assignedClusters = Array.from(new Set(effectiveClusterIds.length > 0 ? effectiveClusterIds : selectedClusterIds));
        const specificSchools = [];
        const seenSchools = new Set();
        let hasManualSelection = false;

        selectedClusterIds.forEach((cName) => {
          const sc = clusterSchoolsScope && clusterSchoolsScope[cName];
          const cObj = (clustersList || []).find(cl => cl.name === cName || cl.id === cName);
          const cId = String(cObj?.id || '').toLowerCase().trim();
          const cNameLower = String(cName || '').toLowerCase().trim();

          const schoolsInCluster = (schoolsList || []).filter(s => {
            const sC = String(s.cluster_name || s.cluster || s.cluster_id || '').toLowerCase().trim();
            return sC === cNameLower || (cId && String(s.cluster_id || '').toLowerCase().trim() === cId);
          });
          const validNames = new Set(schoolsInCluster.map(s => String(s.name || '').toLowerCase().trim()));

          if (sc && !sc.all) {
            hasManualSelection = true;
            if (Array.isArray(sc.schools)) {
              sc.schools.forEach(s => {
                const trimmed = String(s || '').trim();
                if (trimmed && validNames.has(trimmed.toLowerCase()) && !seenSchools.has(trimmed.toLowerCase())) {
                  seenSchools.add(trimmed.toLowerCase());
                  specificSchools.push(trimmed);
                }
              });
            }
          }
        });
        assignedSchools = hasManualSelection && specificSchools.length > 0 ? specificSchools : null;
        primaryClusterId = clustersList.find(c => c.name === assignedClusters[0] || c.id === assignedClusters[0])?.id || assignedClusters[0] || null;
        primarySchoolName = assignedSchools && assignedSchools.length > 0 ? assignedSchools.join(', ') : null;
        finalScopeType = assignedSchools && assignedSchools.length > 0 ? 'school' : 'cluster';
      }

      const createdUser = await api.createUser({
        id: userId.trim() || undefined,   // USR001, USR002...
        username: loginUsername,          // email is the login username
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: finalRole,
        assigned_cluster_id: primaryClusterId,
        assigned_cluster_ids: assignedClusters,
        assigned_school_ids: assignedSchools,
        school_name: primarySchoolName,
        scope_type: finalScopeType,
        permissions: isClusterAdmin 
          ? ['Dashboard', 'Schools & Clusters', 'Students', 'Student Assessment', 'Monthly Tracking', 'Health History', 'Reports', 'Notifications']
          : selectedModulesList,
        password: finalPassword,
        is_active: true
      });

      const clusterDisplay = assignedClusters.length > 0
        ? assignedClusters.join(', ')
        : 'Unassigned (Pending Scope)';
      const schoolDisplay = assignedSchools && assignedSchools.length > 0
        ? assignedSchools.join(', ')
        : (assignedClusters.length > 0 ? 'All Assigned Schools' : 'Unassigned');

      const newUserRecord = {
        id: createdUser.id || userId,
        name: createdUser.name,
        username: createdUser.username || loginUsername,
        email: createdUser.email,
        phone: createdUser.phone,
        rawPassword: finalPassword,
        cluster: clusterDisplay,
        school: schoolDisplay,
        role: role,
        status: 'Active',
        lastLoginDate: 'Just now',
        lastLoginTime: '',
        accessType: finalRole === 'admin' ? 'Full Access' : (scopeType === 'cluster' ? 'Full Access' : 'Limited Access'),
        permissions: isClusterAdmin 
          ? ['Dashboard', 'Schools & Clusters', 'Students', 'Student Assessment', 'Monthly Tracking', 'Health History', 'Reports', 'Notifications']
          : selectedModulesList,
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

  const isClusterAdmin = role === 'Cluster Administrator';

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
          <span style={{ color: '#0F172A', fontWeight: 600 }}>{isClusterAdmin ? 'Create Administrator' : 'Create User'}</span>
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
                {isClusterAdmin ? 'Create Administrator' : 'Create User'}
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                {isClusterAdmin ? 'Create administrator accounts and assign cluster oversight' : 'Create accounts and control mobile application access'}
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
              <span>{isSubmitting ? (isClusterAdmin ? 'Creating Administrator...' : 'Creating User...') : (isClusterAdmin ? 'Create Administrator' : 'Create User')}</span>
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
          {/* Card 00: Account Role & Access Level */}
          <div style={formCardStyle}>
            <div style={cardHeaderRow}>
              <div style={{ ...sectionIconBox, backgroundColor: '#E0E7FF', color: '#4F46E5' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 style={sectionHeadingStyle}>00. Account Role & Access Level</h3>
                <p style={sectionSubStyle}>Select whether to create an Administrator or Staff user account.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginTop: '4px' }}>
              {/* Option 1: Cluster Administrator */}
              <div 
                onClick={() => handleRoleChange('Cluster Administrator')}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: role === 'Cluster Administrator' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: role === 'Cluster Administrator' ? '#F0F7FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: role === 'Cluster Administrator' ? '6px solid #2563EB' : '2px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                  marginTop: '2px'
                }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Cluster Administrator</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700 }}>Admin Login</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                    Manages one or more assigned clusters and specific schools. Experiences the same interface as Super Admin, dynamically scoped.
                  </div>
                </div>
              </div>

              {/* Option 2: School Staff */}
              <div 
                onClick={() => handleRoleChange('School Staff')}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  border: role === 'School Staff' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: role === 'School Staff' ? '#F0F7FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: role === 'School Staff' ? '6px solid #2563EB' : '2px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                  marginTop: '2px'
                }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>School Staff / Health Officer</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 700 }}>Staff Login</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                    Conducts health assessments and daily entry for a specific school or single cluster.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 01: Account Information */}
          <div style={formCardStyle}>
            <div style={cardHeaderRow}>
              <div style={{ ...sectionIconBox, backgroundColor: '#FFEDD5', color: '#EA580C' }}>
                <User size={18} />
              </div>
              <div>
                <h3 style={sectionHeadingStyle}>{isClusterAdmin ? '01. Administrator Information' : '01. Account Information'}</h3>
                <p style={sectionSubStyle}>{isClusterAdmin ? 'Enter basic details for the administrator account.' : 'Enter the basic details for the user account.'}</p>
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
                    {isClusterAdmin ? 'Admin ID' : 'User ID'} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ ...getInputContainerStyle('userId'), border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <Key size={16} color="#64748B" />
                    <input
                      type="text"
                      placeholder={isClusterAdmin ? "ADM001" : "USR001"}
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
                  <p style={sectionSubStyle}>
                    Manually select the clusters and specific schools this user will access.
                  </p>
                </div>
              </div>

              {/* Multi-cluster & Manual School Selection for all roles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {fieldErrors.cluster && (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.cluster}</span>
                    </div>
                  )}
                  {fieldErrors.school && (
                    <div style={inlineErrorStyle}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.school}</span>
                    </div>
                  )}

                  {clustersList.length === 0 ? (
                    /* Clean Informative Empty State when 0 clusters exist in system */
                    <div 
                      style={{
                        border: '1.5px dashed #CBD5E1',
                        borderRadius: '12px',
                        padding: '24px 20px',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: '#FFEDD5',
                        color: '#EA580C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Network size={24} />
                      </div>

                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                          No Clusters Found in System
                        </h4>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '480px', lineHeight: 1.5 }}>
                          No clusters or schools have been created in the database yet. You can create a cluster right now without leaving this page, or proceed with creating this Administrator with pending cluster assignment.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickClusterName('');
                            setQuickClusterError('');
                            setShowQuickCreateClusterModal(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#EA580C',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                          }}
                        >
                          <Plus size={15} strokeWidth={2.5} />
                          <span>Create Cluster Now</span>
                        </button>

                        <label 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            border: assignClustersLater ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                            backgroundColor: assignClustersLater ? '#EFF6FF' : '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: assignClustersLater ? '#1E40AF' : '#475569'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={assignClustersLater}
                            onChange={(e) => {
                              setAssignClustersLater(e.target.checked);
                              if (e.target.checked) {
                                setFieldErrors(prev => ({ ...prev, cluster: '', school: '' }));
                              }
                            }}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563EB' }}
                          />
                          <span>Assign clusters later (Create as Unassigned Admin)</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Top action row when clusters exist */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                          Select one or more clusters below. Under each selected cluster, you can assign <strong>All Schools</strong> or manually select specific schools:
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <label 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              color: assignClustersLater ? '#2563EB' : '#64748B'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={assignClustersLater}
                              onChange={(e) => {
                                setAssignClustersLater(e.target.checked);
                                if (e.target.checked) {
                                  setFieldErrors(prev => ({ ...prev, cluster: '', school: '' }));
                                }
                              }}
                              style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#2563EB' }}
                            />
                            <span>Assign clusters later (Skip for now)</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              setQuickClusterName('');
                              setQuickClusterError('');
                              setShowQuickCreateClusterModal(true);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EA580C',
                              fontSize: '12.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: 0
                            }}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                            <span>Add New Cluster</span>
                          </button>
                        </div>
                      </div>

                      {!assignClustersLater && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(clustersList || []).map((c, cIdx) => {
                            if (!c) return null;
                            const cName = typeof c === 'string' ? c : (c.name || c.id || '');
                            const isSelected = Array.isArray(selectedClusterIds) && selectedClusterIds.includes(cName);
                            const scope = (clusterSchoolsScope && clusterSchoolsScope[cName]) || { all: true, schools: [] };
                            const schoolsUnderCluster = (schoolsList || []).filter((s) => {
                              if (!s) return false;
                              if (typeof s === 'string') return true;
                              const cId = typeof c === 'object' ? c?.id : c;
                              const cNameStr = typeof c === 'object' ? c?.name : c;
                              return (
                                (cId && s.cluster_id === cId) ||
                                (s.cluster_name && cNameStr && s.cluster_name.toLowerCase() === cNameStr.toLowerCase()) ||
                                (s.cluster && cNameStr && s.cluster.toLowerCase() === cNameStr.toLowerCase())
                              );
                            });

                            return (
                              <div 
                                key={typeof c === 'object' ? (c.id || c.name || `cls-${cIdx}`) : c}
                          style={{
                            border: isSelected ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                            borderRadius: '12px',
                            backgroundColor: isSelected ? '#F8FAFC' : '#FFFFFF',
                            overflow: 'hidden',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Cluster Header Row */}
                          <div 
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                              borderBottom: isSelected ? '1px solid #DBEAFE' : 'none'
                            }}
                            onClick={() => handleToggleCluster(cName)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: isSelected ? 'none' : '1.5px solid #94A3B8',
                                backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF'
                              }}>
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#1E40AF' : '#1E293B' }}>
                                {c.name}
                              </span>
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                ({schoolsUnderCluster.length} {schoolsUnderCluster.length === 1 ? 'school' : 'schools'})
                              </span>
                            </div>

                            {isSelected && (
                              <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#2563EB' }}>
                                {scope.all ? 'All Schools in Cluster' : `${(scope.schools || []).filter(sName => schoolsUnderCluster.some(sch => (sch.name === sName || sch.id === sName))).length} ${(scope.schools || []).filter(sName => schoolsUnderCluster.some(sch => (sch.name === sName || sch.id === sName))).length === 1 ? 'School' : 'Schools'} Selected`}
                              </span>
                            )}
                          </div>

                          {/* Schools Option when cluster is checked */}
                          {isSelected && (
                            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {/* Option A: All Schools in this Cluster */}
                              <div 
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                onClick={() => handleToggleAllSchoolsForCluster(cName)}
                              >
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: scope.all ? '5px solid #2563EB' : '2px solid #CBD5E1',
                                  backgroundColor: '#FFFFFF',
                                  flexShrink: 0
                                }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                                  All Schools in {c.name}
                                </span>
                              </div>

                              {/* Option B: Manual Specific Schools Selection */}
                              <div 
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                onClick={() => {
                                  if (scope.all) handleToggleAllSchoolsForCluster(cName);
                                }}
                              >
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: !scope.all ? '5px solid #2563EB' : '2px solid #CBD5E1',
                                  backgroundColor: '#FFFFFF',
                                  flexShrink: 0
                                }} />
                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                                  Select specific schools manually ({schoolsUnderCluster.length} available)
                                </span>
                              </div>

                              {/* Manual Schools Grid when not 'all' */}
                              {!scope.all && (
                                <div style={{
                                  marginTop: '6px',
                                  padding: '10px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  borderRadius: '8px',
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}>
                                  {schoolsUnderCluster.length > 0 ? (
                                    schoolsUnderCluster.map((s, sIdx) => {
                                      if (!s) return null;
                                      const sName = typeof s === 'string' ? s : (s.name || '');
                                      const sKey = typeof s === 'string' ? s : (s.id || s.name || `sch-${sIdx}`);
                                      const isSchoolChecked = Array.isArray(scope.schools) && scope.schools.includes(sName);
                                      return (
                                        <div 
                                          key={sKey}
                                          onClick={() => handleToggleSpecificSchool(cName, sName)}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: isSchoolChecked ? '#EFF6FF' : 'transparent',
                                            transition: 'background-color 0.1s ease'
                                          }}
                                        >
                                          <div style={{
                                            width: '16px',
                                            height: '16px',
                                            borderRadius: '3px',
                                            border: isSchoolChecked ? 'none' : '1.5px solid #94A3B8',
                                            backgroundColor: isSchoolChecked ? '#2563EB' : '#FFFFFF',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#FFFFFF',
                                            flexShrink: 0
                                          }}>
                                            {isSchoolChecked && <Check size={12} strokeWidth={3} />}
                                          </div>
                                          <span style={{ fontSize: '13px', color: '#1E293B', fontWeight: isSchoolChecked ? 600 : 400 }}>
                                            {s.name} {s.code ? `(${s.code})` : ''}
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                                      No schools found under this cluster.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
            </div>

            {/* Section 03. Module Permissions (Hidden for Cluster Administrator) */}
            {!isClusterAdmin && (
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
            )}

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
            <span>{isSubmitting ? (isClusterAdmin ? 'Creating Administrator...' : 'Creating User...') : (isClusterAdmin ? 'Create Administrator' : 'Create User')}</span>
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
                    {isClusterAdmin ? 'Confirm Administrator Creation' : 'Confirm User Creation'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    {isClusterAdmin ? 'Review administrator details before adding to database' : 'Review user details before adding to database'}
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
                {isClusterAdmin 
                  ? 'Are you sure you want to create a new administrator account with cluster oversight privileges?'
                  : 'Are you sure you want to create a new user account with active login privileges?'}
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
                  <span style={{ color: '#64748B' }}>{isClusterAdmin ? 'Admin ID:' : 'User ID:'}</span>
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
                  <span style={{ color: '#64748B' }}>Account Role:</span>
                  <strong style={{ color: '#2563EB' }}>{role}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: '#64748B', flexShrink: 0 }}>Assigned Scope:</span>
                  <strong style={{ color: '#0F172A', textAlign: 'right', maxWidth: '65%' }}>
                    {role === 'Cluster Administrator'
                      ? (assignClustersLater || selectedClusterIds.length === 0
                          ? 'Unassigned (Will be assigned later)' 
                          : selectedClusterIds.join(', '))
                      : `${cluster || 'All Clusters'} (${school || 'All Schools'})`}
                  </strong>
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
                    <span>{isClusterAdmin ? 'Confirm & Create Administrator' : 'Confirm & Create User'}</span>
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
              {isClusterAdmin ? 'Administrator Created Successfully!' : 'User Created Successfully!'}
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
                <span style={{ color: '#64748B' }}>{isClusterAdmin ? 'Admin ID:' : 'User ID:'}</span>
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

      {/* Quick Create Cluster Modal */}
      {showQuickCreateClusterModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowQuickCreateClusterModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
              border: '1px solid #ECEEF2',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Network size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Cluster</h3>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Quickly add a cluster to system</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickCreateClusterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCluster}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Cluster Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Zone, Central District"
                  value={quickClusterName}
                  onChange={(e) => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setQuickClusterName(lettersOnly);
                    setQuickClusterError('');
                  }}
                  autoFocus
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: quickClusterError ? '1.5px solid #EF4444' : '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {quickClusterError && (
                  <div style={{ fontSize: '11.5px', color: '#EF4444', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{quickClusterError}</span>
                  </div>
                )}
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Only alphabetic letters and spaces are allowed.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowQuickCreateClusterModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuickCluster}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isCreatingQuickCluster ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isCreatingQuickCluster ? 'Creating...' : 'Create & Select'}
                </button>
              </div>
            </form>
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
