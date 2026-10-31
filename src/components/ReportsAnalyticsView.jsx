import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  BarChart2,
  Users,
  School,
  Network,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Layers,
  Shield,
  FileSpreadsheet,
  Activity,
  HeartPulse,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/images/wattasattam_logo.png';
import { api } from '../services/api';
import { filterScopeData } from '../utils/scopeFilter';
import { matchStudentSearch } from '../utils/studentSearch';
import SearchableDropdown from './SearchableDropdown';
import ClusterGrowthChartModal from './ClusterGrowthChartModal';
import SchoolGrowthChartModal from './SchoolGrowthChartModal';
import StudentGrowthChartModal from './StudentGrowthChartModal';
import StudentTcCertificateModal from './StudentTcCertificateModal';

// Helper: Authoritative WHO Nutrition Status calculation from live PostgreSQL student record
export function getAuthoritativeNutritionStatus(student) {
  if (!student) return 'Pending Assessment';
  const raw = student.raw || student;
  const rawAssessments = Array.isArray(raw.assessments)
    ? raw.assessments
    : (Array.isArray(student.assessments) ? student.assessments : []);
  const latestA = rawAssessments.length > 0 ? rawAssessments[0] : null;

  const rawClassification = raw.classification || raw.nutrition_status || latestA?.classification || latestA?.nutrition_status || '';
  const rawZ = typeof raw.z_score === 'number' ? raw.z_score : (typeof latestA?.z_score === 'number' ? latestA.z_score : null);
  const heightZ = typeof raw.height_for_age_z === 'number' ? raw.height_for_age_z : (typeof latestA?.height_for_age_z === 'number' ? latestA.height_for_age_z : null);
  const weightZ = typeof raw.weight_for_age_z === 'number' ? raw.weight_for_age_z : (typeof latestA?.weight_for_age_z === 'number' ? latestA.weight_for_age_z : null);

  const scLower = String(rawClassification).toLowerCase().trim();
  const rsLower = String(raw.status || '').toLowerCase().trim();
  const hasZ = typeof rawZ === 'number' && !isNaN(rawZ);
  const hasHZ = typeof heightZ === 'number' && !isNaN(heightZ);
  const hasWZ = typeof weightZ === 'number' && !isNaN(weightZ);
  const hasMeasurements = (student.height_cm > 0 && student.weight_kg > 0) || (latestA?.height_cm > 0 && latestA?.weight_kg > 0);

  if (scLower.includes('severely wasted') || scLower.includes('severe thinness') || (hasZ && rawZ < -3.0)) {
    return 'Severely Wasted';
  }
  if (scLower.includes('wasted') || scLower.includes('thinness') || (hasZ && rawZ < -2.0)) {
    return 'Wasted';
  }
  if (rsLower.includes('stunt') || scLower.includes('stunt') || (hasHZ && heightZ < -2.0)) {
    return 'Stunted';
  }
  const isWeightApplicable = raw.weight_for_age_applicable ?? latestA?.weight_for_age_applicable ?? (typeof raw.age_months === 'number' ? (raw.age_months >= 60 && raw.age_months <= 120) : true);
  if (isWeightApplicable && (rsLower.includes('underweight') || scLower.includes('underweight') || (hasWZ && weightZ < -2.0))) {
    return 'Underweight';
  }
  if (scLower.includes('obese') || (hasZ && rawZ > 2.0)) {
    return 'Overweight';
  }
  if (scLower.includes('overweight') || (hasZ && rawZ > 1.0)) {
    return 'Overweight';
  }
  if (hasMeasurements || scLower.includes('normal')) {
    return 'Normal';
  }
  return 'Pending Assessment';
}

// Helper: WHO color-coded styling
export function getNutritionBadge(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s.includes('severely wasted') || s.includes('severe thinness')) {
    return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5', label: 'Severely Wasted' };
  }
  if (s.includes('wasted') || s.includes('thinness')) {
    return { bg: '#FFEDD5', text: '#EA580C', border: '#FDBA74', label: 'Wasted' };
  }
  if (s.includes('stunted')) {
    return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D', label: 'Stunted' };
  }
  if (s.includes('underweight')) {
    return { bg: '#FEF9C3', text: '#CA8A04', border: '#FDE047', label: 'Underweight' };
  }
  if (s.includes('overweight') || s.includes('obese')) {
    return { bg: '#FCE7F3', text: '#DB2777', border: '#F9A8D4', label: 'Overweight' };
  }
  if (s.includes('normal')) {
    return { bg: '#ECFDF5', text: '#059669', border: '#6EE7B7', label: 'Normal' };
  }
  return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', label: 'Pending Assessment' };
}

