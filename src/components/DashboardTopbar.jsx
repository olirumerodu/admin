import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, RefreshCw, Filter, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardTopbar({ 
  onToggleMobileMenu, 
  onRefreshData, 
  isRefreshing,
  searchQuery, 
  onSearchChange,
  clusters = [],
  selectedCluster,
  onClusterChange,
  schools = [],
  selectedSchool,
  onSchoolChange
}) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button 
          className="mobile-menu-toggle" 
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Bar */}
        <div className="global-search-bar">
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            className="search-input"
            placeholder="Search students, schools, or records..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Cluster / District Filter */}
        {clusters && clusters.length > 0 && (
          <select
            className="topbar-selector"
            value={selectedCluster}
            onChange={(e) => onClusterChange(e.target.value)}
            aria-label="Filter by District"
          >
            <option value="ALL">All Districts / Clusters</option>
            {clusters.map((c) => (
              <option key={c.id || c.name} value={c.id || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {/* School Filter */}
        {schools && schools.length > 0 && (
          <select
            className="topbar-selector"
            value={selectedSchool}
            onChange={(e) => onSchoolChange(e.target.value)}
            aria-label="Filter by School"
          >
            <option value="ALL">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code || 'School'})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="topbar-right">
        {/* Refresh Button */}
        <button
          className="icon-action-btn"
          onClick={onRefreshData}
          title="Refresh Data from Backend"
          disabled={isRefreshing}
        >
          <RefreshCw size={17} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-action-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={17} />
            <span className="notification-badge" />
          </button>

          {showNotifications && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                width: '300px',
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                border: '1px solid #E2E8F0',
                padding: '16px',
                zIndex: 50,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Health Alerts</span>
                <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#DC2626', padding: '2px 8px', borderRadius: '99px', fontWeight: 600 }}>
                  2 Critical
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '8px', background: '#FEF2F2', borderRadius: '8px', fontSize: '12px', color: '#991B1B' }}>
                  <strong>Severe Thinness Alert:</strong> 2 students require immediate follow-up in PUMS GOBI.
                </div>
                <div style={{ padding: '8px', background: '#EFF6FF', borderRadius: '8px', fontSize: '12px', color: '#1E40AF' }}>
                  <strong>WHO AnthroPlus 2007:</strong> Baseline z-score screening updated for Term 1.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button 
          className="logout-btn-top" 
          onClick={logout}
          title="Sign out of Admin Portal"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
}
