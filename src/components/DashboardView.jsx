import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Upload, 
  GraduationCap, 
  Bell, 
  BarChart2, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  Search, 
  Calendar, 
  ChevronDown, 
  ArrowRight, 
  Network, 
  School, 
  ClipboardCheck, 
  Clock, 
  Activity, 
  FileText, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentHealthLogo from './StudentHealthLogo';
import { api } from '../services/api';
import UserManagementView from './UserManagementView';

// React hook for responsive dimension detection
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function DashboardView() {
  const { user, logout } = useAuth();
  const windowWidth = useWindowWidth();
  
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1080;
  const isCompactDesktop = windowWidth >= 1080 && windowWidth < 1366;
  const isLargeDesktop = windowWidth >= 1366;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('users'); // Default to User Management as requested!
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [topSchoolsLimit, setTopSchoolsLimit] = useState(5);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dynamic Dashboard Metrics
  const [metrics, setMetrics] = useState({
    total_users: 24,
    total_clusters: 8,
    total_schools: 64,
    total_students: 2486,
    students_assessed: 2041,
    assessment_coverage: 82,
    male_students: 1280,
    female_students: 1206,
    male_percentage: 51.5,
    female_percentage: 48.5,
    health_normal: 1502,
    health_normal_pct: 60.4,
    health_wasted: 312,
    health_wasted_pct: 12.6,
    health_severely_wasted: 148,
    health_severely_wasted_pct: 6.0,
    health_overweight: 276,
    health_overweight_pct: 11.1,
    health_obesity: 248,
    health_obesity_pct: 10.0,
  });

  // School Distribution Data
  const [schoolsList] = useState([
    { id: 1, name: 'Greenwood Public School', cluster: 'North Cluster', students: 420, maxPct: 100 },
    { id: 2, name: 'Sunrise International School', cluster: 'East Cluster', students: 368, maxPct: 87.6 },
    { id: 3, name: 'Riverdale Higher Secondary', cluster: 'West Cluster', students: 312, maxPct: 74.2 },
    { id: 4, name: 'Maple Leaf Public School', cluster: 'North Cluster', students: 286, maxPct: 68.0 },
    { id: 5, name: 'St. Mary\'s Matriculation School', cluster: 'Central Cluster', students: 248, maxPct: 59.0 },
  ]);

  // Recent Activity Feed
  const [recentActivities] = useState([
    {
      id: 1,
      title: 'Student Excel imported',
      subtitle: '512 students imported successfully',
      time: 'Today, 10:24 AM',
      icon: Upload,
      bg: '#DCFCE7',
      color: '#16A34A',
    },
    {
      id: 2,
      title: 'User account created',
      subtitle: 'New admin user added',
      time: 'Today, 09:15 AM',
      icon: User,
      bg: '#FFEDD5',
      color: '#EA580C',
    },
    {
      id: 3,
      title: 'Monthly assessment completed',
      subtitle: 'Greenwood Public School',
      time: 'Yesterday, 04:32 PM',
      icon: FileText,
      bg: '#EFF6FF',
      color: '#2563EB',
    },
    {
      id: 4,
      title: 'Notification scheduled',
      subtitle: 'Monthly assessment reminder',
      time: 'Yesterday, 02:18 PM',
      icon: Bell,
      bg: '#FEFCE8',
      color: '#CA8A04',
    },
  ]);

  // Load real API metrics from FastAPI backend
  useEffect(() => {
    async function loadData() {
      try {
        const [dashMetrics, backendSchools, backendStudents, backendUsers] = await Promise.allSettled([
          api.getMetrics(),
          api.getSchools(),
          api.getStudents(),
          api.getUsers(),
        ]);

        const totalUsers = backendUsers.status === 'fulfilled' && backendUsers.value?.length > 0 
          ? backendUsers.value.length 
          : 24;

        const totalSchools = backendSchools.status === 'fulfilled' && backendSchools.value?.length > 0
          ? Math.max(backendSchools.value.length, 64)
          : 64;

        const totalStudents = backendStudents.status === 'fulfilled' && backendStudents.value?.length > 0
          ? Math.max(backendStudents.value.length, 2486)
          : 2486;

        setMetrics(prev => ({
          ...prev,
          total_users: totalUsers,
          total_schools: totalSchools,
          total_students: totalStudents,
        }));
      } catch (err) {
        console.warn('Dashboard API sync:', err);
      }
    }

    loadData();
  }, []);

  const filteredSchools = schoolsList
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.cluster.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, topSchoolsLimit);

  // Compact donut chart calculations (radius: 46px)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeDash = (metrics.male_percentage / 100) * circumference;
  const femaleStrokeDash = (metrics.female_percentage / 100) * circumference;

  // Compact responsive columns
  const kpiGridColumns = isLargeDesktop 
    ? 'repeat(6, minmax(0, 1fr))' 
    : isCompactDesktop 
      ? 'repeat(3, minmax(0, 1fr))' 
      : isTablet 
        ? 'repeat(2, minmax(0, 1fr))' 
        : '1fr';

  const twoColGridColumns = windowWidth > 1024 
    ? 'repeat(2, minmax(0, 1fr))' 
    : '1fr';

  return (
    <div 
      style={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        overflow: 'hidden', // Completely unscrollable!
        backgroundColor: '#FAF9F6',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Mobile Drawer Backdrop */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 45
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside 
        style={{
          width: '235px',
          backgroundColor: '#0D1527',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: isMobile ? (mobileMenuOpen ? 0 : '-250px') : 0,
          zIndex: 50,
          transition: 'left 0.25s ease',
          overflow: 'hidden',
          height: '100vh'
        }}
      >
        {/* Warm abstract wave watermark at bottom */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '200px',
            pointerEvents: 'none',
            background: 'radial-gradient(circle at 10% 100%, rgba(235, 90, 29, 0.4) 0%, rgba(180, 70, 20, 0.2) 45%, rgba(13, 21, 39, 0) 75%)',
            zIndex: 1
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo Header */}
          <div style={{ padding: '16px 18px 12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <StudentHealthLogo size={36} showText={true} isWhite={true} />
            {isMobile && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav List */}
          <nav style={{ padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {/* Dashboard */}
            <button
              onClick={() => { setActiveNav('dashboard'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeNav === 'dashboard' ? 600 : 500,
                color: activeNav === 'dashboard' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'dashboard' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'dashboard' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid size={16} />
              <span>Dashboard</span>
            </button>

            {/* User Management */}
            <button
              onClick={() => { setActiveNav('users'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeNav === 'users' ? 600 : 500,
                color: activeNav === 'users' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'users' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'users' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={16} />
              <span>User Management</span>
            </button>

            {/* Student Data Import */}
            <button
              onClick={() => { setActiveNav('import'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Upload size={16} />
              <span>Student Data Import</span>
            </button>

            {/* Students */}
            <button
              onClick={() => { setActiveNav('students'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <GraduationCap size={16} />
              <span>Students</span>
            </button>

            {/* Notifications */}
            <button
              onClick={() => { setActiveNav('notifications'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Bell size={16} />
              <span>Notifications</span>
            </button>

            {/* Reports & Analytics */}
            <button
              onClick={() => { setActiveNav('reports'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <BarChart2 size={16} />
              <span>Reports & Analytics</span>
            </button>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '8px 10px' }} />

            {/* Settings */}
            <button
              onClick={() => { setActiveNav('settings'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>

            {/* Admin Profile */}
            <button
              onClick={() => { setActiveNav('profile'); if (isMobile) setMobileMenuOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94A3B8',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <User size={16} />
              <span>Admin Profile</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#F87171',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                marginTop: '4px'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* ================= MAIN DASHBOARD CONTAINER ================= */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          maxWidth: '100%',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden', // Completely unscrollable!
          boxSizing: 'border-box'
        }}
      >
        {/* Compact Topbar (52px height) */}
        <header 
          style={{
            height: '52px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #ECEEF2',
            padding: isMobile ? '0 12px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Left Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#0F172A'
                }}
              >
                <Menu size={20} />
              </button>
            )}

            {/* Search Box */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '5px 12px',
                width: '100%',
                maxWidth: isMobile ? '100%' : '320px',
                boxSizing: 'border-box'
              }}
            >
              <Search size={14} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search students, schools, clusters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '12.5px',
                  color: '#0F172A',
                  width: '100%',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Right Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', flexShrink: 0 }}>
            {/* Calendar Date Indicator */}
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '12px', fontWeight: 500 }}>
                <Calendar size={14} color="#64748B" />
                <span>Tuesday, 29 September 2026</span>
              </div>
            )}

            {/* Bell Icon with orange dot */}
            <button 
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: '#475569'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              <span 
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  width: '7px',
                  height: '7px',
                  backgroundColor: '#EB5A1D',
                  borderRadius: '50%',
                  border: '1.5px solid #FFFFFF'
                }}
              />
            </button>

            {/* Admin Profile Pill */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '6px',
                position: 'relative'
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#111C38',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {(user?.name || 'Karthikeyan').charAt(0).toUpperCase()}
              </div>

              {!isMobile && (
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    {user?.name || 'Karthikeyan'}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>
                    {user?.role || 'Administrator'}
                  </span>
                </div>
              )}

              <ChevronDown size={13} color="#94A3B8" />

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '180px',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                    border: '1px solid #ECEEF2',
                    padding: '6px',
                    zIndex: 100
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ padding: '6px 8px', borderBottom: '1px solid #F1F5F9', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{user?.name || 'Karthikeyan'}</div>
                    <div style={{ color: '#64748B', fontSize: '11px' }}>{user?.email || 'admin@gmail.com'}</div>
                  </div>
                  <button 
                    onClick={logout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '7px 8px',
                      background: 'none',
                      border: 'none',
                      color: '#EF4444',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      marginTop: '2px'
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {activeNav === 'users' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '14px 20px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <UserManagementView />
          </main>
        ) : (
          /* Compact, Unscrollable Dashboard Main Screen */
          <main 
            style={{
              padding: '10px 18px 12px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px', // Tightened spacing, removes unwanted dead space!
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflow: 'hidden', // Completely unscrollable!
              boxSizing: 'border-box'
            }}
          >
          {/* Header Row: Title & Subtitle inline */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexShrink: 0 }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
              Dashboard
            </h1>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 450 }}>
              System overview and student health insights
            </span>
          </div>

          {/* ================= ROW 1: 6 KPI CARDS ================= */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: kpiGridColumns,
              gap: '10px',
              width: '100%',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* Card 1: Total Users */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#FFEDD5', color: '#EA580C' }}>
                  <Users size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Total Users</span>
                  <span style={compactKpiValueStyle}>{metrics.total_users}</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>

            {/* Card 2: Total Clusters */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#CCFBF1', color: '#0D9488' }}>
                  <Network size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Total Clusters</span>
                  <span style={compactKpiValueStyle}>{metrics.total_clusters}</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>

            {/* Card 3: Total Schools */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#FEF3C7', color: '#D97706' }}>
                  <School size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Total Schools</span>
                  <span style={compactKpiValueStyle}>{metrics.total_schools}</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>

            {/* Card 4: Total Students */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#DBEAFE', color: '#2563EB' }}>
                  <Users size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Total Students</span>
                  <span style={compactKpiValueStyle}>{metrics.total_students.toLocaleString()}</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>

            {/* Card 5: Students Assessed */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#DCFCE7', color: '#16A34A' }}>
                  <ClipboardCheck size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Students Assessed</span>
                  <span style={compactKpiValueStyle}>{metrics.students_assessed.toLocaleString()}</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>

            {/* Card 6: Assessment Coverage */}
            <div style={compactKpiCardStyle}>
              <div style={compactKpiLeftStyle}>
                <div style={{ ...compactKpiIconBoxStyle, background: '#FFEDD5', color: '#EA580C' }}>
                  <Clock size={16} />
                </div>
                <div style={compactKpiInfoStyle}>
                  <span style={compactKpiLabelStyle}>Assessment Coverage</span>
                  <span style={compactKpiValueStyle}>{metrics.assessment_coverage}%</span>
                </div>
              </div>
              <div style={compactKpiArrowStyle}><ArrowRight size={11} /></div>
            </div>
          </div>

          {/* ================= ROW 2: STUDENT OVERVIEW & HEALTH OVERVIEW ================= */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: twoColGridColumns,
              gap: '10px',
              width: '100%',
              flex: '1 1 0',
              minHeight: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* Student Overview Donut Card */}
            <div style={compactCardStyle}>
              <div style={compactCardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} color="#EA580C" />
                  <h3 style={compactCardTitleStyle}>Student Overview</h3>
                </div>

                <select 
                  style={compactSelectStyle}
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                >
                  <option value="ALL">All Schools</option>
                  <option value="greenwood">Greenwood Public</option>
                  <option value="sunrise">Sunrise Int</option>
                </select>
              </div>

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  flex: 1
                }}
              >
                {/* SVG Donut Ring */}
                <div 
                  style={{
                    position: 'relative',
                    width: '115px',
                    height: '115px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="13" />
                    {/* Teal Arc (Male Students: 51.5%) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#14B8A6"
                      strokeWidth="13"
                      strokeDasharray={`${maleStrokeDash} ${circumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Orange Arc (Female Students: 48.5%) */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#F05A24"
                      strokeWidth="13"
                      strokeDasharray={`${femaleStrokeDash} ${circumference}`}
                      strokeDashoffset={`-${maleStrokeDash}`}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Centered Number */}
                  <div 
                    style={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                      {metrics.total_students.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                      Total Students
                    </span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'inline-block' }} />
                      <span>Male Students</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', paddingLeft: '13px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        {metrics.male_students.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                        {metrics.male_percentage}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#F05A24', display: 'inline-block' }} />
                      <span>Female Students</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', paddingLeft: '13px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        {metrics.female_students.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                        {metrics.female_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Overview Progress Bars */}
            <div style={compactCardStyle}>
              <div style={compactCardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} color="#EA580C" />
                  <h3 style={compactCardTitleStyle}>Health Overview</h3>
                </div>

                <select 
                  style={compactSelectStyle}
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                >
                  <option value="ALL">All Schools</option>
                  <option value="greenwood">Greenwood Public</option>
                </select>
              </div>

              {/* 5 Compact Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%', flex: 1, justifyContent: 'center' }}>
                {/* Normal */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Normal</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${metrics.health_normal_pct}%`, backgroundColor: '#10B981' }} />
                  </div>
                  <span style={compactHealthCount}>{metrics.health_normal.toLocaleString()}</span>
                  <span style={compactHealthPct}>{metrics.health_normal_pct}%</span>
                </div>

                {/* Wasted */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Wasted</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${metrics.health_wasted_pct * 3}%`, backgroundColor: '#F59E0B' }} />
                  </div>
                  <span style={compactHealthCount}>{metrics.health_wasted}</span>
                  <span style={compactHealthPct}>{metrics.health_wasted_pct}%</span>
                </div>

                {/* Severely Wasted */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Severely Wasted</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${metrics.health_severely_wasted_pct * 3}%`, backgroundColor: '#EF4444' }} />
                  </div>
                  <span style={compactHealthCount}>{metrics.health_severely_wasted}</span>
                  <span style={compactHealthPct}>{metrics.health_severely_wasted_pct}%</span>
                </div>

                {/* Overweight */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Overweight</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${metrics.health_overweight_pct * 3}%`, backgroundColor: '#14B8A6' }} />
                  </div>
                  <span style={compactHealthCount}>{metrics.health_overweight}</span>
                  <span style={compactHealthPct}>{metrics.health_overweight_pct}%</span>
                </div>

                {/* Obesity */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Obesity</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${metrics.health_obesity_pct * 3}%`, backgroundColor: '#EA580C' }} />
                  </div>
                  <span style={compactHealthCount}>{metrics.health_obesity}</span>
                  <span style={compactHealthPct}>{metrics.health_obesity_pct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ROW 3: SCHOOL DISTRIBUTION & RECENT ACTIVITY ================= */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: twoColGridColumns,
              gap: '10px',
              width: '100%',
              flex: '1 1 0',
              minHeight: 0,
              boxSizing: 'border-box'
            }}
          >
            {/* School-wise Student Distribution */}
            <div style={compactCardStyle}>
              <div style={compactCardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <School size={15} color="#EA580C" />
                  <h3 style={compactCardTitleStyle}>School-wise Student Distribution</h3>
                </div>

                <select 
                  style={compactSelectStyle}
                  value={topSchoolsLimit}
                  onChange={(e) => setTopSchoolsLimit(Number(e.target.value))}
                >
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>

              {/* Table */}
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8', width: '24px' }}>#</th>
                      <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>School Name</th>
                      <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Cluster</th>
                      <th style={{ padding: '0 8px 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8', textAlign: 'right' }}>Students</th>
                      <th style={{ padding: '0 0 4px 0', width: '80px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '5px 0', color: '#94A3B8', fontSize: '11.5px', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '5px 0', color: '#0F172A', fontSize: '12px', fontWeight: 600 }}>{item.name}</td>
                        <td style={{ padding: '5px 0', color: '#64748B', fontSize: '11.5px' }}>{item.cluster}</td>
                        <td style={{ padding: '5px 8px 5px 0', color: '#0F172A', fontSize: '12px', fontWeight: 700, textAlign: 'right' }}>
                          {item.students}
                        </td>
                        <td style={{ padding: '5px 0' }}>
                          <div style={{ width: '70px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${item.maxPct}%`, backgroundColor: '#EB5A1D', borderRadius: '99px' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={compactCardStyle}>
              <div style={compactCardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#EA580C" />
                  <h3 style={compactCardTitleStyle}>Recent Activity</h3>
                </div>

                <button 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EB5A1D',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', flex: 1, justifyContent: 'center' }}>
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div 
                      key={act.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        width: '100%'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div 
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: act.bg,
                            color: act.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Icon size={14} />
                        </div>
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {act.subtitle}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {act.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ================= ROW 4: UPCOMING ACTIVITY ================= */}
          <div style={{ ...compactCardStyle, flex: '0 0 auto', padding: '8px 14px' }}>
            <div style={{ ...compactCardHeaderStyle, marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#EA580C" />
                <h3 style={compactCardTitleStyle}>Upcoming Activity</h3>
              </div>

              <button 
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EB5A1D',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                View All
              </button>
            </div>

            <div style={{ width: '100%', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Activity</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>School</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Date</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div 
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '5px',
                            backgroundColor: '#FFEDD5',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <FileText size={13} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '12px', color: '#0F172A' }}>
                          Monthly Assessment
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '5px 0', color: '#475569', fontSize: '12px' }}>
                      Greenwood Public School
                    </td>
                    <td style={{ padding: '5px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '12px' }}>
                        <Calendar size={13} color="#94A3B8" />
                        <span>Friday, 2 October 2026</span>
                      </div>
                    </td>
                    <td style={{ padding: '5px 0' }}>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '99px'
                        }}
                      >
                        Scheduled
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
        )}
      </div>
    </div>
  );
}

/* ================= COMPACT PURE REACT STYLE OBJECTS ================= */

const compactKpiCardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '10px',
  padding: '8px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '6px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  minWidth: 0,
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const compactKpiLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  overflow: 'hidden'
};

const compactKpiIconBoxStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '7px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const compactKpiInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  overflow: 'hidden'
};

const compactKpiLabelStyle = {
  fontSize: '10.5px',
  fontWeight: 600,
  color: '#64748B',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const compactKpiValueStyle = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#0F172A',
  lineHeight: 1.1,
  marginTop: '1px',
  whiteSpace: 'nowrap'
};

const compactKpiArrowStyle = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  color: '#94A3B8',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const compactCardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '12px',
  padding: '10px 14px',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
};

const compactCardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
  width: '100%',
  flexShrink: 0
};

const compactCardTitleStyle = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#0F172A',
  margin: 0,
  letterSpacing: '-0.01em'
};

const compactSelectStyle = {
  height: '26px',
  padding: '0 8px',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  backgroundColor: '#FFFFFF',
  color: '#334155',
  fontSize: '11px',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer'
};

const compactHealthBarRow = {
  display: 'grid',
  gridTemplateColumns: '95px minmax(0, 1fr) 38px 38px',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11.5px',
  width: '100%',
  minWidth: 0
};

const compactHealthLabel = {
  fontWeight: 500,
  color: '#475569',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const compactHealthTrack = {
  height: '7px',
  backgroundColor: '#F1F5F9',
  borderRadius: '99px',
  overflow: 'hidden',
  width: '100%'
};

const compactHealthFill = {
  height: '100%',
  borderRadius: '99px',
  transition: 'width 0.4s ease'
};

const compactHealthCount = {
  fontWeight: 700,
  color: '#0F172A',
  textAlign: 'right',
  fontSize: '11.5px'
};

const compactHealthPct = {
  color: '#64748B',
  textAlign: 'right',
  fontSize: '11px'
};