export default function ReportsAnalyticsView() {
  const { user, isSuperAdmin, isClusterAdmin, assignedClusterIds, assignedSchoolIds } = useAuth();

  // Primary Tab State: 'clusters' | 'schools' | 'students' | 'tracking'
  const [activeReportTab, setActiveReportTab] = useState('clusters');

  // Search & Filter States
  const [clusterFilter, setClusterFilter] = useState('ALL');
  const [schoolFilter, setSchoolFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination for Students Tab
  const [studentPage, setStudentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(50);

  // Modals for 1-click Reports
  const [selectedClusterReport, setSelectedClusterReport] = useState(null);
  const [selectedSchoolReport, setSelectedSchoolReport] = useState(null);
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [selectedStudentTc, setSelectedStudentTc] = useState(null);

  // Live PostgreSQL Data
  const [liveClusters, setLiveClusters] = useState([]);
  const [liveSchools, setLiveSchools] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => new Date());

  // Load live scoped data
  const loadReportsData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const [cRes, sRes, stRes] = await Promise.all([
        api.getClusters().catch(() => []),
        api.getSchools().catch(() => []),
        api.getStudents().catch(() => [])
      ]);

      const rawClusters = Array.isArray(cRes) ? cRes : [];
      const rawSchools = Array.isArray(sRes) ? sRes : [];
      const rawStudents = Array.isArray(stRes) ? stRes : [];

      const {
        filteredClusters,
        filteredSchools,
        filteredStudents
      } = filterScopeData({
        clusters: rawClusters,
        schools: rawSchools,
        students: rawStudents,
        isClusterAdmin,
        isSuperAdmin,
        assignedClusterIds,
        assignedSchoolIds
      });

      setLiveClusters(filteredClusters);
      setLiveSchools(filteredSchools);
      setLiveStudents(filteredStudents);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.warn('Reports live data fetch error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReportsData();
    const interval = setInterval(() => loadReportsData(true), 8000);
    return () => clearInterval(interval);
  }, [isSuperAdmin, isClusterAdmin, assignedClusterIds, assignedSchoolIds]);

  // Compute nutrition status for every student once
  const studentsWithStatus = useMemo(() => {
    return liveStudents.map(st => ({
      ...st,
      authoritativeStatus: getAuthoritativeNutritionStatus(st)
    }));
  }, [liveStudents]);

  // Priority malnutrition students (Severely Wasted & Wasted)
  const priorityStudents = useMemo(() => {
    return studentsWithStatus.filter(st => {
      const s = st.authoritativeStatus;
      return s === 'Severely Wasted' || s === 'Wasted';
    });
  }, [studentsWithStatus]);

  // Filtered schools for Tab 2
  const filteredSchools = useMemo(() => {
    return liveSchools.filter(sch => {
      if (clusterFilter !== 'ALL') {
        const cId = String(sch.cluster_id || '').toLowerCase();
        const cName = String(sch.cluster_name || sch.cluster || '').toLowerCase();
        const target = String(clusterFilter).toLowerCase();
        if (cId !== target && cName !== target) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sName = String(sch.name || '').toLowerCase();
        const sCode = String(sch.code || '').toLowerCase();
        if (!sName.includes(q) && !sCode.includes(q)) return false;
      }
      return true;
    });
  }, [liveSchools, clusterFilter, searchQuery]);

  // Filtered students for Tab 3
  const filteredStudents = useMemo(() => {
    return studentsWithStatus.filter(st => {
      if (clusterFilter !== 'ALL') {
        const cId = String(st.cluster_id || '').toLowerCase();
        const cName = String(st.cluster_name || st.cluster || '').toLowerCase();
        const target = String(clusterFilter).toLowerCase();
        if (cId !== target && cName !== target) return false;
      }
      if (schoolFilter !== 'ALL') {
        const sId = String(st.school_id || '').toLowerCase();
        const sName = String(st.school_name || '').toLowerCase();
        const target = String(schoolFilter).toLowerCase();
        if (sId !== target && sName !== target) return false;
      }
      if (classFilter !== 'ALL') {
        const stClass = String(st.class_name || '').replace(/class\s*/i, '').trim();
        if (stClass !== classFilter) return false;
      }
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'Overweight') {
          if (st.authoritativeStatus !== 'Overweight' && st.authoritativeStatus !== 'Obese') return false;
        } else if (st.authoritativeStatus !== statusFilter) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        if (!matchStudentSearch(st, searchQuery)) return false;
      }
      return true;
    });
  }, [studentsWithStatus, clusterFilter, schoolFilter, classFilter, statusFilter, searchQuery]);

  // Priority students filtered for Tab 4
  const filteredPriorityStudents = useMemo(() => {
    return priorityStudents.filter(st => {
      if (clusterFilter !== 'ALL') {
        const cId = String(st.cluster_id || '').toLowerCase();
        const cName = String(st.cluster_name || st.cluster || '').toLowerCase();
        const target = String(clusterFilter).toLowerCase();
        if (cId !== target && cName !== target) return false;
      }
      if (schoolFilter !== 'ALL') {
        const sId = String(st.school_id || '').toLowerCase();
        const sName = String(st.school_name || '').toLowerCase();
        const target = String(schoolFilter).toLowerCase();
        if (sId !== target && sName !== target) return false;
      }
      if (searchQuery.trim()) {
        if (!matchStudentSearch(st, searchQuery)) return false;
      }
      return true;
    });
  }, [priorityStudents, clusterFilter, schoolFilter, searchQuery]);

  // Dynamic Class list
  const availableClasses = useMemo(() => {
    const set = new Set();
    liveStudents.forEach(st => {
      const c = String(st.class_name || '').replace(/class\s*/i, '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => {
      const nA = parseInt(a);
      const nB = parseInt(b);
      if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
      return a.localeCompare(b);
    });
  }, [liveStudents]);

  // Paginated students for Tab 3
  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * studentsPerPage;
    return filteredStudents.slice(start, start + studentsPerPage);
  }, [filteredStudents, studentPage, studentsPerPage]);
  const totalStudentPages = Math.ceil(filteredStudents.length / studentsPerPage) || 1;

  // Export Priority CSV
  const handleExportPriorityCSV = () => {
    if (filteredPriorityStudents.length === 0) {
      alert('No priority follow-up students match the selected filters.');
      return;
    }
    const headers = [
      'Student ID',
      'EMIS / Unique ID',
      'Student Name',
      'Gender',
      'DOB',
      'Age',
      'Cluster',
      'School',
      'Class',
      'Section',
      'Malnutrition Classification',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Z-Score',
      'Last Assessed Date'
    ];
    const rows = filteredPriorityStudents.map(st => {
      const raw = st.raw || st;
      const assessments = Array.isArray(raw.assessments) ? raw.assessments : [];
      const latestA = assessments[0] || null;
      return [
        `"${st.id || ''}"`,
        `"${st.idCode || st.previousStudentId || st.emis_number || ''}"`,
        `"${st.name || ''}"`,
        `"${st.gender || ''}"`,
        `"${st.dob || ''}"`,
        `"${st.age || ''}"`,
        `"${st.cluster_name || st.cluster || ''}"`,
        `"${st.school_name || ''}"`,
        `"${st.class_name || ''}"`,
        `"${st.section || ''}"`,
        `"${st.authoritativeStatus || ''}"`,
        st.height_cm || latestA?.height_cm || '',
        st.weight_kg || latestA?.weight_kg || '',
        st.bmi || latestA?.bmi || '',
        st.z_score || latestA?.z_score || '',
        `"${st.last_assessed_date || latestA?.date || ''}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Priority_Malnutrition_Tracking_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Priority Roster
  const handlePrintPriorityRoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print the priority malnutrition roster.');
      return;
    }
    const rowsHtml = filteredPriorityStudents.map((st, idx) => `
      <tr>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${idx + 1}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; font-weight: bold;">${st.name || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1;">${st.idCode || st.previousStudentId || st.id}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1;">${st.school_name || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.class_name || ''} ${st.section || ''}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; font-weight: bold; color: ${st.authoritativeStatus === 'Severely Wasted' ? '#DC2626' : '#EA580C'};">${st.authoritativeStatus}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.height_cm || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.weight_kg || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.bmi || '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.z_score ? Number(st.z_score).toFixed(2) : '—'}</td>
        <td style="padding: 6px 8px; border: 1px solid #CBD5E1; text-align: center;">${st.last_assessed_date || '—'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Priority Malnutrition Tracking Report - Waattasaattam</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0F172A; }
            h1 { font-size: 20px; margin: 0 0 4px 0; color: #0F172A; }
            p { font-size: 12px; margin: 0 0 16px 0; color: #64748B; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background-color: #F1F5F9; padding: 8px; border: 1px solid #CBD5E1; text-align: left; font-weight: 700; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 12mm; }
            }
          </style>
        </head>
        <body>
          <div style="border-bottom: 2px solid #0F172A; padding-bottom: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="width: 54px; height: 54px; border-radius: 50%; border: 1.5px solid #E2E8F0; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #FFFFFF; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
                  <img src="${logoImg}" alt="Waattasaattam Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                </div>
                <div>
                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: #EA580C;">
                    WAATTASAATTAM • STUDENT HEALTH TRACKING
                  </div>
                  <h1 style="font-size: 20px; font-weight: 900; color: #0F172A; margin: 2px 0 0 0; letter-spacing: -0.3px;">
                    PRIORITY MALNUTRITION TRACKING & FOLLOW-UP ROSTER
                  </h1>
                  <p style="font-size: 11.5px; margin: 2px 0 0 0; color: #64748B;">
                    WHO AnthroPlus Standard Growth & Acute Malnutrition Clinical Registry
                  </p>
                </div>
              </div>

              <div style="text-align: right; font-size: 11.5px; color: #475569; line-height: 1.5;">
                <div><strong>Report Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                <div><strong>Total Priority Cases:</strong> <span style="font-weight: 800; color: #DC2626;">${filteredPriorityStudents.length}</span></div>
                <div><strong>Jurisdiction:</strong> ${clusterFilter !== 'ALL' ? clusterFilter : 'All Clusters'}${schoolFilter !== 'ALL' ? ` • ${schoolFilter}` : ''}</div>
              </div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">#</th>
                <th>Student Name</th>
                <th>ID / EMIS</th>
                <th>School</th>
                <th style="text-align: center;">Class</th>
                <th>Classification</th>
                <th style="text-align: center;">Height (cm)</th>
                <th style="text-align: center;">Weight (kg)</th>
                <th style="text-align: center;">BMI</th>
                <th style="text-align: center;">Z-Score</th>
                <th style="text-align: center;">Last Screened</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // If Cluster Admin is unassigned (Pending Scope)
  const isUnassignedAdmin = !isSuperAdmin && liveClusters.length === 0 && liveSchools.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
      {/* ========================================================================= */}
      {/* TOP HEADER: TITLE & REALTIME SYNC ACTION                                    */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        backgroundColor: '#FFFFFF',
        padding: '16px 20px',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EA580C',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.15)'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Reports & Analytics Center
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: isSuperAdmin ? '#EFF6FF' : '#FFF7ED',
                color: isSuperAdmin ? '#1D4ED8' : '#EA580C',
                border: isSuperAdmin ? '1px solid #BFDBFE' : '1px solid #FFEDD5'
              }}>
                {isSuperAdmin ? 'Full State Oversight' : 'Allotted Cluster Scope'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
              Instant single-click access to Official WHO Growth Reports, School Rosters, and Priority Clinical Follow-Ups
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadReportsData(true)}
            disabled={isRefreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: isRefreshing ? 'wait' : 'pointer'
            }}
            title="Refresh Realtime Data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* UNASSIGNED PENDING SCOPE BANNER                                           */}
      {/* ========================================================================= */}
      {isUnassignedAdmin && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Shield size={36} color="#D97706" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#92400E', margin: 0 }}>
              Pending Cluster Scope Assignment
            </h3>
            <p style={{ fontSize: '13px', color: '#B45309', margin: '4px 0 0 0', lineHeight: 1.5 }}>
              Your administrator account has not been assigned to any cluster or school yet. Once the Super Administrator assigns your cluster access scope in User Management, your cluster, school, and student growth reports will be readily accessible here.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4 PRIMARY TABS NAVIGATION                                                  */}
      {/* ========================================================================= */}
      {!isUnassignedAdmin && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '2px solid #E2E8F0',
            paddingBottom: '2px',
            overflowX: 'auto'
          }}>
            {/* Tab 1: Overall Cluster Report */}
            <button
              onClick={() => { setActiveReportTab('clusters'); setSearchQuery(''); setStudentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeReportTab === 'clusters' ? '3px solid #EA580C' : '3px solid transparent',
                backgroundColor: activeReportTab === 'clusters' ? '#FFF7ED' : 'transparent',
                borderRadius: '8px 8px 0 0',
                color: activeReportTab === 'clusters' ? '#EA580C' : '#64748B',
                fontWeight: activeReportTab === 'clusters' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Network size={16} />
              <span>Overall Cluster Reports</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '999px',
                backgroundColor: activeReportTab === 'clusters' ? '#EA580C' : '#E2E8F0',
                color: activeReportTab === 'clusters' ? '#FFFFFF' : '#475569',
                fontWeight: 700
              }}>
                {liveClusters.length}
              </span>
            </button>

            {/* Tab 2: School Growth Report */}
            <button
              onClick={() => { setActiveReportTab('schools'); setSearchQuery(''); setStudentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeReportTab === 'schools' ? '3px solid #EA580C' : '3px solid transparent',
                backgroundColor: activeReportTab === 'schools' ? '#FFF7ED' : 'transparent',
                borderRadius: '8px 8px 0 0',
                color: activeReportTab === 'schools' ? '#EA580C' : '#64748B',
                fontWeight: activeReportTab === 'schools' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <School size={16} />
              <span>School Growth Reports</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '999px',
                backgroundColor: activeReportTab === 'schools' ? '#EA580C' : '#E2E8F0',
                color: activeReportTab === 'schools' ? '#FFFFFF' : '#475569',
                fontWeight: 700
              }}>
                {liveSchools.length}
              </span>
            </button>

            {/* Tab 3: Student Growth Report */}
            <button
              onClick={() => { setActiveReportTab('students'); setSearchQuery(''); setStudentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeReportTab === 'students' ? '3px solid #EA580C' : '3px solid transparent',
                backgroundColor: activeReportTab === 'students' ? '#FFF7ED' : 'transparent',
                borderRadius: '8px 8px 0 0',
                color: activeReportTab === 'students' ? '#EA580C' : '#64748B',
                fontWeight: activeReportTab === 'students' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <GraduationCap size={16} />
              <span>Student Growth Reports</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '999px',
                backgroundColor: activeReportTab === 'students' ? '#EA580C' : '#E2E8F0',
                color: activeReportTab === 'students' ? '#FFFFFF' : '#475569',
                fontWeight: 700
              }}>
                {liveStudents.length}
              </span>
            </button>

            {/* Tab 4: Monthly Tracking / Priority Cases */}
            <button
              onClick={() => { setActiveReportTab('tracking'); setSearchQuery(''); setStudentPage(1); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeReportTab === 'tracking' ? '3px solid #DC2626' : '3px solid transparent',
                backgroundColor: activeReportTab === 'tracking' ? '#FEF2F2' : 'transparent',
                borderRadius: '8px 8px 0 0',
                color: activeReportTab === 'tracking' ? '#DC2626' : '#64748B',
                fontWeight: activeReportTab === 'tracking' ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <HeartPulse size={16} />
              <span>Monthly Tracking & Priority Roster</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '999px',
                backgroundColor: activeReportTab === 'tracking' ? '#DC2626' : '#FEE2E2',
                color: activeReportTab === 'tracking' ? '#FFFFFF' : '#991B1B',
                fontWeight: 700
              }}>
                {priorityStudents.length}
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: OVERALL CLUSTER REPORTS                                             */}
          {/* ========================================================================= */}
          {activeReportTab === 'clusters' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Allotted Clusters</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{liveClusters.length}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Clusters with active screening data</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Managed Schools</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{liveSchools.length}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Schools in allotted jurisdiction</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Enrolled Students</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#EA580C', marginTop: '4px' }}>{liveStudents.length.toLocaleString()}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Students monitored across clusters</div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Priority Malnutrition Cases</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>{priorityStudents.length}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>Severely Wasted & Wasted requiring follow-up</div>
                </div>
              </div>

              {/* Cluster Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                {liveClusters.map((cluster) => {
                  const clusterName = cluster.name || cluster.id;
                  const cSchools = liveSchools.filter(s =>
                    s.cluster_id === cluster.id ||
                    String(s.cluster_name || s.cluster || '').toLowerCase() === String(clusterName).toLowerCase()
                  );
                  const cStudents = studentsWithStatus.filter(st =>
                    st.cluster_id === cluster.id ||
                    String(st.cluster_name || st.cluster || '').toLowerCase() === String(clusterName).toLowerCase()
                  );

                  return (
                    <div
                      key={cluster.id || cluster.name}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E8F0',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              backgroundColor: '#FFF7ED',
                              color: '#EA580C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Network size={20} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                {clusterName}
                              </h3>
                              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                                Cluster Region
                              </span>
                            </div>
                          </div>

                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0'
                          }}>
                            Active
                          </span>
                        </div>

                        {/* Counts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Schools</span>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                              {cSchools.length}
                            </div>
                          </div>
                          <div style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>Total Students</span>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                              {cStudents.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Button */}
                      <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                        <button
                          onClick={() => setSelectedClusterReport(cluster)}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.28)'
                          }}
                        >
                          <FileText size={15} />
                          <span>View / Download Cluster Report (PDF)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SCHOOL GROWTH REPORTS                                               */}
          {/* ========================================================================= */}
          {activeReportTab === 'schools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Filter Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                  {/* Search school */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    minWidth: '240px',
                    flex: 1
                  }}>
                    <Search size={15} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Search school name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                    />
                  </div>

                  {/* Cluster Selector */}
                  <select
                    value={clusterFilter}
                    onChange={(e) => setClusterFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      fontWeight: 600,
                      color: '#334155'
                    }}
                  >
                    <option value="ALL">All Clusters ({liveClusters.length})</option>
                    {liveClusters.map(c => (
                      <option key={c.id || c.name} value={c.name || c.id}>{c.name || c.id}</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Showing {filteredSchools.length} of {liveSchools.length} schools
                </div>
              </div>

              {/* Schools Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 16px' }}>School Name</th>
                        <th style={{ padding: '12px 16px' }}>Cluster</th>
                        <th style={{ padding: '12px 16px' }}>Total Students</th>
                        <th style={{ padding: '12px 16px' }}>Screening Coverage</th>
                        <th style={{ padding: '12px 16px' }}>Normal</th>
                        <th style={{ padding: '12px 16px' }}>Priority (Wasted)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Official Growth Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchools.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                            No schools match the search query or cluster filter.
                          </td>
                        </tr>
                      ) : (
                        filteredSchools.map((sch) => {
                          const sStudents = studentsWithStatus.filter(st =>
                            st.school_id === sch.id ||
                            String(st.school_name || '').toLowerCase() === String(sch.name || '').toLowerCase()
                          );
                          const assessedCount = sStudents.filter(st => st.authoritativeStatus !== 'Pending Assessment').length;
                          const coveragePct = sStudents.length > 0 ? Math.round((assessedCount / sStudents.length) * 100) : 0;
                          const normalCount = sStudents.filter(st => st.authoritativeStatus === 'Normal').length;
                          const priorityCount = sStudents.filter(st => st.authoritativeStatus === 'Severely Wasted' || st.authoritativeStatus === 'Wasted').length;

                          return (
                            <tr key={sch.id || sch.name} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>{sch.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>Code: {sch.code || 'SCH-OE'}</div>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#334155', fontSize: '11px', fontWeight: 600 }}>
                                  {sch.cluster_name || sch.cluster || '—'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0F172A' }}>
                                {sStudents.length}
                              </td>
                              <td style={{ padding: '12px 16px', minWidth: '120px' }}>
                                <span style={{ fontWeight: 700, color: '#0F172A' }}>{coveragePct}%</span>
                                <span style={{ color: '#64748B', fontSize: '11.5px', marginLeft: '6px' }}>({assessedCount}/{sStudents.length})</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ color: '#059669', fontWeight: 700 }}>{normalCount}</span>
                              </td>
                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: priorityCount > 0 ? '#FEE2E2' : '#F1F5F9',
                                  color: priorityCount > 0 ? '#DC2626' : '#64748B'
                                }}>
                                  {priorityCount} Cases
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  onClick={() => setSelectedSchoolReport(sch)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 12px',
                                    backgroundColor: '#EFF6FF',
                                    border: '1px solid #BFDBFE',
                                    borderRadius: '8px',
                                    color: '#1D4ED8',
                                    fontWeight: 700,
                                    fontSize: '11.5px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <FileText size={13} />
                                  <span>School Report (PDF)</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: STUDENT GROWTH REPORTS                                              */}
          {/* ========================================================================= */}
          {activeReportTab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Search & Filter Toolbar */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: '#FFFFFF',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Multi-attribute search input */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    flex: 1,
                    minWidth: '280px'
                  }}>
                    <Search size={16} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Search student by Name, Unique ID, DOB, Class, Section..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setStudentPage(1); }}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
                    />
                  </div>

                  {/* Cluster Dropdown */}
                  <select
                    value={clusterFilter}
                    onChange={(e) => { setClusterFilter(e.target.value); setSchoolFilter('ALL'); setStudentPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, color: '#334155' }}
                  >
                    <option value="ALL">All Clusters</option>
                    {liveClusters.map(c => (
                      <option key={c.id || c.name} value={c.name || c.id}>{c.name || c.id}</option>
                    ))}
                  </select>

                  {/* School Dropdown */}
                  <select
                    value={schoolFilter}
                    onChange={(e) => { setSchoolFilter(e.target.value); setStudentPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, color: '#334155', maxWidth: '200px' }}
                  >
                    <option value="ALL">All Schools</option>
                    {liveSchools
                      .filter(s => clusterFilter === 'ALL' || String(s.cluster_name || s.cluster || s.cluster_id || '').toLowerCase() === String(clusterFilter).toLowerCase())
                      .map(s => (
                        <option key={s.id || s.name} value={s.name}>{s.name}</option>
                      ))}
                  </select>

                  {/* Class Dropdown */}
                  <select
                    value={classFilter}
                    onChange={(e) => { setClassFilter(e.target.value); setStudentPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, color: '#334155' }}
                  >
                    <option value="ALL">All Classes</option>
                    {availableClasses.map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>

                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setStudentPage(1); }}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, color: '#334155' }}
                  >
                    <option value="ALL">All Nutrition Status</option>
                    <option value="Normal">Normal</option>
                    <option value="Severely Wasted">Severely Wasted</option>
                    <option value="Wasted">Wasted</option>
                    <option value="Stunted">Stunted</option>
                    <option value="Underweight">Underweight</option>
                    <option value="Overweight">Overweight</option>
                    <option value="Pending Assessment">Pending Assessment</option>
                  </select>

                  {/* Rows Per Page Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Show:</span>
                    <select
                      value={studentsPerPage}
                      onChange={(e) => { setStudentsPerPage(Number(e.target.value)); setStudentPage(1); }}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, color: '#334155', backgroundColor: '#FFFFFF' }}
                      title="Students per page"
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
                  <span>Found <strong>{filteredStudents.length}</strong> matching students</span>
                  {(searchQuery || clusterFilter !== 'ALL' || schoolFilter !== 'ALL' || classFilter !== 'ALL' || statusFilter !== 'ALL') && (
                    <button
                      onClick={() => { setSearchQuery(''); setClusterFilter('ALL'); setSchoolFilter('ALL'); setClassFilter('ALL'); setStatusFilter('ALL'); setStudentPage(1); }}
                      style={{ background: 'none', border: 'none', color: '#EA580C', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Student Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 16px' }}>Student</th>
                        <th style={{ padding: '12px 16px' }}>Unique ID</th>
                        <th style={{ padding: '12px 16px' }}>School & Cluster</th>
                        <th style={{ padding: '12px 16px' }}>Class / Section</th>
                        <th style={{ padding: '12px 16px' }}>Height & Weight</th>
                        <th style={{ padding: '12px 16px' }}>WHO Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                            No students match the search criteria.
                          </td>
                        </tr>
                      ) : (
                        paginatedStudents.map((st) => {
                          const badge = getNutritionBadge(st.authoritativeStatus);
                          const raw = st.raw || st;
                          const assessments = Array.isArray(raw.assessments) ? raw.assessments : [];
                          const latestA = assessments[0] || null;
                          const height = st.height_cm || latestA?.height_cm;
                          const weight = st.weight_kg || latestA?.weight_kg;

                          return (
                            <tr key={st.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    backgroundColor: st.gender === 'Female' ? '#FCE7F3' : '#EFF6FF',
                                    color: st.gender === 'Female' ? '#DB2777' : '#1D4ED8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '12px'
                                  }}>
                                    {(st.name || 'S').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                                      {st.gender || '—'} {st.dob ? `• DOB: ${st.dob}` : (st.age ? `• ${st.age} yrs` : '')}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                                  {st.idCode || st.previousStudentId || st.emis_number || st.admission_no || st.id}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 600, color: '#0F172A' }}>{st.school_name || '—'}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>{st.cluster_name || st.cluster || '—'}</div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: 600, color: '#0F172A' }}>
                                  {st.class_name ? `Class ${String(st.class_name).replace(/class\s*/i, '')}` : '—'}
                                </span>
                                {st.section && (
                                  <span style={{ marginLeft: '4px', fontSize: '11px', color: '#64748B' }}>
                                    ({st.section})
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                {height && weight ? (
                                  <div>
                                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{height} cm</span>
                                    <span style={{ color: '#94A3B8', margin: '0 4px' }}>•</span>
                                    <span style={{ fontWeight: 600, color: '#0F172A' }}>{weight} kg</span>
                                  </div>
                                ) : (
                                  <span style={{ color: '#94A3B8', fontSize: '11.5px' }}>Not recorded</span>
                                )}
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.border}`
                                }}>
                                  {badge.label}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button
                                    onClick={() => setSelectedStudentReport(st)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '6px 10px',
                                      backgroundColor: '#FFF7ED',
                                      border: '1px solid #FED7AA',
                                      borderRadius: '6px',
                                      color: '#EA580C',
                                      fontWeight: 700,
                                      fontSize: '11.5px',
                                      cursor: 'pointer'
                                    }}
                                    title="View Individual WHO AnthroPlus Growth Chart & Report"
                                  >
                                    <BarChart2 size={13} />
                                    <span>Growth Report</span>
                                  </button>

                                  <button
                                    onClick={() => setSelectedStudentTc(st)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '6px 10px',
                                      backgroundColor: '#F8FAFC',
                                      border: '1px solid #CBD5E1',
                                      borderRadius: '6px',
                                      color: '#475569',
                                      fontWeight: 600,
                                      fontSize: '11.5px',
                                      cursor: 'pointer'
                                    }}
                                    title="View Transfer Certificate Health Record"
                                  >
                                    <Award size={13} />
                                    <span>TC Record</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderTop: '1px solid #F1F5F9',
                    backgroundColor: '#FAFAFA',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        Showing <strong>{(studentPage - 1) * studentsPerPage + 1}</strong> - <strong>{Math.min(studentPage * studentsPerPage, filteredStudents.length)}</strong> of <strong>{filteredStudents.length}</strong> students (Page {studentPage} of {totalStudentPages})
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>Show:</span>
                        <select
                          value={studentsPerPage}
                          onChange={(e) => { setStudentsPerPage(Number(e.target.value)); setStudentPage(1); }}
                          style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', color: '#334155', backgroundColor: '#FFFFFF', fontWeight: 600 }}
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setStudentPage(p => Math.max(1, p - 1))}
                        disabled={studentPage === 1}
                        style={{
                          padding: '4px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          backgroundColor: studentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                          color: studentPage === 1 ? '#94A3B8' : '#334155',
                          cursor: studentPage === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))}
                        disabled={studentPage >= totalStudentPages}
                        style={{
                          padding: '4px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          backgroundColor: studentPage >= totalStudentPages ? '#F1F5F9' : '#FFFFFF',
                          color: studentPage >= totalStudentPages ? '#94A3B8' : '#334155',
                          cursor: studentPage >= totalStudentPages ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 600
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MONTHLY TRACKING & MALNUTRITION PRIORITY ROSTER                     */}
          {/* ========================================================================= */}
          {activeReportTab === 'tracking' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Info & PDF Export Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '4px 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#EA580C'
                  }}>
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Monthly Malnutrition Priority Roster
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Clinical monitoring of Severely Wasted and Wasted students requiring immediate therapeutic nutritional intervention ({filteredPriorityStudents.length} students)
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={handlePrintPriorityRoster}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                    }}
                    title="Download / Print PDF roster of listed priority students"
                  >
                    <Printer size={15} />
                    <span>Print (PDF)</span>
                  </button>
                </div>
              </div>

              {/* Priority Table */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 16px' }}>Student</th>
                        <th style={{ padding: '12px 16px' }}>Unique ID</th>
                        <th style={{ padding: '12px 16px' }}>School & Cluster</th>
                        <th style={{ padding: '12px 16px' }}>Class</th>
                        <th style={{ padding: '12px 16px' }}>Malnutrition Status</th>
                        <th style={{ padding: '12px 16px' }}>Z-Score (BMI)</th>
                        <th style={{ padding: '12px 16px' }}>Height & Weight</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPriorityStudents.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                            No priority malnutrition cases currently identified in your scope!
                          </td>
                        </tr>
                      ) : (
                        filteredPriorityStudents.map((st) => {
                          const badge = getNutritionBadge(st.authoritativeStatus);
                          const raw = st.raw || st;
                          const assessments = Array.isArray(raw.assessments) ? raw.assessments : [];
                          const latestA = assessments[0] || null;
                          const z = st.z_score || latestA?.z_score;
                          const height = st.height_cm || latestA?.height_cm;
                          const weight = st.weight_kg || latestA?.weight_kg;

                          return (
                            <tr key={st.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#0F172A' }}>{st.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                  {st.gender} {st.age ? `• ${st.age} yrs` : ''}
                                </div>
                              </td>

                              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                                {st.idCode || st.previousStudentId || st.emis_number || st.admission_no || st.id}
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ fontWeight: 600, color: '#0F172A' }}>{st.school_name || '—'}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>{st.cluster_name || st.cluster || '—'}</div>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{ fontWeight: 600 }}>
                                  {st.class_name ? `Class ${String(st.class_name).replace(/class\s*/i, '')}` : '—'} {st.section ? `(${st.section})` : ''}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: badge.bg,
                                  color: badge.text,
                                  border: `1px solid ${badge.border}`
                                }}>
                                  {badge.label}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                <span style={{
                                  fontWeight: 700,
                                  color: z && z < -3.0 ? '#DC2626' : '#EA580C'
                                }}>
                                  {z ? Number(z).toFixed(2) : '—'}
                                </span>
                              </td>

                              <td style={{ padding: '12px 16px' }}>
                                {height && weight ? `${height} cm • ${weight} kg` : '—'}
                              </td>

                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  onClick={() => setSelectedStudentReport(st)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '6px 12px',
                                    backgroundColor: '#FFF7ED',
                                    border: '1px solid #FED7AA',
                                    borderRadius: '6px',
                                    color: '#EA580C',
                                    fontWeight: 700,
                                    fontSize: '11.5px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <BarChart2 size={13} />
                                  <span>Growth Report (PDF)</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODALS: 1-CLICK PDF REPORT RENDERERS                                      */}
      {/* ========================================================================= */}
      {selectedClusterReport && (
        <ClusterGrowthChartModal
          isOpen={Boolean(selectedClusterReport)}
          onClose={() => setSelectedClusterReport(null)}
          cluster={selectedClusterReport}
          schools={liveSchools.filter(s =>
            s.cluster_id === selectedClusterReport.id ||
            String(s.cluster_name || s.cluster || '').toLowerCase() === String(selectedClusterReport.name || selectedClusterReport.id).toLowerCase()
          )}
          students={liveStudents.filter(st =>
            st.cluster_id === selectedClusterReport.id ||
            String(st.cluster_name || st.cluster || '').toLowerCase() === String(selectedClusterReport.name || selectedClusterReport.id).toLowerCase()
          )}
        />
      )}

      {selectedSchoolReport && (
        <SchoolGrowthChartModal
          isOpen={Boolean(selectedSchoolReport)}
          onClose={() => setSelectedSchoolReport(null)}
          school={selectedSchoolReport}
          students={liveStudents.filter(st =>
            st.school_id === selectedSchoolReport.id ||
            String(st.school_name || '').toLowerCase() === String(selectedSchoolReport.name || '').toLowerCase()
          )}
          clusterName={selectedSchoolReport.cluster_name || selectedSchoolReport.cluster || ''}
        />
      )}

      {selectedStudentReport && (
        <StudentGrowthChartModal
          isOpen={Boolean(selectedStudentReport)}
          onClose={() => setSelectedStudentReport(null)}
          student={selectedStudentReport}
          schoolName={selectedStudentReport.school_name}
          clusterName={selectedStudentReport.cluster_name || selectedStudentReport.cluster}
          allStudents={liveStudents}
        />
      )}

      {selectedStudentTc && (
        <StudentTcCertificateModal
          isOpen={Boolean(selectedStudentTc)}
          onClose={() => setSelectedStudentTc(null)}
          student={selectedStudentTc}
        />
      )}
    </div>
  );
}
