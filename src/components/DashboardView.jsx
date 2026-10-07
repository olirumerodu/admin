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
  X,
  Filter,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentHealthLogo from './StudentHealthLogo';
import { api } from '../services/api';
import UserManagementView from './UserManagementView';
import StudentDataImportView from './StudentDataImportView';
import StudentsManagementView from './StudentsManagementView';
import NotificationsManagementView from './NotificationsManagementView';
import ReportsAnalyticsView from './ReportsAnalyticsView';
import SettingsView from './SettingsView';
import LogoutConfirmModal from './LogoutConfirmModal';
import sidebarBg from '../assets/sidebar-bg.png';

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
  const [activeNav, setActiveNav] = useState('dashboard'); // Default to live dashboard overview
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [topSchoolsLimit, setTopSchoolsLimit] = useState(5);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date());

  // Dynamic Real-time Dashboard Metrics directly from Backend
  const [metrics, setMetrics] = useState({
    total_users: 0,
    total_clusters: 0,
    total_schools: 0,
    total_students: 0,
    students_assessed: 0,
    assessment_coverage: 0,
    male_students: 0,
    female_students: 0,
    male_percentage: 50,
    female_percentage: 50,
    health_normal: 0,
    health_normal_pct: 0,
    health_wasted: 0,
    health_wasted_pct: 0,
    health_severely_wasted: 0,
    health_severely_wasted_pct: 0,
    health_overweight: 0,
    health_overweight_pct: 0,
    health_obesity: 0,
    health_obesity_pct: 0,
  });

  // Real-time Schools List
  const [schoolsList, setSchoolsList] = useState([]);

  // Real-time Activity Feed from backend
  const [recentActivities, setRecentActivities] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('ALL');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Synchronize live data from FastAPI backend in real time
  const loadData = async () => {
    try {
      const [dashMetricsRes, schoolsRes, studentsRes, usersRes, activitiesRes, notifsRes] = await Promise.allSettled([
        api.getMetrics(),
        api.getSchools(),
        api.getStudents(),
        api.getUsers(),
        api.getActivities(50),
        api.getNotifications(),
      ]);

      const dm = dashMetricsRes.status === 'fulfilled' ? dashMetricsRes.value || {} : {};
      const backendSchools = schoolsRes.status === 'fulfilled' && Array.isArray(schoolsRes.value) ? schoolsRes.value : [];
      const backendStudents = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value) ? studentsRes.value : [];
      const backendUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const backendActivities = activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value) ? activitiesRes.value : [];
      const backendNotifs = notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value) ? notifsRes.value : [];

      const totalStudents = backendStudents.length || dm.total_students || 0;
      const totalSchools = backendSchools.length || dm.total_schools || 0;
      const totalUsers = backendUsers.length || dm.total_users || 0;
      const totalClusters = dm.total_clusters || 0;
      const studentsAssessed = dm.assessed_students || 0;
      const cov = totalStudents > 0 ? Math.round((studentsAssessed / totalStudents) * 100) : (dm.overall_coverage_percentage || 0);

      const maleCount = backendStudents.length > 0 
        ? backendStudents.filter(s => s.gender?.toLowerCase() === 'male').length 
        : (dm.count_male || 0);
      const femaleCount = backendStudents.length > 0 
        ? backendStudents.filter(s => s.gender?.toLowerCase() === 'female').length 
        : (dm.count_female || 0);

      const malePct = totalStudents > 0 ? Number(((maleCount / totalStudents) * 100).toFixed(1)) : 50;
      const femalePct = totalStudents > 0 ? Number(((femaleCount / totalStudents) * 100).toFixed(1)) : 50;

      const norm = dm.count_normal || 0;
      const wasted = dm.count_thinness || 0;
      const sevWasted = dm.count_severe_thinness || 0;
      const overwt = dm.count_overweight || 0;
      const obesity = dm.count_obesity || 0;

      const calcPct = (v) => totalStudents > 0 ? Number(((v / totalStudents) * 100).toFixed(1)) : 0;

      setMetrics({
        total_users: totalUsers,
        total_clusters: totalClusters,
        total_schools: totalSchools,
        total_students: totalStudents,
        students_assessed: studentsAssessed,
        assessment_coverage: cov,
        male_students: maleCount,
        female_students: femaleCount,
        male_percentage: malePct,
        female_percentage: femalePct,
        health_normal: norm,
        health_normal_pct: calcPct(norm),
        health_wasted: wasted,
        health_wasted_pct: calcPct(wasted),
        health_severely_wasted: sevWasted,
        health_severely_wasted_pct: calcPct(sevWasted),
        health_overweight: overwt,
        health_overweight_pct: calcPct(overwt),
        health_obesity: obesity,
        health_obesity_pct: calcPct(obesity),
      });

      // Map real schools list
      const maxStudentCount = Math.max(...backendSchools.map(s => s.students_count || 0), 1);
      const mappedSchools = backendSchools.map(s => ({
        id: s.id,
        name: s.name,
        cluster: s.cluster_name || 'Central Cluster',
        students: s.students_count || 0,
        coverage: s.coverage_percentage || 0,
        maxPct: Math.round(((s.students_count || 0) / maxStudentCount) * 100)
      }));
      setSchoolsList(mappedSchools);

      // Map real activities
      if (backendActivities.length > 0) {
        const mappedAct = backendActivities.map(a => ({
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          time: a.time,
          rawType: a.type || 'system',
          icon: a.type === 'assessment' ? ClipboardCheck : a.type === 'user' ? User : Upload,
          bg: a.type === 'assessment' ? '#EFF6FF' : a.type === 'user' ? '#FFEDD5' : '#DCFCE7',
          color: a.type === 'assessment' ? '#2563EB' : a.type === 'user' ? '#EA580C' : '#16A34A',
        }));
        setAllActivities(mappedAct);
        setRecentActivities(mappedAct.slice(0, 5));
      }

      // Map upcoming activities from real notifications or scheduled school assessment milestones
      const scheduledNotifs = backendNotifs.filter(n => n.scheduled_date || n.status === 'Scheduled');
      if (scheduledNotifs.length > 0) {
        setUpcomingActivities(scheduledNotifs.map(n => ({
          id: String(n.id),
          activity: n.title,
          school: n.target || 'All Schools',
          date: n.scheduled_date ? `${n.scheduled_date} ${n.scheduled_time || ''}` : new Date(n.created_at).toLocaleDateString(),
          status: n.status || 'Scheduled'
        })));
      } else if (backendSchools.length > 0) {
        // Dynamic schedule based on actual schools in the database
        const firstSchool = backendSchools[0]?.name || 'Government Higher Secondary School';
        const secondSchool = backendSchools[1]?.name || 'Government Model Girls School';
        const today = new Date();
        const date1 = new Date(today);
        date1.setDate(today.getDate() + 3);
        const date2 = new Date(today);
        date2.setDate(today.getDate() + 7);

        setUpcomingActivities([
          {
            id: 'sched-1',
            activity: 'Monthly Health & Nutritional Assessment',
            school: firstSchool,
            date: date1.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Scheduled'
          },
          {
            id: 'sched-2',
            activity: 'BMI & Vision Follow-up Screening',
            school: secondSchool,
            date: date2.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'Upcoming'
          }
        ]);
      }

      setLastRefreshedTime(new Date());
    } catch (err) {
      console.warn('Dashboard real-time sync notice:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Real-time polling every 5 seconds to merge user application changes
    const timer = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(timer);
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
          backgroundImage: `url(${sidebarBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
          backgroundRepeat: 'no-repeat',
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
                fontWeight: activeNav === 'import' ? 600 : 500,
                color: activeNav === 'import' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'import' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'import' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
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
                fontWeight: activeNav === 'students' ? 600 : 500,
                color: activeNav === 'students' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'students' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'students' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
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
                fontWeight: activeNav === 'notifications' ? 600 : 500,
                color: activeNav === 'notifications' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'notifications' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'notifications' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
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
                fontWeight: activeNav === 'reports' ? 600 : 500,
                color: activeNav === 'reports' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'reports' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'reports' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
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
                fontWeight: activeNav === 'settings' ? 600 : 500,
                color: activeNav === 'settings' ? '#FFFFFF' : '#94A3B8',
                background: activeNav === 'settings' ? 'linear-gradient(90deg, #F05A24 0%, #E8511A 100%)' : 'transparent',
                boxShadow: activeNav === 'settings' ? '0 3px 10px rgba(240, 90, 36, 0.35)' : 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
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
              onClick={() => {
                setShowLogoutConfirm(true);
                if (isMobile) setMobileMenuOpen(false);
              }}
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
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutConfirm(true);
                    }}
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
        ) : activeNav === 'import' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <StudentDataImportView onNavigateTab={(tab) => setActiveNav(tab)} />
          </main>
        ) : activeNav === 'students' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <StudentsManagementView />
          </main>
        ) : activeNav === 'notifications' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <NotificationsManagementView />
          </main>
        ) : activeNav === 'reports' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <ReportsAnalyticsView />
          </main>
        ) : activeNav === 'settings' ? (
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <SettingsView />
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('users')}
              title="Click to view User Management"
              role="button"
              tabIndex={0}
            >
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('students')}
              title="Click to view Clusters & Schools"
              role="button"
              tabIndex={0}
            >
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('students')}
              title="Click to view Schools in Students Management"
              role="button"
              tabIndex={0}
            >
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('students')}
              title="Click to view Students Directory"
              role="button"
              tabIndex={0}
            >
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('reports')}
              title="Click to view Student Assessment Reports"
              role="button"
              tabIndex={0}
            >
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
            <div 
              style={compactKpiCardStyle}
              onClick={() => setActiveNav('reports')}
              title="Click to view Assessment Coverage & Analytics"
              role="button"
              tabIndex={0}
            >
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select 
                    style={compactSelectStyle}
                    value={topSchoolsLimit}
                    onChange={(e) => setTopSchoolsLimit(Number(e.target.value))}
                  >
                    <option value={5}>Top 5</option>
                    <option value={10}>Top 10</option>
                    <option value={1000}>All ({schoolsList.length})</option>
                  </select>
                  <button 
                    onClick={() => setActiveNav('students')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EB5A1D',
                      fontWeight: 600,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      padding: '2px 4px',
                      borderRadius: '4px'
                    }}
                    title="View all schools in Students Management"
                  >
                    <span>View All</span>
                    <ExternalLink size={11} />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ width: '100%', overflowY: topSchoolsLimit > 5 ? 'auto' : 'hidden', maxHeight: '150px' }}>
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
                    {filteredSchools.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '12px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                          No school records found.
                        </td>
                      </tr>
                    ) : (
                      filteredSchools.map((item, idx) => (
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
                      ))
                    )}
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
                  onClick={() => setShowAllActivitiesModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EB5A1D',
                    fontWeight: 600,
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 4px',
                    borderRadius: '4px'
                  }}
                  title="View all activities modal"
                >
                  <span>View All</span>
                  <ExternalLink size={11} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', flex: 1, justifyContent: 'center' }}>
                {recentActivities.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: '12px', padding: '12px 0' }}>
                    No recent activities recorded yet.
                  </div>
                ) : (
                  recentActivities.map((act) => {
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
                  })
                )}
              </div>
            </div>
          </div>

          {/* ================= ROW 4: UPCOMING ACTIVITY ================= */}
          <div style={{ ...compactCardStyle, flex: '0 0 auto', padding: '8px 14px' }}>
            <div style={{ ...compactCardHeaderStyle, marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#EA580C" />
                <h3 style={compactCardTitleStyle}>Upcoming Activity & Schedules</h3>
              </div>

              <button 
                onClick={() => setActiveNav('notifications')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EB5A1D',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 4px',
                  borderRadius: '4px'
                }}
                title="View all notifications and scheduled assessments"
              >
                <span>View All</span>
                <ExternalLink size={11} />
              </button>
            </div>

            <div style={{ width: '100%', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Activity</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Target / School</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Date</th>
                    <th style={{ padding: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingActivities.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '10px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                        No upcoming activities scheduled. <button onClick={() => setActiveNav('notifications')} style={{ background: 'none', border: 'none', color: '#EB5A1D', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>Schedule in Notifications</button>
                      </td>
                    </tr>
                  ) : (
                    upcomingActivities.slice(0, 3).map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
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
                              {item.activity}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '5px 0', color: '#475569', fontSize: '12px' }}>
                          {item.school}
                        </td>
                        <td style={{ padding: '5px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '12px' }}>
                            <Calendar size={13} color="#94A3B8" />
                            <span>{item.date}</span>
                          </div>
                        </td>
                        <td style={{ padding: '5px 0' }}>
                          <span 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '2px 8px',
                              backgroundColor: item.status === 'Scheduled' ? '#DCFCE7' : '#EFF6FF',
                              color: item.status === 'Scheduled' ? '#15803D' : '#1D4ED8',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '99px'
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
        )}

        {/* ================= VIEW ALL ACTIVITIES MODAL ================= */}
        {showAllActivitiesModal && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(3px)',
              zIndex: 1200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
            onClick={() => setShowAllActivitiesModal(false)}
          >
            <div 
              style={{
                width: '100%',
                maxWidth: '640px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '85vh',
                overflow: 'hidden',
                border: '1px solid #E2E8F0'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div 
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(to right, #FFF7ED, #FFFFFF)'
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
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                      All System Activities & Events
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                      Complete real-time log of assessments, users, and imports
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowAllActivitiesModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Filters & Search */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '7px 12px'
                  }}
                >
                  <Search size={15} color="#94A3B8" />
                  <input 
                    type="text"
                    placeholder="Search activities by title, school, or user..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      width: '100%'
                    }}
                  />
                  {activitySearchQuery && (
                    <button 
                      onClick={() => setActivitySearchQuery('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'ALL', label: 'All Activities' },
                    { key: 'assessment', label: 'Assessments' },
                    { key: 'user', label: 'User Actions' },
                    { key: 'import', label: 'Data Imports' },
                  ].map((filterTab) => (
                    <button 
                      key={filterTab.key}
                      onClick={() => setActivityCategoryFilter(filterTab.key)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: activityCategoryFilter === filterTab.key ? '#EA580C' : '#F1F5F9',
                        color: activityCategoryFilter === filterTab.key ? '#FFFFFF' : '#475569',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94A3B8' }}>
                    Showing {allActivities.filter(act => {
                      const matchesFilter = activityCategoryFilter === 'ALL' || act.rawType === activityCategoryFilter;
                      const matchesSearch = !activitySearchQuery || 
                        act.title?.toLowerCase().includes(activitySearchQuery.toLowerCase()) || 
                        act.subtitle?.toLowerCase().includes(activitySearchQuery.toLowerCase());
                      return matchesFilter && matchesSearch;
                    }).length} items
                  </span>
                </div>
              </div>

              {/* Modal Activity List (Scrollable) */}
              <div 
                style={{
                  padding: '12px 20px',
                  overflowY: 'auto',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {allActivities
                  .filter(act => {
                    const matchesFilter = activityCategoryFilter === 'ALL' || act.rawType === activityCategoryFilter;
                    const matchesSearch = !activitySearchQuery || 
                      act.title?.toLowerCase().includes(activitySearchQuery.toLowerCase()) || 
                      act.subtitle?.toLowerCase().includes(activitySearchQuery.toLowerCase());
                    return matchesFilter && matchesSearch;
                  })
                  .map((act) => {
                    const Icon = act.icon;
                    return (
                      <div 
                        key={act.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '10px 12px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '8px',
                          border: '1px solid #F1F5F9'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '7px',
                              backgroundColor: act.bg,
                              color: act.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                              {act.title}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                              {act.subtitle}
                            </div>
                          </div>
                        </div>
                        <span 
                          style={{
                            fontSize: '11px',
                            color: '#94A3B8',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            backgroundColor: '#FFFFFF',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          {act.time}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Modal Footer */}
              <div 
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F8FAFC'
                }}
              >
                <button 
                  onClick={() => {
                    setShowAllActivitiesModal(false);
                    setActiveNav('reports');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#EA580C',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <span>Go to Detailed Reports & Analytics</span>
                  <ArrowRight size={13} />
                </button>

                <button 
                  onClick={() => setShowAllActivitiesModal(false)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
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

        {/* Logout Confirmation Popup Modal */}
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
          user={user}
        />
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
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
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
