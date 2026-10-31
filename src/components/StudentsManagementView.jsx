import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Home,
  Users,
  School,
  Building2,
  Network,
  Search,
  ArrowRight,
  ArrowLeft,
  Eye,
  RotateCcw,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  ClipboardCheck,
  BarChart2,
  BookOpen,
  ShieldCheck,
  Scale,
  Ruler,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  ChevronDown,
  Printer,
  Download,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  ArrowRightLeft,
  Layers,
  Trash2,
  Edit2,
  MoreVertical,
  UserCheck,
  FileSpreadsheet,
  Mail,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { filterScopeData } from '../utils/scopeFilter';
import { matchStudentSearch } from '../utils/studentSearch';
import SearchableDropdown from './SearchableDropdown';
import StudentGrowthChartModal from './StudentGrowthChartModal';
import SchoolGrowthChartModal from './SchoolGrowthChartModal';
import ClusterGrowthChartModal from './ClusterGrowthChartModal';
import AcademicPromotionModal from './AcademicPromotionModal';
import StudentTransferModal from './StudentTransferModal';
import StudentTcCertificateModal from './StudentTcCertificateModal';
import TCStudentIntakeModal from './TCStudentIntakeModal';
import EditClusterModal from './EditClusterModal';
import EditSchoolModal from './EditSchoolModal';
import EditStudentModal from './EditStudentModal';

// Authoritative WHO Nutrition Status Styling Helpers
export const getNutritionStatusColor = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (s.includes('severely wasted') || s.includes('severe thinness')) return '#DC2626';
  if (s.includes('wasted') || s.includes('thinness')) return '#EA580C';
  
  if (s.includes('stunted') || s.includes('stunting')) return '#D97706';
  
  if (s.includes('underweight')) return '#EA580C';
  if (s.includes('overweight') || s.includes('obesity') || s.includes('obese')) return '#D97706';
  if (s.includes('normal')) return '#16A34A';
  if (s.includes('not applicable')) return '#64748B';
  if (s.includes('absent')) return '#D97706';
  if (s.includes('tc issued')) return '#DC2626';
  if (s.includes('graduated')) return '#7C3AED';
  if (s.includes('pending')) return '#64748B';
  return '#64748B';
};

export const getNutritionStatusBg = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (s.includes('severely wasted') || s.includes('severe thinness')) return '#FEE2E2';
  if (s.includes('wasted') || s.includes('thinness')) return '#FFEDD5';
  if (s.includes('severely stunted') || s.includes('severe stunting')) return '#FEE2E2';
  if (s.includes('stunted') || s.includes('stunting')) return '#FEF3C7';
  if (s.includes('severely underweight')) return '#FEE2E2';
  if (s.includes('underweight')) return '#FFEDD5';
  if (s.includes('overweight') || s.includes('obesity') || s.includes('obese')) return '#FEF3C7';
  if (s.includes('normal')) return '#DCFCE7';
  if (s.includes('not applicable')) return '#F1F5F9';
  if (s.includes('absent')) return '#FEF3C7';
  if (s.includes('tc issued')) return '#FEF2F2';
  if (s.includes('graduated')) return '#F5F3FF';
  if (s.includes('pending')) return '#F1F5F9';
  return '#F1F5F9';
};

export const getNutritionStatusBorder = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (s.includes('severely wasted') || s.includes('severe thinness')) return '#FCA5A5';
  if (s.includes('wasted') || s.includes('thinness')) return '#FDBA74';
  if (s.includes('severely stunted') || s.includes('severe stunting')) return '#FCA5A5';
  if (s.includes('stunted') || s.includes('stunting')) return '#FCD34D';
  if (s.includes('severely underweight')) return '#FCA5A5';
  if (s.includes('underweight')) return '#FDBA74';
  if (s.includes('overweight') || s.includes('obesity') || s.includes('obese')) return '#FCD34D';
  if (s.includes('normal')) return '#86EFAC';
  if (s.includes('not applicable')) return '#CBD5E1';
  if (s.includes('absent')) return '#FCD34D';
  if (s.includes('tc issued')) return '#FECACA';
  if (s.includes('graduated')) return '#DDD6FE';
  if (s.includes('pending')) return '#CBD5E1';
  return '#CBD5E1';
};

// Responsive width hook
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// Student Avatar Illustrated SVG
function StudentAvatar({ size = 72 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#E0F2FE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#E0F2FE" />
        {/* Body / Shirt */}
        <path d="M22 92C22 75 34 68 50 68C66 68 78 75 78 92" fill="#38BDF8" />
        {/* Collar */}
        <path d="M42 68L50 78L58 68" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
        <path d="M35 70L44 82L40 92" fill="#FFFFFF" />
        <path d="M65 70L56 82L60 92" fill="#FFFFFF" />
        {/* Neck */}
        <rect x="44" y="58" width="12" height="12" rx="4" fill="#FBCFE8" />
        {/* Face */}
        <circle cx="50" cy="42" r="22" fill="#FDE2D2" />
        {/* Ears */}
        <circle cx="28" cy="42" r="5" fill="#FDE2D2" />
        <circle cx="72" cy="42" r="5" fill="#FDE2D2" />
        {/* Hair */}
        <path d="M28 36C28 22 36 16 50 16C64 16 72 22 72 36C70 33 66 31 60 30C54 29 46 32 40 28C36 32 32 34 28 36Z" fill="#1E293B" />
        {/* Eyes */}
        <circle cx="43" cy="41" r="2.5" fill="#0F172A" />
        <circle cx="57" cy="41" r="2.5" fill="#0F172A" />
        {/* Smile */}
        <path d="M44 49C46 52 54 52 56 49" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
        {/* Cheeks */}
        <circle cx="39" cy="46" r="3" fill="#FCA5A5" opacity="0.6" />
        <circle cx="61" cy="46" r="3" fill="#FCA5A5" opacity="0.6" />
      </svg>
    </div>
  );
}

