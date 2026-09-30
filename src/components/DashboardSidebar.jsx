import React from 'react';
import { 
  LayoutDashboard, 
  School, 
  Users, 
  HeartPulse, 
  UserCheck, 
  BarChart3, 
  X,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentHealthLogo from './StudentHealthLogo';

export default function DashboardSidebar({ activeTab, onTabSelect, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'schools', label: 'Schools Management', icon: School },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'assessments', label: 'Health Assessments', icon: HeartPulse },
    { id: 'staff', label: 'Staff & Access', icon: UserCheck },
    { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
  ];

  return (
    <>
      {mobileOpen && (
        <div 
          className="mobile-overlay" 
          onClick={onCloseMobile} 
          aria-hidden="true" 
        />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-group">
            <StudentHealthLogo size={36} showText={false} isWhite={true} />
            <div>
              <div className="sidebar-brand-name">Student Health</div>
              <div className="sidebar-brand-badge">ADMIN PORTAL</div>
            </div>
          </div>
          {mobileOpen && (
            <button 
              className="btn-close-modal" 
              onClick={onCloseMobile}
              style={{ color: '#FFFFFF' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onTabSelect(item.id);
                  if (mobileOpen) onCloseMobile();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar-circle">
              {(user?.name || user?.email || 'Admin').charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user?.name || 'Administrator'}</span>
              <span className="user-role-tag">{user?.role || 'Super Admin'}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
