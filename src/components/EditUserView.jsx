import React, { useState, useEffect, useMemo } from "react";
import {
  User, Mail, Phone, GraduationCap, School, Settings, FileText,
  Check, LayoutGrid, Users, ClipboardCheck,
  BarChart2, Heart, Bell, Network, AlertCircle, AlertTriangle,
  CheckCircle2, ArrowLeft, Save, ShieldCheck, CreditCard, Calendar,
  Lock, Eye, EyeOff, Plus, X
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
}

// Consistent design system tokens matching CreateUserView
const fCard = {
  backgroundColor: "#FFFFFF",
  borderRadius: "14px",
  border: "1px solid #ECEEF2",
  padding: "20px 22px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  boxSizing: "border-box"
};

const fHdr = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid #F1F5F9"
};

const lbl = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: "4px"
};

const inp = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#0F172A",
  backgroundColor: "transparent",
  width: "100%",
  minWidth: 0
};

const sel = {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: "13px",
  color: "#0F172A",
  backgroundColor: "transparent",
  width: "100%",
  cursor: "pointer",
  appearance: "none"
};

const errRow = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "11px",
  color: "#EF4444",
  marginTop: "3px"
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px"
};

export default function EditUserView({ user: initialUser, onNavigateBack, onUserUpdated }) {
  const { isClusterAdmin: isCallerClusterAdmin, assignedClusterIds, assignedSchoolIds } = useAuth();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  const parseRole = (r, userObj) => {
    if (!r) return "School Staff";
    const username = (userObj?.username || userObj?.raw?.username || "").toLowerCase();
    const email = (userObj?.email || userObj?.raw?.email || "").toLowerCase();
    const id = (userObj?.id || userObj?.raw?.id || "").toLowerCase();
    const isRootAdmin = username === "admin" || username === "ksvadmin" || email === "admin@gmail.com" || email === "admin@oehealth.org" || id.startsWith("admin");

    if (r === "admin" || r === "Super Admin") {
      if (isRootAdmin) return "Super Admin";
      return "Cluster Administrator";
    }
    if (r === "Cluster Admin" || r === "Cluster Administrator") return "Cluster Administrator";
    return "School Staff";
  };

  // Compute immutable snapshot of initial values for change detection
  const originalValues = useMemo(() => {
    const rawRole = parseRole(initialUser?.role, initialUser);
    let rawPerms = initialUser?.permissions || initialUser?.raw?.permissions;
    if (typeof rawPerms === 'string') {
      try {
        rawPerms = JSON.parse(rawPerms);
      } catch {
        rawPerms = rawPerms.replace(/[{}"']/g, '').split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    let initialPerms;
    if (Array.isArray(rawPerms) && rawPerms.length > 0) {
      const norm = rawPerms.map(p => String(p).toLowerCase().trim());
      initialPerms = {
        dashboard: norm.some(p => p.includes("dashboard")),
        schools: norm.some(p => p.includes("school") || p.includes("cluster")),
        students: norm.some(p => p.includes("student") && !p.includes("assessment")),
        assessment: norm.some(p => p.includes("assessment")),
        tracking: norm.some(p => p.includes("tracking")),
        history: norm.some(p => p.includes("history")),
        reports: norm.some(p => p.includes("report")),
        notifications: norm.some(p => p.includes("notification")),
      };
    } else {
      const isAdmin = rawRole === "Super Admin";
      initialPerms = {
        dashboard: true,
        schools: true,
        students: true,
        assessment: true,
        tracking: true,
        history: true,
        reports: true,
        notifications: true,
      };
    }

    const initialScope = initialUser?.scopeType || initialUser?.scope_type || initialUser?.raw?.scope_type ||
      (initialUser?.accessType === "Limited Access" ||
      (initialUser?.school && initialUser.school !== "All Assigned Schools" && initialUser.school !== "All Schools")
        ? "school"
        : "cluster");

    const rawStatus = initialUser?.status || (initialUser?.raw?.is_active !== false ? "Active" : "Inactive");

    // Multi-cluster & schools scope for Cluster Administrator
    let initialClusterIds = [];
    let rawClusterTokens = initialUser?.assigned_cluster_ids ?? initialUser?.raw?.assigned_cluster_ids;
    if (typeof rawClusterTokens === 'string') {
      try {
        const parsed = JSON.parse(rawClusterTokens);
        if (Array.isArray(parsed)) rawClusterTokens = parsed;
        else rawClusterTokens = rawClusterTokens.split(',').map(c => c.trim()).filter(Boolean);
      } catch {
        rawClusterTokens = rawClusterTokens.split(',').map(c => c.trim()).filter(Boolean);
      }
    }
    if (Array.isArray(rawClusterTokens) && rawClusterTokens.length > 0) {
      initialClusterIds = Array.from(new Set(rawClusterTokens.map(c => String(c || '').trim()).filter(Boolean)));
    } else if (initialUser?.cluster && initialUser.cluster !== 'All Clusters' && initialUser.cluster !== 'Unassigned (Pending Scope)' && !/^[0-9a-fA-F-]{20,}/.test(initialUser.cluster)) {
      initialClusterIds = Array.from(new Set(initialUser.cluster.split(',').map(c => c.trim()).filter(Boolean)));
    } else if (initialUser?.assigned_cluster_id && initialUser.assigned_cluster_id !== 'All Clusters' && initialUser.assigned_cluster_id !== 'all') {
      initialClusterIds = [initialUser.assigned_cluster_id];
    }

    let initialSchoolsScope = {};
    let parsedSchoolIds = initialUser?.assigned_school_ids ?? initialUser?.raw?.assigned_school_ids;
    if (typeof parsedSchoolIds === 'string') {
      try {
        const parsed = JSON.parse(parsedSchoolIds);
        if (Array.isArray(parsed)) parsedSchoolIds = parsed;
        else parsedSchoolIds = parsedSchoolIds.split(',').map(s => s.trim()).filter(Boolean);
      } catch {
        parsedSchoolIds = parsedSchoolIds.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (!parsedSchoolIds && initialUser?.school && initialUser.school !== 'All Assigned Schools' && initialUser.school !== 'All Schools' && initialUser.school !== 'All Schools in Cluster') {
      parsedSchoolIds = initialUser.school.split(',').map(s => s.trim()).filter(Boolean);
    }

    const rawSchoolList = Array.isArray(parsedSchoolIds)
      ? Array.from(new Set(parsedSchoolIds.map(s => String(s || '').trim()).filter(Boolean)))
      : [];

    if (rawSchoolList.length > 0) {
      initialClusterIds.forEach(c => {
        initialSchoolsScope[c] = { all: false, schools: rawSchoolList };
      });
    } else {
      initialClusterIds.forEach(c => {
        initialSchoolsScope[c] = { all: true, schools: [] };
      });
    }

    const initialAssignLater = rawRole === "Cluster Administrator" && initialClusterIds.length === 0;

    return {
      fullName: initialUser?.name || "",
      email: initialUser?.email || "",
      phone: (initialUser?.phone || "").replace(/\D/g, "").slice(0, 10),
      role: rawRole,
      status: rawStatus,
      cluster: (!initialUser?.cluster || initialUser.cluster === "All Clusters" || /^[0-9a-fA-F-]{20,}/.test(initialUser.cluster))
        ? "All Clusters"
        : initialUser.cluster,
      school: initialUser?.school || "All Assigned Schools",
      scopeType: initialScope,
      permissions: initialPerms,
      joinedOn: initialUser?.joinedOn || initialUser?.createdAtFormatted || "",
      lastLoginDate: initialUser?.lastLoginDate || "",
      lastLoginTime: initialUser?.lastLoginTime || "",
      selectedClusterIds: initialClusterIds,
      clusterSchoolsScope: initialSchoolsScope,
      assignClustersLater: initialAssignLater,
    };
  }, [initialUser]);

  // Form states pre-filled with existing user data
  const [fullName, setFullName] = useState(originalValues.fullName);
  const [email, setEmail] = useState(originalValues.email);
  const [phone, setPhone] = useState(originalValues.phone);
  const [role, setRole] = useState(originalValues.role);
  const [status, setStatus] = useState(originalValues.status);
  const [cluster, setCluster] = useState(originalValues.cluster);
  const [school, setSchool] = useState(originalValues.school);
  const [scopeType, setScopeType] = useState(originalValues.scopeType);
  const [permissions, setPermissions] = useState(originalValues.permissions);

  // Multi-cluster & schools manual selection state for Cluster Administrator
  const [selectedClusterIds, setSelectedClusterIds] = useState(originalValues.selectedClusterIds);
  const [clusterSchoolsScope, setClusterSchoolsScope] = useState(originalValues.clusterSchoolsScope);
  const [assignClustersLater, setAssignClustersLater] = useState(originalValues.assignClustersLater);

  // Quick cluster creation modal state
  const [showQuickCreateClusterModal, setShowQuickCreateClusterModal] = useState(false);
  const [quickClusterName, setQuickClusterName] = useState("");
  const [quickClusterError, setQuickClusterError] = useState("");
  const [isCreatingQuickCluster, setIsCreatingQuickCluster] = useState(false);

  // Password editing states (optional: leave blank to preserve existing password)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time password rules evaluation
  const passwordRules = [
    { id: 'minLen', label: '8 to 32 characters long', valid: password.length >= 8 && password.length <= 32 },
    { id: 'hasUpper', label: 'At least one uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { id: 'hasLower', label: 'At least one lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { id: 'hasNum', label: 'At least one numeric digit (0-9)', valid: /[0-9]/.test(password) },
    { id: 'hasSpecial', label: 'At least one special character (!@#$%^&*...)', valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];

  // Auto-filled login username derived from email
  const loginUsername = useMemo(() => (email || "").trim().toLowerCase(), [email]);
  const userId = initialUser?.id || "USR001";

  // Form helper states
  const [clustersList, setClustersList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAttemptBack = () => {
    if (hasChanges) {
      setShowLeaveConfirmModal(true);
    } else {
      onNavigateBack();
    }
  };

  // Sync state if initialUser changes
  useEffect(() => {
    setFullName(originalValues.fullName);
    setEmail(originalValues.email);
    setPhone(originalValues.phone);
    setRole(originalValues.role);
    setStatus(originalValues.status);
    setCluster(originalValues.cluster);
    setSchool(originalValues.school);
    setScopeType(originalValues.scopeType);
    setPermissions(originalValues.permissions);
    setSelectedClusterIds(originalValues.selectedClusterIds);
    setClusterSchoolsScope(originalValues.clusterSchoolsScope);
    setAssignClustersLater(originalValues.assignClustersLater);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched({});
    setFieldErrors({});
    setErrorMsg("");
  }, [originalValues]);

  // Load cluster and school options
  const loadScope = async () => {
    try {
      const [cData, sData] = await Promise.allSettled([api.getClusters(), api.getSchools()]);
      if (cData.status === "fulfilled" && Array.isArray(cData.value)) {
        let availableClusters = cData.value;
        if (isCallerClusterAdmin && assignedClusterIds.length > 0) {
          const normAllowed = new Set(assignedClusterIds.map(x => String(x).toLowerCase().trim()));
          availableClusters = availableClusters.filter(c =>
            normAllowed.has(String(c.id).toLowerCase().trim()) || normAllowed.has(String(c.name).toLowerCase().trim())
          );
        }
        setClustersList(availableClusters);

        // Normalize selectedClusterIds so that any UUID tokens are resolved to actual cluster names
        setSelectedClusterIds(prev => {
          return (prev || []).map(token => {
            const matched = availableClusters.find(c => c.id === token || c.name === token);
            return matched ? matched.name : token;
          });
        });

        const rawCluster = initialUser?.raw?.assigned_cluster_id || initialUser?.raw?.cluster_name || initialUser?.cluster;
        if (rawCluster && rawCluster !== "All Clusters") {
          const matched = cData.value.find(c => c.id === rawCluster || c.name === rawCluster);
          if (matched) {
            setCluster(matched.name);
          }
        }
      }
      if (sData.status === "fulfilled" && Array.isArray(sData.value)) {
        const sList = sData.value;
        const cList = (cData.status === "fulfilled" && Array.isArray(cData.value)) ? cData.value : clustersList;
        setSchoolsList(sList);

        // Partition user's initial schools per cluster accurately
        let rawSchools = initialUser?.assigned_school_ids ?? initialUser?.raw?.assigned_school_ids;
        if (typeof rawSchools === 'string') {
          try {
            const parsed = JSON.parse(rawSchools);
            if (Array.isArray(parsed)) rawSchools = parsed;
            else rawSchools = rawSchools.split(',').map(s => s.trim()).filter(Boolean);
          } catch {
            rawSchools = rawSchools.split(',').map(s => s.trim()).filter(Boolean);
          }
        } else if (!rawSchools && initialUser?.school && initialUser.school !== 'All Assigned Schools' && initialUser.school !== 'All Schools' && initialUser.school !== 'All Schools in Cluster') {
          rawSchools = initialUser.school.split(',').map(s => s.trim()).filter(Boolean);
        }

        const candidateSchools = Array.isArray(rawSchools) ? rawSchools.map(s => String(s || '').trim()).filter(Boolean) : [];

        if (candidateSchools.length > 0) {
          setClusterSchoolsScope(prev => {
            const nextScope = { ...prev };
            Object.keys(nextScope).forEach(cName => {
              const cObj = (cList || []).find(cl => cl.name === cName || cl.id === cName);
              const cId = String(cObj?.id || '').toLowerCase().trim();
              const cNameLower = String(cName || '').toLowerCase().trim();

              const schoolsInCluster = sList.filter(s => {
                const sC = String(s.cluster_name || s.cluster || s.cluster_id || '').toLowerCase().trim();
                return sC === cNameLower || (cId && String(s.cluster_id || '').toLowerCase().trim() === cId);
              });

              const validSchoolNames = new Set(schoolsInCluster.map(s => String(s.name || '').toLowerCase().trim()));
              const matchedSchools = candidateSchools.filter(s => validSchoolNames.has(String(s).toLowerCase().trim()));

              if (matchedSchools.length > 0) {
                nextScope[cName] = {
                  all: matchedSchools.length === schoolsInCluster.length && schoolsInCluster.length > 0,
                  schools: matchedSchools
                };
              } else {
                nextScope[cName] = {
                  all: true,
                  schools: []
                };
              }
            });
            return nextScope;
          });
        }
      }
    } catch (err) {
      console.warn("Scope load error:", err);
    }
  };

  useEffect(() => {
    loadScope();
  }, []);

  const handleQuickCreateCluster = async (e) => {
    if (e) e.preventDefault();
    const cleanName = quickClusterName.trim();
    if (!cleanName) {
      setQuickClusterError("Cluster name is required.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(cleanName)) {
      setQuickClusterError("Cluster name can only contain alphabetic letters.");
      return;
    }
    setIsCreatingQuickCluster(true);
    setQuickClusterError("");
    try {
      const newCluster = await api.createCluster({ name: cleanName });
      await loadScope();
      const cName = newCluster.name || cleanName;
      setSelectedClusterIds((prev) => {
        if (!prev.includes(cName)) return [...prev, cName];
        return prev;
      });
      setClusterSchoolsScope((prev) => ({
        ...prev,
        [cName]: { all: true, schools: [] }
      }));
      setCluster(cName);
      setAssignClustersLater(false);
      setShowQuickCreateClusterModal(false);
      setQuickClusterName("");
      setFieldErrors((prev) => ({ ...prev, cluster: "", school: "" }));
    } catch (err) {
      setQuickClusterError(err.message || "Failed to create cluster.");
    } finally {
      setIsCreatingQuickCluster(false);
    }
  };

  // Handlers for manual cluster & school selection for Cluster Administrator
  const handleToggleCluster = (clusterName) => {
    setSelectedClusterIds((prev) => {
      const exists = prev.includes(clusterName);
      const next = exists ? prev.filter(c => c !== clusterName) : [...prev, clusterName];
      if (next.length === 0) {
        setAssignClustersLater(true);
      } else {
        setAssignClustersLater(false);
      }
      return next;
    });
    setFieldErrors(prev => ({ ...prev, cluster: '', school: '' }));
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
  const filteredSchools = useMemo(() => {
    if (!cluster || cluster === "All Clusters") return schoolsList || [];
    const selectedClusterObj = (clustersList || []).find(c => {
      if (!c) return false;
      if (typeof c === "string") return c === cluster;
      return c.name === cluster || c.id === cluster;
    });
    return (schoolsList || []).filter(s => {
      if (!s) return false;
      if (typeof s === "string") return true;
      return (
        (selectedClusterObj && s.cluster_id === selectedClusterObj.id) ||
        s.cluster_name === cluster ||
        s.cluster === cluster
      );
    });
  }, [cluster, clustersList, schoolsList]);

  // Validation function matching CreateUserView
  const validateField = (name, value) => {
    const val = String(value || "").trim();
    if (name === "fullName") {
      if (!val) return "Full name is required.";
      if (val.length < 3) return "Full name must be at least 3 characters.";
      if (val.length > 50) return "Full name cannot exceed 50 characters.";
      if (!/^[a-zA-Z\s.'"-]+$/.test(val)) return "Full name can only contain letters, spaces, dots, and hyphens.";
      return "";
    }
    if (name === "email") {
      if (!val) return "Email address is required.";
      if (/\s/.test(val)) return "Email cannot contain spaces.";
      if (val.length > 64) return "Email cannot exceed 64 characters.";
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
        return "Please enter a valid email address (e.g. name@domain.com).";
      }
      return "";
    }
    if (name === "phone") {
      const digits = (value || "").replace(/\D/g, "");
      if (!digits) return "Phone number is required.";
      if (digits.length !== 10) return `Phone must be exactly 10 digits (${digits.length}/10 entered).`;
      if (!/^[6-9]/.test(digits)) return "Phone must start with 6, 7, 8, or 9.";
      return "";
    }
    if (name === "cluster") {
      if (!val) return "Please select an assigned cluster.";
      return "";
    }
    if (name === "school" && scopeType === "school") {
      if (!val || val === "All Assigned Schools") return "Please select a specific school.";
      return "";
    }
    if (name === "password") {
      if (!val) return ""; // Optional in edit mode
      if (val.length < 8) return "Password must be at least 8 characters long.";
      if (val.length > 32) return "Password cannot exceed 32 characters.";
      if (!/[A-Z]/.test(val)) return "Password must contain at least one uppercase letter (A-Z).";
      if (!/[a-z]/.test(val)) return "Password must contain at least one lowercase letter (a-z).";
      if (!/[0-9]/.test(val)) return "Password must contain at least one numeric digit (0-9).";
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val)) return "Password must contain at least one special character (!@#$%^&*...).";
      return "";
    }
    if (name === "confirmPassword") {
      if (!password) return "";
      if (!val) return "Please confirm the new password.";
      if (val !== password) return "Passwords do not match. Please verify both passwords are identical.";
      return "";
    }
    return "";
  };

  const handleBlur = (name, value) => {
    setTouched(p => ({ ...p, [name]: true }));
    setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }));
  };

  const handleFieldChange = (name, value) => {
    if (name === "fullName") setFullName(value);
    else if (name === "email") setEmail(value);
    else if (name === "phone") setPhone(value.replace(/\D/g, "").slice(0, 10));
    else if (name === "role") setRole(value);
    else if (name === "status") setStatus(value);
    else if (name === "cluster") {
      setCluster(value);
      if (scopeType === "school") setSchool("");
    }
    else if (name === "school") setSchool(value);
    else if (name === "password") {
      setPassword(value);
      if (confirmPassword) {
        const cpErr = value !== confirmPassword ? "Passwords do not match. Please verify both passwords are identical." : "";
        setFieldErrors(p => ({ ...p, confirmPassword: cpErr }));
      }
    }
    else if (name === "confirmPassword") {
      setConfirmPassword(value);
      const cpErr = value !== password ? "Passwords do not match. Please verify both passwords are identical." : "";
      setFieldErrors(p => ({ ...p, confirmPassword: cpErr }));
    }

    if (touched[name] || fieldErrors[name]) {
      setFieldErrors(p => ({ ...p, [name]: validateField(name, value) }));
    }
  };

  // CHANGE DETECTION: Compares current state with original snapshot.
  // Save Changes button is strictly enabled ONLY when changes are detected!
  const hasChanges = useMemo(() => {
    if (password.trim() !== "" || confirmPassword.trim() !== "") return true;
    if (fullName.trim() !== originalValues.fullName.trim()) return true;
    if (email.trim().toLowerCase() !== originalValues.email.trim().toLowerCase()) return true;
    if (phone.replace(/\D/g, "") !== originalValues.phone) return true;
    if (role !== originalValues.role) return true;
    if (status !== originalValues.status) return true;

    if (assignClustersLater !== originalValues.assignClustersLater) return true;
    const curSorted = [...selectedClusterIds].sort();
    const origSorted = [...(originalValues.selectedClusterIds || [])].sort();
    if (JSON.stringify(curSorted) !== JSON.stringify(origSorted)) return true;
    if (JSON.stringify(clusterSchoolsScope) !== JSON.stringify(originalValues.clusterSchoolsScope || {})) return true;
    if (cluster !== originalValues.cluster) return true;
    if (school !== originalValues.school) return true;
    if (scopeType !== originalValues.scopeType) return true;

    for (const k of Object.keys(originalValues.permissions)) {
      if (Boolean(permissions[k]) !== Boolean(originalValues.permissions[k])) return true;
    }
    return false;
  }, [
    password, confirmPassword, fullName, email, phone, role, status,
    cluster, school, scopeType, permissions, originalValues,
    assignClustersLater, selectedClusterIds, clusterSchoolsScope
  ]);

  // Permission toggles
  const handleTogglePermission = (key) => setPermissions(p => ({ ...p, [key]: !p[key] }));
  const allSelected = Object.values(permissions).every(Boolean);
  const handleToggleSelectAll = () => {
    const next = !allSelected;
    setPermissions({
      dashboard: next,
      schools: next,
      students: next,
      assessment: next,
      tracking: next,
      history: next,
      reports: next,
      notifications: next,
    });
  };

  const selectedModulesList = [
    permissions.dashboard && "Dashboard",
    permissions.schools && "Schools",
    permissions.students && "Students",
    permissions.assessment && "Student Assessment",
    permissions.tracking && "Monthly Tracking",
    permissions.history && "Health History",
    permissions.reports && "Reports",
    permissions.notifications && "Notifications",
  ].filter(Boolean);

  const moduleList = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={15}/>, color: "#3B82F6" },
    { key: "schools", label: "Schools & Clusters", icon: <School size={15}/>, color: "#EA580C" },
    { key: "students", label: "Students", icon: <Users size={15}/>, color: "#8B5CF6" },
    { key: "assessment", label: "Student Assessment", icon: <ClipboardCheck size={15}/>, color: "#10B981" },
    { key: "tracking", label: "Monthly Tracking", icon: <BarChart2 size={15}/>, color: "#F59E0B" },
    { key: "history", label: "Health History", icon: <Heart size={15}/>, color: "#EF4444" },
    { key: "reports", label: "Reports & Export", icon: <FileText size={15}/>, color: "#0EA5E9" },
    { key: "notifications", label: "Notifications", icon: <Bell size={15}/>, color: "#EC4899" },
  ];

  // Submit Handler
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg("");

    // Validate all fields
    const errs = {};
    const ef = validateField("fullName", fullName);
    const ee = validateField("email", email);
    const ep = validateField("phone", phone);
    const epw = validateField("password", password);
    const ecp = validateField("confirmPassword", confirmPassword);

    if (ef) errs.fullName = ef;
    if (ee) errs.email = ee;
    if (ep) errs.phone = ep;
    if (epw) errs.password = epw;
    if (ecp) errs.confirmPassword = ecp;

    if (!selectedClusterIds || selectedClusterIds.length === 0) {
      // Valid: unassigned admin / pending scope
      setAssignClustersLater(true);
    } else if (!assignClustersLater && selectedClusterIds.length > 0) {
      for (const cId of selectedClusterIds) {
        const scope = clusterSchoolsScope[cId];
        if (scope && !scope.all && (!scope.schools || scope.schools.length === 0)) {
          errs.school = `Please select at least one school for cluster "${cId}" or select "All Schools".`;
          break;
        }
      }
    }

    setTouched({ fullName: true, email: true, phone: true, cluster: true, school: true, password: true, confirmPassword: true });
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setErrorMsg(Object.values(errs)[0]);
      return;
    }

    if (role !== "Cluster Administrator" && selectedModulesList.length === 0) {
      setErrorMsg("Please select at least one module permission.");
      return;
    }

    if (!hasChanges) {
      setErrorMsg("No changes detected. Modify any field to save changes.");
      return;
    }

    setShowConfirm(true);
  };

  // Perform Save API call
  const handleConfirmSave = async () => {
    setIsSubmitting(true);
    try {
      const backendRole = (role === "Super Admin" || role === "Cluster Administrator" || role === "Cluster Admin") ? "admin" : "health_officer";
      const foundClusterId = clustersList.find(c => c.name === cluster || c.id === cluster)?.id;
      const assignedCluster = (cluster === "All Clusters" || !cluster) ? null : (foundClusterId || null);
      const cleanEmail = email.trim().toLowerCase();

      let assigned_cluster_ids = null;
      let assigned_school_ids = null;
      let finalCluster = cluster;
      let finalSchool = school;
      let primaryClusterId = assignedCluster;

      if (assignClustersLater || !selectedClusterIds || selectedClusterIds.length === 0) {
        assigned_cluster_ids = [];
        assigned_school_ids = null;
        finalCluster = 'Unassigned (Pending Scope)';
        finalSchool = 'Unassigned';
        primaryClusterId = null;
      } else {
        // Filter out clusters that have manual selection enabled but 0 schools checked
        const effectiveClusterIds = selectedClusterIds.filter((cName) => {
          const sc = clusterSchoolsScope && clusterSchoolsScope[cName];
          if (sc && !sc.all && (!Array.isArray(sc.schools) || sc.schools.length === 0)) {
            return false;
          }
          return true;
        });

        assigned_cluster_ids = Array.from(new Set(effectiveClusterIds.length > 0 ? effectiveClusterIds : selectedClusterIds));
        const specificSchools = [];
        const seenSchools = new Set();
        let hasAnyManualSelection = false;

        // Check if ANY cluster has manual specific schools selected
        selectedClusterIds.forEach((cName) => {
          const sc = clusterSchoolsScope && clusterSchoolsScope[cName];
          if (sc && !sc.all) {
            hasAnyManualSelection = true;
          }
        });

        selectedClusterIds.forEach((cName) => {
          const sc = clusterSchoolsScope && clusterSchoolsScope[cName];
          const cObj = (clustersList || []).find(cl => cl.name === cName || cl.id === cName);
          const cId = String(cObj?.id || '').toLowerCase().trim();
          const cNameLower = String(cName || '').toLowerCase().trim();

          const schoolsInThisCluster = (schoolsList || []).filter(s => {
            const sC = String(s.cluster_name || s.cluster || s.cluster_id || '').toLowerCase().trim();
            return sC === cNameLower || (cId && String(s.cluster_id || '').toLowerCase().trim() === cId);
          });
          const validSchoolNames = new Set(schoolsInThisCluster.map(s => String(s.name || '').toLowerCase().trim()));

          if (hasAnyManualSelection) {
            if (sc && !sc.all) {
              if (Array.isArray(sc.schools)) {
                sc.schools.forEach(s => {
                  const trimmed = String(s || '').trim();
                  if (trimmed && validSchoolNames.has(trimmed.toLowerCase()) && !seenSchools.has(trimmed.toLowerCase())) {
                    seenSchools.add(trimmed.toLowerCase());
                    specificSchools.push(trimmed);
                  }
                });
              }
            } else {
              // sc.all is true: Add ALL schools in this cluster to specificSchools
              schoolsInThisCluster.forEach(s => {
                const trimmed = String(s.name || '').trim();
                if (trimmed && !seenSchools.has(trimmed.toLowerCase())) {
                  seenSchools.add(trimmed.toLowerCase());
                  specificSchools.push(trimmed);
                }
              });
            }
          }
        });

        assigned_school_ids = hasAnyManualSelection && specificSchools.length > 0 ? specificSchools : null;
        finalCluster = assigned_cluster_ids.join(', ');
        finalSchool = assigned_school_ids && assigned_school_ids.length > 0 ? assigned_school_ids.join(', ') : 'All Assigned Schools';
        if (assigned_cluster_ids.length > 0) {
          const firstC = clustersList.find(c => c.name === assigned_cluster_ids[0] || c.id === assigned_cluster_ids[0]);
          if (firstC) primaryClusterId = firstC.id;
        }
      }

      const calculatedScopeType = assigned_school_ids && assigned_school_ids.length > 0 ? 'school' : 'cluster';

      const updatePayload = {
        name: fullName.trim(),
        username: cleanEmail,
        email: cleanEmail,
        phone: phone.trim(),
        role: backendRole,
        assigned_cluster_id: primaryClusterId,
        assigned_cluster_ids: assigned_cluster_ids,
        assigned_school_ids: assigned_school_ids,
        school_name: finalSchool && finalSchool !== 'All Assigned Schools' && finalSchool !== 'Unassigned' ? finalSchool : null,
        scope_type: calculatedScopeType,
        permissions: role === "Cluster Administrator" ? ["Dashboard", "Schools", "Students", "Student Assessment", "Monthly Tracking", "Growth Analytics", "Reports & Analytics"] : selectedModulesList,
        is_active: status === "Active",
      };

      if (password && password.trim()) {
        updatePayload.password = password.trim();
      }

      const savedUser = await api.updateUser(initialUser.id, updatePayload);

      // Broadcast real-time update event so any active views or tabs refresh immediately
      window.dispatchEvent(new CustomEvent('sh_user_updated', {
        detail: {
          userId: initialUser.id,
          updatedUser: savedUser
        }
      }));

      const updatedRecord = {
        ...initialUser,
        ...(savedUser || {}),
        name: fullName.trim(),
        username: cleanEmail,
        email: cleanEmail,
        phone: phone.trim(),
        role,
        status,
        cluster: finalCluster,
        school: finalSchool,
        scopeType: calculatedScopeType,
        assigned_cluster_id: primaryClusterId,
        assigned_cluster_ids: assigned_cluster_ids,
        assigned_school_ids: assigned_school_ids,
        accessType: status !== "Active" ? "Inactive Users" : (calculatedScopeType === "cluster" ? "Full Access" : "Limited Access"),
        permissions: (savedUser && Array.isArray(savedUser.permissions)) ? savedUser.permissions : selectedModulesList,
        raw: {
          ...(initialUser?.raw || {}),
          ...(savedUser || {}),
          name: fullName.trim(),
          username: cleanEmail,
          email: cleanEmail,
          phone: phone.trim(),
          role: backendRole,
          assigned_cluster_id: primaryClusterId,
          assigned_cluster_ids: assigned_cluster_ids,
          assigned_school_ids: assigned_school_ids,
          school_name: calculatedScopeType === "school" ? finalSchool : null,
          scope_type: calculatedScopeType,
          permissions: (savedUser && Array.isArray(savedUser.permissions)) ? savedUser.permissions : selectedModulesList,
          is_active: status === "Active",
        }
      };

      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onUserUpdated) onUserUpdated(updatedRecord);
        if (onNavigateBack) onNavigateBack();
      }, 1200);
    } catch (err) {
      setShowConfirm(false);
      setErrorMsg(err.message || "Failed to save changes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (name, val) => {
    const t = Boolean(touched[name]);
    const hasErr = t && Boolean(fieldErrors[name]);
    const valid = t && !hasErr && Boolean(val);
    return {
      height: "38px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      padding: "0 10px",
      gap: "8px",
      boxSizing: "border-box",
      transition: "all 0.15s ease",
      border: hasErr ? "1.5px solid #EF4444" : valid ? "1.5px solid #10B981" : "1.5px solid #E2E8F0",
      backgroundColor: hasErr ? "#FEF2F2" : valid ? "#F0FDF4" : "#FFFFFF"
    };
  };

  const iconBox = (bg, fg) => ({
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: bg,
    color: fg
  });

  const isClusterAdmin = role === 'Cluster Administrator' || initialUser?.role === 'admin' || initialUser?.role === 'Cluster Administrator';
  const initials = fullName.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || (isClusterAdmin ? "AD" : "US");

  // Dynamic style for Save Changes button based strictly on hasChanges
  const saveBtnStyle = (enabled) => ({
    height: "38px",
    padding: "0 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: enabled ? "#EB5A1D" : "#E2E8F0",
    color: enabled ? "#FFFFFF" : "#94A3B8",
    fontSize: "13px",
    fontWeight: 700,
    cursor: enabled && !isSubmitting ? "pointer" : "not-allowed",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: enabled ? "0 4px 12px rgba(235,90,29,0.3)" : "none",
    transition: "all 0.2s ease",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>

      {/* Breadcrumb matching CreateUserView */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748B" }}>
        <span style={{ cursor: "pointer" }} onClick={handleAttemptBack}>User Management</span>
        <span>&gt;</span>
        <span style={{ cursor: "pointer" }} onClick={handleAttemptBack}>{initialUser?.name || (isClusterAdmin ? "Administrator" : "User")}</span>
        <span>&gt;</span>
        <span style={{ color: "#0F172A", fontWeight: 600 }}>{isClusterAdmin ? "Edit Administrator" : "Edit User"}</span>
      </div>

      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={handleAttemptBack}
            style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#FFFFFF", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            title="Go Back"
          >
            <ArrowLeft size={17}/>
          </button>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em", margin: 0 }}>
              {isClusterAdmin ? `Edit Administrator — ${initialUser?.name}` : `Edit User — ${initialUser?.name}`}
            </h1>
            <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0 0" }}>
              {isClusterAdmin ? "Modify administrator account details and cluster scope permissions." : "Modify user account details. Save Changes button enables only when changes are made."}
            </p>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={handleAttemptBack}
            style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "1.5px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasChanges || isSubmitting}
            style={saveBtnStyle(hasChanges)}
            title={hasChanges ? "Click to save changes" : "No changes detected. Modify any field to enable saving."}
          >
            <Save size={15}/>
            <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={16}/>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Unsaved changes notice banner */}
      {hasChanges && (
        <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E", borderRadius: "8px", padding: "9px 14px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={15} style={{ flexShrink: 0 }}/>
          <span>You have unsaved changes. Click <strong>Save Changes</strong> to apply them to this user.</span>
        </div>
      )}

      {/* Main Form Full Width Column */}
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>

          {/* Card 01: Account Information */}
          <div style={fCard}>
            <div style={fHdr}>
              <div style={iconBox("#FFEDD5", "#EA580C")}><User size={18}/></div>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>{isClusterAdmin ? "01. Administrator Information" : "01. Account Information"}</h3>
                <p style={{ fontSize: "11.5px", color: "#94A3B8", margin: "1px 0 0 0" }}>{isClusterAdmin ? "Update administrator account details and cluster oversight." : "Update user account details and permissions."}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Row 1: Full Name & Email */}
              <div style={grid2}>
                <div>
                  <label style={lbl}>Full Name <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={getInputStyle("fullName", fullName)}>
                    <User size={16} color={touched.fullName && fieldErrors.fullName ? "#EF4444" : touched.fullName && fullName && !fieldErrors.fullName ? "#10B981" : "#94A3B8"}/>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={fullName}
                      maxLength={50}
                      onChange={e => handleFieldChange("fullName", e.target.value)}
                      onBlur={() => handleBlur("fullName", fullName)}
                      style={inp}
                    />
                    {touched.fullName && !fieldErrors.fullName && fullName && <Check size={14} color="#10B981" strokeWidth={2.5}/>}
                    {touched.fullName && fieldErrors.fullName && <AlertCircle size={15} color="#EF4444"/>}
                  </div>
                  {touched.fullName && fieldErrors.fullName && <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.fullName}</span></div>}
                </div>

                <div>
                  <label style={lbl}>Email Address <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={getInputStyle("email", email)}>
                    <Mail size={16} color={touched.email && fieldErrors.email ? "#EF4444" : touched.email && email && !fieldErrors.email ? "#10B981" : "#94A3B8"}/>
                    <input
                      type="email"
                      placeholder="e.g. name@domain.com"
                      value={email}
                      maxLength={64}
                      onChange={e => handleFieldChange("email", e.target.value)}
                      onBlur={() => handleBlur("email", email)}
                      style={inp}
                    />
                    {touched.email && !fieldErrors.email && email && <Check size={14} color="#10B981" strokeWidth={2.5}/>}
                    {touched.email && fieldErrors.email && <AlertCircle size={15} color="#EF4444"/>}
                  </div>
                  {touched.email && fieldErrors.email
                    ? <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.email}</span></div>
                    : <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "3px", display: "block" }}>Email serves as login identity</span>}
                </div>
              </div>

              {/* Row 2: Phone Number & User ID */}
              <div style={grid2}>
                <div>
                  <label style={lbl}>Phone Number <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={getInputStyle("phone", phone)}>
                    <Phone size={16} color={touched.phone && fieldErrors.phone ? "#EF4444" : touched.phone && phone.length === 10 ? "#10B981" : "#94A3B8"}/>
                    <input
                      type="text"
                      placeholder="10-digit mobile number"
                      value={phone}
                      maxLength={10}
                      onChange={e => handleFieldChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone", phone)}
                      style={inp}
                    />
                    {touched.phone && !fieldErrors.phone && phone.length === 10 && <Check size={14} color="#10B981" strokeWidth={2.5}/>}
                    {touched.phone && fieldErrors.phone && <AlertCircle size={15} color="#EF4444"/>}
                  </div>
                  {touched.phone && fieldErrors.phone
                    ? <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.phone}</span></div>
                    : <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "3px", display: "block" }}>10-digit Indian mobile number</span>}
                </div>

                <div>
                  <label style={lbl}>{isClusterAdmin ? "Admin ID" : "User ID"} <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ height: "38px", border: "1.5px solid #E2E8F0", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: "#F8FAFC" }}>
                    <CreditCard size={16} color="#64748B"/>
                    <input
                      type="text"
                      value={userId}
                      readOnly
                      style={{ ...inp, color: "#334155", fontWeight: 600, cursor: "default" }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2.5: Login Username (auto-filled from email) */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>Login Username <span style={{ color: "#EF4444" }}>*</span></label>
                  <span style={{ fontSize: "10.5px", color: "#059669", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", padding: "1px 7px", borderRadius: "99px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <ShieldCheck size={11}/> Auto-filled from Email
                  </span>
                </div>
                <div style={{ height: "38px", border: "1.5px solid #10B981", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: "#F0FDF4" }}>
                  <Mail size={16} color="#10B981"/>
                  <input
                    type="text"
                    value={loginUsername}
                    readOnly
                    style={{ ...inp, color: "#065F46", fontWeight: 600, cursor: "default" }}
                  />
                  <Check size={14} color="#10B981" strokeWidth={2.5}/>
                </div>
                <span style={{ fontSize: "11px", color: "#059669", marginTop: "3px", display: "block", fontWeight: 500 }}>
                  Login username dynamically syncs with the Email field
                </span>
              </div>

              {/* Row 2.6: Security Credentials / Password Editing */}
              <div style={grid2}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Password</label>
                    <span style={{ fontSize: "10.5px", color: "#64748B", fontStyle: "italic" }}>
                      Leave blank to keep current
                    </span>
                  </div>
                  <div style={getInputStyle("password", password)}>
                    <Lock size={16} color={touched.password && fieldErrors.password ? "#EF4444" : touched.password && password && !fieldErrors.password ? "#10B981" : "#94A3B8"}/>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      maxLength={32}
                      onChange={e => handleFieldChange("password", e.target.value)}
                      onBlur={() => handleBlur("password", password)}
                      style={inp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", padding: "2px", color: "#64748B", display: "flex", alignItems: "center" }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <Eye size={15}/> : <EyeOff size={15}/>}
                    </button>
                  </div>
                  {touched.password && fieldErrors.password && (
                    <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.password}</span></div>
                  )}

                  {/* Real-time Password Rules Checklist when typing */}
                  {password.length > 0 && (
                    <div 
                      style={{
                        marginTop: "8px",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>
                        Password Requirements:
                      </div>
                      {passwordRules.map(rule => (
                        <div 
                          key={rule.id} 
                          style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "11px", 
                            color: rule.valid ? "#059669" : "#64748B" 
                          }}
                        >
                          {rule.valid ? (
                            <Check size={12} color="#059669" strokeWidth={3}/>
                          ) : (
                            <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#CBD5E1" }}/>
                          )}
                          <span style={{ fontWeight: rule.valid ? 600 : 400 }}>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label style={lbl}>Confirm Password</label>
                  <div style={getInputStyle("confirmPassword", confirmPassword)}>
                    <Lock size={16} color={touched.confirmPassword && fieldErrors.confirmPassword ? "#EF4444" : touched.confirmPassword && confirmPassword && !fieldErrors.confirmPassword ? "#10B981" : "#94A3B8"}/>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      maxLength={32}
                      onChange={e => handleFieldChange("confirmPassword", e.target.value)}
                      onBlur={() => handleBlur("confirmPassword", confirmPassword)}
                      style={inp}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", padding: "2px", color: "#64748B", display: "flex", alignItems: "center" }}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <Eye size={15}/> : <EyeOff size={15}/>}
                    </button>
                  </div>
                  {touched.confirmPassword && fieldErrors.confirmPassword ? (
                    <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.confirmPassword}</span></div>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "3px", display: "block" }}>
                      Re-type new password to verify
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Account Status & Registration Info */}
              <div style={grid2}>
                <div>
                  <label style={lbl}>Account Status <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ height: "38px", border: "1.5px solid #E2E8F0", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: "#FFFFFF" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: status === "Active" ? "#10B981" : "#EF4444", flexShrink: 0 }}/>
                    <select value={status} onChange={e => handleFieldChange("status", e.target.value)} style={sel}>
                      <option value="Active">Active — Login Enabled</option>
                      <option value="Inactive">Inactive — Login Disabled</option>
                    </select>
                  </div>
                  <span style={{ fontSize: "11px", color: status === "Active" ? "#059669" : "#DC2626", marginTop: "3px", display: "block" }}>
                    {status === "Active" ? "Account is active with full system access" : "Account is suspended/inactive"}
                  </span>
                </div>

                <div>
                  <label style={lbl}>Joined / Created</label>
                  <div style={{ height: "38px", border: "1.5px solid #E2E8F0", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: "#F8FAFC" }}>
                    <Calendar size={15} color="#64748B"/>
                    <input
                      type="text"
                      value={originalValues.joinedOn || "Active Account"}
                      readOnly
                      style={{ ...inp, color: "#475569", cursor: "default" }}
                    />
                  </div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", marginTop: "3px", display: "block" }}>
                    Account creation date in database
                  </span>
                </div>
              </div>
            </div>
          </div>

            {/* Section 02: Access Scope */}
            <div style={fCard}>
              <div style={fHdr}>
                <div style={iconBox("#FFEDD5", "#EA580C")}><GraduationCap size={18}/></div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>02. Access Scope</h3>
                  <p style={{ fontSize: "11.5px", color: "#94A3B8", margin: "1px 0 0 0" }}>
                    Manually select the clusters and specific schools this user will access.
                  </p>
                </div>
              </div>

              {/* Multi-cluster & Manual School Selection for all roles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {fieldErrors.cluster && (
                    <div style={errRow}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{fieldErrors.cluster}</span>
                    </div>
                  )}
                  {fieldErrors.school && (
                    <div style={errRow}>
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
                          No clusters or schools have been created in the database yet. You can create a cluster right now without leaving this page, or save this Administrator with pending cluster assignment.
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
                          <span>Assign clusters later (Keep as Unassigned Admin)</span>
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
                            <span>Assign clusters later (Keep as Unassigned)</span>
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
                                      onClick={() => {
                                        setClusterSchoolsScope(prev => ({
                                          ...prev,
                                          [cName]: { all: true, schools: [] }
                                        }));
                                        setFieldErrors(prev => ({ ...prev, school: '' }));
                                      }}
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
                                        setClusterSchoolsScope(prev => {
                                          const existingSchools = prev[cName]?.schools || [];
                                          const initialSelected = existingSchools.length > 0
                                            ? existingSchools
                                            : (schoolsUnderCluster[0]?.name ? [schoolsUnderCluster[0].name] : []);
                                          return {
                                            ...prev,
                                            [cName]: {
                                              all: false,
                                              schools: initialSelected
                                            }
                                          };
                                        });
                                        setFieldErrors(prev => ({ ...prev, school: '' }));
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
                                                  borderRadius: '4px',
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
                                                <span style={{ fontSize: '12.5px', color: isSchoolChecked ? '#1E40AF' : '#334155', fontWeight: isSchoolChecked ? 600 : 400 }}>
                                                  {s.name}
                                                </span>
                                              </div>
                                            );
                                          })
                                        ) : (
                                          <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', padding: '6px' }}>
                                            No schools currently registered under this cluster.
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

            {/* Section 03: Module Permissions (Hidden for Cluster Administrator) */}
            {role !== "Cluster Administrator" && (
            <div style={fCard}>
              <div style={fHdr}>
                <div style={iconBox("#FFEDD5", "#EA580C")}><Settings size={18}/></div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>03. Module Permissions</h3>
                  <p style={{ fontSize: "11.5px", color: "#94A3B8", margin: "1px 0 0 0" }}>{selectedModulesList.length} of 7 modules enabled</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    onClick={handleToggleSelectAll}
                    style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#FFF7ED", border: "1px solid #FFEDD5" }}
                  >
                    <div style={{ width: "36px", height: "20px", borderRadius: "99px", backgroundColor: allSelected ? "#EB5A1D" : "#CBD5E1", padding: "2px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: allSelected ? "flex-end" : "flex-start", transition: "all 0.2s", flexShrink: 0 }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>{allSelected ? "Deselect All Modules" : "Select All Modules"}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                    {moduleList.map(mod => (
                      <div
                        key={mod.key}
                        onClick={() => handleTogglePermission(mod.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          backgroundColor: permissions[mod.key] ? "#FFF7ED" : "#F8FAFC",
                          border: permissions[mod.key] ? "1.5px solid #FDBA74" : "1px solid #E2E8F0",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: permissions[mod.key] ? "#EA580C" : mod.color }}>{mod.icon}</span>
                          <span style={{ fontSize: "13px", fontWeight: permissions[mod.key] ? 700 : 500, color: permissions[mod.key] ? "#0F172A" : "#64748B" }}>
                            {mod.label}
                          </span>
                        </div>
                        <div style={{ width: "36px", height: "20px", borderRadius: "99px", backgroundColor: permissions[mod.key] ? "#EB5A1D" : "#E2E8F0", padding: "2px", display: "flex", alignItems: "center", justifyContent: permissions[mod.key] ? "flex-end" : "flex-start", transition: "all 0.2s", flexShrink: 0 }}>
                          <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#FFFFFF", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
            )}

        {/* Validation error notification banner if errors exist */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            fontSize: '13px',
            fontWeight: 600,
            marginTop: '8px'
          }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
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
            type="button"
            onClick={handleSubmit}
            disabled={!hasChanges || isSubmitting}
            style={{
              height: '40px',
              padding: '0 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: hasChanges ? '#EB5A1D' : '#E2E8F0',
              color: hasChanges ? '#FFFFFF' : '#94A3B8',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: hasChanges && !isSubmitting ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: hasChanges ? '0 4px 12px rgba(235, 90, 29, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes to Save'}</span>
          </button>
        </div>
      </form>

      {/* Unsaved Changes Confirmation Modal */}
      {showLeaveConfirmModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "26px 28px", maxWidth: "440px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={22} color="#DC2626"/>
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>Discard Unsaved Changes?</div>
                <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                  You have unsaved changes to this user account. If you leave now, these changes will not be saved.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(false)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirmModal(false);
                  onNavigateBack();
                }}
                style={{ padding: "9px 20px", borderRadius: "8px", border: "none", backgroundColor: "#DC2626", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}
              >
                Discard & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "26px 28px", maxWidth: "440px", width: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Save size={22} color="#EA580C"/>
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A" }}>Save Changes?</div>
                <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "2px" }}>
                  This will update the account and permissions for <strong>{fullName || initialUser?.name}</strong>.
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "10px 12px", marginBottom: "18px", fontSize: "12px", color: "#475569", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div>• <strong>{isClusterAdmin ? "Admin ID:" : "User ID:"}</strong> {userId}</div>
              <div>• <strong>Login Username:</strong> {loginUsername}</div>
              <div>• <strong>Cluster:</strong> {cluster || "—"}</div>
              <div>• <strong>Modules:</strong> {selectedModulesList.length} enabled</div>
              {password && password.trim() ? (
                <div>• <strong>Password:</strong> •••••••• (Will be updated)</div>
              ) : (
                <div>• <strong>Password:</strong> Unchanged</div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #E2E8F0", backgroundColor: "#FFFFFF", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSubmitting}
                style={{ padding: "9px 20px", borderRadius: "8px", border: "none", backgroundColor: "#EB5A1D", color: "#FFFFFF", fontSize: "13px", fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(235,90,29,0.3)" }}
              >
                {isSubmitting ? "Saving..." : "Yes, Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "32px", maxWidth: "380px", width: "90%", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <CheckCircle2 size={28} color="#059669"/>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginBottom: "6px" }}>Changes Saved!</div>
            <div style={{ fontSize: "13px", color: "#64748B" }}>
              The account for <strong>{fullName || initialUser?.name}</strong> has been updated successfully.
            </div>
          </div>
        </div>
      )}

      {/* Quick Create Cluster Modal */}
      {showQuickCreateClusterModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(3px)'
          }}
        >
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px 26px',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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