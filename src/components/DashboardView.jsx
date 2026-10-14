import React, { useState, useEffect, useMemo } from 'react';
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
  const [dashboardSchoolFilter, setDashboardSchoolFilter] = useState('ALL');
  const [studentSchoolFilter, setStudentSchoolFilter] = useState('ALL');
  const [healthSchoolFilter, setHealthSchoolFilter] = useState('ALL');
  const [rawStudents, setRawStudents] = useState([]);
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
    male_percentage: 0,
    female_percentage: 0,
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

  // Real-time Schools List from Database
  const [schoolsList, setSchoolsList] = useState([]);

  // Real-time Upcoming Schedules from database
  const [upcomingActivities, setUpcomingActivities] = useState([]);

  // Synchronize live data from FastAPI backend in real time
  const loadData = async (filterTarget = dashboardSchoolFilter) => {
    try {
      const isFiltered = filterTarget && filterTarget !== 'ALL';
      const [dashMetricsRes, schoolsRes, studentsRes, usersRes, notifsRes] = await Promise.allSettled([
        api.getMetrics(isFiltered ? filterTarget : null),
        api.getSchools(),
        api.getStudents(),
        api.getUsers(),
        api.getNotifications(),
      ]);

      const dm = dashMetricsRes.status === 'fulfilled' ? dashMetricsRes.value || {} : {};
      const backendSchools = schoolsRes.status === 'fulfilled' && Array.isArray(schoolsRes.value) ? schoolsRes.value : [];
      const backendStudents = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value) ? studentsRes.value : [];
      const backendUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value : [];
      const backendNotifs = notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value) ? notifsRes.value : [];

      const totalStudents = dm.total_students ?? backendStudents.length ?? 0;
      const totalSchools = dm.total_schools ?? backendSchools.length ?? 0;
      const totalUsers = dm.total_users ?? backendUsers.length ?? 0;
      const totalClusters = dm.total_clusters ?? 0;
      const studentsAssessed = dm.assessed_students ?? 0;
      const cov = dm.overall_coverage_percentage ?? (totalStudents > 0 ? Math.round((studentsAssessed / totalStudents) * 100) : 0);

      const maleCount = dm.count_male ?? (backendStudents.length > 0 
        ? backendStudents.filter(s => s.gender?.toLowerCase() === 'male').length 
        : 0);
      const femaleCount = dm.count_female ?? (backendStudents.length > 0 
        ? backendStudents.filter(s => s.gender?.toLowerCase() === 'female').length 
        : 0);

      const malePct = totalStudents > 0 ? Number(((maleCount / totalStudents) * 100).toFixed(1)) : 0;
      const femalePct = totalStudents > 0 ? Number(((femaleCount / totalStudents) * 100).toFixed(1)) : 0;

      const norm = dm.count_normal ?? 0;
      const wasted = dm.count_thinness ?? 0;
      const sevWasted = dm.count_severe_thinness ?? 0;
      const overwt = dm.count_overweight ?? 0;
      const obesity = dm.count_obesity ?? 0;

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

      // Map real schools list from database
      const maxStudentCount = Math.max(...backendSchools.map(s => s.students_count || 0), 1);
      const mappedSchools = backendSchools.map(s => ({
        id: String(s.id),
        name: s.name,
        cluster: s.cluster_name || 'District',
        students: s.students_count || 0,
        coverage: s.coverage_percentage || 0,
        maxPct: Math.round(((s.students_count || 0) / maxStudentCount) * 100)
      }));
      setSchoolsList(mappedSchools);
      setRawStudents(backendStudents);

      // Lightweight dashboard feed synced

      // Map upcoming activities only from real database notifications / schedules (no hardcoded fallback)
      const scheduledNotifs = backendNotifs.filter(n => n.scheduled_date || n.status === 'Scheduled');
      if (scheduledNotifs.length > 0) {
        setUpcomingActivities(scheduledNotifs.map(n => ({
          id: String(n.id),
          activity: n.title,
          school: n.target || 'All Schools',
          date: n.scheduled_date ? `${n.scheduled_date} ${n.scheduled_time || ''}` : new Date(n.created_at).toLocaleDateString(),
          status: n.status || 'Scheduled'
        })));
      } else {
        setUpcomingActivities([]);
      }

      setLastRefreshedTime(new Date());
    } catch (err) {
      console.warn('Dashboard real-time sync notice:', err);
    }
  };

  useEffect(() => {
    loadData(dashboardSchoolFilter);
    // Real-time polling every 5 seconds to merge database changes
    const timer = setInterval(() => {
      loadData(dashboardSchoolFilter);
    }, 5000);
    return () => clearInterval(timer);
  }, [dashboardSchoolFilter]);

  const handleDashboardSchoolFilterChange = (newSchoolId) => {
    setDashboardSchoolFilter(newSchoolId);
    setStudentSchoolFilter(newSchoolId);
    setHealthSchoolFilter(newSchoolId);
    loadData(newSchoolId);
  };

  const filteredSchools = schoolsList
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.cluster.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, topSchoolsLimit);

  // Student Overview Dynamic Computation based on Selected Real School
  const studentOverviewData = useMemo(() => {
    let list = rawStudents.filter(s => !s.enrollment_status || s.enrollment_status === 'Active');
    const isFiltered = studentSchoolFilter && studentSchoolFilter !== 'ALL';
    if (isFiltered) {
      list = list.filter(s => 
        String(s.school_id || '').trim().toLowerCase() === String(studentSchoolFilter).trim().toLowerCase() ||
        String(s.school_name || '').trim().toLowerCase() === String(studentSchoolFilter).trim().toLowerCase()
      );
    }
    const total = list.length;
    const male = list.filter(s => s.gender?.toLowerCase() === 'male').length;
    const female = list.filter(s => s.gender?.toLowerCase() === 'female').length;

    if (total > 0) {
      const malePct = Number(((male / total) * 100).toFixed(1));
      const femalePct = Number(((female / total) * 100).toFixed(1));
      return { total, male, female, malePct, femalePct };
    }

    if (!isFiltered) {
      return {
        total: metrics.total_students,
        male: metrics.male_students,
        female: metrics.female_students,
        malePct: metrics.male_percentage || 0,
        femalePct: metrics.female_percentage || 0,
      };
    }

    return { total: 0, male: 0, female: 0, malePct: 0, femalePct: 0 };
  }, [rawStudents, studentSchoolFilter, metrics]);

  // Health Overview Dynamic Computation based on Selected Real School
  const healthOverviewData = useMemo(() => {
    let list = rawStudents.filter(s => !s.enrollment_status || s.enrollment_status === 'Active');
    const isFiltered = healthSchoolFilter && healthSchoolFilter !== 'ALL';
    if (isFiltered) {
      list = list.filter(s => 
        String(s.school_id || '').trim().toLowerCase() === String(healthSchoolFilter).trim().toLowerCase() ||
        String(s.school_name || '').trim().toLowerCase() === String(healthSchoolFilter).trim().toLowerCase()
      );
    }

    const total = list.length;
    if (total > 0) {
      const getStatus = (s) => (s.nutrition_status || s.assessments?.[0]?.nutrition_status || '').toLowerCase();

      const normal = list.filter(s => {
        const st = getStatus(s);
        return st.includes('normal') || (!st && !s.is_follow_up_required);
      }).length;

      const wasted = list.filter(s => {
        const st = getStatus(s);
        return (st.includes('wasted') || st.includes('thinness')) && !st.includes('severe');
      }).length;

      const sevWasted = list.filter(s => {
        const st = getStatus(s);
        return st.includes('severe');
      }).length;

      const overweight = list.filter(s => {
        const st = getStatus(s);
        return st.includes('overweight');
      }).length;

      const obesity = list.filter(s => {
        const st = getStatus(s);
        return st.includes('obese') || st.includes('obesity');
      }).length;

      const calcPct = (v) => Number(((v / total) * 100).toFixed(1));

      return {
        total,
        normal,
        normalPct: calcPct(normal),
        wasted,
        wastedPct: calcPct(wasted),
        sevWasted,
        sevWastedPct: calcPct(sevWasted),
        overweight,
        overweightPct: calcPct(overweight),
        obesity,
        obesityPct: calcPct(obesity),
      };
    }

    if (!isFiltered) {
      return {
        total: metrics.students_assessed || metrics.total_students,
        normal: metrics.health_normal,
        normalPct: metrics.health_normal_pct,
        wasted: metrics.health_wasted,
        wastedPct: metrics.health_wasted_pct,
        sevWasted: metrics.health_severely_wasted,
        sevWastedPct: metrics.health_severely_wasted_pct,
        overweight: metrics.health_overweight,
        overweightPct: metrics.health_overweight_pct,
        obesity: metrics.health_obesity,
        obesityPct: metrics.health_obesity_pct,
      };
    }

    return {
      total: 0,
      normal: 0,
      normalPct: 0,
      wasted: 0,
      wastedPct: 0,
      sevWasted: 0,
      sevWastedPct: 0,
      overweight: 0,
      overweightPct: 0,
      obesity: 0,
      obesityPct: 0,
    };
  }, [rawStudents, healthSchoolFilter, metrics]);

  // Compact donut chart calculations (radius: 46px)
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const maleStrokeDash = (studentOverviewData.malePct / 100) * circumference;
  const femaleStrokeDash = (studentOverviewData.femalePct / 100) * circumference;

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
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
          /* Clean, Maintainable Dashboard Main Screen */
          <main 
            style={{
              padding: isMobile ? '12px 14px' : '18px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              flex: 1,
              height: 'calc(100vh - 52px)',
              maxHeight: 'calc(100vh - 52px)',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box'
            }}
          >
          {/* Header Row: Title & Subtitle inline, and Live Database School Filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                Dashboard
              </h1>
              <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 450 }}>
                System overview & real-time database analytics
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <School size={14} color="#EA580C" />
                <span>Filter School:</span>
              </span>
              <select 
                style={{
                  ...compactSelectStyle,
                  borderColor: dashboardSchoolFilter !== 'ALL' ? '#EA580C' : '#E2E8F0',
                  backgroundColor: dashboardSchoolFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
                  fontWeight: 600
                }}
                value={dashboardSchoolFilter}
                onChange={(e) => handleDashboardSchoolFilterChange(e.target.value)}
              >
                <option value="ALL">All Schools ({schoolsList.length})</option>
                {schoolsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
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
                  value={studentSchoolFilter}
                  onChange={(e) => setStudentSchoolFilter(e.target.value)}
                >
                  <option value="ALL">All Schools ({schoolsList.length})</option>
                  {schoolsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
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
                    {/* Teal Arc (Male Students) */}
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
                    {/* Orange Arc (Female Students) */}
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
                      {studentOverviewData.total.toLocaleString()}
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
                        {studentOverviewData.male.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                        {studentOverviewData.malePct}%
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
                        {studentOverviewData.female.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                        {studentOverviewData.femalePct}%
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
                  value={healthSchoolFilter}
                  onChange={(e) => setHealthSchoolFilter(e.target.value)}
                >
                  <option value="ALL">All Schools ({schoolsList.length})</option>
                  {schoolsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* 5 Compact Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', width: '100%', flex: 1, justifyContent: 'center' }}>
                {/* Normal */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Normal</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${healthOverviewData.normalPct}%`, backgroundColor: '#10B981' }} />
                  </div>
                  <span style={compactHealthCount}>{healthOverviewData.normal.toLocaleString()}</span>
                  <span style={compactHealthPct}>{healthOverviewData.normalPct}%</span>
                </div>

                {/* Wasted */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Wasted</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${Math.min(100, healthOverviewData.wastedPct * 2)}%`, backgroundColor: '#F59E0B' }} />
                  </div>
                  <span style={compactHealthCount}>{healthOverviewData.wasted}</span>
                  <span style={compactHealthPct}>{healthOverviewData.wastedPct}%</span>
                </div>

                {/* Severely Wasted */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Severely Wasted</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${Math.min(100, healthOverviewData.sevWastedPct * 2)}%`, backgroundColor: '#EF4444' }} />
                  </div>
                  <span style={compactHealthCount}>{healthOverviewData.sevWasted}</span>
                  <span style={compactHealthPct}>{healthOverviewData.sevWastedPct}%</span>
                </div>

                {/* Overweight */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Overweight</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${Math.min(100, healthOverviewData.overweightPct * 2)}%`, backgroundColor: '#14B8A6' }} />
                  </div>
                  <span style={compactHealthCount}>{healthOverviewData.overweight}</span>
                  <span style={compactHealthPct}>{healthOverviewData.overweightPct}%</span>
                </div>

                {/* Obesity */}
                <div style={compactHealthBarRow}>
                  <span style={compactHealthLabel}>Obesity</span>
                  <div style={compactHealthTrack}>
                    <div style={{ ...compactHealthFill, width: `${Math.min(100, healthOverviewData.obesityPct * 2)}%`, backgroundColor: '#EA580C' }} />
                  </div>
                  <span style={compactHealthCount}>{healthOverviewData.obesity}</span>
                  <span style={compactHealthPct}>{healthOverviewData.obesityPct}%</span>
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

            {/* Upcoming Activity & Schedules */}
            <div style={compactCardStyle}>
              <div style={compactCardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={15} />
                  </div>
                  <div>
                    <h3 style={compactCardTitleStyle}>Upcoming Activity & Schedules</h3>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>Screening drives & events</p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveNav('notifications')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EB5A1D',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 6px',
                    borderRadius: '4px'
                  }}
                  title="View all notifications and scheduled assessments"
                >
                  <span>Manage</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <div style={{ width: '100%', overflowY: 'auto', maxHeight: '220px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <th style={{ padding: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Activity</th>
                      <th style={{ padding: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Target School</th>
                      <th style={{ padding: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Date</th>
                      <th style={{ padding: '0 0 6px 0', fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingActivities.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '24px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                          No upcoming activities scheduled.{' '}
                          <button 
                            onClick={() => setActiveNav('notifications')} 
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              color: '#EB5A1D', 
                              cursor: 'pointer', 
                              fontWeight: 600, 
                              textDecoration: 'underline' 
                            }}
                          >
                            Schedule in Notifications
                          </button>
                        </td>
                      </tr>
                    ) : (
                      upcomingActivities.slice(0, 5).map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                          <td style={{ padding: '7px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div 
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '5px',
                                  backgroundColor: '#FFEDD5',
                                  color: '#EA580C',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <FileText size={12} />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '12px', color: '#0F172A' }}>
                                {item.activity}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '7px 0', color: '#475569', fontSize: '12px' }}>
                            {item.school}
                          </td>
                          <td style={{ padding: '7px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '12px' }}>
                              <Calendar size={12} color="#94A3B8" />
                              <span>{item.date}</span>
                            </div>
                          </td>
                          <td style={{ padding: '7px 0' }}>
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
          </div>
        </main>
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

/* ================= CLEAN & MAINTAINABLE REACT STYLE OBJECTS ================= */

const compactKpiCardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #ECEEF2',
  borderRadius: '12px',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
  minWidth: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
};

const compactKpiLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0,
  overflow: 'hidden'
};

const compactKpiIconBoxStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
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
  fontSize: '11px',
  fontWeight: 600,
  color: '#64748B',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const compactKpiValueStyle = {
  fontSize: '20px',
  fontWeight: 800,
  color: '#0F172A',
  lineHeight: 1.15,
  marginTop: '2px',
  whiteSpace: 'nowrap'
};

const compactKpiArrowStyle = {
  width: '22px',
  height: '22px',
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
  borderRadius: '14px',
  padding: '16px 18px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
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
  marginBottom: '14px',
  width: '100%',
  flexShrink: 0
};

const compactCardTitleStyle = {
  fontSize: '14.5px',
  fontWeight: 700,
  color: '#0F172A',
  margin: 0,
  letterSpacing: '-0.01em'
};

const compactSelectStyle = {
  height: '28px',
  padding: '0 10px',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  backgroundColor: '#FFFFFF',
  color: '#334155',
  fontSize: '11.5px',
  fontWeight: 500,
  outline: 'none',
  cursor: 'pointer'
};

const compactHealthBarRow = {
  display: 'grid',
  gridTemplateColumns: '100px minmax(0, 1fr) 42px 42px',
  alignItems: 'center',
  gap: '10px',
  fontSize: '12px',
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
  height: '8px',
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
  fontSize: '12px'
};

const compactHealthPct = {
  color: '#64748B',
  textAlign: 'right',
  fontSize: '11.5px'
};
