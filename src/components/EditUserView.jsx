import React, { useState, useEffect, useMemo } from "react";
import {
  User, Mail, Phone, GraduationCap, School, Settings, FileText,
  Check, LayoutGrid, Users, ClipboardCheck,
  BarChart2, Heart, Bell, Network, AlertCircle, AlertTriangle,
  CheckCircle2, ArrowLeft, Save, ShieldCheck, CreditCard, Calendar,
  Lock, Eye, EyeOff
} from "lucide-react";
import { api } from "../services/api";

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
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  const parseRole = (r) => {
    if (!r) return "School Staff";
    if (r === "admin" || r === "Super Admin") return "Super Admin";
    return "School Staff";
  };

  // Compute immutable snapshot of initial values for change detection
  const originalValues = useMemo(() => {
    const rawRole = parseRole(initialUser?.role);
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
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched({});
    setFieldErrors({});
    setErrorMsg("");
  }, [originalValues]);

  // Load cluster and school options
  useEffect(() => {
    async function loadScope() {
      try {
        const [cData, sData] = await Promise.allSettled([api.getClusters(), api.getSchools()]);
        if (cData.status === "fulfilled" && Array.isArray(cData.value) && cData.value.length > 0) {
          setClustersList(cData.value);
          const rawCluster = initialUser?.raw?.assigned_cluster_id || initialUser?.raw?.cluster_name || initialUser?.cluster;
          if (rawCluster && rawCluster !== "All Clusters") {
            const matched = cData.value.find(c => c.id === rawCluster || c.name === rawCluster);
            if (matched) {
              setCluster(matched.name);
            }
          }
        }
        if (sData.status === "fulfilled" && Array.isArray(sData.value) && sData.value.length > 0) {
          setSchoolsList(sData.value);
        }
      } catch (err) {
        console.warn("Scope load error:", err);
      }
    }
    loadScope();
  }, []);

  // Filter schools in real-time based on the selected cluster from database
  const filteredSchools = useMemo(() => {
    if (!cluster || cluster === "All Clusters") return schoolsList;
    const selectedClusterObj = clustersList.find(c => c.name === cluster || c.id === cluster);
    return schoolsList.filter(s => 
      (selectedClusterObj && s.cluster_id === selectedClusterObj.id) ||
      s.cluster_name === cluster ||
      s.cluster === cluster
    );
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
    if (cluster !== originalValues.cluster) return true;
    if (school !== originalValues.school) return true;
    if (scopeType !== originalValues.scopeType) return true;
    for (const k of Object.keys(originalValues.permissions)) {
      if (Boolean(permissions[k]) !== Boolean(originalValues.permissions[k])) return true;
    }
    return false;
  }, [password, confirmPassword, fullName, email, phone, role, status, cluster, school, scopeType, permissions, originalValues]);

  // Permission toggles
  const handleTogglePermission = (key) => setPermissions(p => ({ ...p, [key]: !p[key] }));
  const allSelected = Object.values(permissions).every(Boolean);
  const handleToggleSelectAll = () => {
    const next = !allSelected;
    setPermissions({
      dashboard: next,
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
    permissions.students && "Students",
    permissions.assessment && "Student Assessment",
    permissions.tracking && "Monthly Tracking",
    permissions.history && "Health History",
    permissions.reports && "Reports",
    permissions.notifications && "Notifications",
  ].filter(Boolean);

  const moduleList = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={15}/>, color: "#3B82F6" },
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
    const ec = validateField("cluster", cluster);
    const es = validateField("school", school);
    const epw = validateField("password", password);
    const ecp = validateField("confirmPassword", confirmPassword);

    if (ef) errs.fullName = ef;
    if (ee) errs.email = ee;
    if (ep) errs.phone = ep;
    if (ec) errs.cluster = ec;
    if (es) errs.school = es;
    if (epw) errs.password = epw;
    if (ecp) errs.confirmPassword = ecp;

    setTouched({ fullName: true, email: true, phone: true, cluster: true, school: true, password: true, confirmPassword: true });
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) {
      setErrorMsg(Object.values(errs)[0]);
      return;
    }

    if (selectedModulesList.length === 0) {
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
      const backendRole = role === "Super Admin" ? "admin" : "health_officer";
      const foundClusterId = clustersList.find(c => c.name === cluster || c.id === cluster)?.id;
      const assignedCluster = (cluster === "All Clusters" || !cluster) ? null : (foundClusterId || null);
      const cleanEmail = email.trim().toLowerCase();

      const updatePayload = {
        name: fullName.trim(),
        username: cleanEmail,
        email: cleanEmail,
        phone: phone.trim(),
        role: backendRole,
        assigned_cluster_id: assignedCluster,
        school_name: scopeType === "school" ? school : null,
        scope_type: scopeType,
        permissions: selectedModulesList,
        is_active: status === "Active",
      };

      if (password && password.trim()) {
        updatePayload.password = password.trim();
      }

      const savedUser = await api.updateUser(initialUser.id, updatePayload);

      const updatedRecord = {
        ...initialUser,
        ...(savedUser || {}),
        name: fullName.trim(),
        username: cleanEmail,
        email: cleanEmail,
        phone: phone.trim(),
        role,
        status,
        cluster,
        school,
        scopeType,
        accessType: status !== "Active" ? "Inactive Users" : (scopeType === "cluster" ? "Full Access" : "Limited Access"),
        permissions: (savedUser && Array.isArray(savedUser.permissions)) ? savedUser.permissions : selectedModulesList,
        raw: {
          ...(initialUser?.raw || {}),
          ...(savedUser || {}),
          name: fullName.trim(),
          username: cleanEmail,
          email: cleanEmail,
          phone: phone.trim(),
          role: backendRole,
          assigned_cluster_id: assignedCluster,
          school_name: scopeType === "school" ? school : null,
          scope_type: scopeType,
          permissions: (savedUser && Array.isArray(savedUser.permissions)) ? savedUser.permissions : selectedModulesList,
          is_active: status === "Active",
        }
      };

      setShowConfirm(false);
      setShowSuccess(true);
      if (onUserUpdated) onUserUpdated(updatedRecord);
      setTimeout(() => {
        setShowSuccess(false);
        if (onNavigateBack) onNavigateBack();
      }, 1500);
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

  const initials = fullName.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "US";

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
        <span style={{ cursor: "pointer" }} onClick={handleAttemptBack}>{initialUser?.name || "User"}</span>
        <span>&gt;</span>
        <span style={{ color: "#0F172A", fontWeight: 600 }}>Edit User</span>
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
              Edit User — {initialUser?.name}
            </h1>
            <p style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 0 0" }}>
              Modify user account details. Save Changes button enables only when changes are made.
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
                <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>01. Account Information</h3>
                <p style={{ fontSize: "11.5px", color: "#94A3B8", margin: "1px 0 0 0" }}>Update user account details, role, and permissions.</p>
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
                  <label style={lbl}>User ID <span style={{ color: "#EF4444" }}>*</span></label>
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

              {/* Row 2.5: Login Username (auto-filled from email) & Role */}
              <div style={grid2}>
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

                <div>
                  <label style={lbl}>Role <span style={{ color: "#EF4444" }}>*</span></label>
                  <div style={{ height: "38px", border: "1.5px solid #E2E8F0", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: "#FFFFFF" }}>
                    <User size={16} color="#94A3B8"/>
                    <select value={role} onChange={e => handleFieldChange("role", e.target.value)} style={sel}>
                      <option value="Super Admin">Super Admin</option>
                      <option value="School Staff">School Staff</option>
                    </select>
                  </div>
                  <span style={{ fontSize: "11px", color: "#64748B", marginTop: "3px", display: "block" }}>
                    Controls administrative privileges
                  </span>
                </div>
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
                      placeholder="Enter new password (optional)"
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
                  <p style={{ fontSize: "11.5px", color: "#94A3B8", margin: "1px 0 0 0" }}>Cluster and school jurisdiction.</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <label style={lbl}>Cluster <span style={{ color: "#EF4444" }}>*</span></label>
                    <div style={getInputStyle("cluster", cluster)}>
                      <Network size={15} color="#94A3B8"/>
                      <select value={cluster} onChange={e => handleFieldChange("cluster", e.target.value)} onBlur={() => handleBlur("cluster", cluster)} style={sel}>
                        <option value="">-- Select Cluster --</option>
                        <option value="All Clusters">All Clusters</option>
                        {clustersList.length > 0
                          ? clustersList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)
                          : <option value={(!cluster || /^[0-9a-fA-F-]{20,}$/.test(cluster)) ? "All Clusters" : cluster}>{(!cluster || /^[0-9a-fA-F-]{20,}$/.test(cluster)) ? "All Clusters" : cluster}</option>}
                      </select>
                      {touched.cluster && !fieldErrors.cluster && cluster && <Check size={14} color="#10B981" strokeWidth={2.5}/>}
                    </div>
                    {touched.cluster && fieldErrors.cluster && <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.cluster}</span></div>}
                  </div>

                  <div>
                    <label style={lbl}>School {scopeType === "school" && <span style={{ color: "#EF4444" }}>*</span>}</label>
                    <div style={{ height: "38px", border: "1.5px solid #E2E8F0", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 10px", gap: "8px", backgroundColor: scopeType === "cluster" ? "#F8FAFC" : "#FFFFFF" }}>
                      <School size={15} color="#94A3B8"/>
                      <select 
                        value={scopeType === "cluster" ? "All Assigned Schools" : school} 
                        onChange={e => handleFieldChange("school", e.target.value)} 
                        disabled={scopeType === "cluster"}
                        style={{ ...sel, cursor: scopeType === "cluster" ? "default" : "pointer", color: scopeType === "cluster" ? "#64748B" : "#0F172A" }}
                      >
                        {scopeType === "cluster" ? (
                          <option value="All Assigned Schools">
                            {cluster && cluster !== "All Clusters" ? `All Schools in ${cluster}` : "All Assigned Schools"}
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
                    </div>
                    {touched.school && fieldErrors.school && <div style={errRow}><AlertCircle size={12}/><span>{fieldErrors.school}</span></div>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <label style={lbl}>Access Scope Type:</label>
                  {[
                    { val: "cluster", label: "All schools in cluster", sub: "User can access all schools within the selected cluster." },
                    { val: "school", label: "Specific school only", sub: "User is restricted to the chosen school only." }
                  ].map(opt => (
                    <label 
                      key={opt.val} 
                      style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", padding: "6px 8px", borderRadius: "8px", backgroundColor: scopeType === opt.val ? "#FFF7ED" : "#FFFFFF", border: "1px solid", borderColor: scopeType === opt.val ? "#FFEDD5" : "#F1F5F9", transition: "all 0.15s ease" }} 
                      onClick={() => {
                        setScopeType(opt.val);
                        if (opt.val === 'cluster') setSchool('All Assigned Schools');
                      }}
                    >
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", marginTop: "2px", flexShrink: 0, border: scopeType === opt.val ? "5px solid #EA580C" : "2px solid #CBD5E1", backgroundColor: "#FFFFFF", transition: "border 0.15s ease" }}/>
                      <div>
                        <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#0F172A" }}>{opt.label}</div>
                        <div style={{ fontSize: "11px", color: "#64748B" }}>{opt.sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 03: Module Permissions - Always fully visible */}
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
              <div>• <strong>User ID:</strong> {userId}</div>
              <div>• <strong>Login Username:</strong> {loginUsername}</div>
              <div>• <strong>Role:</strong> {role}</div>
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
    </div>
  );
}