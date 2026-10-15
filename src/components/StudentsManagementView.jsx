import React, { useState, useEffect, useMemo } from 'react';
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
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import SearchableDropdown from './SearchableDropdown';
import StudentGrowthChartModal from './StudentGrowthChartModal';
import SchoolGrowthChartModal from './SchoolGrowthChartModal';
import AcademicPromotionModal from './AcademicPromotionModal';
import StudentTransferModal from './StudentTransferModal';
import StudentTcCertificateModal from './StudentTcCertificateModal';
import EditClusterModal from './EditClusterModal';
import EditSchoolModal from './EditSchoolModal';

// Authoritative WHO Nutrition Status Styling Helpers
export const getNutritionStatusColor = (status) => {
  switch (status) {
    case 'Severely Wasted': return '#DC2626';
    case 'Wasted': return '#EA580C';
    case 'Overweight': return '#D97706';
    case 'Obesity': return '#9333EA';
    case 'Normal': return '#16A34A';
    default: return '#64748B';
  }
};

export const getNutritionStatusBg = (status) => {
  switch (status) {
    case 'Severely Wasted': return '#FEE2E2';
    case 'Wasted': return '#FFEDD5';
    case 'Overweight': return '#FEF3C7';
    case 'Obesity': return '#F3E8FF';
    case 'Normal': return '#DCFCE7';
    default: return '#F1F5F9';
  }
};

