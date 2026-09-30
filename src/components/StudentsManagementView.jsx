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
  ChevronDown
} from 'lucide-react';

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

  // Active selections
  const [selectedClusterId, setSelectedClusterId] = useState('cluster-a');
  const [selectedSchoolId, setSelectedSchoolId] = useState('greenwood');
  const [selectedStudentId, setSelectedStudentId] = useState('GW001');

  // Search & Filter States
  const [clusterSearch, setClusterSearch] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [sectionFilter, setSectionFilter] = useState('All Sections');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [studentPage, setStudentPage] = useState(1);

  // Growth Trend Chart metric toggle: 'Weight' | 'Height' | 'BMI'
  const [trendMetric, setTrendMetric] = useState('Weight');

  // ================= DYNAMIC DATA ENGINE =================

  // Clusters Data
  const [clustersData, setClustersData] = useState([
    {
      id: 'cluster-a',
      name: 'Cluster A',
      schoolsCount: 12,
      studentsCount: 486,
      themeColor: '#EA580C',
      bgColor: '#FFF7ED',
      accentColor: '#FFEDD5',
      waveColor: 'rgba(234, 88, 12, 0.08)'
    },
    {
      id: 'cluster-b',
      name: 'Cluster B',
      schoolsCount: 8,
      studentsCount: 324,
      themeColor: '#059669',
      bgColor: '#ECFDF5',
      accentColor: '#D1FAE5',
      waveColor: 'rgba(5, 150, 105, 0.08)'
    },
    {
      id: 'cluster-c',
      name: 'Cluster C',
      schoolsCount: 10,
      studentsCount: 412,
      themeColor: '#2563EB',
      bgColor: '#EFF6FF',
      accentColor: '#DBEAFE',
      waveColor: 'rgba(37, 99, 235, 0.08)'
    },
    {
      id: 'cluster-d',
      name: 'Cluster D',
      schoolsCount: 8,
      studentsCount: 368,
      themeColor: '#8B5CF6',
      bgColor: '#F5F3FF',
      accentColor: '#EDE9FE',
      waveColor: 'rgba(139, 92, 246, 0.08)'
    },
    {
      id: 'cluster-e',
      name: 'Cluster E',
      schoolsCount: 6,
      studentsCount: 298,
      themeColor: '#E11D48',
      bgColor: '#FFF1F2',
      accentColor: '#FFE4E6',
      waveColor: 'rgba(225, 29, 72, 0.08)'
    },
    {
      id: 'cluster-f',
      name: 'Cluster F',
      schoolsCount: 9,
      studentsCount: 312,
      themeColor: '#D97706',
      bgColor: '#FFFBEB',
      accentColor: '#FEF3C7',
      waveColor: 'rgba(217, 119, 6, 0.08)'
    }
  ]);

  // Schools mapping by cluster
  const schoolsByCluster = {
    'cluster-a': [
      { id: 'greenwood', name: 'Greenwood Public School', students: 126, assessed: 98, pending: 28, pct: 78, barColor: '#10B981', iconColor: '#EA580C', iconBg: '#FFF7ED' },
      { id: 'oakridge', name: 'Oakridge Academy', students: 98, assessed: 76, pending: 22, pct: 78, barColor: '#3B82F6', iconColor: '#2563EB', iconBg: '#EFF6FF' },
      { id: 'stjude', name: 'St. Jude High School', students: 74, assessed: 52, pending: 22, pct: 70, barColor: '#F59E0B', iconColor: '#059669', iconBg: '#ECFDF5' },
      { id: 'riverside', name: 'Riverside International', students: 68, assessed: 61, pending: 7, pct: 90, barColor: '#10B981', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
      { id: 'sunrise', name: 'Sunrise Public School', students: 42, assessed: 30, pending: 12, pct: 71, barColor: '#F59E0B', iconColor: '#EA580C', iconBg: '#FFF7ED' },
      { id: 'maplewood', name: 'Maplewood High School', students: 38, assessed: 25, pending: 13, pct: 66, barColor: '#F59E0B', iconColor: '#059669', iconBg: '#ECFDF5' },
      { id: 'hillview', name: 'Hillview School', students: 28, assessed: 20, pending: 8, pct: 71, barColor: '#F59E0B', iconColor: '#2563EB', iconBg: '#EFF6FF' },
      { id: 'lakeside', name: 'Lakeside Public School', students: 12, assessed: 10, pending: 2, pct: 83, barColor: '#10B981', iconColor: '#8B5CF6', iconBg: '#F5F3FF' },
    ],
    'cluster-b': [
      { id: 'pinehill', name: 'Pinehill Academy', students: 110, assessed: 88, pending: 22, pct: 80, barColor: '#10B981', iconColor: '#059669', iconBg: '#ECFDF5' },
      { id: 'cedar', name: 'Cedar High School', students: 94, assessed: 70, pending: 24, pct: 74, barColor: '#3B82F6', iconColor: '#2563EB', iconBg: '#EFF6FF' },
    ]
  };

  // Students Data for Greenwood Public School (matching Image 3)
  const [studentsData, setStudentsData] = useState([
    { sno: 1, id: 'GW001', idCode: '1042', name: 'Aarav Sharma', gender: 'Male', classVal: '3', section: 'A', dob: '15/05/2019', dobFormatted: '15 May 2019', latestAssessment: '12 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
    { sno: 2, id: 'GW002', idCode: '1043', name: 'Diya Patel', gender: 'Female', classVal: '4', section: 'B', dob: '20/08/2018', dobFormatted: '20 Aug 2018', latestAssessment: '10 Sep 2026', healthStatus: 'Needs Attention', currentStatus: 'Needs Attention' },
    { sno: 3, id: 'GW003', idCode: '1044', name: 'Rohan Kumar', gender: 'Male', classVal: '2', section: 'C', dob: '10/02/2020', dobFormatted: '10 Feb 2020', latestAssessment: '08 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
    { sno: 4, id: 'GW004', idCode: '1045', name: 'Sneha Reddy', gender: 'Female', classVal: '3', section: 'A', dob: '11/06/2019', dobFormatted: '11 Jun 2019', latestAssessment: '14 Sep 2026', healthStatus: 'Under Observation', currentStatus: 'Under Observation' },
    { sno: 5, id: 'GW005', idCode: '1046', name: 'Aditya Menon', gender: 'Male', classVal: '5', section: 'B', dob: '02/03/2017', dobFormatted: '02 Mar 2017', latestAssessment: '09 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
    { sno: 6, id: 'GW006', idCode: '1047', name: 'Ishita Singh', gender: 'Female', classVal: '1', section: 'A', dob: '25/11/2020', dobFormatted: '25 Nov 2020', latestAssessment: '13 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
    { sno: 7, id: 'GW007', idCode: '1048', name: 'Kabir Khan', gender: 'Male', classVal: '4', section: 'C', dob: '17/07/2018', dobFormatted: '17 Jul 2018', latestAssessment: '11 Sep 2026', healthStatus: 'Needs Attention', currentStatus: 'Needs Attention' },
    { sno: 8, id: 'GW008', idCode: '1049', name: 'Ananya Iyer', gender: 'Female', classVal: '3', section: 'B', dob: '28/09/2019', dobFormatted: '28 Sep 2019', latestAssessment: '12 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
    { sno: 9, id: 'GW009', idCode: '1050', name: 'Vihaan Gupta', gender: 'Male', classVal: '2', section: 'A', dob: '05/01/2020', dobFormatted: '05 Jan 2020', latestAssessment: '07 Sep 2026', healthStatus: 'Under Observation', currentStatus: 'Under Observation' },
    { sno: 10, id: 'GW010', idCode: '1051', name: 'Meera Nair', gender: 'Female', classVal: '5', section: 'C', dob: '21/04/2017', dobFormatted: '21 Apr 2017', latestAssessment: '14 Sep 2026', healthStatus: 'Healthy', currentStatus: 'Normal' },
  ]);

  // Selected Entities
  const activeCluster = clustersData.find(c => c.id === selectedClusterId) || clustersData[0];
  const schoolsList = schoolsByCluster[selectedClusterId] || schoolsByCluster['cluster-a'];
  const activeSchool = schoolsList.find(s => s.id === selectedSchoolId) || schoolsList[0];
  const activeStudent = studentsData.find(s => s.id === selectedStudentId) || studentsData[0];

  // Assessment monthly records for Aarav Sharma (matching Image 5)
  const assessmentHistory = [
    { month: 'November 2026', date: '12 Nov 2026', height: 131.2, weight: 24.1, bmi: 14.0, classification: 'Normal' },
    { month: 'October 2026', date: '10 Oct 2026', height: 129.8, weight: 23.4, bmi: 13.9, classification: 'Normal' },
    { month: 'September 2026', date: '12 Sep 2026', height: 128.5, weight: 22.3, bmi: 13.5, classification: 'Normal' },
    { month: 'August 2026', date: '14 Aug 2026', height: 126.1, weight: 21.0, bmi: 13.2, classification: 'Normal' },
    { month: 'July 2026', date: '12 Jul 2026', height: 124.3, weight: 20.1, bmi: 13.0, classification: 'Normal' },
    { month: 'June 2026', date: '10 Jun 2026', height: 122.0, weight: 19.2, bmi: 12.9, classification: 'Normal' },
  ];

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
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      const match = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (classFilter !== 'All Classes' && s.classVal !== classFilter.replace('Class ', '')) return false;
    if (sectionFilter !== 'All Sections' && s.section !== sectionFilter.replace('Section ', '')) return false;
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
                    2,486
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
                    8
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
                    64
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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
              {activeCluster.name}
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Schools and student distribution
            </p>
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
          {/* Header row with Title and Right Summary Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
                {activeSchool.name}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                {activeSchool.students} Students
              </p>
            </div>

            {/* Total Students Card on Right */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={22} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Total Students</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {activeSchool.students}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Students in this school</div>
              </div>
            </div>
          </div>

          {/* Filter Bar Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '14px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
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

            {/* Class Filter */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
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
              <option value="All Classes">All Classes</option>
              <option value="Class 1">Class 1</option>
              <option value="Class 2">Class 2</option>
              <option value="Class 3">Class 3</option>
              <option value="Class 4">Class 4</option>
              <option value="Class 5">Class 5</option>
            </select>

            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
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
              <option value="All Sections">All Sections</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
            </select>

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
              <option value="Healthy">Healthy</option>
              <option value="Needs Attention">Needs Attention</option>
              <option value="Under Observation">Under Observation</option>
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
                Showing 1–{filteredStudents.length} of 126 students
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
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Health Status ↕</th>
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
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{item.id}</td>
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
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            backgroundColor:
                              item.healthStatus === 'Healthy'
                                ? '#DCFCE7'
                                : item.healthStatus === 'Needs Attention'
                                ? '#FEF3C7'
                                : '#FEE2E2',
                            color:
                              item.healthStatus === 'Healthy'
                                ? '#15803D'
                                : item.healthStatus === 'Needs Attention'
                                ? '#B45309'
                                : '#B91C1C'
                          }}
                        >
                          {item.healthStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
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
              <button
                type="button"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
              >
                4
              </button>
              <button
                type="button"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
              >
                5
              </button>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>...</span>
              <button
                type="button"
                style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
              >
                13
              </button>
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
                  Student ID: #{activeStudent.idCode || '1042'}
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

            {/* Current Status Box on Right */}
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
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669'
                }}
              >
                <Activity size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Current Status</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
                  {activeStudent.currentStatus || 'Normal'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Based on latest assessment
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
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>128.5 cm</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px' }}>Normal</span>
                </div>

                {/* Weight */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <Scale size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Weight</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>22.3 kg</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px' }}>Normal</span>
                </div>

                {/* BMI */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <Gauge size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>BMI</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>13.5</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px' }}>Normal</span>
                </div>

                {/* Classification */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 10px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px auto' }}>
                    <ShieldCheck size={15} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Classification</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>Normal</div>
                  <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '10px' }}>Healthy Range</span>
                </div>
              </div>

              {/* 3 Z-score meters */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', paddingTop: '6px' }}>
                {/* BMI-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>BMI-for-Age Z</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>-0.4</div>
                  {/* Gauge bar */}
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    <div style={{ position: 'absolute', left: `${getZMeterPosition(-0.4)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>Normal range</div>
                </div>

                {/* Height-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Height-for-Age Z</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>0.2</div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    <div style={{ position: 'absolute', left: `${getZMeterPosition(0.2)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>Normal range</div>
                </div>

                {/* Weight-for-Age Z */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Weight-for-Age Z</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '2px 0 4px 0' }}>-0.3</div>
                  <div style={{ position: 'relative', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px' }}>
                    <div style={{ position: 'absolute', left: '25%', right: '25%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
                    <div style={{ position: 'absolute', left: `${getZMeterPosition(-0.3)}%`, top: '-3px', width: '2px', height: '12px', backgroundColor: '#0F172A' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B', textAlign: 'center', marginTop: '3px' }}>Normal range</div>
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
                <span style={{ fontWeight: 600, color: '#0F172A' }}>12 September 2026</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI-for-Age Z</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>-0.4</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Height</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>128.5 cm</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Height-for-Age Z</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>0.2</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Weight</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>22.3 kg</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Weight-for-Age Z</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>-0.3</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>BMI</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>13.5</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #F1F5F9', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Classification</span>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 10px', borderRadius: '10px' }}>
                  Normal
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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.15 }}>
              Health History
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Track the student's health assessments over time
            </p>
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
                Student ID: #{activeStudent.idCode || '1042'}
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
                  {assessmentHistory.slice().reverse().map((item, idx) => {
                    const value = trendMetric === 'Weight' ? item.weight : trendMetric === 'Height' ? item.height : item.bmi;
                    const maxVal = trendMetric === 'Weight' ? 30 : trendMetric === 'Height' ? 150 : 25;
                    const barHeightPct = Math.min(100, Math.max(10, (value / maxVal) * 100));

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
                      {item.month.replace(' 2026', ' 2026').replace('November', 'Nov').replace('October', 'Oct').replace('September', 'Sep').replace('August', 'Aug').replace('July', 'Jul').replace('June', 'Jun')}
                    </span>
                  ))}
                </div>
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
                November 2026
              </div>

              {/* Details Key Values */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Height</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>131.2 cm</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Weight</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>24.1 kg</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>BMI</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>14.0</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Classification</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '3px 10px', borderRadius: '10px' }}>
                    Normal
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
                  {assessmentHistory.map((item) => (
                    <tr
                      key={item.month}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>{item.month}</td>
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.date}</td>
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.height}</td>
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.weight}</td>
                      <td style={{ padding: '11px 14px', fontSize: '12.5px', color: '#475569' }}>{item.bmi}</td>
                      <td style={{ padding: '11px 14px', fontSize: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 10px', borderRadius: '10px' }}>
                          {item.classification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
