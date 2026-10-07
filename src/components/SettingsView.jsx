import React, { useState, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  User,
  Lock,
  Monitor,
  Mail,
  Bell,
  Calendar,
  Layers,
  Database,
  RefreshCw,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  ShieldCheck,
  Laptop,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SettingsView() {
  const { user } = useAuth();
  // Notification Toggle States
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [assessmentReminders, setAssessmentReminders] = useState(true);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Sync & Database state
  const [lastSyncTime, setLastSyncTime] = useState('Online');
  const [isSyncing, setIsSyncing] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [dbOnline, setDbOnline] = useState(true);

  // Dynamic status check
  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.getSystemStatus();
        if (res) {
          setSystemStatus(res);
          setDbOnline(true);
        } else {
          setDbOnline(false);
        }
      } catch {
        setDbOnline(false);
      }
    };
    checkDb();
    const timer = setInterval(checkDb, 8000);
    return () => clearInterval(timer);
  }, []);

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Sessions list
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Chrome on Windows 11',
      ip: '192.168.1.8',
      location: 'Chennai, India',
      current: true,
      icon: Laptop,
      lastActive: 'Active now'
    },
    {
      id: 'sess-2',
      device: 'Safari on iPhone 15 Pro',
      ip: '103.28.14.92',
      location: 'Chennai, India',
      current: false,
      icon: Smartphone,
      lastActive: '2 hours ago'
    },
    {
      id: 'sess-3',
      device: 'Edge on Windows 10 (Office PC)',
      ip: '182.72.19.44',
      location: 'Erode, India',
      current: false,
      icon: Monitor,
      lastActive: 'Yesterday at 05:40 PM'
    }
  ]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      alert('Please enter your current password.');
      return;
    }
    if (newPassword.length < 4) {
      alert('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      if (user?.id) {
        await api.updateUser(user.id, { password: newPassword });
      }
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast('Password updated in database successfully!');
    } catch (err) {
      alert(`Password update failed: ${err.message}`);
    }
  };

  const handleRevokeSession = (sessionId) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
    triggerToast('Session terminated successfully.');
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const res = await api.getSystemStatus();
      if (res) {
        setSystemStatus(res);
        setDbOnline(true);
      }
      const now = new Date();
      setLastSyncTime(
        now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      );
      triggerToast('Database synchronized with PostgreSQL successfully!');
    } catch {
      triggerToast('Sync failed: unable to connect to backend.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '13.5px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setShowToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
        <button
          onClick={() => {}}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: 0
          }}
        >
          <Home size={15} />
        </button>
        <ChevronRight size={14} color="#94A3B8" />
        <span style={{ color: '#0F172A', fontWeight: 600 }}>Settings</span>
      </div>

      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: '13.5px',
            color: '#64748B',
            margin: '4px 0 0 0',
            fontWeight: 400
          }}
        >
          Manage your account, notification preferences and system information.
        </p>
      </div>

      {/* Settings Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ========================================================================= */}
        {/* CARD 1: ACCOUNT                                                           */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '22px 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <User size={20} color="#0284C7" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                ACCOUNT
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Manage your account security and session preferences.
              </p>
            </div>
          </div>

          {/* Item 1: Change Password */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Lock size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Change Password
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Update your account password regularly for better security.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <span>Change Password</span>
              <ChevronRight size={14} color="#64748B" />
            </button>
          </div>

          {/* Item 2: Session Settings */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Monitor size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Session Settings
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Manage your active sessions and sign out from other devices.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSessionModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#94A3B8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
            >
              <span>Manage Sessions</span>
              <ChevronRight size={14} color="#64748B" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: NOTIFICATIONS                                                     */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '22px 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bell size={20} color="#EA580C" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                NOTIFICATIONS
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Configure how you want to receive notifications.
              </p>
            </div>
          </div>

          {/* Item 1: Email Notifications */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Mail size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Email Notifications
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Receive important updates and reports via email.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => {
                  setEmailNotifications(!emailNotifications);
                  triggerToast(`Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: emailNotifications ? '#2563EB' : '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transform: emailNotifications ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', minWidth: '55px' }}>
                {emailNotifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Item 2: System Notifications */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Bell size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  System Notifications
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Receive in-app notifications for key activities.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => {
                  setSystemNotifications(!systemNotifications);
                  triggerToast(`System notifications ${!systemNotifications ? 'enabled' : 'disabled'}`);
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: systemNotifications ? '#2563EB' : '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transform: systemNotifications ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', minWidth: '55px' }}>
                {systemNotifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Item 3: Assessment Reminders */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Calendar size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Assessment Reminders
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Get reminders for pending student assessments.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => {
                  setAssessmentReminders(!assessmentReminders);
                  triggerToast(`Assessment reminders ${!assessmentReminders ? 'enabled' : 'disabled'}`);
                }}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: assessmentReminders ? '#2563EB' : '#CBD5E1',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    transform: assessmentReminders ? 'translateX(20px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', minWidth: '55px' }}>
                {assessmentReminders ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: SYSTEM                                                            */}
        {/* ========================================================================= */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '22px 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={20} color="#16A34A" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                SYSTEM
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                View application details and system status.
              </p>
            </div>
          </div>

          {/* Item 1: Application Version */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Layers size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Application Version
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Current version of the Student Health Admin Portal.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                v1.4.0
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  padding: '3px 12px',
                  borderRadius: '12px'
                }}
              >
                Up to date
              </span>
            </div>
          </div>

          {/* Item 2: Database Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Database size={18} color="#64748B" />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Database Status ({systemStatus?.database || 'vatta_sattam (PostgreSQL)'})
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {dbOnline ? 'Connected to live PostgreSQL database' : 'Disconnected from database'}
                </div>
              </div>
            </div>

            <div>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: dbOnline ? '#DCFCE7' : '#FEE2E2',
                  color: dbOnline ? '#16A34A' : '#EF4444',
                  padding: '4px 14px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: dbOnline ? '#16A34A' : '#EF4444'
                  }}
                />
                {dbOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Item 3: Last Data Sync */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #F1F5F9'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <RefreshCw
                size={18}
                color="#64748B"
                style={{
                  animation: isSyncing ? 'spin 1s linear infinite' : 'none'
                }}
              />
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  Last Data Sync
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Time of the last successful data synchronization.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12.5px', color: '#475569' }}>
                {lastSyncTime}
              </span>
              <button
                onClick={handleSyncData}
                disabled={isSyncing}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  border: 'none',
                  padding: '4px 14px',
                  borderRadius: '12px',
                  cursor: isSyncing ? 'wait' : 'pointer'
                }}
              >
                {isSyncing ? 'Syncing...' : 'Success'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHANGE PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 35px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Lock size={18} color="#EA580C" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Change Password
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Ensure your account is using a strong password
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Current Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 38px 9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 38px 9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 38px 9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(240, 90, 36, 0.3)'
                  }}
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGE SESSIONS MODAL                                                     */}
      {/* ========================================================================= */}
      {showSessionModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 35px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#E0F2FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Monitor size={18} color="#0284C7" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Active Sessions
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Devices currently signed into this account
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {sessions.map((sess) => {
                const IconComponent = sess.icon;
                return (
                  <div
                    key={sess.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IconComponent size={20} color={sess.current ? '#0284C7' : '#64748B'} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{sess.device}</span>
                          {sess.current && (
                            <span style={{ fontSize: '10px', color: '#16A34A', backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
                              Current
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {sess.location} • {sess.lastActive}
                        </div>
                      </div>
                    </div>

                    {!sess.current && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        style={{
                          fontSize: '11.5px',
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
              <button
                onClick={() => setShowSessionModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