export const getNutritionStatusBorder = (status) => {
  switch (status) {
    case 'Severely Wasted': return '#FCA5A5';
    case 'Wasted': return '#FDBA74';
    case 'Overweight': return '#FCD34D';
    case 'Obesity': return '#D8B4FE';
    case 'Normal': return '#86EFAC';
    default: return '#CBD5E1';
  }
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

export default function StudentsManagementView() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // Navigation Level: 'clusters' | 'schools' | 'students' | 'student_details' | 'health_history'
  const [viewLevel, setViewLevel] = useState('clusters');

  // Raw live data from backend
  const [rawClusters, setRawClusters] = useState([]);
  const [rawSchools, setRawSchools] = useState([]);
  const [rawStudents, setRawStudents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Active selections
  const [selectedClusterId, setSelectedClusterId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Search & Filter States
  const [clusterSearch, setClusterSearch] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [studentPage, setStudentPage] = useState(1);

  // Sub-tab for School Students View: 'all' | 'priority'
  const [studentViewTab, setStudentViewTab] = useState('all');
  // Priority Follow-Up Filters
  const [priorityCategoryFilter, setPriorityCategoryFilter] = useState('ALL'); // 'ALL' | 'SEVERELY_WASTED' | 'WASTED'
  const [upcomingMonthFilter, setUpcomingMonthFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'NEXT_MONTH' | 'OVERDUE'

  // Modals for PDF Growth Chart
  const [showStudentGrowthModal, setShowStudentGrowthModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [showSchoolGrowthModal, setShowSchoolGrowthModal] = useState(false);
  const [modalSchool, setModalSchool] = useState(null);

  // Promotion, TC and Transfer States
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('Active'); // 'Active' | 'TC Issued' | 'Graduated' | 'All'
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [transferModalStudent, setTransferModalStudent] = useState(null);
  const [tcCertModalStudent, setTcCertModalStudent] = useState(null);

  // Growth Trend Chart metric toggle: 'Weight' | 'Height' | 'BMI'
  const [trendMetric, setTrendMetric] = useState('Weight');

  // Deletion & Editing Modals State
  const [clusterToDelete, setClusterToDelete] = useState(null);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [clusterToEdit, setClusterToEdit] = useState(null);
  const [schoolToEdit, setSchoolToEdit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
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

  const THEME_PALETTES = [
    { themeColor: '#EA580C', bgColor: '#FFF7ED', accentColor: '#FFEDD5', waveColor: 'rgba(234, 88, 12, 0.08)' },
    { themeColor: '#059669', bgColor: '#ECFDF5', accentColor: '#D1FAE5', waveColor: 'rgba(5, 150, 105, 0.08)' },
    { themeColor: '#2563EB', bgColor: '#EFF6FF', accentColor: '#DBEAFE', waveColor: 'rgba(37, 99, 235, 0.08)' },
    { themeColor: '#8B5CF6', bgColor: '#F5F3FF', accentColor: '#EDE9FE', waveColor: 'rgba(139, 92, 246, 0.08)' },
    { themeColor: '#E11D48', bgColor: '#FFF1F2', accentColor: '#FFE4E6', waveColor: 'rgba(225, 29, 72, 0.08)' },
    { themeColor: '#D97706', bgColor: '#FFFBEB', accentColor: '#FEF3C7', waveColor: 'rgba(217, 119, 6, 0.08)' },
  ];

  // Fetch all backend data and poll every 5s for real-time sync with mobile app
  const loadLiveStudentsData = async (silent = false) => {
    try {
      if (!silent) setLoadingData(true);
      const [clustersRes, schoolsRes, studentsRes] = await Promise.all([
        api.getClusters(),
        api.getSchools(),
        api.getStudents(),
      ]);

      if (Array.isArray(clustersRes)) {
        setRawClusters(clustersRes);
        setSelectedClusterId(prev => prev || (clustersRes.length > 0 ? clustersRes[0].id : ''));
      }
      if (Array.isArray(schoolsRes)) {
        setRawSchools(schoolsRes);
        setSelectedSchoolId(prev => prev || (schoolsRes.length > 0 ? schoolsRes[0].id : ''));
      }
      if (Array.isArray(studentsRes)) {
        setRawStudents(studentsRes);
        setSelectedStudentId(prev => prev || (studentsRes.length > 0 ? studentsRes[0].id : ''));
      }
    } catch (err) {
      console.warn('Real-time Students Sync notice:', err);
    } finally {
      if (!silent) setLoadingData(false);
    }
  };

  useEffect(() => {
    loadLiveStudentsData();
    const timer = setInterval(() => {
      loadLiveStudentsData(true);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Formatted Clusters
  const clustersData = useMemo(() => {
    if (rawClusters.length === 0) return [];
    return rawClusters.map((c, i) => {
      const palette = THEME_PALETTES[i % THEME_PALETTES.length];
      const clusterSchools = rawSchools.filter(s => s.cluster_id === c.id || s.cluster_name?.toLowerCase() === c.name?.toLowerCase());
      const clusterStudents = rawStudents.filter(st => st.cluster_name?.toLowerCase() === c.name?.toLowerCase() || clusterSchools.some(sc => sc.id === st.school_id));
      return {
        id: c.id,
        name: c.name,
        schoolsCount: clusterSchools.length || c.schools_count || 0,
        studentsCount: clusterStudents.length || c.students_count || 0,
        coverage: c.coverage_percentage || 0,
        ...palette
      };
    });
  }, [rawClusters, rawSchools, rawStudents]);

  // Selected Entities
  const activeCluster = clustersData.find(c => c.id === selectedClusterId) || clustersData[0] || { name: 'Cluster', id: '' };

  // Schools mapping by cluster
  const schoolsList = useMemo(() => {
    const clusterSchools = rawSchools.filter(s => 
      selectedClusterId ? (s.cluster_id === selectedClusterId || s.cluster_name?.toLowerCase() === activeCluster?.name?.toLowerCase()) : true
    );
    return clusterSchools.map((s, idx) => {
      const studentsInSchool = rawStudents.filter(st => st.school_id === s.id || st.school_name === s.name);
      const studentCount = studentsInSchool.length || s.students_count || 0;
      const assessedCount = studentsInSchool.filter(st => (st.assessments && st.assessments.length > 0) || st.latest_assessment_date).length;
      const pct = studentCount > 0 ? Math.round((assessedCount / studentCount) * 100) : (s.coverage_percentage || 0);
      return {
        id: s.id,
        name: s.name,
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

  const activeSchool = schoolsList.find(s => s.id === selectedSchoolId) || schoolsList[0] || { name: 'School', id: '' };

  // Students Data for selected school
  const studentsData = useMemo(() => {
    const filtered = rawStudents.filter(s => 
      selectedSchoolId ? (s.school_id === selectedSchoolId || s.school_name === activeSchool?.name) : true
    );
    return filtered.map((s, idx) => {
      const hasAssessments = Array.isArray(s.assessments) && s.assessments.length > 0;
      const latestA = hasAssessments ? s.assessments[0] : null;
      const assessDate = s.latest_assessment_date || latestA?.assessment_date || 'Pending';
      // Authoritative WHO classification strictly from assessment data and database
      const rawStatus = s.nutrition_status || latestA?.nutrition_status || null;
      const rawClassification = s.latest_bmi_for_age_classification || latestA?.bmi_for_age_classification || null;
      const rawZ = typeof s.latest_bmi_for_age_zscore === 'number' 
        ? s.latest_bmi_for_age_zscore 
        : (typeof latestA?.bmi_for_age_zscore === 'number' ? latestA.bmi_for_age_zscore : null);

      let authoritativeStatus = 'Pending Assessment';
      const statusCandidate = rawClassification || rawStatus;
      
      if (statusCandidate && statusCandidate !== 'Pending Calculation' && statusCandidate !== 'Pending Assessment') {
        const scLower = statusCandidate.toLowerCase().trim();
        if (scLower.includes('severely wasted') || scLower.includes('severe thinness')) {
          authoritativeStatus = 'Severely Wasted';
        } else if (scLower.includes('wasted') || scLower.includes('thinness')) {
          authoritativeStatus = 'Wasted';
        } else if (scLower.includes('obesity') || scLower.includes('obese')) {
          authoritativeStatus = 'Obesity';
        } else if (scLower.includes('overweight')) {
          authoritativeStatus = 'Overweight';
        } else if (scLower.includes('normal') || scLower.includes('healthy')) {
          authoritativeStatus = 'Normal';
        }
      }

      // If status candidate didn't resolve to a standard category or we have a z-score
      if (typeof rawZ === 'number' && !isNaN(rawZ)) {
        if (rawZ < -3.0) authoritativeStatus = 'Severely Wasted';
        else if (rawZ < -2.0) authoritativeStatus = 'Wasted';
        else if (rawZ <= 1.0) authoritativeStatus = 'Normal';
        else if (rawZ <= 2.0) authoritativeStatus = 'Overweight';
        else authoritativeStatus = 'Obesity';
      } else if (authoritativeStatus === 'Pending Assessment' && (hasAssessments || (assessDate && assessDate !== 'Pending' && assessDate !== 'None'))) {
        authoritativeStatus = 'Normal';
      }

      const currentStatus = authoritativeStatus;
      const healthStatus = authoritativeStatus;
      const bmiZ = typeof rawZ === 'number' ? rawZ : null;
      const heightZ = typeof s.latest_height_for_age_zscore === 'number' ? s.latest_height_for_age_zscore : (typeof latestA?.height_for_age_zscore === 'number' ? latestA.height_for_age_zscore : null);
      const weightZ = typeof s.latest_weight_for_age_zscore === 'number' ? s.latest_weight_for_age_zscore : (typeof latestA?.weight_for_age_zscore === 'number' ? latestA.weight_for_age_zscore : null);

      const isSeverelyWasted = authoritativeStatus === 'Severely Wasted';
      const isWasted = authoritativeStatus === 'Wasted';
      const isOverweight = authoritativeStatus === 'Overweight';
      const isObesity = authoritativeStatus === 'Obesity';
      const isNormal = authoritativeStatus === 'Normal';
      const isCritical = isSeverelyWasted || isWasted;

      // Real-time Upcoming Monthly Assessment Schedule (based strictly on real last assessment date)
      let nextDueFormatted = 'Pending Assessment';
      let dueStatus = 'Pending Screening';
      let dueBadgeColor = '#64748B';
      let dueBadgeBg = '#F1F5F9';

      const validLastDate = assessDate && assessDate !== 'Pending' && assessDate !== 'None' ? new Date(assessDate) : null;
      if (validLastDate && !isNaN(validLastDate.getTime())) {
        const nextDueDate = new Date(validLastDate);
        nextDueDate.setDate(nextDueDate.getDate() + 30); // Monthly follow-up 30 days after last screening
        nextDueFormatted = nextDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
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
        healthStatus: healthStatus,
        currentStatus: currentStatus,
        isSeverelyWasted: isSeverelyWasted,
        isWasted: isWasted,
        isCritical: isCritical,
        nextDueDateFormatted: nextDueFormatted,
        dueStatus: dueStatus,
        dueBadgeColor: dueBadgeColor,
        dueBadgeBg: dueBadgeBg,
        height: s.height_cm || latestA?.height_cm || 0,
        weight: s.weight_kg || latestA?.weight_kg || 0,
        bmi: s.bmi || latestA?.bmi || 0,
        bmiZScore: bmiZ,
        heightZScore: heightZ,
        weightZScore: weightZ,
        ageDisplay: s.age_string || s.latest_age_display || '',
        enrollmentStatus: s.enrollment_status || 'Active',
        academicYear: s.academic_year || '2026-2027',
        tcDate: s.tc_date || null,
        tcReason: s.tc_reason || null,
        previousSchoolName: s.previous_school_name || null,
        previousStudentId: s.previous_student_id || null,
        raw: s
      };
    });
  }, [rawStudents, selectedSchoolId, activeSchool]);

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

  // Critical follow-up students (Severely Wasted & Wasted)
  const criticalStudents = useMemo(() => {
    return studentsData.filter(s => s.isCritical);
  }, [studentsData]);

  // Filtered Critical Students for Priority Tracking Tab
  const filteredCriticalStudents = useMemo(() => {
    return criticalStudents.filter(s => {
      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        const match = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
        if (!match) return false;
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

      if (upcomingMonthFilter === 'THIS_MONTH' && !s.dueStatus?.toLowerCase().includes('this month') && !s.dueStatus?.toLowerCase().includes('days')) return false;
      if (upcomingMonthFilter === 'NEXT_MONTH' && !s.dueStatus?.toLowerCase().includes('next month')) return false;
      if (upcomingMonthFilter === 'OVERDUE' && !s.dueStatus?.toLowerCase().includes('overdue')) return false;

      return true;
    });
  }, [criticalStudents, studentSearch, classFilter, sectionFilter, genderFilter, priorityCategoryFilter, upcomingMonthFilter]);

  const activeStudent = studentsData.find(s => s.id === selectedStudentId) || studentsData[0] || {
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
      return {
        month: dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        date: dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        height: a.height_cm,
        weight: a.weight_kg,
        bmi: a.bmi,
        classification: a.nutrition_status || a.bmi_for_age_classification || 'Normal'
      };
    });
  }, [activeStudent]);

  // Dynamic Filtering for Clusters
  const filteredClusters = clustersData.filter(c =>
    c.name.toLowerCase().includes(clusterSearch.toLowerCase())
  );

  // Dynamic Filtering for Schools
  const filteredSchools = schoolsList.filter(s =>
    s.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  // Dynamic Filtering for Students
  const filteredStudents = studentsData.filter(s => {
    if (enrollmentStatusFilter !== 'All' && (s.enrollmentStatus || 'Active') !== enrollmentStatusFilter) return false;
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      const match = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      if (!match) return false;
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
    if (statusFilter !== 'All Status' && s.healthStatus !== statusFilter) return false;
    return true;
  });

  const handleClearStudentFilters = () => {
    setStudentSearch('');
    setClassFilter('All Classes');
    setSectionFilter('All Sections');
    setGenderFilter('All Genders');
    setStatusFilter('All Status');
    setEnrollmentStatusFilter('Active');
  };

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
        boxSizing: 'border-box',
        overflowX: 'hidden'
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
              {filteredClusters.map((cluster) => (
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
              ))}
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

          {/* Section: Schools Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Schools in {activeCluster.name}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  List of schools and their student distribution.
                </p>
              </div>

              {/* Search box */}
              <div style={{ position: 'relative', width: isMobile ? '100%' : '260px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={schoolSearch}
                  onChange={(e) => setSchoolSearch(e.target.value)}
                  placeholder="Search schools..."
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

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>School Name ↕</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Students ↕</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessed ↕</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Pending ↕</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Current Status ↕</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((item) => (
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
                          <span>{item.name}</span>
                        </div>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                {activeSchool.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                {activeSchool.students} Enrolled Students • Health & Growth Surveillance
              </p>
            </div>

            {/* Actions & Summary on Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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

              {/* Total Students Card on Right */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #ECEEF2',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Users size={20} color="#EA580C" />
                </div>
                <div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Total Students</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    {activeSchool.students}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B' }}>In this school</div>
                </div>
              </div>
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
                color: studentViewTab === 'priority' ? '#DC2626' : '#64748B',
                borderBottom: studentViewTab === 'priority' ? '2.5px solid #DC2626' : '2.5px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <AlertTriangle size={16} color="#DC2626" />
              <span>Priority Tracking: Wasted & Severely Wasted</span>
              <span
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
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

          {/* ================= VIEW TAB 1: PRIORITY TRACKING ================= */}
          {studentViewTab === 'priority' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {/* KPI Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '12px' }}>
                {/* Total Priority */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Priority Cases</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{criticalStudents.length}</div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>Requiring follow-up</div>
                  </div>
                </div>

                {/* Severely Wasted */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #FECACA', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 700 }}>Severely Wasted</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                      {criticalStudents.filter(s => s.isSeverelyWasted).length}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#991B1B' }}>Z-Score &lt; -3.0 SD (Critical)</div>
                  </div>
                </div>

                {/* Wasted */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1.5px solid #FED7AA', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C', flexShrink: 0 }}>
                    <Scale size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#C2410C', fontWeight: 700 }}>Wasted (Moderate)</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', lineHeight: 1.1 }}>
                      {criticalStudents.filter(s => s.isWasted).length}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#9A3412' }}>Z-Score &lt; -2.0 SD (Moderate)</div>
                  </div>
                </div>

                {/* Upcoming This Month */}
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', flexShrink: 0 }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>Due This Month</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E40AF', lineHeight: 1.1 }}>
                      {criticalStudents.filter(s => s.dueStatus?.includes('Due in') || s.dueStatus?.includes('This Month')).length}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>October 2026 Assessment</div>
                  </div>
                </div>
              </div>

              {/* Filter Bar for Priority Students */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                  <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by student name or ID..."
                    style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={priorityCategoryFilter}
                  onChange={(e) => setPriorityCategoryFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#0F172A', backgroundColor: '#FFFFFF', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Priority Categories</option>
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

                {/* Upcoming Month Filter */}
                <select
                  value={upcomingMonthFilter}
                  onChange={(e) => setUpcomingMonthFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#0F172A', backgroundColor: '#FFFFFF', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="ALL">All Upcoming Assessments</option>
                  <option value="THIS_MONTH">Due This Month (October 2026)</option>
                  <option value="NEXT_MONTH">Due Next Month (November 2026)</option>
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
                      Critical Nutrition Surveillance Roster
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Showing {filteredCriticalStudents.length} students requiring upcoming monthly assessment
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', width: '45px' }}>#</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Student ID</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Student Name</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Grade-Sec</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Gender</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Status</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>BMI (kg/m²)</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Z-Score</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Last Assessed</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B' }}>Next Assessment Due</th>
                        <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 700, color: '#991B1B', textAlign: 'center' }}>Actions</th>
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
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B' }}>{idx + 1}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>{item.id}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{item.name}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#475569' }}>Class {item.classVal}-{item.section}</td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#475569' }}>{item.gender}</td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                backgroundColor: item.isSeverelyWasted ? '#FEE2E2' : '#FFEDD5',
                                color: item.isSeverelyWasted ? '#DC2626' : '#EA580C',
                                border: `1px solid ${item.isSeverelyWasted ? '#FECACA' : '#FED7AA'}`
                              }}>
                                {item.isSeverelyWasted ? '🔴 Severely Wasted' : '🟠 Wasted'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{item.bmi ? item.bmi : '—'}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', fontWeight: 700, color: item.isSeverelyWasted ? '#DC2626' : '#EA580C' }}>
                              {typeof item.bmiZScore === 'number' ? `${item.bmiZScore.toFixed(2)} SD` : '—'}
                            </td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px', color: '#64748B' }}>{item.latestAssessment}</td>
                            <td style={{ padding: '10px 12px', fontSize: '11.5px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 600,
                                  fontSize: '11px',
                                  backgroundColor: item.dueBadgeBg,
                                  color: item.dueBadgeColor
                                }}>
                                  {item.dueStatus}
                                </span>
                                <span style={{ color: '#64748B', fontSize: '10.5px' }}>({item.nextDueDateFormatted})</span>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setModalStudent(item);
                                    setShowStudentGrowthModal(true);
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
                                    boxShadow: '0 1px 3px rgba(235, 90, 29, 0.2)'
                                  }}
                                  title="Download WHO Growth Chart (PDF)"
                                >
                                  <FileText size={12} />
                                  <span>Growth Chart PDF</span>
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
                                    cursor: 'pointer'
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
                          <td colSpan="11" style={{ textAlign: 'center', padding: '28px', color: '#64748B' }}>
                            No students matching the selected priority filter criteria.
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
                      { id: 'Active', label: 'Active Enrolled', count: studentsData.filter(s => (s.enrollmentStatus || 'Active') === 'Active').length },
                      { id: 'TC Issued', label: 'TC Issued', count: studentsData.filter(s => s.enrollmentStatus === 'TC Issued').length },
                      { id: 'Graduated', label: 'Graduated', count: studentsData.filter(s => s.enrollmentStatus === 'Graduated').length },
                      { id: 'All', label: 'All Records', count: studentsData.length }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setEnrollmentStatusFilter(tab.id)}
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

                {/* Filter Controls Row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '200px' }}>
                    <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Student name / ID"
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

                  {/* Health Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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
                    <option value="Overweight">Overweight</option>
                    <option value="Obesity">Obesity</option>
                    <option value="Pending Assessment">Pending Assessment</option>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px', gap: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Showing 1–{filteredStudents.length} of {studentsData.length} students
                  </div>
                  <select
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option>10 per page</option>
                    <option>25 per page</option>
                    <option>50 per page</option>
                  </select>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '50px' }}>S.No</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Student ID ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Student Name</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Gender</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Class ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Section ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>DOB ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Latest Assessment ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Status ↕</th>
                        <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((item) => (
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.id}</span>
                              {item.enrollmentStatus && item.enrollmentStatus !== 'Active' && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '8px',
                                    backgroundColor: item.enrollmentStatus === 'TC Issued' ? '#FEF2F2' : '#EFF6FF',
                                    color: item.enrollmentStatus === 'TC Issued' ? '#DC2626' : '#2563EB',
                                    border: `1px solid ${item.enrollmentStatus === 'TC Issued' ? '#FECACA' : '#BFDBFE'}`
                                  }}
                                >
                                  {item.enrollmentStatus}
                                </span>
                              )}
                            </div>
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
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalStudent(item);
                                  setShowStudentGrowthModal(true);
                                }}
                                style={{
                                  backgroundColor: '#F8FAFC',
                                  color: '#0F172A',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Download Student Growth Chart (PDF)"
                              >
                                <FileText size={12} color="#2563EB" />
                                <span>PDF</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTransferModalStudent(item);
                                }}
                                style={{
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Issue TC or Transfer to another school"
                              >
                                <ArrowRightLeft size={12} color="#1D4ED8" />
                                <span>TC / Transfer</span>
                              </button>

                              {(item.enrollmentStatus === 'TC Issued' || item.enrollmentStatus === 'Graduated') && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTcCertModalStudent(item);
                                  }}
                                  style={{
                                    backgroundColor: '#FEF3C7',
                                    color: '#B45309',
                                    border: '1px solid #FDE68A',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Print TC Health Summary Record"
                                >
                                  <Printer size={12} color="#B45309" />
                                  <span>TC Record</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudentId(item.id);
                                  setViewLevel('student_details');
                                }}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  color: '#0F172A',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  padding: '4px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Eye size={13} />
                                <span>View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                  >
                    3
                  </button>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>...</span>
                  <button
                    type="button"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                  >
                    &gt;
                  </button>
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
          {/* Top Profile Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #ECEEF2',
              padding: '22px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <StudentAvatar size={74} />
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.15 }}>
                  {activeStudent.name}
                </h1>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>
                  Student ID: {activeStudent.id || activeStudent.idCode || 'N/A'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                    <School size={15} color="#64748B" />
                    <span>{activeSchool.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                    <BookOpen size={15} color="#64748B" />
                    <span>Grade {activeStudent.classVal}{activeStudent.section}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                    <Network size={15} color="#64748B" />
                    <span>{activeCluster.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Status Box & Action Buttons on Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setTransferModalStudent(activeStudent)}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                title="Issue Transfer Certificate or transfer student to another school"
              >
                <ArrowRightLeft size={15} />
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
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  title="Print Official TC Health Summary Certificate"
                >
                  <Printer size={15} />
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
                  borderRadius: '10px',
                  padding: '12px 16px',
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
                <span>Growth Chart (PDF)</span>
              </button>

              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #DCFCE7',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: getNutritionStatusBg(activeStudent.currentStatus),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getNutritionStatusColor(activeStudent.currentStatus)
                  }}
                >
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Current Status</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: getNutritionStatusColor(activeStudent.currentStatus), lineHeight: 1.1 }}>
                    {activeStudent.currentStatus || 'Normal'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Based on latest assessment
                  </div>
                </div>
              </div>
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

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Cluster</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeCluster.name}</span>
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
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: activeStudent.weightZScore < -2 ? '#FFEDD5' : '#DCFCE7', color: activeStudent.weightZScore < -2 ? '#EA580C' : '#15803D', padding: '2px 8px', borderRadius: '10px' }}>
                    {activeStudent.weight ? (activeStudent.weightZScore < -2 ? 'Underweight' : 'Normal') : 'Pending'}
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
                  <div style={{ fontSize: '16px', fontWeight: 800, color: (typeof activeStudent.weightZScore === 'number' && activeStudent.weightZScore < -2) ? '#DC2626' : '#0F172A', margin: '2px 0 4px 0' }}>
                    {typeof activeStudent.weightZScore === 'number' ? `${activeStudent.weightZScore.toFixed(2)} SD` : '—'}
                  </div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    {typeof activeStudent.weightZScore === 'number' && (
                      <div style={{ position: 'absolute', left: `${getZMeterPosition(activeStudent.weightZScore)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>
                    {typeof activeStudent.weightZScore === 'number' ? (activeStudent.weightZScore < -2 ? 'Underweight (<-2 SD)' : 'Normal range') : 'No assessment data'}
                  </div>
                </div>
              </div>
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
                  {typeof activeStudent.weightZScore === 'number' ? `${activeStudent.weightZScore.toFixed(2)} SD` : '—'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeStudent.bmi ? activeStudent.bmi : '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Classification</span>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  backgroundColor: getNutritionStatusBg(activeStudent.currentStatus), 
                  color: getNutritionStatusColor(activeStudent.currentStatus), 
                  border: `1px solid ${getNutritionStatusBorder(activeStudent.currentStatus)}`,
                  padding: '2px 10px', 
                  borderRadius: '10px' 
                }}>
                  {activeStudent.currentStatus || 'Pending'}
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
                          {item.month.replace(' 2026', '').replace('November', 'Nov').replace('October', 'Oct').replace('September', 'Sep').replace('August', 'Aug').replace('July', 'Jul').replace('June', 'Jun')}
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
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Height (cm)</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Weight (kg)</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>BMI</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Classification</th>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
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
      <StudentGrowthChartModal
        isOpen={showStudentGrowthModal}
        onClose={() => {
          setShowStudentGrowthModal(false);
          setModalStudent(null);
        }}
        student={modalStudent}
        schoolName={activeSchool?.name}
        clusterName={activeCluster?.name}
      />

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
    </div>
  );
}