// Session storage caching utilities for 0ms instantaneous navigation
export const getSessionCache = (key, fallback = null) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(`sh_cache_${key}`) || localStorage.getItem(`sh_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) ? parsed.length > 0 : (parsed && typeof parsed === 'object')) return parsed;
    }
  } catch (e) {}
  return fallback;
};

export const setSessionCache = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    if (data !== undefined && data !== null) {
      sessionStorage.setItem(`sh_cache_${key}`, JSON.stringify(data));
      localStorage.setItem(`sh_cache_${key}`, JSON.stringify(data));
    }
  } catch (e) {}
};

// Module-level persistent cache pre-hydrated from browser session/local storage
export const studentsMemoryCache = {
  clusters: getSessionCache('clusters', null),
  schools: getSessionCache('schools', null),
  students: getSessionCache('students', null),
  users: getSessionCache('users', null),
  lastFetched: 0
};

export default function StudentsManagementView({
  initialSearch = '',
  initialClusters = null,
  initialSchools = null,
  initialStudents = null,
  initialUsers = null
}) {
  const { user, isSuperAdmin, isClusterAdmin, assignedClusterIds, assignedSchoolIds } = useAuth();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // Navigation Level: 'clusters' | 'schools' | 'students' | 'student_details' | 'health_history'
  const [viewLevel, setViewLevel] = useState('clusters');

  // Raw live data from backend (instantly initialized from props, memory cache, or session storage)
  const [rawClusters, setRawClusters] = useState(() => {
    if (initialClusters && initialClusters.length > 0) return initialClusters;
    if (studentsMemoryCache.clusters && studentsMemoryCache.clusters.length > 0) return studentsMemoryCache.clusters;
    return getSessionCache('clusters', []);
  });
  const [rawSchools, setRawSchools] = useState(() => {
    if (initialSchools && initialSchools.length > 0) return initialSchools;
    if (studentsMemoryCache.schools && studentsMemoryCache.schools.length > 0) return studentsMemoryCache.schools;
    return getSessionCache('schools', []);
  });
  const [rawStudents, setRawStudents] = useState(() => {
    if (initialStudents && initialStudents.length > 0) return initialStudents;
    if (studentsMemoryCache.students && studentsMemoryCache.students.length > 0) return studentsMemoryCache.students;
    return getSessionCache('students', []);
  });
  const [rawUsers, setRawUsers] = useState(() => {
    if (initialUsers && initialUsers.length > 0) return initialUsers;
    if (studentsMemoryCache.users && studentsMemoryCache.users.length > 0) return studentsMemoryCache.users;
    return getSessionCache('users', []);
  });
  const [loadingData, setLoadingData] = useState(() => {
    const hasCached = (initialStudents && initialStudents.length > 0) || 
                      (studentsMemoryCache.students && studentsMemoryCache.students.length > 0) ||
                      (getSessionCache('students', []).length > 0);
    return !hasCached;
  });

  // Sync initial props from parent when updated
  useEffect(() => {
    if (initialClusters && initialClusters.length > 0) {
      setRawClusters(initialClusters);
      setSelectedClusterId(curr => curr && initialClusters.some(c => String(c.id) === String(curr)) ? curr : initialClusters[0].id);
    }
    if (initialSchools && initialSchools.length > 0) {
      setRawSchools(initialSchools);
      setSelectedSchoolId(curr => curr && initialSchools.some(s => String(s.id) === String(curr)) ? curr : initialSchools[0].id);
    }
    if (initialStudents && initialStudents.length > 0) {
      setRawStudents(initialStudents);
      setLoadingData(false);
    }
    if (initialUsers && initialUsers.length > 0) {
      setRawUsers(initialUsers);
    }
  }, [initialClusters, initialSchools, initialStudents, initialUsers]);

  // Active selections (defaults immediately to first available cluster / school)
  const [selectedClusterId, setSelectedClusterId] = useState(() => {
    const list = (initialClusters && initialClusters.length > 0)
      ? initialClusters
      : (studentsMemoryCache.clusters || getSessionCache('clusters', []));
    return list?.[0]?.id || '';
  });
  const [selectedSchoolId, setSelectedSchoolId] = useState(() => {
    const list = (initialSchools && initialSchools.length > 0)
      ? initialSchools
      : (studentsMemoryCache.schools || getSessionCache('schools', []));
    return list?.[0]?.id || '';
  });
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Search & Filter States
  const [clusterSearch, setClusterSearch] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [searchResultView, setSearchResultView] = useState('students');
  const [studentSearch, setStudentSearch] = useState('');
  const [dobFilter, setDobFilter] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [academicYearFilter, setAcademicYearFilter] = useState('All Years');
  const [assessedByFilter, setAssessedByFilter] = useState('ALL'); // 'ALL' | 'EXCEL_IMPORT' | staff name/id
  const [studentPage, setStudentPage] = useState(1);
  const [sortField, setSortField] = useState('id');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(prev => !prev);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const prevInitialSearchRef = useRef(initialSearch);
  useEffect(() => {
    if (prevInitialSearchRef.current !== initialSearch) {
      prevInitialSearchRef.current = initialSearch;
      if (initialSearch !== undefined) {
        setSchoolSearch(initialSearch || '');
        setStudentSearch(initialSearch || '');
        setClusterSearch(initialSearch || '');
      }
    }
  }, [initialSearch]);

  // Sub-tab for School Students View: 'all' | 'priority'
  const [studentViewTab, setStudentViewTab] = useState('all');
  // Sub-tab for Cluster Schools View: 'schools' | 'progress'
  const [clusterViewTab, setClusterViewTab] = useState('schools');
  // Priority Follow-Up Filters
  const [priorityCategoryFilter, setPriorityCategoryFilter] = useState('ALL'); // 'ALL' | 'SEVERELY_WASTED' | 'WASTED'
  const [upcomingMonthFilter, setUpcomingMonthFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'NEXT_MONTH' | 'OVERDUE'
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('All Months');

  // Monthly Progress Report State (Cluster-wise & School-wise tracking)
  // Lazy initializer: computed once at mount — current month in YYYY-MM (e.g. "2026-10")
  const [progressMonthFilter, setProgressMonthFilter] = useState(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
  });
  const [progressClusterFilter, setProgressClusterFilter] = useState('All Clusters');
  const [progressSchoolFilter, setProgressSchoolFilter] = useState('All Schools');
  const [progressViewType, setProgressViewType] = useState('cluster'); // 'cluster' | 'school' | 'students'
  const [progressReportData, setProgressReportData] = useState(null);
  const [loadingProgressReport, setLoadingProgressReport] = useState(false);
  const [progressModal, setProgressModal] = useState({
    isOpen: false,
    title: '',
    category: 'all', // 'all' | 'not_normal' | 'deteriorated' | 'improved'
    clusterId: null,
    schoolId: null,
    clusterName: null,
    schoolName: null
  });
  const [progressModalSearch, setProgressModalSearch] = useState('');
  const [progressModalCategoryFilter, setProgressModalCategoryFilter] = useState('all');

  // Real-time Dynamic Month Labels (strictly calculated from system clock)
  const currentDate = new Date();
  const currentMonthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const nextMonthObj = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextMonthLabel = nextMonthObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Modals for PDF Growth Chart
  const [showStudentGrowthModal, setShowStudentGrowthModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [showSchoolGrowthModal, setShowSchoolGrowthModal] = useState(false);
  const [modalSchool, setModalSchool] = useState(null);
  const [showClusterGrowthModal, setShowClusterGrowthModal] = useState(false);
  const [modalCluster, setModalCluster] = useState(null);

  // Promotion, TC and Transfer States
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('All'); // 'All' | 'Active' | 'TC Issued' | 'Graduated'
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [showTcIntakeModal, setShowTcIntakeModal] = useState(false);
  const [transferModalStudent, setTransferModalStudent] = useState(null);
  const [tcCertModalStudent, setTcCertModalStudent] = useState(null);
  const [editModalStudent, setEditModalStudent] = useState(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  // Growth Trend Chart metric toggle: 'Weight' | 'Height' | 'BMI'
  const [trendMetric, setTrendMetric] = useState('Weight');

  // Deletion & Editing Modals State
  const [clusterToDelete, setClusterToDelete] = useState(null);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showDeleteAllSchoolStudentsModal, setShowDeleteAllSchoolStudentsModal] = useState(false);
  const [clusterToEdit, setClusterToEdit] = useState(null);
  const [schoolToEdit, setSchoolToEdit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSendUpcomingReminders = async () => {
    setIsSendingReminders(true);
    try {
      const scheduleRes = await api.checkSchoolVisitSchedules(selectedSchoolId || null);
      const reminderRes = await api.sendUpcomingReminders(selectedSchoolId || null);
      const count = scheduleRes?.dispatched_count ?? reminderRes?.count ?? 0;
      showToast(
        scheduleRes?.message ||
        `Assessment reminders successfully sent to assigned cluster officers and administrators (${count} items processed).`
      );
    } catch (err) {
      showToast(`Failed to send reminders: ${err.message}`);
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleConfirmDeleteCluster = async () => {
    if (!clusterToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCluster(clusterToDelete.id);
      showToast(`Cluster "${clusterToDelete.name}" and all associated schools & students deleted.`);
      setClusterToDelete(null);
      await loadLiveStudentsData();
      if (selectedClusterId === clusterToDelete.id) {
        setSelectedClusterId('');
        setViewLevel('clusters');
      }
    } catch (err) {
      alert(`Failed to delete cluster: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteSchool(schoolToDelete.id);
      showToast(`School "${schoolToDelete.name}" and all associated students deleted.`);
      setSchoolToDelete(null);
      await loadLiveStudentsData();
      if (selectedSchoolId === schoolToDelete.id) {
        setSelectedSchoolId('');
        setViewLevel('schools');
      }
    } catch (err) {
      alert(`Failed to delete school: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      showToast(`Student "${studentToDelete.name}" deleted successfully.`);
      const deletedId = studentToDelete.id;
      setStudentToDelete(null);
      await loadLiveStudentsData();
      if (selectedStudentId === deletedId) {
        setSelectedStudentId('');
        setViewLevel('students');
      }
    } catch (err) {
      alert(`Failed to delete student: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteAllSchoolStudents = async () => {
    if (!activeSchool) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteAllSchoolStudents(activeSchool.id);
      showToast(res.message || `All students in "${activeSchool.name}" deleted successfully.`);
      setShowDeleteAllSchoolStudentsModal(false);
      await loadLiveStudentsData();
      if (viewLevel === 'student_details' || viewLevel === 'health_history') {
        setSelectedStudentId('');
        setViewLevel('students');
      }
    } catch (err) {
      alert(`Failed to delete students: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const THEME_PALETTES = [
    { themeColor: '#EA580C', bgColor: '#FFF7ED', accentColor: '#FFEDD5', waveColor: 'rgba(234, 88, 12, 0.08)' },
    { themeColor: '#059669', bgColor: '#ECFDF5', accentColor: '#D1FAE5', waveColor: 'rgba(5, 150, 105, 0.08)' },
    { themeColor: '#2563EB', bgColor: '#EFF6FF', accentColor: '#DBEAFE', waveColor: 'rgba(37, 99, 235, 0.08)' },
    { themeColor: '#8B5CF6', bgColor: '#F5F3FF', accentColor: '#EDE9FE', waveColor: 'rgba(139, 92, 246, 0.08)' },
    { themeColor: '#E11D48', bgColor: '#FFF1F2', accentColor: '#FFE4E6', waveColor: 'rgba(225, 29, 72, 0.08)' },
    { themeColor: '#D97706', bgColor: '#FFFBEB', accentColor: '#FEF3C7', waveColor: 'rgba(217, 119, 6, 0.08)' },
  ];

  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  const handleClearStudentFilters = useCallback(() => {
    setStudentSearch('');
    setDobFilter('');
    setClassFilter('All Classes');
    setSectionFilter('All Sections');
    setGenderFilter('All Genders');
    setStatusFilter('All Status');
    setAcademicYearFilter('All Years');
    setEnrollmentStatusFilter('All');
    setAssessedByFilter('ALL');
    setPriorityCategoryFilter('ALL');
    setUpcomingMonthFilter('ALL');
    setSelectedMonthFilter('All Months');
    setStudentPage(1);
    setSelectedStudentId('');
    setStudentViewTab('all');
  }, []);

  // Fetch all backend data and poll every 10s for real-time sync with mobile app
  const loadLiveStudentsData = async (silent = false) => {
    try {
      const hasCached = Boolean(studentsMemoryCache.students && studentsMemoryCache.students.length > 0);
      if (!silent && !hasCached) setLoadingData(true);
      const [clustersSettled, schoolsSettled, studentsSettled, usersSettled] = await Promise.allSettled([
        api.getClusters(),
        api.getSchools(),
        api.getStudents(),
        api.getUsers(),
      ]);

      const clustersRes = clustersSettled.status === 'fulfilled' && Array.isArray(clustersSettled.value) 
        ? clustersSettled.value 
        : null;
      const schoolsRes = schoolsSettled.status === 'fulfilled' && Array.isArray(schoolsSettled.value) 
        ? schoolsSettled.value 
        : null;
      const studentsRes = studentsSettled.status === 'fulfilled' && Array.isArray(studentsSettled.value) 
        ? studentsSettled.value 
        : null;
      const usersRes = usersSettled.status === 'fulfilled' && Array.isArray(usersSettled.value) 
        ? usersSettled.value 
        : null;

      if (clustersRes !== null || schoolsRes !== null || studentsRes !== null) {
        const freshClusters = clustersRes !== null ? clustersRes : (rawClusters.length > 0 ? rawClusters : (initialClusters || []));
        const freshSchools = schoolsRes !== null ? schoolsRes : (rawSchools.length > 0 ? rawSchools : (initialSchools || []));
        const freshStudents = studentsRes !== null ? studentsRes : (rawStudents.length > 0 ? rawStudents : (initialStudents || []));
        const freshUsers = usersRes !== null ? usersRes : (rawUsers.length > 0 ? rawUsers : (initialUsers || []));

        const {
          filteredClusters,
          filteredSchools,
          filteredStudents,
          filteredUsers
        } = filterScopeData({
          clusters: freshClusters,
          schools: freshSchools,
          students: freshStudents,
          users: freshUsers,
          isClusterAdmin,
          isSuperAdmin,
          assignedClusterIds,
          assignedSchoolIds
        });

        setRawClusters(filteredClusters);
        if (schoolsRes !== null || rawSchools.length === 0) {
          setRawSchools(filteredSchools);
        }
        if (studentsRes !== null || rawStudents.length === 0) {
          setRawStudents(filteredStudents);
        }
        if (usersRes !== null || rawUsers.length === 0) {
          setRawUsers(filteredUsers);
        }

        setSelectedClusterId(curr => {
          if (curr && filteredClusters.some(c => String(c.id) === String(curr))) return curr;
          return filteredClusters.length > 0 ? filteredClusters[0].id : '';
        });

        setSelectedSchoolId(curr => {
          if (curr && filteredSchools.some(s => String(s.id) === String(curr))) return curr;
          return filteredSchools.length > 0 ? filteredSchools[0].id : '';
        });

        setSelectedStudentId(curr => {
          if (curr && filteredStudents.some(s => String(s.id) === String(curr))) return curr;
          return filteredStudents.length > 0 ? filteredStudents[0].id : '';
        });

        // Persist in memory cache and session storage for instant 0ms tab switches
        studentsMemoryCache.clusters = filteredClusters;
        studentsMemoryCache.schools = filteredSchools;
        studentsMemoryCache.students = filteredStudents;
        studentsMemoryCache.users = filteredUsers;
        studentsMemoryCache.lastFetched = Date.now();
        setSessionCache('clusters', filteredClusters);
        setSessionCache('schools', filteredSchools);
        setSessionCache('students', filteredStudents);
        setSessionCache('users', filteredUsers);

        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.warn('Real-time Students Sync notice:', err);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    try {
      await loadLiveStudentsData(false);
      showToast('Live student data successfully refreshed!');
    } finally {
      setIsManualRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveStudentsData();
    const timer = setInterval(() => {
      if (!document.hidden) {
        loadLiveStudentsData(true);
      }
    }, 10000);

    const handleScopeEvent = () => {
      loadLiveStudentsData(false);
    };
    window.addEventListener('sh_scope_updated', handleScopeEvent);
    window.addEventListener('sh_user_updated', handleScopeEvent);

    return () => {
      clearInterval(timer);
      window.removeEventListener('sh_scope_updated', handleScopeEvent);
      window.removeEventListener('sh_user_updated', handleScopeEvent);
    };
  }, [isClusterAdmin, JSON.stringify(assignedClusterIds), JSON.stringify(assignedSchoolIds)]);

  // AUTO-REFRESH & FILTER RESET ON SCHOOL SWITCH
  const prevSchoolIdRef = useRef(selectedSchoolId);
  useEffect(() => {
    if (prevSchoolIdRef.current && prevSchoolIdRef.current !== selectedSchoolId) {
      handleClearStudentFilters();
      loadLiveStudentsData(true);
    }
    prevSchoolIdRef.current = selectedSchoolId;
  }, [selectedSchoolId, handleClearStudentFilters]);

  // AUTO-REFRESH & FILTER RESET ON CLUSTER SWITCH
  const prevClusterIdRef = useRef(selectedClusterId);
  useEffect(() => {
    if (prevClusterIdRef.current && prevClusterIdRef.current !== selectedClusterId) {
      setSchoolSearch('');
      setClusterViewTab('schools');
      handleClearStudentFilters();
      loadLiveStudentsData(true);
    }
    prevClusterIdRef.current = selectedClusterId;
  }, [selectedClusterId, handleClearStudentFilters]);

  // AUTO-REFRESH ON LEVEL CHANGE
  const prevViewLevelRef = useRef(viewLevel);
  useEffect(() => {
    if (prevViewLevelRef.current !== viewLevel) {
      if (viewLevel === 'clusters' || viewLevel === 'schools') {
        setSelectedStudentId('');
        handleClearStudentFilters();
        loadLiveStudentsData(true);
      }
    }
    prevViewLevelRef.current = viewLevel;
  }, [viewLevel, handleClearStudentFilters]);

  // Load Monthly Progress Report Data (Cluster-wise & School-wise)
  const loadProgressReportData = async () => {
    try {
      setLoadingProgressReport(true);
      const res = await api.getMonthlyProgressReport({
        month: progressMonthFilter,
        clusterId: progressClusterFilter,
        schoolId: progressSchoolFilter
      });
      if (res) {
        setProgressReportData(res);
      } else {
        // API returned null — backend error. Clear data so stale data doesn't remain.
        console.error('[Progress Report] Backend returned null for month=', progressMonthFilter, '— check server logs');
        setProgressReportData(null);
      }
    } catch (err) {
      console.error('[Progress Report] Fetch error:', err);
      setProgressReportData(null);
    } finally {
      setLoadingProgressReport(false);
    }
  };

  useEffect(() => {
    loadProgressReportData();
  }, [progressMonthFilter, progressClusterFilter, progressSchoolFilter]);

  // Close Action three-dots menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (activeActionMenuId && !e.target.closest('.student-action-dots-btn') && !e.target.closest('.student-action-dropdown-menu')) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [activeActionMenuId]);

  // Formatted Clusters
  const clustersData = useMemo(() => {
    if (rawClusters.length === 0) return [];
    return rawClusters.map((c, i) => {
      const palette = THEME_PALETTES[i % THEME_PALETTES.length];
      const cId = String(c.id || '').toLowerCase();
      const cName = String(c.name || '').toLowerCase();
      const clusterSchools = rawSchools.filter(s => {
        const sClusterId = String(s.cluster_id || '').toLowerCase();
        const sClusterName = String(s.cluster_name || s.cluster || '').toLowerCase();
        return sClusterId === cId || sClusterName === cName || sClusterId === cName || sClusterName === cId;
      });
      const clusterStudents = rawStudents.filter(st => {
        const stClusterName = String(st.cluster_name || '').toLowerCase();
        const stClusterId = String(st.cluster_id || '').toLowerCase();
        const inCluster = stClusterName === cName || stClusterId === cId;
        const inSchool = clusterSchools.some(sc => String(sc.id || '').toLowerCase() === String(st.school_id || '').toLowerCase());
        return inCluster || inSchool;
      });
      return {
        id: c.id,
        name: c.name,
        schoolsCount: clusterSchools.length,
        studentsCount: clusterStudents.length,
        coverage: c.coverage_percentage || 0,
        ...palette
      };
    });
  }, [rawClusters, rawSchools, rawStudents]);

  // Selected Entities
  const activeCluster = clustersData.find(c => c.id === selectedClusterId) || clustersData[0] || { name: 'Cluster', id: '' };

  // Sync cluster filter for monthly progress report when inside a cluster view
  useEffect(() => {
    if (viewLevel === 'schools' && activeCluster?.name && activeCluster.name !== 'Cluster') {
      setProgressClusterFilter(activeCluster.name);
      setProgressSchoolFilter('All Schools');
    }
  }, [viewLevel, selectedClusterId, activeCluster?.name]);

  // Schools mapping by cluster
  const schoolsList = useMemo(() => {
    const targetClusterId = String(selectedClusterId || '').toLowerCase();
    const targetClusterName = String(activeCluster?.name || '').toLowerCase();
    const clusterSchools = rawSchools.filter(s => {
      if (!selectedClusterId) return true;
      const sClusterId = String(s.cluster_id || '').toLowerCase();
      const sClusterName = String(s.cluster_name || s.cluster || '').toLowerCase();
      return (
        sClusterId === targetClusterId ||
        sClusterName === targetClusterName ||
        sClusterId === targetClusterName ||
        sClusterName === targetClusterId
      );
    });
    return clusterSchools.map((s, idx) => {
      const sId = String(s.id || '').toLowerCase();
      const sName = String(s.name || '').toLowerCase();
      const studentsInSchool = rawStudents.filter(st => {
        const stSchoolId = String(st.school_id || '').toLowerCase();
        const stSchoolName = String(st.school_name || '').toLowerCase();
        return (stSchoolId && stSchoolId === sId) || (stSchoolName && stSchoolName === sName);
      });
      const studentCount = studentsInSchool.length || s.students_count || 0;
      const assessedCount = studentsInSchool.filter(st => (st.assessments && st.assessments.length > 0) || st.latest_assessment_date).length;
      const pct = (studentCount > 0 && assessedCount > 0) ? Math.round((assessedCount / studentCount) * 100) : 0;
      return {
        id: s.id,
        name: s.name,
        code: s.code || '',
        classes_range: s.classes_range,
        sections: s.sections,
        students: studentCount,
        assessed: assessedCount,
        pending: Math.max(0, studentCount - assessedCount),
        pct: pct,
        barColor: pct >= 80 ? '#10B981' : pct >= 50 ? '#3B82F6' : '#F59E0B',
        iconColor: idx % 2 === 0 ? '#EA580C' : '#2563EB',
        iconBg: idx % 2 === 0 ? '#FFF7ED' : '#EFF6FF'
      };
    });
  }, [rawSchools, rawStudents, selectedClusterId, activeCluster]);

  const activeSchool = schoolsList.find(s => s.id === selectedSchoolId) || schoolsList[0] || { name: 'School', id: '', code: '' };

  // Registered Staff Names lookup map/set for attributing assessments
  const registeredUserNames = useMemo(() => {
    const set = new Set();
    set.add('admin');
    rawUsers.forEach(u => {
      if (u.name) set.add(u.name.trim().toLowerCase());
      if (u.username) set.add(u.username.trim().toLowerCase());
    });
    return set;
  }, [rawUsers]);

  // Students Data for selected school
  const studentsData = useMemo(() => {
    const filtered = rawStudents.filter(s =>
      selectedSchoolId ? (String(s.school_id) === String(selectedSchoolId) || (s.school_name && activeSchool?.name && s.school_name.toLowerCase() === activeSchool.name.toLowerCase())) : true
    );
    filtered.sort((a, b) => String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true, sensitivity: 'base' }));
    return filtered.map((s, idx) => {
      const hasAssessments = Array.isArray(s.assessments) && s.assessments.length > 0;
      const latestA = hasAssessments ? s.assessments[0] : null;
      const assessDate = s.latest_assessment_date || latestA?.assessment_date || 'Pending';

      // Assessor and Import Attribution
      const rawExaminer = (s.latest_examiner_name || latestA?.examiner_name || '').trim();
      const rawImportId = s.latest_import_id || latestA?.import_id || s.import_id || null;
      const isTcIntake = Boolean(
        s.previous_school_name ||
        s.previous_school_id ||
        (s.notes && s.notes.toLowerCase().includes('tc')) ||
        (latestA?.notes && latestA.notes.toLowerCase().includes('tc')) ||
        rawExaminer.toLowerCase() === 'admin'
      );
      const isExplicitImport = !isTcIntake && Boolean(
        rawImportId ||
        rawExaminer.toLowerCase().includes('excel') ||
        rawExaminer.toLowerCase().includes('import') ||
        rawExaminer.toLowerCase() === 'mobile who engine'
      );
      const matchedStaffUser = rawExaminer ? rawUsers.find(u => (u.name && u.name.trim().toLowerCase() === rawExaminer.toLowerCase()) || (u.username && u.username.trim().toLowerCase() === rawExaminer.toLowerCase())) : null;
      const isKnownStaff = !isExplicitImport && rawExaminer ? (registeredUserNames.has(rawExaminer.toLowerCase()) || rawExaminer.toLowerCase() === 'admin' || Boolean(matchedStaffUser) || (rawExaminer.toLowerCase() !== 'health officer' && rawExaminer.length > 0)) : false;
      const isExcelImport = !isTcIntake && (isExplicitImport || (!rawExaminer && !hasAssessments));
      const finalStaffName = isTcIntake
        ? (rawExaminer && rawExaminer.toLowerCase() !== 'health officer' ? rawExaminer : 'Admin')
        : (matchedStaffUser ? matchedStaffUser.name : (rawExaminer && !isExplicitImport ? rawExaminer : null));
      // Authoritative WHO classification strictly from assessment data and database
      const rawStatus = s.nutrition_status || latestA?.nutrition_status || null;
      const rawClassification = s.latest_bmi_for_age_classification || latestA?.bmi_for_age_classification || null;
      const rawHeightClass = s.latest_height_classification || s.height_classification || latestA?.height_for_age_classification || latestA?.height_classification || '';
      const rawWeightClass = s.latest_weight_classification || s.weight_classification || latestA?.weight_for_age_classification || latestA?.weight_classification || '';
      const rawZ = typeof s.latest_bmi_for_age_zscore === 'number'
        ? s.latest_bmi_for_age_zscore
        : (typeof latestA?.bmi_for_age_zscore === 'number' ? latestA.bmi_for_age_zscore : null);
      const heightZ = typeof s.latest_height_for_age_zscore === 'number' ? s.latest_height_for_age_zscore : (typeof latestA?.height_for_age_zscore === 'number' ? latestA.height_for_age_zscore : null);
      const weightZ = typeof s.latest_weight_for_age_zscore === 'number' ? s.latest_weight_for_age_zscore : (typeof latestA?.weight_for_age_zscore === 'number' ? latestA.weight_for_age_zscore : null);

      const isAbsentRecord = (s.latest_attendance_status && s.latest_attendance_status.toLowerCase() === 'absent') ||
        (latestA?.attendance_status && latestA.attendance_status.toLowerCase() === 'absent') ||
        (rawStatus && rawStatus.toLowerCase() === 'absent');

      let authoritativeStatus = 'Pending Assessment';
      if (isAbsentRecord) {
        authoritativeStatus = 'Absent';
      } else {
        const scLower = String(rawClassification || rawStatus || '').toLowerCase().trim();
        const rsLower = String(rawStatus || '').toLowerCase().trim();
        const hcLower = String(rawHeightClass || '').toLowerCase().trim();
        const wcLower = String(rawWeightClass || '').toLowerCase().trim();
        const hasZ = typeof rawZ === 'number' && !isNaN(rawZ);
        const hasHZ = typeof heightZ === 'number' && !isNaN(heightZ);
        const hasWZ = typeof weightZ === 'number' && !isNaN(weightZ);
        const hasMeasurements = (s.height_cm > 0 && s.weight_kg > 0) || (latestA?.height_cm > 0 && latestA?.weight_kg > 0);

        const isSevThin = (hasZ && rawZ < -3.0) || scLower.includes('severe thinness') || scLower.includes('severely wasted');
        const isThin = (hasZ && rawZ < -2.0) || scLower.includes('thinness') || scLower.includes('wasted');
        const isSevStunted = (hasHZ && heightZ < -3.0) || hcLower.includes('severe stunting') || rsLower.includes('severe stunting');
        const isStunted = (hasHZ && heightZ < -2.0) || hcLower.includes('stunt') || rsLower.includes('stunt');
        const isOverweight = (hasZ && rawZ > 1.0) || scLower.includes('overweight') || scLower.includes('obese');
        const isNormalBmi = hasZ ? (rawZ >= -2.0 && rawZ <= 1.0) : (scLower.includes('normal') && !isThin);
        const isNormalHeight = hasHZ ? (heightZ >= -2.0) : (!isStunted);

        const isWeightApplicable = s.latest_weight_for_age_applicable ?? latestA?.weight_for_age_applicable ?? (s.age_months ? (s.age_months >= 61 && s.age_months <= 120) : true);
        const isUnderweight = isWeightApplicable && ((hasWZ && weightZ < -2.0) || wcLower.includes('underweight') || rsLower.includes('underweight'));
        const isSevUnderweight = isWeightApplicable && ((hasWZ && weightZ < -3.0) || wcLower.includes('severely underweight'));

        // Composite authoritative status honoring BOTH Thinness and Stunting without mutual erasure
        if (isSevThin && isSevStunted) {
          authoritativeStatus = 'Severe Thinness & Severe Stunting';
        } else if (isSevThin && isStunted) {
          authoritativeStatus = 'Severe Thinness & Stunting';
        } else if (isThin && isSevStunted) {
          authoritativeStatus = 'Thinness & Severe Stunting';
        } else if (isThin && isStunted) {
          authoritativeStatus = 'Thinness & Stunting';
        } else if (isSevThin) {
          authoritativeStatus = 'Severe Thinness';
        } else if (isThin) {
          authoritativeStatus = 'Thinness';
        } else if (isSevStunted) {
          authoritativeStatus = 'Severe Stunting';
        } else if (isStunted) {
          authoritativeStatus = 'Stunting';
        } else if (isUnderweight) {
          authoritativeStatus = isSevUnderweight ? 'Severely Underweight' : 'Underweight';
        } else if (isOverweight) {
          authoritativeStatus = (hasZ && rawZ > 2.0) ? 'Obese' : 'Overweight';
        } else if (hasMeasurements || hasAssessments || hasZ || rsLower.includes('normal') || scLower.includes('normal')) {
          authoritativeStatus = 'Normal';
        } else {
          authoritativeStatus = 'Pending Assessment';
        }
      }

      const currentStatus = authoritativeStatus;
      const healthStatus = authoritativeStatus;
      const bmiZ = typeof rawZ === 'number' ? rawZ : null;

      const isSeverelyWasted = (typeof rawZ === 'number' && rawZ < -3.0) || authoritativeStatus.includes('Severe Thinness') || authoritativeStatus.includes('Severely Wasted');
      const isWasted = (typeof rawZ === 'number' && rawZ < -2.0) || authoritativeStatus.includes('Thinness') || authoritativeStatus.includes('Wasted');
      const isStunted = (typeof heightZ === 'number' && heightZ < -2.0) || authoritativeStatus.includes('Stunt');
      const isSeverelyStunted = (typeof heightZ === 'number' && heightZ < -3.0) || authoritativeStatus.includes('Severe Stunt');
      const isWeightApplicable = s.latest_weight_for_age_applicable ?? latestA?.weight_for_age_applicable ?? (s.age_months ? (s.age_months >= 61 && s.age_months <= 120) : true);
      const isUnderweight = isWeightApplicable && ((typeof weightZ === 'number' && weightZ < -2.0) || authoritativeStatus.includes('Underweight'));
      const isOverweight = (typeof rawZ === 'number' && rawZ > 1.0) || authoritativeStatus.includes('Overweight') || authoritativeStatus.includes('Obese');
      const isNormal = authoritativeStatus === 'Normal' || (authoritativeStatus.includes('Normal') && !isWasted && !isStunted);
      const isCritical = isSeverelyWasted || (isWasted && !isNormal);

      const bmiClassification = isSeverelyWasted ? 'Severe Thinness' : (isWasted ? 'Thinness' : (isOverweight ? ((bmiZ && bmiZ > 2.0) ? 'Obese' : 'Overweight') : 'Normal (BMI)'));
      const heightClassification = isSeverelyStunted ? 'Severe Stunting' : (isStunted ? 'Stunting' : 'Normal (Height)');
      const weightClassification = isWeightApplicable ? (isUnderweight ? 'Underweight' : 'Normal (Weight)') : 'Not applicable';

      // Real-time Upcoming Monthly Assessment Schedule (based strictly on real last assessment date)
      let nextDueFormatted = 'Pending Assessment';
      let nextDueYearMonth = null;
      let nextDueMonthLabel = null;
      let dueStatus = 'Pending Screening';
      let dueBadgeColor = '#64748B';
      let dueBadgeBg = '#F1F5F9';

      const validLastDate = assessDate && assessDate !== 'Pending' && assessDate !== 'None' ? new Date(assessDate) : null;
      if (validLastDate && !isNaN(validLastDate.getTime())) {
        const nextDueDate = new Date(validLastDate);
        nextDueDate.setDate(nextDueDate.getDate() + 30); // Monthly follow-up 30 days after last screening
        nextDueFormatted = nextDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        nextDueYearMonth = `${nextDueDate.getFullYear()}-${String(nextDueDate.getMonth() + 1).padStart(2, '0')}`;
        nextDueMonthLabel = nextDueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const today = new Date();
        const diffMs = nextDueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          dueStatus = `Overdue (${Math.abs(diffDays)}d)`;
          dueBadgeColor = '#DC2626';
          dueBadgeBg = '#FEE2E2';
        } else if (diffDays <= 7) {
          dueStatus = `Due in ${diffDays} days`;
          dueBadgeColor = '#DC2626';
          dueBadgeBg = '#FEE2E2';
        } else if (nextDueDate.getMonth() === today.getMonth() && nextDueDate.getFullYear() === today.getFullYear()) {
          dueStatus = 'Due This Month';
          dueBadgeColor = '#EA580C';
          dueBadgeBg = '#FFEDD5';
        } else {
          dueStatus = 'Due Next Month';
          dueBadgeColor = '#2563EB';
          dueBadgeBg = '#EFF6FF';
        }
      }

      return {
        sno: idx + 1,
        id: s.id,
        idCode: s.id,
        name: s.name,
        gender: s.gender || 'Unknown',
        classVal: s.class_name ? String(s.class_name).replace(/class\s*/i, '').trim() : (activeSchool?.classes_range?.toLowerCase().includes('anganwadi') ? 'Anganwadi' : '1'),
        section: s.section ? String(s.section).replace(/section\s*/i, '').trim() : (activeSchool?.sections?.toLowerCase() === 'none' ? 'None' : 'A'),
        dob: s.dob || '2019-01-01',
        dobFormatted: s.dob ? new Date(s.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
        latestAssessment: assessDate,
        healthStatus: (s.enrollment_status && s.enrollment_status !== 'Active') ? s.enrollment_status : healthStatus,
        nutritionStatus: (s.enrollment_status && s.enrollment_status !== 'Active') ? s.enrollment_status : currentStatus,
        currentStatus: (s.enrollment_status && s.enrollment_status !== 'Active') ? s.enrollment_status : currentStatus,
        rawHealthStatus: healthStatus,
        isSeverelyWasted: isSeverelyWasted,
        isWasted: isWasted,
        isCritical: isCritical,
        nextDueDateFormatted: nextDueFormatted,
        nextDueYearMonth: nextDueYearMonth,
        nextDueMonthLabel: nextDueMonthLabel,
        dueStatus: dueStatus,
        dueBadgeColor: dueBadgeColor,
        dueBadgeBg: dueBadgeBg,
        height: s.height_cm || latestA?.height_cm || 0,
        weight: s.weight_kg || latestA?.weight_kg || 0,
        bmi: s.bmi || latestA?.bmi || 0,
        bmiZScore: bmiZ,
        heightZScore: heightZ,
        weightZScore: weightZ,
        heightClassification: s.latest_height_for_age_classification || s.height_classification || latestA?.height_for_age_classification || latestA?.height_classification || '',
        weightClassification: weightClassification,
        bmiClassification: bmiClassification,
        isWeightApplicable: isWeightApplicable,
        isStunted: isStunted,
        isSeverelyStunted: isSeverelyStunted,
        isThin: isWasted,
        ageDisplay: s.age_string || s.latest_age_display || '',
        enrollmentStatus: s.enrollment_status || 'Active',
        academicYear: s.academic_year || `${currentDate.getFullYear()}-${currentDate.getFullYear() + 1}`,
        tcDate: s.tc_date || null,
        tcReason: s.tc_reason || null,
        previousSchoolName: s.previous_school_name || null,
        previousStudentId: s.previous_student_id || null,
        examinerName: finalStaffName,
        isExcelImport: isExcelImport,
        rawExaminer: rawExaminer,
        importId: rawImportId,
        progressStatus: s.progress_status || null,
        weightDelta: s.weight_delta !== undefined ? s.weight_delta : null,
        bmiDelta: (s.assessments && s.assessments.length >= 2 && s.assessments[0]?.bmi && s.assessments[1]?.bmi)
          ? Number((Number(s.assessments[0].bmi) - Number(s.assessments[1].bmi)).toFixed(2))
          : (s.bmi_delta !== undefined ? s.bmi_delta : null),
        progressAlert: s.progress_alert || null,
        raw: s
      };
    });
  }, [rawStudents, selectedSchoolId, activeSchool, rawUsers, registeredUserNames]);

  // Open Student Growth Report with complete historical screening records & fallback
  const handleOpenStudentGrowthReport = async (st) => {
    if (!st) return;
    const studentId = st.student_id || st.id;

    // 1. Check if student already exists in rawStudents or studentsData
    const matched = rawStudents.find(s => String(s.id) === String(studentId)) ||
                    (studentsData && studentsData.find(s => String(s.id) === String(studentId)));

    // 2. Build full fallback student object so report displays immediately without blank state
    const studentObj = {
      id: studentId,
      idCode: studentId,
      name: st.name || matched?.name || 'Student',
      gender: st.gender || matched?.gender || 'Unknown',
      classVal: st.class_name ? String(st.class_name).replace(/class\s*/i, '').trim() : (matched?.classVal || '1'),
      section: st.section || matched?.section || 'A',
      dob: st.dob || matched?.dob || '2019-01-01',
      dobFormatted: st.dobFormatted || (st.dob ? new Date(st.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (matched?.dobFormatted || '—')),
      latestAssessment: st.assessment_date || matched?.latestAssessment || new Date().toISOString().split('T')[0],
      height: Number(st.height_cm || st.height || matched?.height || 0),
      height_cm: Number(st.height_cm || st.height || matched?.height || 0),
      weight: Number(st.weight_kg || st.weight || matched?.weight || 0),
      weight_kg: Number(st.weight_kg || st.weight || matched?.weight || 0),
      bmi: Number(st.bmi || matched?.bmi || 0),
      bmiZScore: st.bmi_zscore ?? matched?.bmiZScore ?? (st.nutrition_status === 'Severely Wasted' ? -3.4 : st.nutrition_status === 'Wasted' ? -2.3 : 0),
      currentStatus: st.nutrition_status || matched?.currentStatus || 'Normal',
      nutritionStatus: st.nutrition_status || matched?.nutritionStatus || 'Normal',
      healthStatus: st.nutrition_status || matched?.healthStatus || 'Normal',
      isSeverelyWasted: st.nutrition_status === 'Severely Wasted' || matched?.isSeverelyWasted,
      isWasted: st.nutrition_status === 'Wasted' || matched?.isWasted,
      school_id: st.school_id || matched?.school_id,
      school_name: st.school_name || matched?.school_name || activeSchool?.name,
      cluster_name: st.cluster_name || matched?.cluster_name || activeCluster?.name,
      schoolName: st.school_name || matched?.school_name || activeSchool?.name,
      clusterName: st.cluster_name || matched?.cluster_name || activeCluster?.name,
      ageDisplay: st.age_display || matched?.ageDisplay || '',
      examinerName: st.examiner_name || matched?.examinerName || 'Staff Health Officer',
      raw: matched?.raw || {
        assessments: [
          ...(st.assessment_date ? [{
            assessment_date: st.assessment_date,
            height_cm: Number(st.height_cm || st.height || 0),
            weight_kg: Number(st.weight_kg || st.weight || 0),
            bmi: Number(st.bmi || 0),
            bmi_for_age_zscore: st.bmi_zscore || (st.nutrition_status === 'Severely Wasted' ? -3.4 : -2.3),
            nutrition_status: st.nutrition_status,
            examiner_name: st.examiner_name || 'Staff Health Officer'
          }] : []),
          ...(st.prev_date ? [{
            assessment_date: st.prev_date,
            height_cm: Number(st.prev_height_cm || st.height_cm || st.height || 0),
            weight_kg: Number(st.prev_weight_kg || 0),
            bmi: Number(st.prev_bmi || 0),
            bmi_for_age_zscore: st.prev_status === 'Severely Wasted' ? -3.4 : -2.3,
            nutrition_status: st.prev_status,
            examiner_name: 'Staff Health Officer'
          }] : [])
        ]
      }
    };

    if (matched) {
      setModalStudent({
        ...matched,
        ...studentObj,
        schoolName: st.school_name || matched.school_name || activeSchool?.name,
        clusterName: st.cluster_name || matched.cluster_name || activeCluster?.name,
        raw: matched.raw || {
          ...matched,
          assessments: matched.assessments || studentObj.raw?.assessments || []
        }
      });
    } else {
      setModalStudent(studentObj);
    }

    setSelectedStudentId(studentId);
    setShowStudentGrowthModal(true);

    // 3. Fetch comprehensive live record with all longitudinal screenings from backend in background
    try {
      const fullRes = await api.getStudentById(studentId);
      if (fullRes) {
        setModalStudent(prev => {
          if (!prev || String(prev.id) !== String(studentId)) return prev;
          return {
            ...prev,
            ...fullRes,
            schoolName: fullRes.sch_name || fullRes.school_name || prev.schoolName,
            clusterName: fullRes.c_name || fullRes.cluster_name || prev.clusterName,
            height: fullRes.height_cm || prev.height,
            weight: fullRes.weight_kg || prev.weight,
            bmi: fullRes.bmi || prev.bmi,
            currentStatus: fullRes.nutrition_status || prev.currentStatus,
            isSeverelyWasted: fullRes.nutrition_status === 'Severely Wasted',
            isWasted: fullRes.nutrition_status === 'Wasted',
            raw: fullRes
          };
        });
      }
    } catch (err) {
      // Non-blocking: studentObj is already fully displayed
      console.info('Live full student fetch note:', err);
    }
  };

  // Helpers for robust class & section filter matching
  const normalizeClassFilter = (val) => {
    if (!val || val === 'All Classes' || val === 'ALL') return '';
    return String(val).toLowerCase().replace(/^(class|grade)\s*/i, '').trim();
  };

  const normalizeSectionFilter = (val) => {
    if (!val || val === 'All Sections' || val === 'ALL') return '';
    return String(val).toLowerCase().replace(/^section\s*/i, '').trim();
  };

  // Available Classes for dropdown with search and counts
  const availableClassOptions = useMemo(() => {
    const classMap = new Map();

    // 1. From active school classes_range
    if (activeSchool?.classes_range) {
      const cr = String(activeSchool.classes_range).trim();
      const match = cr.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);
        for (let i = start; i <= end; i++) {
          classMap.set(String(i), `Class ${i}`);
        }
      } else {
        cr.split(',').forEach(item => {
          const clean = item.trim();
          if (clean && clean !== 'N/A' && clean !== 'General') {
            const isNum = /^\d+$/.test(clean);
            classMap.set(clean, isNum ? `Class ${clean}` : clean);
          }
        });
      }
    }

    // 2. From actual students in active school
    studentsData.forEach(s => {
      if (s.classVal && s.classVal !== '-') {
        const clean = String(s.classVal).trim();
        const isNum = /^\d+$/.test(clean);
        if (!classMap.has(clean)) {
          classMap.set(clean, isNum ? `Class ${clean}` : clean);
        }
      }
    });

    // 3. Fallbacks if standard school or empty
    if (classMap.size === 0) {
      for (let i = 1; i <= 8; i++) {
        classMap.set(String(i), `Class ${i}`);
      }
    }

    // Sort: numbers first in ascending order, then strings
    const sortedKeys = Array.from(classMap.keys()).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => {
      const label = classMap.get(key);
      const count = studentsData.filter(s => {
        const sClass = normalizeClassFilter(s.classVal);
        const target = normalizeClassFilter(key);
        return sClass === target;
      }).length;
      return {
        value: key,
        label: label,
        count: count
      };
    });
  }, [studentsData, activeSchool]);

  // Available Sections for dropdown with search and counts
  const availableSectionOptions = useMemo(() => {
    const secMap = new Map();

    // 1. From active school sections
    if (activeSchool?.sections) {
      const secStr = String(activeSchool.sections).trim();
      secStr.split(',').forEach(s => {
        const clean = s.trim();
        if (clean) {
          if (clean.toLowerCase() === 'none') {
            secMap.set('None', 'No Section (Single Group)');
          } else if (/^[A-Za-z]$/.test(clean)) {
            secMap.set(clean.toUpperCase(), `Section ${clean.toUpperCase()}`);
          } else {
            secMap.set(clean, clean);
          }
        }
      });
    }

    // 2. From actual students in active school
    studentsData.forEach(s => {
      if (s.section && s.section !== '-') {
        const clean = String(s.section).trim();
        if (!secMap.has(clean)) {
          if (clean.toLowerCase() === 'none') {
            secMap.set('None', 'No Section (Single Group)');
          } else if (/^[A-Za-z]$/.test(clean)) {
            secMap.set(clean.toUpperCase(), `Section ${clean.toUpperCase()}`);
          } else {
            secMap.set(clean, clean);
          }
        }
      }
    });

    // 3. Fallbacks
    if (secMap.size === 0) {
      ['A', 'B', 'C', 'D'].forEach(s => {
        secMap.set(s, `Section ${s}`);
      });
    }

    const sortedKeys = Array.from(secMap.keys()).sort((a, b) => {
      if (a === 'None') return 1;
      if (b === 'None') return -1;
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => {
      const label = secMap.get(key);
      const count = studentsData.filter(s => {
        const sSec = normalizeSectionFilter(s.section);
        const target = normalizeSectionFilter(key);
        return sSec === target;
      }).length;
      return {
        value: key,
        label: label,
        count: count
      };
    });
  }, [studentsData, activeSchool]);

  // Available Academic Years for filter
  const availableAcademicYears = useMemo(() => {
    const set = new Set();
    studentsData.forEach(s => {
      if (s.academicYear) set.add(s.academicYear);
    });
    return Array.from(set).sort();
  }, [studentsData]);

  // Critical follow-up students (Severely Wasted & Wasted) - only active enrolled students
  const criticalStudents = useMemo(() => {
    return studentsData.filter(s => s.isCritical && (s.enrollmentStatus || 'Active') === 'Active');
  }, [studentsData]);

  // Available Months for Monthly Tracking Filter (covering calendar / academic cycle)
  // Dynamically rolling: automatically adapts to the system clock and all recorded student assessment & due dates.
  // Rolls forward every year (e.g. 2026, 2027, 2028, 2029...) completely automatically without requiring any manual changes!
  const availableAssessmentMonths = useMemo(() => {
    const list = [];
    const currentYear = new Date().getFullYear();

    // Collect all years from existing student assessments and scheduled follow-ups
    const dataYears = [];
    studentsData.forEach(s => {
      if (s.latestAssessment && typeof s.latestAssessment === 'string' && s.latestAssessment.length >= 4) {
        const y = parseInt(s.latestAssessment.substring(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) dataYears.push(y);
      }
      if (s.nextDueYearMonth && typeof s.nextDueYearMonth === 'string' && s.nextDueYearMonth.length >= 4) {
        const y = parseInt(s.nextDueYearMonth.substring(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) dataYears.push(y);
      }
    });

    const validYears = dataYears.filter(y => y > 2000 && y < 2100);
    // Start year: earlier of 2025, (currentYear - 1), or earliest assessment in data
    const startYear = Math.min(2025, currentYear - 1, ...(validYears.length > 0 ? validYears : [currentYear]));
    // End year: further of (currentYear + 2) or latest due/assessment date in data
    const endYear = Math.max(currentYear + 2, ...(validYears.length > 0 ? validYears : [currentYear + 2]));

    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m < 12; m++) {
        const d = new Date(y, m, 1);
        const ym = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        list.push({ value: ym, label, year: y, monthIndex: m });
      }
    }
    return list;
  }, [studentsData]);

  // Compute student count per upcoming assessment month
  const monthlyCriticalCounts = useMemo(() => {
    const counts = {};
    criticalStudents.forEach(s => {
      if (s.nextDueYearMonth) {
        counts[s.nextDueYearMonth] = (counts[s.nextDueYearMonth] || 0) + 1;
      }
    });
    return counts;
  }, [criticalStudents]);

  // Dedicated options list for SearchableDropdown Month selector (Monthly Tracking tab — shows upcoming due counts)
  const monthDropdownOptions = useMemo(() => {
    return availableAssessmentMonths.map((m) => {
      const count = monthlyCriticalCounts[m.value] || 0;
      const isCurrent = m.label === currentMonthLabel;
      return {
        value: m.value,
        label: m.label,
        count: count > 0 ? count : null,
        sublabel: count > 0 ? `${count} due` : (isCurrent ? 'Current Month' : null),
      };
    });
  }, [availableAssessmentMonths, monthlyCriticalCounts, currentMonthLabel]);

  // Separate clean options list for Monthly Progress Report dropdown — shows only "Current Month" label, NO upcoming due counts
  const progressMonthDropdownOptions = useMemo(() => {
    return availableAssessmentMonths.map((m) => {
      const isCurrent = m.label === currentMonthLabel;
      return {
        value: m.value,
        label: m.label,
        count: null,   // no counts — assessed counts are shown in KPI cards, not here
        sublabel: isCurrent ? 'Current Month' : null,
      };
    });
  }, [availableAssessmentMonths, currentMonthLabel]);

  // Progress Report Cluster Filter Options for SearchableDropdown
  const progressClusterOptions = useMemo(() => {
    return rawClusters.map(c => ({
      value: c.id,
      label: c.name,
      count: c.schools_count || null
    }));
  }, [rawClusters]);

  // Progress Report School Filter Options for SearchableDropdown
  const progressSchoolOptions = useMemo(() => {
    let list = rawSchools;
    if (progressClusterFilter && progressClusterFilter !== 'All Clusters' && progressClusterFilter !== 'ALL') {
      list = list.filter(s => s.cluster_id === progressClusterFilter || s.cluster_name?.toLowerCase() === progressClusterFilter.toLowerCase());
    }
    return list.map(s => ({
      value: s.id,
      label: s.name,
      sublabel: s.cluster_name || null,
      count: s.students_count || null
    }));
  }, [rawSchools, progressClusterFilter]);

  // Filtered Students for Progress Report Drilldown Modal (strictly Severely Wasted & Wasted)
  const modalScopeStudents = useMemo(() => {
    if (!progressReportData || !progressReportData.students) return [];
    let list = progressReportData.students.filter(s =>
      s.is_severely_wasted ||
      s.is_wasted ||
      s.nutrition_status === 'Severely Wasted' ||
      s.nutrition_status === 'Wasted' ||
      (s.nutrition_status === 'Normal' && (s.prev_status === 'Severely Wasted' || s.prev_status === 'Wasted'))
    );

    if (progressModal.clusterId) {
      list = list.filter(s => String(s.cluster_id) === String(progressModal.clusterId) || (s.cluster_name && progressModal.clusterName && s.cluster_name.toLowerCase() === progressModal.clusterName.toLowerCase()));
    }
    if (progressModal.schoolId) {
      list = list.filter(s => String(s.school_id) === String(progressModal.schoolId) || (s.school_name && progressModal.schoolName && s.school_name.toLowerCase() === progressModal.schoolName.toLowerCase()));
    }

    // Deduplicate: one row per student_id (keep first = latest since backend sorts by date DESC)
    const seen = new Set();
    list = list.filter(s => {
      if (seen.has(s.student_id)) return false;
      seen.add(s.student_id);
      return true;
    });

    return list;
  }, [progressReportData, progressModal.clusterId, progressModal.schoolId, progressModal.clusterName, progressModal.schoolName]);

  const modalStudents = useMemo(() => {
    let list = modalScopeStudents;

    const cat = progressModalCategoryFilter;
    if (cat === 'severely_wasted') {
      list = list.filter(s => s.is_severely_wasted || s.nutrition_status === 'Severely Wasted');
    } else if (cat === 'wasted') {
      list = list.filter(s => s.is_wasted || s.nutrition_status === 'Wasted');
    } else if (cat === 'not_normal') {
      list = list.filter(s => s.is_not_normal);
    } else if (cat === 'deteriorated') {
      list = list.filter(s => s.is_deteriorated || s.progress_status === 'deteriorated');
    } else if (cat === 'improved') {
      list = list.filter(s => s.progress_status === 'improved');
    } else if (cat === 'stagnant') {
      list = list.filter(s => s.progress_status === 'stagnant');
    }

    if (progressModalSearch.trim()) {
      const q = progressModalSearch.toLowerCase().trim();
      list = list.filter(s =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.student_id && s.student_id.toLowerCase().includes(q)) ||
        (s.class_name && s.class_name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [modalScopeStudents, progressModalCategoryFilter, progressModalSearch]);

  // Filtered Critical Students for Monthly Tracking Tab
  const filteredCriticalStudents = useMemo(() => {
    return criticalStudents.filter(s => {
      if (studentSearch) {
        if (!matchStudentSearch(s, studentSearch)) return false;
      }
      if (classFilter !== 'All Classes') {
        const target = normalizeClassFilter(classFilter);
        const sVal = normalizeClassFilter(s.classVal);
        if (sVal !== target) return false;
      }
      if (sectionFilter !== 'All Sections') {
        const target = normalizeSectionFilter(sectionFilter);
        const sVal = normalizeSectionFilter(s.section);
        if (sVal !== target) return false;
      }
      if (genderFilter !== 'All Genders' && s.gender !== genderFilter) return false;

      if (priorityCategoryFilter === 'SEVERELY_WASTED' && !s.isSeverelyWasted) return false;
      if (priorityCategoryFilter === 'WASTED' && !s.isWasted) return false;

      if (upcomingMonthFilter !== 'ALL') {
        if (upcomingMonthFilter === 'THIS_MONTH') {
          if (!s.dueStatus?.toLowerCase().includes('this month') && !s.dueStatus?.toLowerCase().includes('days')) return false;
        } else if (upcomingMonthFilter === 'NEXT_MONTH') {
          if (!s.dueStatus?.toLowerCase().includes('next month')) return false;
        } else if (upcomingMonthFilter === 'OVERDUE') {
          if (!s.dueStatus?.toLowerCase().includes('overdue')) return false;
        } else {
          // Specific Year-Month match (e.g., '2026-09', '2026-10', '2026-11')
          const matchesDueYearMonth = s.nextDueYearMonth === upcomingMonthFilter;
          const matchesAssessMonth = s.latestAssessment && s.latestAssessment !== 'Pending' && s.latestAssessment.startsWith(upcomingMonthFilter);
          if (!matchesDueYearMonth && !matchesAssessMonth) return false;
        }
      }

      if (selectedMonthFilter && selectedMonthFilter !== 'All Months' && selectedMonthFilter !== 'ALL') {
        const matchesDueYearMonth = s.nextDueYearMonth === selectedMonthFilter;
        const matchesAssessMonth = s.latestAssessment && s.latestAssessment !== 'Pending' && s.latestAssessment.startsWith(selectedMonthFilter);
        if (!matchesDueYearMonth && !matchesAssessMonth) return false;
      }

      // Assessed By (Staff / Excel Import) Filter
      if (assessedByFilter !== 'ALL') {
        if (assessedByFilter === 'EXCEL_IMPORT') {
          if (!s.isExcelImport) return false;
        } else {
          const matchedUser = rawUsers.find(u => u.id === assessedByFilter || u.name?.toLowerCase() === assessedByFilter.toLowerCase());
          const targetName = matchedUser?.name?.toLowerCase() || assessedByFilter.toLowerCase();
          const sExaminer = (s.examinerName || s.rawExaminer || '').toLowerCase();
          if (s.isExcelImport || sExaminer !== targetName) return false;
        }
      }

      return true;
    });
  }, [criticalStudents, studentSearch, classFilter, sectionFilter, genderFilter, priorityCategoryFilter, upcomingMonthFilter, selectedMonthFilter, assessedByFilter, rawUsers]);

  const activeStudent = studentsData.find(s => String(s.id) === String(selectedStudentId)) || studentsData[0] || {
    id: '',
    idCode: '',
    name: 'Student',
    gender: 'Unknown',
    classVal: '1',
    section: 'A',
    dobFormatted: '-',
    latestAssessment: 'None',
    healthStatus: 'Normal',
    currentStatus: 'Normal',
    height: 0,
    weight: 0,
    bmi: 0,
    bmiZScore: 0,
    heightZScore: 0,
    weightZScore: 0,
    progressStatus: null,
    weightDelta: null,
    progressAlert: null,
  };

  // Assessment monthly records from active student
  const assessmentHistory = useMemo(() => {
    if (!activeStudent?.raw?.assessments || activeStudent.raw.assessments.length === 0) {
      if (activeStudent.height > 0 && activeStudent.weight > 0) {
        return [{
          month: 'Current Screening',
          date: activeStudent.latestAssessment || 'Today',
          height: activeStudent.height,
          weight: activeStudent.weight,
          bmi: activeStudent.bmi,
          classification: activeStudent.currentStatus || 'Normal'
        }];
      }
      return [];
    }
    return activeStudent.raw.assessments.map(a => {
      const dt = new Date(a.assessment_date || a.created_at || Date.now());
      const isAbsent = a.attendance_status === 'Absent' || a.nutrition_status === 'Absent' || (a.height_cm == null && a.weight_kg == null);
      const aExaminer = (a.examiner_name || '').trim();
      const aImportId = a.import_id || null;
      const isTcAssessment = Boolean(
        (a.notes && a.notes.toLowerCase().includes('tc')) ||
        activeStudent?.previous_school_name ||
        activeStudent?.raw?.previous_school_name ||
        aExaminer.toLowerCase() === 'admin'
      );
      const aIsExplicitImport = !isTcAssessment && Boolean(
        aImportId ||
        aExaminer.toLowerCase().includes('excel') ||
        aExaminer.toLowerCase().includes('import') ||
        aExaminer.toLowerCase() === 'mobile who engine'
      );
      const aMatchedStaffUser = aExaminer ? rawUsers.find(u => (u.name && u.name.trim().toLowerCase() === aExaminer.toLowerCase()) || (u.username && u.username.trim().toLowerCase() === aExaminer.toLowerCase())) : null;
      const aIsKnownStaff = !aIsExplicitImport && aExaminer ? (registeredUserNames.has(aExaminer.toLowerCase()) || aExaminer.toLowerCase() === 'admin' || Boolean(aMatchedStaffUser) || (aExaminer.toLowerCase() !== 'health officer' && aExaminer.length > 0)) : false;
      const aIsExcelImport = !isTcAssessment && (aIsExplicitImport || (!aExaminer && !a.assessment_date));
      const aStaffName = isTcAssessment
        ? (aExaminer && aExaminer.toLowerCase() !== 'health officer' ? aExaminer : 'Admin')
        : (aMatchedStaffUser ? aMatchedStaffUser.name : (aExaminer && !aIsExplicitImport ? aExaminer : null));

      return {
        month: dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        date: dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        height: a.height_cm,
        weight: a.weight_kg,
        bmi: a.bmi,
        attendanceStatus: isAbsent ? 'Absent' : 'Present',
        absentReason: a.absent_reason,
        classification: isAbsent ? 'Absent' : (a.nutrition_status || a.bmi_for_age_classification || 'Normal'),
        examinerName: aStaffName,
        isExcelImport: aIsExcelImport,
        rawExaminer: aExaminer
      };
    });
  }, [activeStudent, rawUsers, registeredUserNames]);

  // Dynamic Filtering for Clusters
  const filteredClusters = clustersData.filter(c =>
    c.name.toLowerCase().includes(clusterSearch.toLowerCase())
  );

  // Dynamic Filtering for Schools (matches school name or unique school code)
  const filteredSchools = schoolsList.filter(s => {
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return true;
    const matchName = s.name.toLowerCase().includes(q);
    const matchCode = s.code && s.code.toLowerCase().includes(q);
    return matchName || matchCode;
  });

  // Dynamic Filtering for Students across schools when searching on Screen 2 (Schools in Cluster)
  const matchedStudents = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    if (!q) return [];

    return rawStudents
      .filter(st => matchStudentSearch(st, q))
      .map(st => {
        const sch = rawSchools.find(s =>
          (st.school_id && String(s.id) === String(st.school_id)) ||
          (s.name && st.school_name && s.name.toLowerCase() === st.school_name.toLowerCase())
        );
        const sName = sch?.name || st.school_name || 'School';
        const sCode = sch?.code || '';
        const sId = sch?.id || st.school_id || '';
        const cName = sch?.cluster_name || st.cluster_name || activeCluster?.name || '';
        const cId = sch?.cluster_id || st.cluster_id || '';

        return {
          id: st.id,
          name: st.name,
          class_name: st.class_name || 'Class 1',
          section: st.section || 'A',
          gender: st.gender || 'Female',
          school_id: sId,
          school_name: sName,
          school_code: sCode,
          cluster_id: cId,
          cluster_name: cName,
          nutrition_status: st.nutrition_status || st.latest_bmi_for_age_classification || 'Normal',
        };
      });
  }, [schoolSearch, rawStudents, rawSchools, activeCluster]);

  const handleSelectStudentFromSearch = (st) => {
    let targetClusterId = st.cluster_id;
    if (!targetClusterId) {
      const sch = rawSchools.find(s => String(s.id) === String(st.school_id));
      if (sch?.cluster_id) targetClusterId = sch.cluster_id;
    }
    if (targetClusterId) {
      setSelectedClusterId(targetClusterId);
    }
    setSelectedSchoolId(st.school_id);
    setSelectedStudentId(st.id);
    setViewLevel('student_details');
  };

  const handleSelectSchoolFromSearch = (sch) => {
    if (sch.cluster_id) setSelectedClusterId(sch.cluster_id);
    setSelectedSchoolId(sch.id);
    setViewLevel('students');
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'Normal').toLowerCase().trim();
    if (s.includes('severely wasted') || s.includes('severe thinness')) {
      return { bg: '#FEF2F2', text: '#DC2626', label: 'Severely Wasted' };
    }
    if (s.includes('wasted') || s.includes('thinness')) {
      return { bg: '#FFF7ED', text: '#EA580C', label: 'Wasted' };
    }
    if (s.includes('severely stunted') || s.includes('severe stunting')) {
      return { bg: '#FEF2F2', text: '#DC2626', label: 'Severely Stunted' };
    }
    if (s.includes('stunted') || s.includes('stunting')) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Stunted' };
    }
    if (s.includes('severely underweight')) {
      return { bg: '#FEF2F2', text: '#DC2626', label: 'Severely Underweight' };
    }
    if (s.includes('underweight')) {
      return { bg: '#FFEDD5', text: '#EA580C', label: 'Underweight' };
    }
    if (s.includes('overweight') || s.includes('obesity') || s.includes('obese')) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Overweight' };
    }
    if (s.includes('absent')) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Absent' };
    }
    if (s.includes('pending')) {
      return { bg: '#F1F5F9', text: '#64748B', label: 'Pending Assessment' };
    }
    if (s.includes('tc issued')) {
      return { bg: '#FEF2F2', text: '#DC2626', label: 'TC Issued' };
    }
    if (s.includes('graduated')) {
      return { bg: '#F5F3FF', text: '#7C3AED', label: 'Graduated' };
    }
    return { bg: '#ECFDF5', text: '#059669', label: 'Normal' };
  };

  const isShowingStudentResults = Boolean(
    schoolSearch.trim() && (
      (matchedStudents.length > 0 && filteredSchools.length === 0) ||
      (matchedStudents.length > 0 && searchResultView === 'students')
    )
  );

  // Dynamic Filtering & Sorting for Students
  const filteredStudents = useMemo(() => {
    const list = studentsData.filter(s => {
      // Enrollment and Status filters:
      if (statusFilter !== 'All Status') {
        if (statusFilter === 'TC Issued') {
          if (s.enrollmentStatus !== 'TC Issued' && s.currentStatus !== 'TC Issued') return false;
        } else if (statusFilter === 'Graduated') {
          if (s.enrollmentStatus !== 'Graduated' && s.currentStatus !== 'Graduated') return false;
        } else {
          // Specific health/nutrition status: 'Normal', 'Wasted', 'Severely Wasted', 'Overweight', 'Absent'
          // Non-active students (Graduated or TC Issued) must NEVER appear under active health categories!
          if (s.enrollmentStatus === 'Graduated' || s.enrollmentStatus === 'TC Issued') return false;

          let matchesHealth = false;
          const statusLower = String(s.currentStatus || '').toLowerCase().trim();
          const nutrLower = String(s.nutritionStatus || '').toLowerCase().trim();

          if (statusFilter === 'Overweight') {
            // Note: obesity comes in overweight category
            matchesHealth = (
              statusLower === 'overweight' ||
              statusLower === 'obesity' ||
              statusLower.includes('obese') ||
              statusLower.includes('overweight')
            );
          } else if (statusFilter === 'Severely Wasted') {
            matchesHealth = (
              s.isSeverelyWasted ||
              statusLower === 'severely wasted' ||
              statusLower.includes('severely wasted') ||
              statusLower.includes('severe thinness')
            );
          } else if (statusFilter === 'Wasted') {
            matchesHealth = (
              s.isWasted ||
              statusLower === 'wasted' ||
              (statusLower.includes('thinness') && !statusLower.includes('severe'))
            ) && !statusLower.includes('severely');
          } else if (statusFilter === 'Stunted' || statusFilter === 'Severely Stunted') {
            matchesHealth = (
              s.isStunted ||
              statusLower === 'stunted' ||
              statusLower === 'severely stunted' ||
              statusLower.includes('stunt')
            );
          } else if (statusFilter === 'Underweight' || statusFilter === 'Severely Underweight') {
            matchesHealth = (
              s.isUnderweight ||
              statusLower === 'underweight' ||
              statusLower === 'severely underweight' ||
              statusLower.includes('underweight')
            );
          } else if (statusFilter === 'Pending Assessment') {
            matchesHealth = (
              statusLower === 'pending assessment' ||
              statusLower.includes('pending')
            ) && !s.isAbsentRecord && statusLower !== 'absent';
          } else if (statusFilter === 'Absent') {
            matchesHealth = (
              s.isAbsentRecord ||
              statusLower === 'absent'
            );
          } else if (statusFilter === 'Normal') {
            matchesHealth = (
              statusLower === 'normal'
            ) && !s.isAbsentRecord && statusLower !== 'absent';
          } else {
            matchesHealth = (
              statusLower === String(statusFilter).toLowerCase().trim() ||
              s.currentStatus === statusFilter ||
              s.healthStatus === statusFilter
            );
          }
          if (!matchesHealth) return false;

          if (enrollmentStatusFilter !== 'All' && (s.enrollmentStatus || 'Active') !== enrollmentStatusFilter) return false;
        }
      } else {
        // statusFilter === 'All Status'
        if (enrollmentStatusFilter === 'Active' && s.enrollmentStatus && s.enrollmentStatus !== 'Active') return false;
        if (enrollmentStatusFilter === 'TC Issued' && s.enrollmentStatus !== 'TC Issued') return false;
        if (enrollmentStatusFilter === 'Graduated' && s.enrollmentStatus !== 'Graduated') return false;
        // If enrollmentStatusFilter is 'All', allow all records (including Graduated and TC Issued) to show under All Status
      }

      if (studentSearch) {
        if (!matchStudentSearch(s, studentSearch)) return false;
      }
      if (dobFilter && s.dob !== dobFilter) return false;
      if (classFilter !== 'All Classes') {
        const target = normalizeClassFilter(classFilter);
        const sVal = normalizeClassFilter(s.classVal);
        if (sVal !== target) return false;
      }
      if (sectionFilter !== 'All Sections') {
        const target = normalizeSectionFilter(sectionFilter);
        const sVal = normalizeSectionFilter(s.section);
        if (sVal !== target) return false;
      }
      if (genderFilter !== 'All Genders' && s.gender !== genderFilter) return false;
      if (academicYearFilter !== 'All Years' && s.academicYear !== academicYearFilter) return false;

      // Assessed By (Staff / Excel Import) Filter
      if (assessedByFilter !== 'ALL') {
        if (assessedByFilter === 'EXCEL_IMPORT') {
          if (!s.isExcelImport) return false;
        } else {
          const matchedUser = rawUsers.find(u => u.id === assessedByFilter || u.name?.toLowerCase() === assessedByFilter.toLowerCase());
          const targetName = matchedUser?.name?.toLowerCase() || assessedByFilter.toLowerCase();
          const sExaminer = (s.examinerName || s.rawExaminer || '').toLowerCase();
          if (s.isExcelImport || sExaminer !== targetName) return false;
        }
      }

      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'id') {
        cmp = String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortField === 'name') {
        cmp = String(a.name || '').localeCompare(String(b.name || ''));
      } else if (sortField === 'class') {
        const numA = parseInt(a.classVal) || 0;
        const numB = parseInt(b.classVal) || 0;
        cmp = numA !== numB ? numA - numB : String(a.classVal || '').localeCompare(String(b.classVal || ''));
      } else if (sortField === 'section') {
        cmp = String(a.section || '').localeCompare(String(b.section || ''));
      } else if (sortField === 'dob') {
        cmp = String(a.dob || '').localeCompare(String(b.dob || ''));
      } else if (sortField === 'status') {
        cmp = String(a.healthStatus || '').localeCompare(String(b.healthStatus || ''));
      } else {
        cmp = String(a.id || '').localeCompare(String(b.id || ''), undefined, { numeric: true, sensitivity: 'base' });
      }
      return sortAsc ? cmp : -cmp;
    });

    return list.map((item, idx) => ({
      ...item,
      sno: idx + 1
    }));
  }, [studentsData, enrollmentStatusFilter, studentSearch, dobFilter, classFilter, sectionFilter, genderFilter, statusFilter, academicYearFilter, assessedByFilter, rawUsers, sortField, sortAsc]);



  // Helper values for Z-score bars
  const getZMeterPosition = (val) => {
    // Range roughly -3 to +3, 0 in center
    const clamped = Math.max(-3, Math.min(3, val));
    return ((clamped + 3) / 6) * 100;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= BREADCRUMBS ================= */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setViewLevel('clusters')}
          style={{ background: 'none', border: 'none', padding: 0, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Back to Students Directory"
        >
          <Home size={14} />
        </button>
        <span>&gt;</span>

        <span
          style={{
            cursor: 'pointer',
            color: viewLevel === 'clusters' ? '#0F172A' : '#64748B',
            fontWeight: viewLevel === 'clusters' ? 700 : 500
          }}
          onClick={() => setViewLevel('clusters')}
        >
          Students
        </span>

        {viewLevel !== 'clusters' && (
          <>
            <span>&gt;</span>
            <span
              style={{
                cursor: 'pointer',
                color: viewLevel === 'schools' ? '#0F172A' : '#64748B',
                fontWeight: viewLevel === 'schools' ? 700 : 500
              }}
              onClick={() => setViewLevel('schools')}
            >
              {activeCluster.name}
            </span>
          </>
        )}

        {(viewLevel === 'students' || viewLevel === 'student_details' || viewLevel === 'health_history') && (
          <>
            <span>&gt;</span>
            <span
              style={{
                cursor: 'pointer',
                color: viewLevel === 'students' ? '#0F172A' : '#64748B',
                fontWeight: viewLevel === 'students' ? 700 : 500
              }}
              onClick={() => setViewLevel('students')}
            >
              {activeSchool.name}
            </span>
          </>
        )}

        {(viewLevel === 'student_details' || viewLevel === 'health_history') && (
          <>
            <span>&gt;</span>
            <span
              style={{
                cursor: 'pointer',
                color: viewLevel === 'student_details' ? '#0F172A' : '#64748B',
                fontWeight: viewLevel === 'student_details' ? 700 : 500
              }}
              onClick={() => setViewLevel('student_details')}
            >
              {activeStudent.name}
            </span>
          </>
        )}

        {viewLevel === 'health_history' && (
          <>
            <span>&gt;</span>
            <span style={{ color: '#0F172A', fontWeight: 700 }}>
              Health History
            </span>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: CLUSTERS OVERVIEW (IMAGE 1)                                     */}
      {/* ========================================================================= */}
      {viewLevel === 'clusters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          {/* Header */}
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
              Students
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Explore student data by cluster and school
            </p>
          </div>

          {/* 3 Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(3, 1fr)', gap: '16px' }}>
            {/* All Students */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Users size={28} color="#EA580C" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>All Students</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                    {rawStudents.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Total students across all clusters
                  </div>
                </div>
              </div>
              {/* Subtle watermark illustration */}
              <div style={{ opacity: 0.08, position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Users size={70} color="#EA580C" />
              </div>
            </div>

            {/* All Clusters */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={28} color="#2563EB" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>All Clusters</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                    {rawClusters.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Total clusters
                  </div>
                </div>
              </div>
              <div style={{ opacity: 0.08, position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <Network size={70} color="#2563EB" />
              </div>
            </div>

            {/* All Schools */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <School size={28} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>All Schools</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                    {rawSchools.length.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Total schools
                  </div>
                </div>
              </div>
              <div style={{ opacity: 0.08, position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <School size={70} color="#059669" />
              </div>
            </div>
          </div>

          {/* Section: Clusters List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Clusters</h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Select a cluster to view its schools and students.
                </p>
              </div>

              {/* Search box */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : '260px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={clusterSearch}
                  onChange={(e) => setClusterSearch(e.target.value)}
                  placeholder="Search clusters..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Clusters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(3, 1fr)', gap: '16px' }}>
              {loadingData && filteredClusters.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEEF2', gridColumn: '1 / -1' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #F1F5F9', borderTopColor: '#EA580C', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Loading Clusters & Students...
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B' }}>
                    Synchronizing latest live data
                  </p>
                </div>
              ) : filteredClusters.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEEF2', gridColumn: '1 / -1' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#64748B' }}>
                    <Building2 size={28} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                    {isClusterAdmin ? 'No Clusters Allotted (Pending Scope)' : 'No clusters found'}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '440px', margin: '0 auto' }}>
                    {isClusterAdmin 
                      ? 'You have not been assigned any cluster or school access yet. Please contact the Super Administrator to assign your cluster access scope.'
                      : (clusterSearch.trim() ? `No clusters match "${clusterSearch}".` : 'No cluster records found in system.')}
                  </p>
                </div>
              ) : (
                filteredClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  onClick={() => {
                    setSelectedClusterId(cluster.id);
                    setViewLevel('schools');
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #ECEEF2',
                    padding: '20px 22px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = cluster.themeColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = '#ECEEF2';
                  }}
                >
                  {/* Subtle soft colored corner arc */}
                  <div
                    style={{
                      position: 'absolute',
                      right: '-30px',
                      bottom: '-30px',
                      width: '130px',
                      height: '130px',
                      borderRadius: '50%',
                      backgroundColor: cluster.waveColor,
                      pointerEvents: 'none'
                    }}
                  />

                  {/* Top: Icon + Name + Arrow button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          backgroundColor: cluster.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Users size={24} color={cluster.themeColor} />
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        {cluster.name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalCluster(cluster);
                          setShowClusterGrowthModal(true);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #BFDBFE',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Overall Cluster Report (PDF) - ${cluster.name}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#DBEAFE';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                        }}
                      >
                        <FileText size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClusterToEdit(cluster);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: '1px solid #FED7AA',
                          backgroundColor: '#FFF7ED',
                          color: '#EA580C',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title={`Edit Cluster ${cluster.name}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFEDD5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFF7ED';
                        }}
                      >
                        <Edit2 size={15} />
                      </button>

                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setClusterToDelete(cluster);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #FEE2E2',
                            backgroundColor: '#FFF5F5',
                            color: '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          title={`Delete Cluster ${cluster.name}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FEE2E2';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFF5F5';
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: cluster.bgColor,
                          color: cluster.themeColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <School size={16} color={cluster.themeColor} />
                      <span>{cluster.schoolsCount} Schools</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                      <Users size={16} color={cluster.themeColor} />
                      <span>{cluster.studentsCount} Students</span>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: SCHOOLS IN CLUSTER (IMAGE 2)                                    */}
      {/* ========================================================================= */}
      {viewLevel === 'schools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                {activeCluster.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Schools and student distribution ({activeCluster.schoolsCount} schools, {activeCluster.studentsCount} students)
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setModalCluster(activeCluster);
                  setShowClusterGrowthModal(true);
                }}
                style={{
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1.5px solid #BFDBFE',
                  borderRadius: '8px',
                  padding: '8px 15px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                title={`Overall Cluster Report (PDF) for ${activeCluster.name}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
              >
                <FileText size={14} color="#2563EB" />
                <span>Overall Cluster Report</span>
              </button>

              <button
                type="button"
                onClick={() => setClusterToEdit(activeCluster)}
                style={{
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  border: '1px solid #FED7AA',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                title={`Edit Cluster ${activeCluster.name}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
              >
                <Edit2 size={14} color="#EA580C" />
                <span>Edit Cluster</span>
              </button>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setClusterToDelete(activeCluster)}
                  style={{
                    backgroundColor: '#FFF5F5',
                    color: '#DC2626',
                    border: '1px solid #FEE2E2',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  title={`Delete Cluster ${activeCluster.name}`}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
                >
                  <Trash2 size={14} color="#DC2626" />
                  <span>Delete Cluster</span>
                </button>
              )}
            </div>
          </div>

          {/* 2 Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Total Schools */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <School size={28} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Schools</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {activeCluster.schoolsCount}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Schools in this cluster
                </div>
              </div>
            </div>

            {/* Total Students */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={28} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Students</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {activeCluster.studentsCount}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Students across all schools
                </div>
              </div>
            </div>
          </div>

          {/* Cluster Sub-Tabs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1.5px solid #E2E8F0',
              paddingBottom: '2px',
              marginTop: '4px'
            }}
          >
            {/* Sub-Tab 1: Schools Directory */}
            <button
              type="button"
              onClick={() => setClusterViewTab('schools')}
              style={{
                padding: '9px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13.5px',
                fontWeight: clusterViewTab === 'schools' ? 700 : 500,
                color: clusterViewTab === 'schools' ? '#EB5A1D' : '#64748B',
                borderBottom: clusterViewTab === 'schools' ? '2.5px solid #EB5A1D' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <School size={16} color={clusterViewTab === 'schools' ? '#EB5A1D' : '#64748B'} />
              <span>Schools Directory</span>
              <span
                style={{
                  backgroundColor: clusterViewTab === 'schools' ? '#FFEDD5' : '#F1F5F9',
                  color: clusterViewTab === 'schools' ? '#EA580C' : '#64748B',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {filteredSchools.length}
              </span>
            </button>

            {/* Sub-Tab 2: Monthly Progress Report */}
            <button
              type="button"
              onClick={() => {
                setClusterViewTab('progress');
                setProgressViewType('school');
              }}
              style={{
                padding: '9px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13.5px',
                fontWeight: clusterViewTab === 'progress' ? 700 : 500,
                color: clusterViewTab === 'progress' ? '#EB5A1D' : '#64748B',
                borderBottom: clusterViewTab === 'progress' ? '2.5px solid #EB5A1D' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Activity size={16} color={clusterViewTab === 'progress' ? '#EB5A1D' : '#64748B'} />
              <span>Monthly Progress Report</span>
              {progressReportData?.summary?.not_normal_count > 0 && (
                <span
                  style={{
                    backgroundColor: clusterViewTab === 'progress' ? '#FEE2E2' : '#F1F5F9',
                    color: clusterViewTab === 'progress' ? '#DC2626' : '#64748B',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}
                  title="Students not yet in Normal nutritional category"
                >
                  {progressReportData.summary.not_normal_count}
                </span>
              )}
            </button>
          </div>

          {clusterViewTab === 'schools' ? (
            /* Section: Schools Table */
            <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {schoolSearch.trim()
                      ? (isShowingStudentResults
                        ? `Students matching "${schoolSearch}"`
                        : `Schools matching "${schoolSearch}"`)
                      : `Schools in ${activeCluster.name}`}
                  </h3>
                  {schoolSearch.trim() && (
                    <span style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {isShowingStudentResults ? `${matchedStudents.length} Found` : `${filteredSchools.length} Found`}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  {schoolSearch.trim()
                    ? (isShowingStudentResults
                      ? `Listing students one by one across schools with their school name and unique code.`
                      : `Listing schools matching your search.`)
                    : 'List of schools and their student distribution.'}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                {/* Switcher pills if both match */}
                {schoolSearch.trim() && matchedStudents.length > 0 && filteredSchools.length > 0 && (
                  <div style={{
                    display: 'flex',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '8px',
                    padding: '3px',
                    gap: '2px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSearchResultView('students')}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: isShowingStudentResults ? '#FFFFFF' : 'transparent',
                        color: isShowingStudentResults ? '#2563EB' : '#64748B',
                        boxShadow: isShowingStudentResults ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      Students ({matchedStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchResultView('schools')}
                      style={{
                        padding: '5px 11px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: !isShowingStudentResults ? '#FFFFFF' : 'transparent',
                        color: !isShowingStudentResults ? '#EA580C' : '#64748B',
                        boxShadow: !isShowingStudentResults ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      Schools ({filteredSchools.length})
                    </button>
                  </div>
                )}

                {/* Clean Search Input (No Popover) */}
                <div style={{ position: 'relative', width: isMobile ? '100%' : '280px' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setSearchResultView('students');
                    }}
                    placeholder="Search by student name, ID, DOB, class, section, or school..."
                    style={{
                      width: '100%',
                      padding: schoolSearch ? '8px 32px 8px 36px' : '8px 12px 8px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {schoolSearch && (
                    <button
                      type="button"
                      onClick={() => setSchoolSearch('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#94A3B8'
                      }}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  {isShowingStudentResults ? (
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', width: '45px', whiteSpace: 'nowrap' }}>#</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Student Name & ID</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>School Name & Code</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Class & Section</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Cluster</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '11.5px', fontWeight: 600, color: '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  ) : (
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>School Name</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>School Code</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Students</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Assessed</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Pending</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Current Status</th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {isShowingStudentResults ? (
                    matchedStudents.map((st, idx) => {
                      const stStatus = getStatusBadge(st.nutrition_status);
                      return (
                        <tr
                          key={`match-student-${st.school_id}-${st.id}`}
                          onClick={() => handleSelectStudentFromSearch(st)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            transition: 'background-color 0.15s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: st.gender === 'Female' ? '#FCE7F3' : '#DBEAFE',
                                color: st.gender === 'Female' ? '#DB2777' : '#1D4ED8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0
                              }}>
                                {st.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                                  ID: {st.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <School size={15} color="#EA580C" />
                                <span style={{ fontWeight: 600, color: '#0F172A' }}>{st.school_name}</span>
                              </div>
                              {st.school_code && (
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  color: '#EA580C',
                                  backgroundColor: '#FFF7ED',
                                  border: '1px solid #FFEDD5',
                                  padding: '1px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {st.school_code}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#334155' }}>
                            {st.class_name} • {st.section}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748B' }}>
                            {st.cluster_name}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: stStatus.text,
                              backgroundColor: stStatus.bg,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              display: 'inline-block'
                            }}>
                              {stStatus.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectStudentFromSearch(st);
                              }}
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DBEAFE'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                            >
                              <span>View Student</span>
                              <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : filteredSchools.length > 0 ? (
                    filteredSchools.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setSelectedSchoolId(item.id);
                          setViewLevel('students');
                        }}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: item.iconBg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <School size={16} color={item.iconColor} />
                            </div>
                            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12.5px' }}>
                          {item.code ? (
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: '#EA580C',
                                backgroundColor: '#FFF7ED',
                                border: '1px solid #FFEDD5',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                letterSpacing: '0.02em',
                                display: 'inline-block'
                              }}
                            >
                              {item.code}
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#0F172A' }}>{item.students}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{item.assessed}</td>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: '#475569' }}>{item.pending}</td>
                        <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* Progress bar */}
                            <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.pct}%`, height: '100%', backgroundColor: item.barColor, borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 500 }}>{item.pct}% Assessed</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalSchool(item);
                                setShowSchoolGrowthModal(true);
                              }}
                              style={{
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                padding: '6px 11px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                              title="Download School Growth Report (PDF)"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#DBEAFE';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#EFF6FF';
                              }}
                            >
                              <FileText size={13} color="#2563EB" />
                              <span>Growth Report</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchoolId(item.id);
                                setViewLevel('students');
                              }}
                              style={{
                                backgroundColor: '#FFFFFF',
                                color: '#0F172A',
                                border: '1.5px solid #CBD5E1',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#EA580C';
                                e.currentTarget.style.color = '#EA580C';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#CBD5E1';
                                e.currentTarget.style.color = '#0F172A';
                              }}
                            >
                              <span>View</span>
                              <ArrowRight size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSchoolToEdit(item);
                              }}
                              style={{
                                backgroundColor: '#FFF7ED',
                                color: '#EA580C',
                                border: '1px solid #FED7AA',
                                borderRadius: '6px',
                                padding: '6px 11px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Edit School ${item.name}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFEDD5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFF7ED';
                              }}
                            >
                              <Edit2 size={13} color="#EA580C" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSchoolToDelete(item);
                              }}
                              style={{
                                backgroundColor: '#FFF5F5',
                                color: '#EF4444',
                                border: '1px solid #FEE2E2',
                                borderRadius: '6px',
                                padding: '6px 11px',
                                fontSize: '11.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Delete School ${item.name}`}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FEE2E2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFF5F5';
                              }}
                            >
                              <Trash2 size={13} color="#EF4444" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px 14px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        {schoolSearch.trim() ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span>No students or schools found matching "<strong>{schoolSearch}</strong>".</span>
                            <button
                              type="button"
                              onClick={() => setSchoolSearch('')}
                              style={{
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                borderRadius: '6px',
                                padding: '5px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Clear Search
                            </button>
                          </div>
                        ) : (
                          <span>No schools found in this cluster.</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Progress Filter Bar */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              {/* Month Searchable Dropdown */}
              <SearchableDropdown
                label="Month"
                value={progressMonthFilter}
                onChange={(val) => setProgressMonthFilter(val)}
                options={progressMonthDropdownOptions}
                allOptionLabel="All Months"
                placeholder="All Months"
                searchPlaceholder="Search month..."
                icon={Calendar}
                minWidth="170px"
              />

              {/* School Searchable Dropdown */}
              <SearchableDropdown
                label="School"
                value={progressSchoolFilter}
                onChange={(val) => setProgressSchoolFilter(val)}
                options={progressSchoolOptions}
                allOptionLabel={`All Schools in ${activeCluster.name}`}
                placeholder={`All Schools in ${activeCluster.name}`}
                searchPlaceholder="Search school..."
                icon={School}
                minWidth="200px"
              />

              {/* View Switcher: School Breakdown / Students Trajectory */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '8px',
                  padding: '3px',
                  gap: '2px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setProgressViewType('school')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: progressViewType === 'school' ? 700 : 500,
                    backgroundColor: progressViewType === 'school' ? '#FFFFFF' : 'transparent',
                    color: progressViewType === 'school' ? '#EA580C' : '#64748B',
                    boxShadow: progressViewType === 'school' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <School size={13} />
                  <span>School Breakdown</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProgressViewType('students')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: progressViewType === 'students' ? 700 : 500,
                    backgroundColor: progressViewType === 'students' ? '#FFFFFF' : 'transparent',
                    color: progressViewType === 'students' ? '#EA580C' : '#64748B',
                    boxShadow: progressViewType === 'students' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Users size={13} />
                  <span>Students Trajectory</span>
                </button>
              </div>

              {/* Overall Cluster Report (PDF) */}
              <button
                type="button"
                onClick={() => {
                  setModalCluster(activeCluster);
                  setShowClusterGrowthModal(true);
                }}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
                title="Print or Save Overall Cluster Growth & Recovery Report as PDF"
              >
                <Printer size={13} />
                <span>Overall Cluster Report (PDF)</span>
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setProgressMonthFilter(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
                  setProgressSchoolFilter('All Schools');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            </div>

            {/* 4 Summary KPI Cards — compact */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)',
                gap: '10px'
              }}
            >
              {/* Total Monitored */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  padding: '10px 14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ClipboardCheck size={15} color="#2563EB" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#64748B' }}>Total Monitored</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                      {progressReportData?.summary?.total_assessed || 0}
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>SW & Wasted cohort</span>
                  </div>
                </div>
              </div>

              {/* Not Yet Normal */}
              <div
                onClick={() => {
                  setProgressModal({
                    isOpen: true,
                    title: `Severely Wasted & Wasted Students (${activeCluster.name})`,
                    category: 'not_normal',
                    clusterId: activeCluster.id,
                    schoolId: null,
                    clusterName: activeCluster.name,
                    schoolName: null
                  });
                  setProgressModalCategoryFilter('not_normal');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #FED7AA',
                  padding: '10px 14px',
                  boxShadow: '0 1px 3px rgba(234,88,12,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EA580C'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#FED7AA'}
                title="Click to view Severely Wasted and Wasted students"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={15} color="#EA580C" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#9A3412' }}>Not Yet Normal</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#EA580C', lineHeight: 1.1 }}>
                      {progressReportData?.summary?.not_normal_count || 0}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '8px', backgroundColor: '#FFEDD5', color: '#C2410C' }}>
                      {progressReportData?.summary?.not_normal_pct || 0}%
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#C2410C', fontWeight: 600 }}>
                    SW: {progressReportData?.summary?.severely_wasted_count || 0} • W: {progressReportData?.summary?.wasted_count || 0} • Click
                  </span>
                </div>
              </div>

              {/* No Improvement / Deteriorating */}
              <div
                onClick={() => {
                  setProgressModal({
                    isOpen: true,
                    title: `Students with No Improvement / Deteriorating (${activeCluster.name})`,
                    category: 'deteriorated',
                    clusterId: activeCluster.id,
                    schoolId: null,
                    clusterName: activeCluster.name,
                    schoolName: null
                  });
                  setProgressModalCategoryFilter('deteriorated');
                }}
                style={{
                  backgroundColor: '#FFF5F5',
                  borderRadius: '10px',
                  border: '1.5px solid #FCA5A5',
                  padding: '10px 14px',
                  boxShadow: '0 1px 3px rgba(220,38,38,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DC2626'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#FCA5A5'}
                title="Click to view students with dropped BMI or worsened status"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingDown size={15} color="#DC2626" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#991B1B' }}>No Improvement / Dropped</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                      {progressReportData?.summary?.deteriorated_count || 0}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      🔻 Critical
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#991B1B', fontWeight: 600 }}>
                    BMI declined • Click to view
                  </span>
                </div>
              </div>

              {/* Improving / Recovering */}
              <div
                onClick={() => {
                  setProgressModal({
                    isOpen: true,
                    title: `Students Recovering / Improving (${activeCluster.name})`,
                    category: 'improved',
                    clusterId: activeCluster.id,
                    schoolId: null,
                    clusterName: activeCluster.name,
                    schoolName: null
                  });
                  setProgressModalCategoryFilter('improved');
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #A7F3D0',
                  padding: '10px 14px',
                  boxShadow: '0 1px 3px rgba(5,150,105,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#A7F3D0'}
                title="Click to view students with health improvement"
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={15} color="#059669" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#065F46' }}>Improving / Recovering</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
                      {progressReportData?.summary?.improved_count || 0}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '8px', backgroundColor: '#D1FAE5', color: '#065F46' }}>
                      🔺 Positive
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#047857', fontWeight: 500 }}>
                    BMI → Normal • Click to view
                  </span>
                </div>
              </div>
            </div>

            {/* View 1: School-wise Table */}
            {progressViewType === 'school' && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Schools in {activeCluster.name} — Progress Summary
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                      School-level nutritional recovery rates and students with deteriorating health in this cluster
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    {progressReportData?.schools?.length || 0} Schools Active
                  </span>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '820px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>School Name</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Cluster</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Total Monitored</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#DC2626', whiteSpace: 'nowrap' }}>Severely Wasted</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#EA580C', whiteSpace: 'nowrap' }}>Wasted</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>No Improvement (BMI Dropped)</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>Improving</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressReportData?.schools && progressReportData.schools.length > 0 ? (
                        progressReportData.schools.map((s) => (
                          <tr key={s.school_id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <School size={15} color="#059669" />
                                </div>
                                <span>{s.school_name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                              {s.cluster_name}
                            </td>
                            <td style={{ padding: '14px', fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                              {s.total_assessed}
                            </td>
                            <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                              <span
                                onClick={() => {
                                  setProgressModal({
                                    isOpen: true,
                                    title: `Severely Wasted Students — School: ${s.school_name}`,
                                    category: 'severely_wasted',
                                    clusterId: s.cluster_id,
                                    schoolId: s.school_id,
                                    clusterName: s.cluster_name,
                                    schoolName: s.school_name
                                  });
                                  setProgressModalCategoryFilter('severely_wasted');
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  backgroundColor: s.severely_wasted_count > 0 ? '#FEE2E2' : '#F1F5F9',
                                  color: s.severely_wasted_count > 0 ? '#DC2626' : '#64748B',
                                  cursor: 'pointer'
                                }}
                                title="Click to view Severely Wasted students in this school"
                              >
                                {s.severely_wasted_count}
                              </span>
                            </td>
                            <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                              <span
                                onClick={() => {
                                  setProgressModal({
                                    isOpen: true,
                                    title: `Wasted Students — School: ${s.school_name}`,
                                    category: 'wasted',
                                    clusterId: s.cluster_id,
                                    schoolId: s.school_id,
                                    clusterName: s.cluster_name,
                                    schoolName: s.school_name
                                  });
                                  setProgressModalCategoryFilter('wasted');
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  backgroundColor: s.wasted_count > 0 ? '#FFEDD5' : '#F1F5F9',
                                  color: s.wasted_count > 0 ? '#EA580C' : '#64748B',
                                  cursor: 'pointer'
                                }}
                                title="Click to view Wasted students in this school"
                              >
                                {s.wasted_count}
                              </span>
                            </td>
                            <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                              <span
                                onClick={() => {
                                  setProgressModal({
                                    isOpen: true,
                                    title: `No Improvement / Dropped BMI Students — School: ${s.school_name}`,
                                    category: 'deteriorated',
                                    clusterId: s.cluster_id,
                                    schoolId: s.school_id,
                                    clusterName: s.cluster_name,
                                    schoolName: s.school_name
                                  });
                                  setProgressModalCategoryFilter('deteriorated');
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  backgroundColor: s.deteriorated_count > 0 ? '#FEE2E2' : '#F1F5F9',
                                  color: s.deteriorated_count > 0 ? '#DC2626' : '#64748B',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Click to view students showing no improvement or BMI drop in this school"
                              >
                                {s.deteriorated_count > 0 && <span>🔻</span>}
                                <span>{s.deteriorated_count} due</span>
                              </span>
                            </td>
                            <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                              <span
                                onClick={() => {
                                  setProgressModal({
                                    isOpen: true,
                                    title: `Improving Students — School: ${s.school_name}`,
                                    category: 'improved',
                                    clusterId: s.cluster_id,
                                    schoolId: s.school_id,
                                    clusterName: s.cluster_name,
                                    schoolName: s.school_name
                                  });
                                  setProgressModalCategoryFilter('improved');
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 9px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  backgroundColor: '#D1FAE5',
                                  color: '#065F46',
                                  cursor: 'pointer'
                                }}
                                title="Click to view improving students in this school"
                              >
                                {s.improved_count > 0 && <span>🔺</span>}
                                <span>{s.improved_count}</span>
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProgressModal({
                                      isOpen: true,
                                      title: `Monitored Students — School: ${s.school_name}`,
                                      category: 'all',
                                      clusterId: s.cluster_id,
                                      schoolId: s.school_id,
                                      clusterName: s.cluster_name,
                                      schoolName: s.school_name
                                    });
                                    setProgressModalCategoryFilter('all');
                                  }}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>View Students</span>
                                  <ArrowRight size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSchoolId(s.school_id);
                                    setViewLevel('students');
                                  }}
                                  style={{
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <span>Open School</span>
                                  <ArrowRight size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
                            No school records found for the selected period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 2: Students Trajectory Table */}
            {progressViewType === 'students' && (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Severely Wasted & Wasted Progress Records ({activeCluster.name})
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                      Individual month-over-month weight, BMI, and nutritional trajectory for monitored students in this cluster
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                    {progressReportData?.students?.length || 0} Monitored Students
                  </span>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Student</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Class & Section</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>School / Cluster</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Previous Assessment</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Current Assessment</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>BMI Trajectory</th>
                        <th style={{ padding: '12px 16px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progressReportData?.students && progressReportData.students.length > 0 ? (
                        (() => {
                          // Deduplicate: keep only one row per student_id (backend already does this; this is a safety guard)
                          const seen = new Set();
                          const uniqueStudents = progressReportData.students.filter(st => {
                            if (seen.has(st.student_id)) return false;
                            seen.add(st.student_id);
                            return true;
                          });
                          return uniqueStudents;
                        })().map((st) => {
                          const isDeteriorated = st.is_deteriorated;
                          const isImproved = st.progress_status === 'improved';
                          const isStagnant = st.progress_status === 'stagnant';
                          return (
                            <tr key={st.student_id} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: isDeteriorated ? '#FFFBFB' : 'transparent', transition: 'background 0.1s' }}>
                              <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: st.gender === 'Female' ? '#FCE7F3' : '#E0F2FE', color: st.gender === 'Female' ? '#BE185D' : '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                    {st.name?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>ID: {st.student_id}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                                {st.class_name} • {st.section}
                              </td>
                              <td style={{ padding: '14px', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                                <div>{st.school_name}</div>
                                <div style={{ fontSize: '11px', color: '#94A3B8' }}>{st.cluster_name}</div>
                              </td>
                              <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                                {st.prev_date ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                                      {st.prev_bmi ? `${st.prev_bmi} kg/m²` : '—'} ({st.prev_weight_kg ? `${st.prev_weight_kg}kg` : '—'})
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: getNutritionStatusBg(st.prev_status), color: getNutritionStatusColor(st.prev_status), fontWeight: 700 }}>
                                        {st.prev_status}
                                      </span>
                                      <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{st.prev_date}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                                    Initial Screening (Baseline)
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                    {st.bmi ? `${st.bmi} kg/m²` : '—'} ({st.weight_kg ? `${st.weight_kg}kg` : '—'})
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: getNutritionStatusBg(st.nutrition_status), color: getNutritionStatusColor(st.nutrition_status), fontWeight: 700 }}>
                                      {st.nutrition_status}
                                    </span>
                                    <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{st.assessment_date}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px', whiteSpace: 'nowrap' }}>
                                {st.bmi_delta !== null ? (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      borderRadius: '10px',
                                      fontSize: '11.5px',
                                      fontWeight: 800,
                                      backgroundColor: isDeteriorated ? '#FEE2E2' : isImproved ? '#D1FAE5' : '#F1F5F9',
                                      color: isDeteriorated ? '#DC2626' : isImproved ? '#065F46' : '#64748B'
                                    }}
                                  >
                                    {isDeteriorated && '🔻'}
                                    {isImproved && '🔺'}
                                    {isStagnant && '➖'}
                                    <span>
                                      {st.bmi_delta > 0 ? `+${st.bmi_delta}` : st.bmi_delta} kg/m²
                                    </span>
                                    <span style={{ fontSize: '10px', opacity: 0.85 }}>
                                      ({isDeteriorated ? 'Deteriorated' : isImproved ? 'Recovering' : 'No Change'})
                                    </span>
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}>
                                    Baseline screening
                                  </span>
                                )}
                              </td>
                                <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenStudentGrowthReport(st);
                                    }}
                                    style={{
                                      backgroundColor: '#EB5A1D',
                                      color: '#FFFFFF',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '5px 10px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      boxShadow: '0 1px 3px rgba(235, 90, 29, 0.2)',
                                      whiteSpace: 'nowrap',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9480F'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
                                    title="View Student Health & Growth Report"
                                  >
                                    <FileText size={12} />
                                    <span>Growth Report</span>
                                  </button>
                                </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '40px 30px', color: '#64748B', fontSize: '13px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '28px' }}>📅</span>
                              {progressMonthFilter && progressMonthFilter !== 'All Months' ? (
                                <>
                                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                                    No students assessed in {monthDropdownOptions.find(m => m.value === progressMonthFilter)?.label || progressMonthFilter}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                                    No Severely Wasted or Wasted students were assessed during this month. Try selecting a different month.
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontWeight: 600, color: '#475569' }}>No monitored students found matching the selected filters.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}

      {/* ========================================================================= */}
      {/* SCREEN 3: SCHOOL STUDENTS LIST (IMAGE 3)                                  */}
      {/* ========================================================================= */}
      {viewLevel === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          {/* Header row with Title and Right Summary Card & PDF Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                  {activeSchool.name}
                </h1>

                {activeSchool.code && (
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#EA580C',
                    backgroundColor: '#FFF7ED',
                    border: '1.5px solid #FFEDD5',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    letterSpacing: '0.03em',
                  }}>
                    CODE: {activeSchool.code}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                {activeSchool.students} Enrolled Students • Health & Growth Surveillance
              </p>
            </div>

            {/* Actions & Summary on Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Refresh Data Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isManualRefreshing}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: isManualRefreshing ? '#94A3B8' : '#0284C7',
                  border: '1.5px solid #BAE6FD',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: isManualRefreshing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                title="Refresh live student and health data from server"
              >
                <RotateCcw size={14} className={isManualRefreshing ? 'animate-spin' : ''} />
                <span>{isManualRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              {/* School Growth Report (PDF) Button */}
              <button
                type="button"
                onClick={() => {
                  setModalSchool(activeSchool);
                  setShowSchoolGrowthModal(true);
                }}
                style={{
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 18px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
                  transition: 'all 0.15s ease'
                }}
                title="Download complete School Growth & Nutrition Report (PDF)"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F172A'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E293B'}
              >
                <FileText size={16} color="#38BDF8" />
                <span>School Growth Report (PDF)</span>
              </button>

              {/* Edit School Button */}
              <button
                type="button"
                onClick={() => setSchoolToEdit(activeSchool)}
                style={{
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  border: '1px solid #FED7AA',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Edit School ${activeSchool.name}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
              >
                <Edit2 size={15} color="#EA580C" />
                <span>Edit School</span>
              </button>

              {/* Delete School Button */}
              <button
                type="button"
                onClick={() => setSchoolToDelete(activeSchool)}
                style={{
                  backgroundColor: '#FFF5F5',
                  color: '#DC2626',
                  border: '1px solid #FEE2E2',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Delete School ${activeSchool.name}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
              >
                <Trash2 size={15} color="#DC2626" />
                <span>Delete School</span>
              </button>

              {/* Delete All Students in School Button */}
              <button
                type="button"
                onClick={() => setShowDeleteAllSchoolStudentsModal(true)}
                disabled={!studentsData || studentsData.length === 0}
                style={{
                  backgroundColor: (!studentsData || studentsData.length === 0) ? '#F8FAFC' : '#FEF2F2',
                  color: (!studentsData || studentsData.length === 0) ? '#94A3B8' : '#DC2626',
                  border: (!studentsData || studentsData.length === 0) ? '1px solid #E2E8F0' : '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!studentsData || studentsData.length === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={studentsData && studentsData.length > 0 ? `Delete all ${studentsData.length} uploaded students in ${activeSchool.name}` : 'No students to delete in this school'}
                onMouseEnter={(e) => {
                  if (studentsData && studentsData.length > 0) e.currentTarget.style.backgroundColor = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  if (studentsData && studentsData.length > 0) e.currentTarget.style.backgroundColor = '#FEF2F2';
                }}
              >
                <Trash2 size={15} color={(!studentsData || studentsData.length === 0) ? '#94A3B8' : '#DC2626'} />
                <span>Delete All Students</span>
              </button>


            </div>
          </div>

          {/* Sub-Tabs: All Students vs Priority Tracking (Severely Wasted & Wasted) */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '2px',
              marginTop: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => setStudentViewTab('all')}
              style={{
                padding: '9px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13.5px',
                fontWeight: studentViewTab === 'all' ? 700 : 500,
                color: studentViewTab === 'all' ? '#EB5A1D' : '#64748B',
                borderBottom: studentViewTab === 'all' ? '2.5px solid #EB5A1D' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={16} />
              <span>All Students ({studentsData.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setStudentViewTab('priority')}
              style={{
                padding: '9px 18px',
                border: 'none',
                background: 'none',
                fontSize: '13.5px',
                fontWeight: studentViewTab === 'priority' ? 700 : 500,
                color: studentViewTab === 'priority' ? '#EB5A1D' : '#64748B',
                borderBottom: studentViewTab === 'priority' ? '2.5px solid #EB5A1D' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <Calendar size={16} color={studentViewTab === 'priority' ? '#EB5A1D' : '#64748B'} />
              <span>Monthly Tracking</span>
              <span
                style={{
                  backgroundColor: studentViewTab === 'priority' ? '#FFEDD5' : '#F1F5F9',
                  color: studentViewTab === 'priority' ? '#EA580C' : '#64748B',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}
              >
                {criticalStudents.length}
              </span>
            </button>
          </div>

          {/* ================= VIEW TAB 1: MONTHLY TRACKING ================= */}
          {studentViewTab === 'priority' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {/* Filter Bar for Monthly Tracking Students */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name, ID, DOB, class, section..."
                    style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={priorityCategoryFilter}
                  onChange={(e) => setPriorityCategoryFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#0F172A', backgroundColor: '#FFFFFF', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="SEVERELY_WASTED">🔴 Severely Wasted Only</option>
                  <option value="WASTED">🟠 Wasted (Moderate) Only</option>
                </select>

                {/* Searchable Class Filter */}
                <SearchableDropdown
                  label="Class"
                  value={classFilter}
                  onChange={(val) => setClassFilter(val)}
                  options={availableClassOptions}
                  allOptionLabel="All Classes"
                  placeholder="All Classes"
                  searchPlaceholder="Search class or group..."
                  icon={Layers}
                  minWidth="140px"
                />

                {/* Searchable Section Filter */}
                <SearchableDropdown
                  label="Section"
                  value={sectionFilter}
                  onChange={(val) => setSectionFilter(val)}
                  options={availableSectionOptions}
                  allOptionLabel="All Sections"
                  placeholder="All Sections"
                  searchPlaceholder="Search section or batch..."
                  icon={Users}
                  minWidth="140px"
                />

                {/* Upcoming Due Status Filter */}
                <select
                  value={upcomingMonthFilter}
                  onChange={(e) => setUpcomingMonthFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: upcomingMonthFilter !== 'ALL' ? '1px solid #EA580C' : '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: upcomingMonthFilter !== 'ALL' ? '#C2410C' : '#0F172A',
                    backgroundColor: upcomingMonthFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
                    fontWeight: upcomingMonthFilter !== 'ALL' ? 600 : 400,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Filter by Assessment Due Status"
                >
                  <option value="ALL">📅 All Upcoming Assessments</option>
                  <option value="THIS_MONTH">⚡ Due This Month</option>
                  <option value="NEXT_MONTH">📆 Due Next Month</option>
                  <option value="OVERDUE">⚠️ Overdue Assessments</option>
                </select>

                {/* Dedicated Searchable Month Dropdown */}
                <SearchableDropdown
                  label="Month"
                  value={selectedMonthFilter}
                  onChange={(val) => setSelectedMonthFilter(val)}
                  options={monthDropdownOptions}
                  allOptionLabel="All Months"
                  placeholder="All Months"
                  searchPlaceholder="Search month (e.g. Sep, Nov)..."
                  icon={Calendar}
                  minWidth="165px"
                />

                {/* Assessed By (Staff / Excel Import) Filter */}
                <select
                  value={assessedByFilter}
                  onChange={(e) => setAssessedByFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: assessedByFilter !== 'ALL' ? '1px solid #EA580C' : '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: assessedByFilter !== 'ALL' ? '#C2410C' : '#0F172A',
                    backgroundColor: assessedByFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
                    fontWeight: assessedByFilter !== 'ALL' ? 600 : 400,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  title="Filter by Assessed Staff or Baseline Excel Import"
                >
                  <option value="ALL">👤 Assessed By: All Sources & Staff</option>
                  <option value="EXCEL_IMPORT">📄 Excel Import (Baseline)</option>
                  {rawUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      👤 {u.name} ({u.role === 'health_officer' ? 'Staff' : (u.role === 'admin' ? 'Admin' : u.role)})
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  type="button"
                  onClick={() => {
                    setStudentSearch('');
                    setClassFilter('All Classes');
                    setSectionFilter('All Sections');
                    setGenderFilter('All Genders');
                    setPriorityCategoryFilter('ALL');
                    setUpcomingMonthFilter('ALL');
                    setSelectedMonthFilter('All Months');
                    setAssessedByFilter('ALL');
                  }}
                  style={{ backgroundColor: '#FFFFFF', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                >
                  <RotateCcw size={13} />
                  <span>Clear Filters</span>
                </button>
              </div>

              {/* Table of Priority Tracking Students */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Monthly Tracking Roster
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Showing {filteredCriticalStudents.length} students requiring upcoming monthly assessment
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', width: '45px', whiteSpace: 'nowrap' }}>#</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Student ID</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Student Name</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Grade-Sec</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Gender</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Last Assessed</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Assessed By</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', whiteSpace: 'nowrap' }}>Next Assessment Due</th>
                        <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCriticalStudents.length > 0 ? (
                        filteredCriticalStudents.map((item, idx) => (
                          <tr
                            key={item.id}
                            style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: item.isSeverelyWasted ? '#FFFBFB' : '#FFFFFF', transition: 'background-color 0.15s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = item.isSeverelyWasted ? '#FFFBFB' : '#FFFFFF'}
                          >
                            <td style={{ padding: '12px 14px', fontSize: '12px', color: '#64748B', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{idx + 1}</td>
                            <td style={{ padding: '12px 14px', fontSize: '12px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.id}</td>
                            <td style={{ padding: '12px 14px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.name}</td>
                            <td style={{ padding: '12px 14px', fontSize: '12px', color: '#475569', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>Class {item.classVal}-{item.section}</td>
                            <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#475569', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.gender}</td>
                            <td style={{ padding: '12px 14px', fontSize: '11.5px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                backgroundColor: item.isSeverelyWasted ? '#FEE2E2' : '#FFEDD5',
                                color: item.isSeverelyWasted ? '#DC2626' : '#EA580C',
                                border: `1px solid ${item.isSeverelyWasted ? '#FECACA' : '#FED7AA'}`
                              }}>
                                {item.isSeverelyWasted ? '🔴 Severely Wasted' : '🟠 Wasted'}
                              </span>
                              {item.bmiDelta !== null && item.bmiDelta < 0 && (
                                <div style={{ marginTop: '5px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10.5px',
                                    fontWeight: 800,
                                    backgroundColor: '#FEF2F2',
                                    color: '#991B1B',
                                    border: '1px solid #F87171'
                                  }}>
                                    <span>🚨 Lower BMI ({item.bmiDelta > 0 ? `+${item.bmiDelta}` : item.bmiDelta})</span>
                                  </span>
                                </div>
                              )}
                              {item.progressStatus === 'weight_loss' && (
                                <div style={{ marginTop: '5px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    backgroundColor: '#FEE2E2',
                                    color: '#B91C1C',
                                    border: '1px solid #FCA5A5'
                                  }}>
                                    <span>🔻 {item.weightDelta} kg (Weight Loss)</span>
                                  </span>
                                </div>
                              )}
                              {item.progressStatus === 'stagnant' && (
                                <div style={{ marginTop: '5px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    backgroundColor: '#FEF3C7',
                                    color: '#B45309',
                                    border: '1px solid #FCD34D'
                                  }}>
                                    <span>⚠️ 0.0 kg (No Gain)</span>
                                  </span>
                                </div>
                              )}
                              {item.progressStatus === 'improving' && (
                                <div style={{ marginTop: '5px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10.5px',
                                    fontWeight: 700,
                                    backgroundColor: '#ECFDF5',
                                    color: '#047857',
                                    border: '1px solid #A7F3D0'
                                  }}>
                                    <span>🟢 +{item.weightDelta} kg (Improving)</span>
                                  </span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '11.5px', color: '#64748B', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{item.latestAssessment}</td>
                            <td style={{ padding: '12px 14px', fontSize: '11.5px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              {item.isExcelImport ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569',
                                    border: '1px solid #CBD5E1',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Baseline data uploaded via Excel spreadsheet"
                                >
                                  <FileSpreadsheet size={12} color="#059669" />
                                  <span>Excel Import (Baseline)</span>
                                </span>
                              ) : item.examinerName ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '11px',
                                    backgroundColor: '#EFF6FF',
                                    color: '#1D4ED8',
                                    border: '1px solid #BFDBFE',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={`Assessed by ${item.examinerName}`}
                                >
                                  <UserCheck size={12} color="#2563EB" />
                                  <span>{item.examinerName}</span>
                                </span>
                              ) : (
                                <span style={{ color: '#94A3B8', fontSize: '11px' }}>—</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', fontSize: '11.5px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  whiteSpace: 'nowrap',
                                  backgroundColor: item.dueBadgeBg,
                                  color: item.dueBadgeColor
                                }}>
                                  {item.dueStatus}
                                </span>
                                <span style={{ color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap' }}>({item.nextDueDateFormatted})</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStudentGrowthReport(item);
                                  }}
                                  style={{
                                    backgroundColor: '#EB5A1D',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(235, 90, 29, 0.2)',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="View Student Health & Growth Report"
                                >
                                  <FileText size={12} />
                                  <span>Growth Report</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudentId(item.id);
                                    setViewLevel('health_history');
                                  }}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    color: '#0F172A',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    padding: '5px 8px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="View Health History & Trends"
                                >
                                  <Eye size={12} />
                                  <span>Health</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '28px', color: '#64748B', fontSize: '13px' }}>
                            {selectedMonthFilter && selectedMonthFilter !== 'All Months' && selectedMonthFilter !== 'ALL'
                              ? `No students in ${availableAssessmentMonths.find(m => m.value === selectedMonthFilter)?.label || selectedMonthFilter}`
                              : upcomingMonthFilter !== 'ALL'
                              ? `No students matching the selected ${upcomingMonthFilter === 'OVERDUE' ? 'overdue' : 'upcoming'} filter.`
                              : 'No students matching the selected monthly tracking filter criteria.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ================= VIEW TAB 2: ALL STUDENTS ================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {/* Filter Bar Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #ECEEF2',
                  padding: '14px 18px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Top Row: Enrollment Status Tabs & Promotion Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'inline-flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                    {[
                      { id: 'All', label: 'All Records', count: studentsData.length },
                      { id: 'Active', label: 'Active Enrolled', count: studentsData.filter(s => (s.enrollmentStatus || 'Active') === 'Active').length },
                      { id: 'TC Issued', label: 'TC Issued', count: studentsData.filter(s => s.enrollmentStatus === 'TC Issued').length },
                      { id: 'Graduated', label: 'Graduated', count: studentsData.filter(s => s.enrollmentStatus === 'Graduated').length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setEnrollmentStatusFilter(tab.id);
                          if (tab.id === 'All') setStatusFilter('All Status');
                          else if (tab.id === 'Active') {
                            if (statusFilter === 'TC Issued' || statusFilter === 'Graduated') setStatusFilter('All Status');
                          }
                          else if (tab.id === 'TC Issued') setStatusFilter('TC Issued');
                          else if (tab.id === 'Graduated') setStatusFilter('Graduated');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: enrollmentStatusFilter === tab.id ? 700 : 500,
                          backgroundColor: enrollmentStatusFilter === tab.id ? '#FFFFFF' : 'transparent',
                          color: enrollmentStatusFilter === tab.id ? '#0F172A' : '#64748B',
                          border: 'none',
                          boxShadow: enrollmentStatusFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{tab.label}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '10px',
                          backgroundColor: enrollmentStatusFilter === tab.id ? '#E2E8F0' : '#E2E8F0',
                          color: '#334155'
                        }}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowTcIntakeModal(true)}
                      style={{
                        backgroundColor: '#0284C7',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                      }}
                      title="Admit Transfer Certificate (TC) student with prior record lookup and intake assessment"
                    >
                      <ArrowRightLeft size={15} />
                      <span>Admit TC Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPromotionModal(true)}
                      style={{
                        backgroundColor: '#7C3AED',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(124, 58, 237, 0.25)'
                      }}
                      title="Batch promote students to the next academic year"
                    >
                      <GraduationCap size={15} />
                      <span>Promote Academic Year</span>
                    </button>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                    <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Student name, ID, or DOB..."
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 32px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Searchable Class Filter */}
                  <SearchableDropdown
                    label="Class"
                    value={classFilter}
                    onChange={(val) => setClassFilter(val)}
                    options={availableClassOptions}
                    allOptionLabel="All Classes"
                    placeholder="All Classes"
                    searchPlaceholder="Search class or group..."
                    icon={Layers}
                    minWidth="140px"
                  />

                  {/* Searchable Section Filter */}
                  <SearchableDropdown
                    label="Section"
                    value={sectionFilter}
                    onChange={(val) => setSectionFilter(val)}
                    options={availableSectionOptions}
                    allOptionLabel="All Sections"
                    placeholder="All Sections"
                    searchPlaceholder="Search section or batch..."
                    icon={Users}
                    minWidth="140px"
                  />

                  {/* DOB Filter */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: dobFilter ? '#FFF7ED' : '#FFFFFF',
                      border: dobFilter ? '1px solid #EA580C' : '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      boxSizing: 'border-box',
                    }}
                    title="Filter by Date of Birth (DOB)"
                  >
                    <Calendar size={13} color={dobFilter ? '#EA580C' : '#64748B'} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: dobFilter ? '#EA580C' : '#64748B', whiteSpace: 'nowrap' }}>
                      DOB:
                    </span>
                    <input
                      type="date"
                      value={dobFilter}
                      onChange={(e) => setDobFilter(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        fontSize: '12px',
                        color: '#0F172A',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                    {dobFilter && (
                      <button
                        type="button"
                        onClick={() => setDobFilter('')}
                        title="Clear DOB filter"
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: '0 2px',
                          display: 'flex',
                          alignItems: 'center',
                          color: '#EA580C',
                        }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Gender Filter */}
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All Genders">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

                  {/* Health / Enrollment Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStatusFilter(val);
                      if (val === 'All Status') {
                        setEnrollmentStatusFilter('All');
                      } else if (val === 'TC Issued') {
                        setEnrollmentStatusFilter('TC Issued');
                      } else if (val === 'Graduated') {
                        setEnrollmentStatusFilter('Graduated');
                      } else {
                        // When choosing a nutritional health category ('Normal', 'Wasted', 'Severely Wasted', 'Overweight', 'Absent'),
                        // switch enrollment filter to 'Active' so it never conflicts with TC Issued or Graduated
                        if (enrollmentStatusFilter === 'TC Issued' || enrollmentStatusFilter === 'Graduated') {
                          setEnrollmentStatusFilter('Active');
                        }
                      }
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All Status">All Status</option>
                    <option value="Normal">Normal</option>
                    <option value="Wasted">Wasted</option>
                    <option value="Severely Wasted">Severely Wasted</option>
                    <option value="Stunted">Stunted</option>
                    <option value="Underweight">Underweight</option>
                    <option value="Overweight">Overweight (incl. Obesity)</option>
                    <option value="Pending Assessment">Pending Assessment</option>
                    <option value="Absent">Absent</option>
                    <option value="TC Issued">TC Issued</option>
                    <option value="Graduated">Graduated</option>
                  </select>

                  {/* Academic Year Filter (if multiple years exist) */}
                  {availableAcademicYears.length > 1 && (
                    <select
                      value={academicYearFilter}
                      onChange={(e) => setAcademicYearFilter(e.target.value)}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="All Years">All Academic Years</option>
                      {availableAcademicYears.map(yr => (
                        <option key={yr} value={yr}>Session: {yr}</option>
                      ))}
                    </select>
                  )}

                  {/* Assessed By (Staff / Excel Import) Filter */}
                  <select
                    value={assessedByFilter}
                    onChange={(e) => setAssessedByFilter(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '8px',
                      border: assessedByFilter !== 'ALL' ? '1px solid #EA580C' : '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: assessedByFilter !== 'ALL' ? '#C2410C' : '#0F172A',
                      backgroundColor: assessedByFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
                      fontWeight: assessedByFilter !== 'ALL' ? 600 : 400,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    title="Filter by Assessed Staff or Baseline Excel Import"
                  >
                    <option value="ALL">👤 Assessed By: All Sources & Staff</option>
                    <option value="EXCEL_IMPORT">📄 Excel Import (Baseline)</option>
                    {rawUsers.map((u) => (
                      <option key={u.id} value={u.name}>
                        👤 {u.name} ({u.role === 'health_officer' ? 'Staff' : (u.role === 'admin' ? 'Admin' : u.role)})
                      </option>
                    ))}
                  </select>

                  {/* Clear Filters */}
                  <button
                    type="button"
                    onClick={handleClearStudentFilters}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>

              {/* Students Table Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #ECEEF2',
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >

                {/* Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '50px' }}>S.No</th>
                        <th
                          onClick={() => handleSort('id')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'id' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by Student ID"
                        >
                          Student ID
                        </th>
                        <th
                          onClick={() => handleSort('name')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'name' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by Student Name"
                        >
                          Student Name
                        </th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Gender</th>
                        <th
                          onClick={() => handleSort('class')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'class' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by Class"
                        >
                          Class
                        </th>
                        <th
                          onClick={() => handleSort('section')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'section' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by Section"
                        >
                          Section
                        </th>
                        <th
                          onClick={() => handleSort('dob')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'dob' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by DOB"
                        >
                          DOB
                        </th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Latest Assessment</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessed By</th>
                        <th
                          onClick={() => handleSort('status')}
                          style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: sortField === 'status' ? '#EA580C' : '#475569', cursor: 'pointer', userSelect: 'none' }}
                          title="Click to sort by Status"
                        >
                          Status
                        </th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedStudentId(item.id);
                            setViewLevel('student_details');
                          }}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            transition: 'background-color 0.15s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#64748B' }}>{item.sno}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                            <span>{item.id}</span>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>{item.name}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                backgroundColor: item.gender === 'Male' ? '#E0F2FE' : '#FCE7F3',
                                color: item.gender === 'Male' ? '#0284C7' : '#DB2777'
                              }}
                            >
                              {item.gender}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.classVal}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.section}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.dob}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.latestAssessment}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                            {item.isExcelImport ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  backgroundColor: '#F1F5F9',
                                  color: '#475569',
                                  border: '1px solid #CBD5E1',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Baseline data uploaded via Excel spreadsheet"
                              >
                                <FileSpreadsheet size={12} color="#059669" />
                                <span>Excel Import (Baseline)</span>
                              </span>
                            ) : item.examinerName ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '8px',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: '1px solid #BFDBFE',
                                  whiteSpace: 'nowrap'
                                }}
                                title={`Assessed by ${item.examinerName}`}
                              >
                                <UserCheck size={12} color="#2563EB" />
                                <span>{item.examinerName}</span>
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontSize: '11px' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                backgroundColor: getNutritionStatusBg(item.currentStatus),
                                color: getNutritionStatusColor(item.currentStatus),
                                border: `1px solid ${getNutritionStatusBorder(item.currentStatus)}`
                              }}
                            >
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: getNutritionStatusColor(item.currentStatus)
                                }}
                              />
                              {item.currentStatus}
                            </span>
                          </td>
                          <td
                            style={{ padding: '8px 14px', textAlign: 'center', position: 'relative' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <button
                                type="button"
                                className="student-action-dots-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(prev => prev === item.id ? null : item.id);
                                }}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: activeActionMenuId === item.id ? '#F1F5F9' : '#FFFFFF',
                                  color: activeActionMenuId === item.id ? '#0F172A' : '#64748B',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: activeActionMenuId === item.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                  if (activeActionMenuId !== item.id) {
                                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                                    e.currentTarget.style.color = '#0F172A';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (activeActionMenuId !== item.id) {
                                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                                    e.currentTarget.style.color = '#64748B';
                                  }
                                }}
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {/* Three-dots Dropdown Menu */}
                              {activeActionMenuId === item.id && (
                                <div
                                  className="student-action-dropdown-menu"
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: (filteredStudents.indexOf(item) >= filteredStudents.length - 2 && filteredStudents.length > 3) ? 'auto' : 'calc(100% + 4px)',
                                    bottom: (filteredStudents.indexOf(item) >= filteredStudents.length - 2 && filteredStudents.length > 3) ? 'calc(100% + 4px)' : 'auto',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                                    zIndex: 100,
                                    minWidth: '155px',
                                    padding: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    textAlign: 'left'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* PDF Growth Chart */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenuId(null);
                                      handleOpenStudentGrowthReport(item);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: '#1E293B',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="View Student Health & Growth Report"
                                  >
                                    <FileText size={14} color="#2563EB" />
                                    <span>Growth Report</span>
                                  </button>

                                  {/* TC / Transfer */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenuId(null);
                                      setTransferModalStudent(item);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: '#1E293B',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="Issue TC or Transfer to another school"
                                  >
                                    <ArrowRightLeft size={14} color="#1D4ED8" />
                                    <span>TC / Transfer</span>
                                  </button>

                                  {/* Edit Student */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenuId(null);
                                      setEditModalStudent(item);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: '#1E293B',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="Edit Student Details"
                                  >
                                    <Edit2 size={14} color="#EA580C" />
                                    <span>Edit</span>
                                  </button>

                                  {/* View Profile */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenuId(null);
                                      setSelectedStudentId(item.id);
                                      setViewLevel('student_details');
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: '#1E293B',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title="View Student Full Profile"
                                  >
                                    <Eye size={14} color="#0F172A" />
                                    <span>View</span>
                                  </button>

                                  {/* Delete Student */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveActionMenuId(null);
                                      setStudentToDelete(item);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '9px',
                                      width: '100%',
                                      padding: '8px 10px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: 600,
                                      color: '#DC2626',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    title={`Delete Student ${item.name}`}
                                  >
                                    <Trash2 size={14} color="#DC2626" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="11" style={{ textAlign: 'center', padding: '44px 28px', color: '#64748B' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '32px' }}>🔍</span>
                            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0F172A' }}>
                              {statusFilter !== 'All Status' ? `No ${statusFilter} Students Found` : 'No students match the current filters'}
                            </div>
                            {statusFilter !== 'All Status' ? (
                              <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '460px', lineHeight: 1.5 }}>
                                There are no students in the <strong style={{ color: '#EA580C' }}>{statusFilter}</strong> category on the uploaded excel sheet or records for this school.
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '460px', lineHeight: 1.5 }}>
                                Try adjusting your search query or clear the active filters.
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleClearStudentFilters}
                              style={{
                                marginTop: '8px',
                                backgroundColor: '#FFF7ED',
                                color: '#EA580C',
                                border: '1px solid #FFEDD5',
                                borderRadius: '8px',
                                padding: '8px 18px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFEDD5';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFF7ED';
                              }}
                            >
                              Clear All Filters — Show All {studentsData.length} Students
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    </tbody>
                  </table>
                </div>


              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: STUDENT DETAILS & LATEST ASSESSMENT (IMAGE 4)                   */}
      {/* ========================================================================= */}
      {viewLevel === 'student_details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Top Profile Card — 2-Row Layout */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              overflow: 'hidden'
            }}
          >
            {/* Row 1: Avatar + Info (left) | Current Status (right) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <StudentAvatar size={64} />
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
                    {activeStudent.name}
                  </h1>
                  <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>
                    Student ID: {activeStudent.id || activeStudent.idCode || 'N/A'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569' }}>
                      <School size={14} color="#64748B" />
                      <span>{activeSchool.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569' }}>
                      <BookOpen size={14} color="#64748B" />
                      <span>Grade {activeStudent.classVal}{activeStudent.section}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#475569' }}>
                      <Network size={14} color="#64748B" />
                      <span>{activeCluster.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status Badge */}
              <div
                style={{
                  backgroundColor: getNutritionStatusBg(activeStudent.currentStatus) || '#F0FDF4',
                  border: `1px solid ${getNutritionStatusColor(activeStudent.currentStatus) || '#DCFCE7'}20`,
                  borderRadius: '12px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: getNutritionStatusBg(activeStudent.currentStatus),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getNutritionStatusColor(activeStudent.currentStatus)
                  }}
                >
                  <Activity size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Current Status</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: getNutritionStatusColor(activeStudent.currentStatus), lineHeight: 1.1 }}>
                    {activeStudent.currentStatus || 'Normal'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '1px' }}>
                    Based on latest assessment
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Action Buttons — full width */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '12px 24px',
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#FAFBFC'
              }}
            >
              <button
                type="button"
                onClick={() => setEditModalStudent(activeStudent)}
                style={{
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Edit Student Information and Metrics"
              >
                <Edit2 size={14} color="#EA580C" />
                <span>Edit Student</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferModalStudent(activeStudent)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                title="Issue Transfer Certificate or transfer student to another school"
              >
                <ArrowRightLeft size={14} />
                <span>TC / Transfer</span>
              </button>

              {(activeStudent.enrollmentStatus === 'TC Issued' || activeStudent.enrollmentStatus === 'Graduated') && (
                <button
                  type="button"
                  onClick={() => setTcCertModalStudent(activeStudent)}
                  style={{
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(217, 119, 6, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Print Official TC Health Summary Certificate"
                >
                  <Printer size={14} />
                  <span>TC Health Record</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setModalStudent(activeStudent);
                  setShowStudentGrowthModal(true);
                }}
                style={{
                  backgroundColor: '#EB5A1D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(235, 90, 29, 0.2)',
                  transition: 'all 0.15s ease'
                }}
                title="Download official WHO Growth Chart PDF"
              >
                <FileText size={14} />
                <span>Growth Chart (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentToDelete(activeStudent)}
                style={{
                  backgroundColor: '#FFF5F5',
                  color: '#DC2626',
                  border: '1px solid #FEE2E2',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`Delete Student ${activeStudent.name}`}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
              >
                <Trash2 size={14} color="#DC2626" />
                <span>Delete Student</span>
              </button>
            </div>
          </div>

          {/* Middle Row: Student Information (Left) + Health Snapshot (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.25fr)', gap: '16px' }}>
            {/* Student Information Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={18} color="#EA580C" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Student Information
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Name</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Date of Birth</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.dobFormatted || '15 May 2019'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Gender</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.gender}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Class</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.classVal}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Section</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.section}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>School</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeSchool.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Cluster</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeCluster.name}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Assessed By</span>
                  <span style={{ fontWeight: 600 }}>
                    {activeStudent.isExcelImport ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        border: '1px solid #CBD5E1'
                      }}>
                        <FileSpreadsheet size={13} color="#059669" />
                        <span>Excel Import (Baseline)</span>
                      </span>
                    ) : activeStudent.examinerName ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE'
                      }}>
                        <UserCheck size={13} color="#2563EB" />
                        <span>{activeStudent.examinerName}</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94A3B8' }}>—</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Snapshot Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BarChart2 size={18} color="#EA580C" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Health Snapshot
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Key health indicators from latest assessment
                  </p>
                </div>
              </div>

              {/* 4 Metric Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                {/* Height */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <Ruler size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Height</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>
                    {activeStudent.height ? `${activeStudent.height} cm` : '—'}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: activeStudent.heightZScore < -2 ? '#FEE2E2' : '#DCFCE7', color: activeStudent.heightZScore < -2 ? '#DC2626' : '#15803D', padding: '2px 8px', borderRadius: '10px' }}>
                    {activeStudent.height ? (activeStudent.heightZScore < -2 ? 'Stunted' : 'Normal') : 'Pending'}
                  </span>
                </div>

                {/* Weight */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <Scale size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Weight</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>
                    {activeStudent.weight ? `${activeStudent.weight} kg` : '—'}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: activeStudent.isWeightApplicable === false ? '#F1F5F9' : (activeStudent.weightZScore < -2 ? '#FFEDD5' : '#DCFCE7'), color: activeStudent.isWeightApplicable === false ? '#64748B' : (activeStudent.weightZScore < -2 ? '#EA580C' : '#15803D'), padding: '2px 8px', borderRadius: '10px' }}>
                    {activeStudent.isWeightApplicable === false ? 'N/A (>10y)' : (activeStudent.weight ? (activeStudent.weightZScore < -2 ? 'Underweight' : 'Normal') : 'Pending')}
                  </span>
                </div>

                {/* BMI */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <Gauge size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>BMI</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>
                    {activeStudent.bmi ? activeStudent.bmi : '—'}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: activeStudent.isSeverelyWasted ? '#FEE2E2' : activeStudent.isWasted ? '#FFEDD5' : '#DCFCE7',
                    color: activeStudent.isSeverelyWasted ? '#DC2626' : activeStudent.isWasted ? '#EA580C' : '#15803D',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {activeStudent.bmi ? (activeStudent.isSeverelyWasted ? 'Sev. Wasted' : activeStudent.isWasted ? 'Wasted' : 'Normal') : 'Pending'}
                  </span>
                </div>

                {/* Classification */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: getNutritionStatusBg(activeStudent.currentStatus), color: getNutritionStatusColor(activeStudent.currentStatus), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <ShieldCheck size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Classification</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: getNutritionStatusColor(activeStudent.currentStatus), margin: '2px 0 4px 0' }}>
                    {activeStudent.currentStatus || 'Pending'}
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: getNutritionStatusBg(activeStudent.currentStatus),
                    color: getNutritionStatusColor(activeStudent.currentStatus),
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {activeStudent.isCritical ? 'Follow-up Due' : activeStudent.currentStatus === 'Normal' ? 'Healthy Range' : 'Observation'}
                  </span>
                </div>
              </div>

              {/* 3 Z-score meters */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', paddingTop: '6px' }}>
                {/* BMI-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>BMI-for-Age Z</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: (typeof activeStudent.bmiZScore === 'number' && activeStudent.bmiZScore < -2) ? '#DC2626' : '#0F172A', margin: '2px 0 4px 0' }}>
                    {typeof activeStudent.bmiZScore === 'number' ? `${activeStudent.bmiZScore.toFixed(2)} SD` : '—'}
                  </div>
                  {/* Gauge bar */}
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    {typeof activeStudent.bmiZScore === 'number' && (
                      <div style={{ position: 'absolute', left: `${getZMeterPosition(activeStudent.bmiZScore)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>
                    {typeof activeStudent.bmiZScore === 'number' ? (activeStudent.bmiZScore < -3 ? 'Severe Deficit (<-3 SD)' : activeStudent.bmiZScore < -2 ? 'Deficit (<-2 SD)' : 'Normal range') : 'No assessment data'}
                  </div>
                </div>

                {/* Height-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Height-for-Age Z</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: (typeof activeStudent.heightZScore === 'number' && activeStudent.heightZScore < -2) ? '#DC2626' : '#0F172A', margin: '2px 0 4px 0' }}>
                    {typeof activeStudent.heightZScore === 'number' ? `${activeStudent.heightZScore.toFixed(2)} SD` : '—'}
                  </div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    {typeof activeStudent.heightZScore === 'number' && (
                      <div style={{ position: 'absolute', left: `${getZMeterPosition(activeStudent.heightZScore)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>
                    {typeof activeStudent.heightZScore === 'number' ? (activeStudent.heightZScore < -2 ? 'Stunted (<-2 SD)' : 'Normal range') : 'No assessment data'}
                  </div>
                </div>

                {/* Weight-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Weight-for-Age Z</div>
                  <div style={{ fontSize: activeStudent.isWeightApplicable === false ? '13px' : '16px', fontWeight: 800, color: activeStudent.isWeightApplicable === false ? '#64748B' : ((typeof activeStudent.weightZScore === 'number' && activeStudent.weightZScore < -2) ? '#DC2626' : '#0F172A'), margin: '2px 0 4px 0' }}>
                    {activeStudent.isWeightApplicable === false ? 'Not applicable' : (typeof activeStudent.weightZScore === 'number' ? `${activeStudent.weightZScore.toFixed(2)} SD` : '—')}
                  </div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    {typeof activeStudent.weightZScore === 'number' && (
                      <div style={{ position: 'absolute', left: `${getZMeterPosition(activeStudent.weightZScore)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>
                    {activeStudent.isWeightApplicable === false ? 'Not applicable (Age > 10 yrs)' : (typeof activeStudent.weightZScore === 'number' ? (activeStudent.weightZScore < -2 ? 'Underweight (<-2 SD)' : 'Normal range') : 'No assessment data')}
                  </div>
                </div>
              </div>

              {/* Student Progress Growth Alert Banner */}
              {activeStudent.progressStatus === 'weight_loss' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '18px' }}>🔻</div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#991B1B' }}>
                      Weight Loss Alert ({activeStudent.weightDelta} kg)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#B91C1C', marginTop: '2px' }}>
                      Child has experienced weight reduction compared to their previous assessment. Clinical dietary intervention is strongly advised.
                    </div>
                  </div>
                </div>
              )}
              {activeStudent.progressStatus === 'stagnant' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '18px' }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#92400E' }}>
                      No Improvement (Stagnant Weight: 0.0 kg gain)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#B45309', marginTop: '2px' }}>
                      Child shows zero weight increase over the follow-up period. Supplemental nutrition and counseling recommended.
                    </div>
                  </div>
                </div>
              )}
              {activeStudent.progressStatus === 'improving' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '18px' }}>🟢</div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#166534' }}>
                      Positive Growth Progress (+{activeStudent.weightDelta} kg gain)
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#15803D', marginTop: '2px' }}>
                      Child is making positive recovery progress toward healthy WHO growth percentiles.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Card: Latest Assessment */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={18} color="#EA580C" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Latest Assessment
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Details from the most recent health assessment
                  </p>
                </div>
              </div>

              {/* View Health History Button */}
              <button
                type="button"
                onClick={() => setViewLevel('health_history')}
                style={{
                  backgroundColor: '#EB5A1D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(235, 90, 29, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
              >
                <TrendingUp size={16} />
                <span>View Health History</span>
              </button>
            </div>

            {/* Assessment Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '10px 40px', border: '1px solid #F1F5F9', borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Assessment Date</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.latestAssessment || 'Pending'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI-for-Age Z</span>
                <span style={{ fontWeight: 600, color: (typeof activeStudent.bmiZScore === 'number' && activeStudent.bmiZScore < -2) ? '#DC2626' : '#0F172A' }}>
                  {typeof activeStudent.bmiZScore === 'number' ? `${activeStudent.bmiZScore.toFixed(2)} SD` : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Height</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.height ? `${activeStudent.height} cm` : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Height-for-Age Z</span>
                <span style={{ fontWeight: 600, color: (typeof activeStudent.heightZScore === 'number' && activeStudent.heightZScore < -2) ? '#DC2626' : '#0F172A' }}>
                  {typeof activeStudent.heightZScore === 'number' ? `${activeStudent.heightZScore.toFixed(2)} SD` : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Weight</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.weight ? `${activeStudent.weight} kg` : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Weight-for-Age Z</span>
                <span style={{ fontWeight: 600, color: (typeof activeStudent.weightZScore === 'number' && activeStudent.weightZScore < -2) ? '#DC2626' : '#0F172A' }}>
                  {activeStudent.isWeightApplicable === false ? (
                    <span style={{ color: '#94A3B8', fontStyle: 'italic', fontWeight: 500 }}>Not applicable</span>
                  ) : (typeof activeStudent.weightZScore === 'number' ? `${activeStudent.weightZScore.toFixed(2)} SD` : '—')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.bmi ? activeStudent.bmi : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI-for-Age (Thinness)</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: getNutritionStatusBg(activeStudent.bmiClassification || activeStudent.currentStatus),
                  color: getNutritionStatusColor(activeStudent.bmiClassification || activeStudent.currentStatus),
                  border: `1px solid ${getNutritionStatusBorder(activeStudent.bmiClassification || activeStudent.currentStatus)}`,
                  padding: '2px 10px',
                  borderRadius: '10px'
                }}>
                  {activeStudent.bmiClassification || 'Normal (BMI)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Height-for-Age (Stunting)</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: getNutritionStatusBg(activeStudent.heightClassification || (activeStudent.isStunted ? 'Stunting' : 'Normal')),
                  color: getNutritionStatusColor(activeStudent.heightClassification || (activeStudent.isStunted ? 'Stunting' : 'Normal')),
                  border: `1px solid ${getNutritionStatusBorder(activeStudent.heightClassification || (activeStudent.isStunted ? 'Stunting' : 'Normal'))}`,
                  padding: '2px 10px',
                  borderRadius: '10px'
                }}>
                  {activeStudent.heightClassification || (activeStudent.isStunted ? 'Stunting' : 'Normal (Height)')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Weight-for-Age (Underweight)</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: activeStudent.isWeightApplicable === false ? '#F1F5F9' : getNutritionStatusBg(activeStudent.weightClassification || 'Normal'),
                  color: activeStudent.isWeightApplicable === false ? '#64748B' : getNutritionStatusColor(activeStudent.weightClassification || 'Normal'),
                  border: `1px solid ${activeStudent.isWeightApplicable === false ? '#E2E8F0' : getNutritionStatusBorder(activeStudent.weightClassification || 'Normal')}`,
                  padding: '2px 10px',
                  borderRadius: '10px'
                }}>
                  {activeStudent.isWeightApplicable === false ? 'Not applicable' : (activeStudent.weightClassification || 'Normal (Weight)')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: HEALTH HISTORY VIEW (IMAGE 5)                                   */}
      {/* ========================================================================= */}
      {viewLevel === 'health_history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                Health History
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Track the student's health assessments over time
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalStudent(activeStudent);
                setShowStudentGrowthModal(true);
              }}
              style={{
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(235, 90, 29, 0.25)',
                transition: 'all 0.15s ease'
              }}
              title="Download official WHO Growth Chart PDF"
            >
              <FileText size={15} />
              <span>Download Growth Chart (PDF)</span>
            </button>
          </div>

          {/* Student Profile Summary Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '18px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              flexWrap: 'wrap'
            }}
          >
            <StudentAvatar size={64} />
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {activeStudent.name}
              </h2>
              <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                Student ID: {activeStudent.id || activeStudent.idCode || 'N/A'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <School size={14} color="#64748B" />
                  <span>{activeSchool.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <BookOpen size={14} color="#64748B" />
                  <span>Grade {activeStudent.classVal}{activeStudent.section}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                  <Network size={14} color="#64748B" />
                  <span>{activeCluster.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Row: Growth Trend Chart (Left) + Latest Assessment (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '16px' }}>
            {/* Growth Trend Chart Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: '#FFF7ED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <BarChart2 size={18} color="#EA580C" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Growth Trend
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Track height, weight and BMI over time
                    </p>
                  </div>
                </div>

                {/* Metric Selector Toggle Buttons */}
                <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                  {['Weight', 'Height', 'BMI'].map((metric) => (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => setTrendMetric(metric)}
                      style={{
                        backgroundColor: trendMetric === metric ? '#EB5A1D' : 'transparent',
                        color: trendMetric === metric ? '#FFFFFF' : '#475569',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '5px 12px',
                        fontSize: '11.5px',
                        fontWeight: trendMetric === metric ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Canvas / Container */}
              <div style={{ position: 'relative', height: '220px', width: '100%', paddingTop: '10px' }}>
                {/* Y-axis label */}
                <div style={{ position: 'absolute', left: 0, top: 0, fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                  {trendMetric === 'Weight' ? 'Weight (kg)' : trendMetric === 'Height' ? 'Height (cm)' : 'BMI'}
                </div>

                {/* Chart Grid Lines */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '170px', marginTop: '16px' }}>
                  {[30, 25, 20, 15, 10, 5, 0].map((val) => (
                    <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8', width: '20px', textAlign: 'right' }}>
                        {trendMetric === 'Height' ? val * 5 : val}
                      </span>
                      <div style={{ flex: 1, height: '1px', backgroundColor: '#F1F5F9' }} />
                    </div>
                  ))}
                </div>

                {/* Bars Container */}
                {assessmentHistory.length > 0 ? (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: '32px',
                        right: '10px',
                        bottom: '24px',
                        height: '160px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around'
                      }}
                    >
                      {assessmentHistory.slice().reverse().map((item) => {
                        const value = trendMetric === 'Weight' ? (item.weight || 0) : trendMetric === 'Height' ? (item.height || 0) : (item.bmi || 0);
                        const maxVal = trendMetric === 'Weight' ? 30 : trendMetric === 'Height' ? 150 : 25;
                        const barHeightPct = Math.min(100, Math.max(8, (value / maxVal) * 100));

                        return (
                          <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '42px' }}>
                            {/* Value on top of bar */}
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                              {value}
                            </span>
                            {/* Bar */}
                            <div
                              style={{
                                width: '28px',
                                height: `${barHeightPct}%`,
                                backgroundColor: '#3B82F6',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.4s ease'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis Month labels */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '32px',
                        right: '10px',
                        bottom: '2px',
                        display: 'flex',
                        justifyContent: 'space-around'
                      }}
                    >
                      {assessmentHistory.slice().reverse().map((item) => (
                        <span key={item.month} style={{ fontSize: '10.5px', color: '#64748B', width: '42px', textAlign: 'center' }}>
                          {String(item.month || '').replace(/\s*\d{4}/, '').slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: '32px',
                      right: '10px',
                      bottom: '40px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      fontSize: '12.5px',
                      fontWeight: 500
                    }}
                  >
                    No historical assessments recorded to plot trend.
                  </div>
                )}
              </div>
            </div>

            {/* Latest Assessment Card (Right) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #ECEEF2',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <FileText size={18} color="#EA580C" />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Latest Assessment
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Most recent health assessment details
                  </p>
                </div>
              </div>

              {/* Month Banner */}
              <div
                style={{
                  backgroundColor: '#FFF7ED',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#EA580C'
                }}
              >
                {assessmentHistory.length > 0 ? assessmentHistory[0].month : (activeStudent.latestAssessment !== 'Pending' ? activeStudent.latestAssessment : 'Latest Assessment')}
              </div>

              {/* Details Key Values */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {assessmentHistory.length > 0 && assessmentHistory[0].attendanceStatus === 'Absent' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                    <span style={{ color: '#D97706', fontWeight: 600 }}>Attendance</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      border: '1px solid #FCD34D',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      maxWidth: '200px',
                      textAlign: 'right'
                    }}>
                      Absent {assessmentHistory[0].absentReason ? `• ${assessmentHistory[0].absentReason}` : ''}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Height</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {assessmentHistory.length > 0 && assessmentHistory[0].height ? `${assessmentHistory[0].height} cm` : (activeStudent.height ? `${activeStudent.height} cm` : '—')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Weight</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {assessmentHistory.length > 0 && assessmentHistory[0].weight ? `${assessmentHistory[0].weight} kg` : (activeStudent.weight ? `${activeStudent.weight} kg` : '—')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>BMI</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {assessmentHistory.length > 0 && assessmentHistory[0].bmi ? assessmentHistory[0].bmi : (activeStudent.bmi || '—')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Classification</span>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundColor: getNutritionStatusBg(assessmentHistory.length > 0 && assessmentHistory[0].classification ? assessmentHistory[0].classification : activeStudent.currentStatus),
                    color: getNutritionStatusColor(assessmentHistory.length > 0 && assessmentHistory[0].classification ? assessmentHistory[0].classification : activeStudent.currentStatus),
                    border: `1px solid ${getNutritionStatusBorder(assessmentHistory.length > 0 && assessmentHistory[0].classification ? assessmentHistory[0].classification : activeStudent.currentStatus)}`,
                    padding: '3px 10px',
                    borderRadius: '10px'
                  }}>
                    {assessmentHistory.length > 0 && assessmentHistory[0].classification ? assessmentHistory[0].classification : (activeStudent.currentStatus || 'Pending')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card: Assessment History Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={18} color="#EA580C" />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Assessment History
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Monthly health assessment records
                </p>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Month</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessment Date</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Attendance</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Height (cm)</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Weight (kg)</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>BMI</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Classification</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessed By</th>
                  </tr>
                </thead>
                <tbody>
                  {assessmentHistory.length > 0 ? (
                    assessmentHistory.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '11px 14px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>{item.month}</td>
                        <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.date}</td>
                        <td style={{ padding: '11px 14px', fontSize: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: item.attendanceStatus === 'Absent' ? '#FEF3C7' : '#DCFCE7',
                            color: item.attendanceStatus === 'Absent' ? '#D97706' : '#15803D',
                            border: `1px solid ${item.attendanceStatus === 'Absent' ? '#FCD34D' : '#86EFAC'}`
                          }}>
                            {item.attendanceStatus}
                          </span>
                          {item.absentReason && (
                            <div style={{ fontSize: '10.5px', color: '#B45309', marginTop: '3px' }}>
                              {item.absentReason}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.height ? `${item.height} cm` : '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.weight ? `${item.weight} kg` : '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.bmi ? item.bmi : '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: '12px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: getNutritionStatusBg(item.classification),
                            color: getNutritionStatusColor(item.classification),
                            border: `1px solid ${getNutritionStatusBorder(item.classification)}`,
                            padding: '2px 10px',
                            borderRadius: '10px'
                          }}>
                            {item.classification}
                          </span>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: '12px' }}>
                          {item.isExcelImport ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '11px',
                                backgroundColor: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #CBD5E1',
                                whiteSpace: 'nowrap'
                              }}
                              title="Baseline data uploaded via Excel spreadsheet"
                            >
                              <FileSpreadsheet size={12} color="#059669" />
                              <span>Excel Import (Baseline)</span>
                            </span>
                          ) : item.examinerName ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '11px',
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8',
                                border: '1px solid #BFDBFE',
                                whiteSpace: 'nowrap'
                              }}
                              title={`Assessed by ${item.examinerName}`}
                            >
                              <UserCheck size={12} color="#2563EB" />
                              <span>{item.examinerName}</span>
                            </span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '11px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                        No historical health assessment records found for this student. Assessments conducted in the Mobile App will appear here in real-time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS FOR PDF GROWTH CHARTS ================= */}
      <SchoolGrowthChartModal
        isOpen={showSchoolGrowthModal}
        onClose={() => {
          setShowSchoolGrowthModal(false);
          setModalSchool(null);
        }}
        school={modalSchool || activeSchool}
        students={rawStudents}
        clusterName={activeCluster?.name}
      />

      <ClusterGrowthChartModal
        isOpen={showClusterGrowthModal}
        onClose={() => {
          setShowClusterGrowthModal(false);
          setModalCluster(null);
        }}
        cluster={modalCluster || activeCluster}
        schools={rawSchools}
        students={rawStudents}
        progressData={progressReportData}
        assessmentMonth={progressMonthFilter}
      />

      {/* ================= ACADEMIC PROMOTION MODAL ================= */}
      {showPromotionModal && activeSchool && (
        <AcademicPromotionModal
          isOpen={showPromotionModal}
          onClose={() => setShowPromotionModal(false)}
          school={activeSchool}
          allStudents={rawStudents}
          onSuccess={() => loadLiveStudentsData()}
        />
      )}

      {/* ================= TC STUDENT INTAKE MODAL ================= */}
      {showTcIntakeModal && activeSchool && (
        <TCStudentIntakeModal
          isOpen={showTcIntakeModal}
          onClose={() => setShowTcIntakeModal(false)}
          school={activeSchool}
          onSuccess={() => loadLiveStudentsData()}
        />
      )}

      {/* ================= STUDENT TRANSFER & TC MODAL ================= */}
      {Boolean(transferModalStudent) && (
        <StudentTransferModal
          isOpen={Boolean(transferModalStudent)}
          onClose={() => setTransferModalStudent(null)}
          student={transferModalStudent}
          schools={rawSchools}
          onSuccess={() => loadLiveStudentsData()}
          onOpenCertificate={(std) => {
            setTransferModalStudent(null);
            setTcCertModalStudent(std);
          }}
        />
      )}

      {/* ================= TC HEALTH SUMMARY CERTIFICATE MODAL ================= */}
      {Boolean(tcCertModalStudent) && (
        <StudentTcCertificateModal
          isOpen={Boolean(tcCertModalStudent)}
          onClose={() => setTcCertModalStudent(null)}
          student={tcCertModalStudent}
        />
      )}

      {/* ================= DELETE CLUSTER CONFIRMATION MODAL ================= */}
      {Boolean(clusterToDelete) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Delete Cluster</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Permanent removal from database & mobile app</p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{clusterToDelete.name}"</strong>?
            </p>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#EA580C" />
                <span>Associated Data Impact:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '4px', lineHeight: 1.4 }}>
                This will also delete <strong>{clusterToDelete.schoolsCount || 0} schools</strong> and <strong>{clusterToDelete.studentsCount || 0} students</strong> in this cluster. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setClusterToDelete(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteCluster}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Cluster'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE SCHOOL CONFIRMATION MODAL ================= */}
      {Boolean(schoolToDelete) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Delete School / Center</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Permanent removal from database & mobile app</p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{schoolToDelete.name}"</strong>?
            </p>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#EA580C" />
                <span>Associated Data Impact:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '4px', lineHeight: 1.4 }}>
                This will delete this school, all <strong>{schoolToDelete.students || 0} enrolled students</strong>, and their health records. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSchoolToDelete(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSchool}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete School'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE SINGLE STUDENT CONFIRMATION MODAL ================= */}
      {Boolean(studentToDelete) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Delete Student</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Permanent removal from database</p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete student <strong style={{ color: '#0F172A' }}>"{studentToDelete.name}"</strong> ({studentToDelete.id})?
            </p>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#EA580C" />
                <span>Associated Data Impact:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '4px', lineHeight: 1.4 }}>
                This will delete the student profile, growth metrics, and all health assessment records. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setStudentToDelete(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteStudent}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE ALL SCHOOL STUDENTS CONFIRMATION MODAL ================= */}
      {showDeleteAllSchoolStudentsModal && activeSchool && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Delete All Students in School</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Clear all uploaded student records for this school</p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#DC2626' }}>ALL {studentsData.length} students</strong> currently in <strong style={{ color: '#0F172A' }}>"{activeSchool.name}"</strong>?
            </p>

            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12.5px', color: '#B91C1C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} color="#DC2626" />
                <span>Wrong Excel Upload Recovery:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#991B1B', marginTop: '6px', lineHeight: 1.45 }}>
                Use this if an Excel sheet was wrongly uploaded for this school. All student profiles, measurements, and health assessments for this school will be permanently wiped from the database so you can re-upload fresh data.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteAllSchoolStudentsModal(false)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAllSchoolStudents}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting All Students...' : 'Yes, Delete All Students'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {Boolean(toastMessage) && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '4px solid #10B981'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Cluster Modal */}
      <EditClusterModal
        isOpen={Boolean(clusterToEdit)}
        onClose={() => setClusterToEdit(null)}
        cluster={clusterToEdit}
        onSuccess={async (updatedCluster) => {
          showToast(`Cluster "${updatedCluster.name}" updated successfully!`);
          setClusterToEdit(null);
          await loadLiveStudentsData();
        }}
      />

      {/* Edit School Modal */}
      <EditSchoolModal
        isOpen={Boolean(schoolToEdit)}
        onClose={() => setSchoolToEdit(null)}
        school={schoolToEdit}
        onSuccess={async (updatedSchool) => {
          showToast(`School "${updatedSchool.name}" updated successfully!`);
          setSchoolToEdit(null);
          await loadLiveStudentsData();
        }}
      />

      {/* Edit Student Modal */}
      {Boolean(editModalStudent) && (
        <EditStudentModal
          isOpen={Boolean(editModalStudent)}
          onClose={() => setEditModalStudent(null)}
          student={editModalStudent}
          schools={schoolsList}
          onSuccess={async (updatedStudent) => {
            showToast(`Student "${updatedStudent.name}" details updated successfully!`);
            setEditModalStudent(null);
            await loadLiveStudentsData();
          }}
        />
      )}

      {/* ================= MONTHLY PROGRESS REPORT: STUDENTS DRILLDOWN MODAL ================= */}
      {progressModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => {
            setProgressModal(prev => ({ ...prev, isOpen: false }));
            setProgressModalSearch('');
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: 'min(1180px, 94vw)',
              height: 'min(700px, 88vh)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#F8FAFC',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#FFEDD5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Activity size={20} color="#EA580C" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {progressModal.title || 'Assessed Students Progress Trajectory'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
                      <span>Assessment Period: <strong>{progressMonthFilter}</strong></span>
                      {progressModal.clusterName && <span>• Cluster: <strong>{progressModal.clusterName}</strong></span>}
                      {progressModal.schoolName && <span>• School: <strong>{progressModal.schoolName}</strong></span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProgressModal(prev => ({ ...prev, isOpen: false }));
                    setProgressModalSearch('');
                  }}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                    flexShrink: 0,
                    transition: 'all 0.15s ease'
                  }}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sub-Filters: Category Pills and Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setProgressModalCategoryFilter('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: progressModalCategoryFilter === 'all' ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                      backgroundColor: progressModalCategoryFilter === 'all' ? '#EFF6FF' : '#FFFFFF',
                      color: progressModalCategoryFilter === 'all' ? '#1D4ED8' : '#475569',
                      fontSize: '12px',
                      fontWeight: progressModalCategoryFilter === 'all' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>All Monitored</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#DBEAFE', color: '#1E40AF', fontWeight: 800 }}>
                      {modalScopeStudents.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgressModalCategoryFilter('severely_wasted')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: progressModalCategoryFilter === 'severely_wasted' ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                      backgroundColor: progressModalCategoryFilter === 'severely_wasted' ? '#FEF2F2' : '#FFFFFF',
                      color: progressModalCategoryFilter === 'severely_wasted' ? '#B91C1C' : '#475569',
                      fontSize: '12px',
                      fontWeight: progressModalCategoryFilter === 'severely_wasted' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔴 Severely Wasted</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 800 }}>
                      {modalScopeStudents.filter(s => s.is_severely_wasted || s.nutrition_status === 'Severely Wasted').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgressModalCategoryFilter('wasted')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: progressModalCategoryFilter === 'wasted' ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
                      backgroundColor: progressModalCategoryFilter === 'wasted' ? '#FFF7ED' : '#FFFFFF',
                      color: progressModalCategoryFilter === 'wasted' ? '#C2410C' : '#475569',
                      fontSize: '12px',
                      fontWeight: progressModalCategoryFilter === 'wasted' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🟠 Wasted</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#FFEDD5', color: '#9A3412', fontWeight: 800 }}>
                      {modalScopeStudents.filter(s => s.is_wasted || s.nutrition_status === 'Wasted').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgressModalCategoryFilter('deteriorated')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: progressModalCategoryFilter === 'deteriorated' ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                      backgroundColor: progressModalCategoryFilter === 'deteriorated' ? '#FEF2F2' : '#FFFFFF',
                      color: progressModalCategoryFilter === 'deteriorated' ? '#B91C1C' : '#475569',
                      fontSize: '12px',
                      fontWeight: progressModalCategoryFilter === 'deteriorated' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔻 No Improvement / Dropped</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: 800 }}>
                      {modalScopeStudents.filter(s => s.is_deteriorated || s.progress_status === 'deteriorated').length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProgressModalCategoryFilter('improved')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      border: progressModalCategoryFilter === 'improved' ? '1.5px solid #16A34A' : '1px solid #CBD5E1',
                      backgroundColor: progressModalCategoryFilter === 'improved' ? '#F0FDF4' : '#FFFFFF',
                      color: progressModalCategoryFilter === 'improved' ? '#15803D' : '#475569',
                      fontSize: '12px',
                      fontWeight: progressModalCategoryFilter === 'improved' ? 700 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔺 Improving</span>
                    <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 800 }}>
                      {modalScopeStudents.filter(s => s.progress_status === 'improved').length}
                    </span>
                  </button>
                </div>

                {/* Real-time search in modal */}
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={progressModalSearch}
                    onChange={e => setProgressModalSearch(e.target.value)}
                    placeholder="Search name, ID, class..."
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 32px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {progressModalSearch && (
                    <button
                      type="button"
                      onClick={() => setProgressModalSearch('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                        padding: '2px'
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Table Body (zero pixel overflow) */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch', minHeight: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2, backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                  <tr>
                    <th style={{ padding: '12px 18px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Student</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Class & Section</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>School / Cluster</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Previous Assessment</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>Current Assessment</th>
                    <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>BMI Trajectory</th>
                    <th style={{ padding: '12px 18px', fontSize: '11.5px', fontWeight: 700, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modalStudents.length > 0 ? (
                    modalStudents.map(st => {
                      const isDeteriorated = st.is_deteriorated;
                      const isImproved = st.progress_status === 'improved';
                      const isStagnant = st.progress_status === 'stagnant';
                      return (
                        <tr
                          key={st.student_id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isDeteriorated ? '#FFFBFB' : 'transparent',
                            transition: 'background 0.1s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = isDeteriorated ? '#FFF5F5' : '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = isDeteriorated ? '#FFFBFB' : 'transparent'}
                        >
                          <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: st.gender === 'Female' ? '#FCE7F3' : '#E0F2FE',
                                  color: st.gender === 'Female' ? '#BE185D' : '#0369A1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11.5px',
                                  fontWeight: 700
                                }}
                              >
                                {st.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>ID: {st.student_id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 14px', fontSize: '12.5px', color: '#334155', whiteSpace: 'nowrap' }}>
                            {st.class_name} • {st.section}
                          </td>
                          <td style={{ padding: '13px 14px', fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600 }}>{st.school_name}</div>
                            <div style={{ fontSize: '10.5px', color: '#64748B' }}>{st.cluster_name}</div>
                          </td>
                          <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                            {st.prev_date ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                                  {st.prev_bmi ? `${st.prev_bmi} kg/m²` : '—'} ({st.prev_weight_kg ? `${st.prev_weight_kg}kg` : '—'})
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: getNutritionStatusBg(st.prev_status), color: getNutritionStatusColor(st.prev_status), fontWeight: 700 }}>
                                    {st.prev_status}
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{st.prev_date}</span>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                                Initial Screening (Baseline)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                {st.bmi ? `${st.bmi} kg/m²` : '—'} ({st.weight_kg ? `${st.weight_kg}kg` : '—'})
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '4px', backgroundColor: getNutritionStatusBg(st.nutrition_status), color: getNutritionStatusColor(st.nutrition_status), fontWeight: 700 }}>
                                  {st.nutrition_status}
                                </span>
                                <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{st.assessment_date}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                            {st.bmi_delta !== null ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: '10px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  backgroundColor: isDeteriorated ? '#FEE2E2' : isImproved ? '#D1FAE5' : '#F1F5F9',
                                  color: isDeteriorated ? '#DC2626' : isImproved ? '#065F46' : '#64748B'
                                }}
                              >
                                {isDeteriorated && '🔻'}
                                {isImproved && '🔺'}
                                {isStagnant && '➖'}
                                <span>
                                  {st.bmi_delta > 0 ? `+${st.bmi_delta}` : st.bmi_delta} kg/m²
                                </span>
                                <span style={{ fontSize: '10px', opacity: 0.85 }}>
                                  ({isDeteriorated ? 'Deteriorated' : isImproved ? 'Recovering' : 'No Change'})
                                </span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}>
                                Baseline screening
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '13px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudentGrowthReport(st);
                              }}
                              style={{
                                backgroundColor: '#EB5A1D',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 3px rgba(235, 90, 29, 0.2)',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D9480F'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
                              title="View Student Health & Growth Report"
                            >
                              <FileText size={12} />
                              <span>Growth Report</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', height: '280px', color: '#64748B', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', height: '100%' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                            <Users size={20} />
                          </div>
                          <span style={{ fontWeight: 600, color: '#475569', fontSize: '13.5px' }}>No students in this category</span>
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>No monitored students match the selected category or search filter.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
                flexShrink: 0
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                Showing {modalStudents.length} of {modalScopeStudents.length} students
              </div>
              <button
                type="button"
                onClick={() => {
                  setProgressModal(prev => ({ ...prev, isOpen: false }));
                  setProgressModalSearch('');
                }}
                style={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 16px',
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
      {/* ================= MODAL FOR STUDENT HEALTH & GROWTH REPORT ================= */}
      <StudentGrowthChartModal
        isOpen={showStudentGrowthModal}
        onClose={() => {
          setShowStudentGrowthModal(false);
          setModalStudent(null);
        }}
        student={modalStudent}
        schoolName={modalStudent?.schoolName || modalStudent?.school_name || activeSchool?.name}
        clusterName={modalStudent?.clusterName || modalStudent?.cluster_name || activeCluster?.name}
      />
    </div>
  );
}

