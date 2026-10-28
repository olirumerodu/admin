import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  Users,
  School,
  Network,
  ClipboardCheck,
  ArrowUpRight,
  ArrowRight,
  BarChart2,
  PieChart,
  Activity,
  Calendar,
  FileText,
  User,
  CheckCircle2,
  Layers,
  FileSpreadsheet,
  Printer,
  GraduationCap,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';
import { api } from '../services/api';
import SearchableDropdown from './SearchableDropdown';

// Color palette for dynamic school & chart visualization
const PALETTE_COLORS = ['#0D9488', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#F97316'];

export default function ReportsAnalyticsView() {
  // Navigation Mode: 'overview' | 'gender' | 'school_wise' | 'year_wise' | 'health_stats' | 'student_report'
  const [viewMode, setViewMode] = useState('overview');

  // Filter States
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedGrade, setSelectedGrade] = useState('All Grades');
  const [selectedHealthCategory, setSelectedHealthCategory] = useState('ALL');

  // Pagination for detailed report
  const [reportPage, setReportPage] = useState(1);
  const [reportPageSize, setReportPageSize] = useState(10);

  // Live Backend Data
  const [liveSchools, setLiveSchools] = useState([]);
  const [liveStudents, setLiveStudents] = useState([]);
  const [liveClusters, setLiveClusters] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState(null);

  useEffect(() => {
    async function loadReportsData() {
      try {
        const [sRes, stRes, cRes, mRes] = await Promise.all([
          api.getSchools().catch(() => []),
          api.getStudents().catch(() => []),
          api.getClusters().catch(() => []),
          api.getMetrics().catch(() => null)
        ]);
        if (Array.isArray(sRes)) setLiveSchools(sRes);
        if (Array.isArray(stRes)) setLiveStudents(stRes);
        if (Array.isArray(cRes)) setLiveClusters(cRes);
        if (mRes) setLiveMetrics(mRes);
      } catch (err) {
        console.warn('Reports live data fetch:', err);
      }
    }
    loadReportsData();
    const timer = setInterval(loadReportsData, 5000);
    return () => clearInterval(timer);
  }, []);

  // Available Academic Years extracted from real students
  const availableYears = useMemo(() => {
    const yrSet = new Set();
    liveStudents.forEach(st => {
      if (st.academic_year) {
        const y = String(st.academic_year).split('-')[0].trim();
        if (y) yrSet.add(y);
      }
      if (st.created_at) {
        const y = String(new Date(st.created_at).getFullYear());
        if (y && !isNaN(y)) yrSet.add(y);
      }
    });
    if (yrSet.size === 0) yrSet.add('2026');
    return Array.from(yrSet).sort((a, b) => b.localeCompare(a));
  }, [liveStudents]);

  // Cluster Options from real backend
  const clusterOptions = useMemo(() => {
    const set = new Set();
    liveClusters.forEach(c => { if (c.name) set.add(c.name); });
    liveSchools.forEach(s => { if (s.cluster_name) set.add(s.cluster_name); });
    liveStudents.forEach(st => { if (st.cluster_name) set.add(st.cluster_name); });
    return Array.from(set).filter(Boolean).sort();
  }, [liveClusters, liveSchools, liveStudents]);

  // School Options from real backend, filtered by selectedCluster if chosen
  const schoolOptions = useMemo(() => {
    const relevant = liveSchools.filter(s => 
      selectedCluster === 'ALL' || String(s.cluster_name || '').toLowerCase() === selectedCluster.toLowerCase()
    );
    const names = new Set(relevant.map(s => s.name).filter(Boolean));
    if (names.size === 0) {
      liveStudents.forEach(st => {
        if (st.school_name && (selectedCluster === 'ALL' || String(st.cluster_name || '').toLowerCase() === selectedCluster.toLowerCase())) {
          names.add(st.school_name);
        }
      });
    }
    return Array.from(names).sort();
  }, [liveSchools, liveStudents, selectedCluster]);

  // Dynamic Class & Section options for reports filter
  const reportClassOptions = useMemo(() => {
    const classSet = new Set();
    liveStudents.forEach(st => {
      if (st.class_name) {
        const clean = String(st.class_name).replace(/class\s*/i, '').trim();
        if (clean) classSet.add(clean);
      }
    });
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Anganwadi', 'Balwadi'].forEach(c => classSet.add(c));
    const sorted = Array.from(classSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
    return sorted.map(c => ({
      value: c,
      label: /^\d+$/.test(c) ? `Class ${c}` : c
    }));
  }, [liveStudents]);

  const reportSectionOptions = useMemo(() => {
    const secSet = new Set();
    liveStudents.forEach(st => {
      if (st.section) {
        const clean = String(st.section).replace(/section\s*/i, '').trim();
        if (clean) secSet.add(clean);
      }
    });
    ['A', 'B', 'C', 'D', 'None'].forEach(s => secSet.add(s));
    const sorted = Array.from(secSet).sort((a, b) => {
      if (a === 'None') return 1;
      if (b === 'None') return -1;
      return a.localeCompare(b);
    });
    return sorted.map(s => ({
      value: s,
      label: s === 'None' ? 'No Section (Single Group)' : `Section ${s}`
    }));
  }, [liveStudents]);

  // Filtered students according to all active filter dropdowns
  const filteredStudents = useMemo(() => {
    return liveStudents.filter(st => {
      // Year filter
      if (selectedYear !== 'ALL') {
        const yr = String(st.academic_year || '').trim();
        const createdYr = st.created_at ? String(new Date(st.created_at).getFullYear()) : '';
        if (!yr.includes(selectedYear) && createdYr !== selectedYear) return false;
      }
      // Cluster filter
      if (selectedCluster !== 'ALL') {
        if (String(st.cluster_name || '').toLowerCase() !== selectedCluster.toLowerCase()) return false;
      }
      // School filter
      if (selectedSchool !== 'ALL') {
        if (
          String(st.school_name || '').toLowerCase() !== selectedSchool.toLowerCase() &&
          String(st.school_id || '').toLowerCase() !== selectedSchool.toLowerCase()
        ) return false;
      }
      // Gender filter
      if (selectedGender !== 'ALL') {
        if (String(st.gender || '').toLowerCase() !== selectedGender.toLowerCase()) return false;
      }
      // Class filter
      if (selectedClass !== 'ALL') {
        const cls = String(st.class_name || '').replace(/class\s*/i, '').trim();
        if (cls !== selectedClass) return false;
      }
      // Section filter
      if (selectedSection !== 'ALL') {
        const sec = String(st.section || '').replace(/section\s*/i, '').trim();
        if (selectedSection === 'None') {
          if (sec && sec !== 'None') return false;
        } else {
          if (sec !== selectedSection) return false;
        }
      }
      // Health Category filter
      if (selectedHealthCategory !== 'ALL') {
        const nut = String(st.nutrition_status || '').toLowerCase();
        const cat = selectedHealthCategory.toLowerCase();
        if (cat === 'normal' && !nut.includes('normal')) return false;
        if (cat === 'severely wasted' && (!nut.includes('severe') || (!nut.includes('wasted') && !nut.includes('thinness')))) return false;
        if (cat === 'wasted' && (!nut.includes('wasted') && !nut.includes('thinness') || nut.includes('severe'))) return false;
        if (cat === 'severely stunted' && (!nut.includes('severe') || !nut.includes('stunt'))) return false;
        if (cat === 'stunted' && (!nut.includes('stunt') || nut.includes('severe'))) return false;
        if (cat === 'severely underweight' && (!nut.includes('severe') || !nut.includes('underweight'))) return false;
        if (cat === 'underweight' && (!nut.includes('underweight') || nut.includes('severe'))) return false;
        if (cat === 'overweight' && (!nut.includes('overweight') && !nut.includes('obese') && !nut.includes('obesity'))) return false;
      }
      return true;
    });
  }, [liveStudents, selectedYear, selectedCluster, selectedSchool, selectedGender, selectedClass, selectedSection, selectedHealthCategory]);

  // Compute schools data dynamically from real backend
  const activeSchoolsData = useMemo(() => {
    let baseSchools = liveSchools;
    if (baseSchools.length === 0) {
      const distinctNames = Array.from(new Set(liveStudents.map(s => s.school_name).filter(Boolean)));
      baseSchools = distinctNames.map(name => ({ id: name, name, cluster_name: 'Unassigned' }));
    }

    const filtered = baseSchools.filter(s => {
      const matchCluster = selectedCluster === 'ALL' || String(s.cluster_name || '').toLowerCase() === selectedCluster.toLowerCase();
      const matchSchool = selectedSchool === 'ALL' || String(s.name || '').toLowerCase() === selectedSchool.toLowerCase();
      return matchCluster && matchSchool;
    });

    return filtered.map((s, idx) => {
      const schoolStudents = filteredStudents.filter(st => 
        String(st.school_id || '').toLowerCase() === String(s.id || '').toLowerCase() || 
        String(st.school_name || '').toLowerCase() === String(s.name || '').toLowerCase()
      );
      const total = schoolStudents.length;
      const male = schoolStudents.filter(st => st.gender?.toLowerCase() === 'male').length;
      const female = schoolStudents.filter(st => st.gender?.toLowerCase() === 'female').length;
      const assessed = schoolStudents.filter(st => (st.assessments && st.assessments.length > 0) || st.latest_assessment_date).length;
      const pending = Math.max(0, total - assessed);

      // Nutrition breakdown
      const norm = schoolStudents.filter(st => st.nutrition_status?.toLowerCase().includes('normal')).length;
      const sevWasted = schoolStudents.filter(st => st.nutrition_status?.toLowerCase().includes('severe')).length;
      const wasted = schoolStudents.filter(st => (st.nutrition_status?.toLowerCase().includes('wasted') || st.nutrition_status?.toLowerCase().includes('thinness')) && !st.nutrition_status?.toLowerCase().includes('severe')).length;
      const overwt = schoolStudents.filter(st => st.nutrition_status?.toLowerCase().includes('overweight') || st.nutrition_status?.toLowerCase().includes('obese') || st.nutrition_status?.toLowerCase().includes('obesity')).length;
      const obesity = 0;

      return {
        id: s.id,
        name: s.name,
        cluster: s.cluster_name || 'Unassigned',
        totalStudents: total,
        sampleCount: total,
        male,
        female,
        assessed,
        pending,
        color: PALETTE_COLORS[idx % PALETTE_COLORS.length],
        nutrition: {
          normal: norm,
          wasted,
          severelyWasted: sevWasted,
          overweight: overwt,
          obesity
        }
      };
    });
  }, [liveSchools, liveStudents, filteredStudents, selectedCluster, selectedSchool]);

  // Aggregated dynamic metrics directly from filtered students
  const totalStudents = filteredStudents.length;
  const totalMale = useMemo(() => filteredStudents.filter(s => s.gender?.toLowerCase() === 'male').length, [filteredStudents]);
  const totalFemale = useMemo(() => filteredStudents.filter(s => s.gender?.toLowerCase() === 'female').length, [filteredStudents]);
  const malePercent = totalStudents > 0 ? ((totalMale / totalStudents) * 100).toFixed(1) : '0.0';
  const femalePercent = totalStudents > 0 ? ((totalFemale / totalStudents) * 100).toFixed(1) : '0.0';

  const totalSchoolsCount = activeSchoolsData.length;
  const totalClustersCount = useMemo(() => {
    if (selectedCluster !== 'ALL') return 1;
    if (liveClusters.length > 0) return liveClusters.length;
    return new Set(activeSchoolsData.map(s => s.cluster)).size || 1;
  }, [selectedCluster, liveClusters, activeSchoolsData]);

  const totalAssessmentsCount = useMemo(() => {
    if (selectedYear === 'ALL' && selectedCluster === 'ALL' && selectedSchool === 'ALL' && selectedGender === 'ALL' && selectedClass === 'ALL' && selectedSection === 'ALL' && selectedHealthCategory === 'ALL' && liveMetrics?.total_assessments) {
      return liveMetrics.total_assessments;
    }
    return filteredStudents.reduce((acc, st) => {
      const count = Array.isArray(st.assessments) ? st.assessments.length : (st.latest_assessment_date ? 1 : 0);
      return acc + count;
    }, 0);
  }, [filteredStudents, liveMetrics, selectedYear, selectedCluster, selectedSchool, selectedGender, selectedClass, selectedSection, selectedHealthCategory]);

  // Health Category Statistics from real data
  const healthStats = useMemo(() => {
    let normal = 0;
    let wasted = 0;
    let severelyWasted = 0;
    let overweight = 0;
    let obesity = 0;

    filteredStudents.forEach(st => {
      const nut = String(st.nutrition_status || '').toLowerCase();
      if (nut.includes('normal')) {
        normal += 1;
      } else if (nut.includes('severe')) {
        severelyWasted += 1;
      } else if (nut.includes('wasted') || nut.includes('thinness')) {
        wasted += 1;
      } else if (nut.includes('overweight') || nut.includes('obese') || nut.includes('obesity')) {
        overweight += 1;
      } else {
        normal += 1;
      }
    });

    const total = filteredStudents.length;
    const calcPct = (cnt) => total > 0 ? `${((cnt / total) * 100).toFixed(1)}%` : '0.0%';

    return {
      total,
      normal: { count: normal, pct: calcPct(normal), color: '#22C55E' },
      wasted: { count: wasted, pct: calcPct(wasted), color: '#F59E0B' },
      severelyWasted: { count: severelyWasted, pct: calcPct(severelyWasted), color: '#F97316' },
      overweight: { count: overweight, pct: calcPct(overweight), color: '#EF4444' },
      obesity: { count: 0, pct: '0.0%', color: '#991B1B' }
    };
  }, [filteredStudents]);

  // Donut Segments for Overview Health Donut (r=54, C=339)
  const healthSegments = useMemo(() => {
    const total = healthStats.total;
    const C = 339;
    if (total === 0) return [];

    const items = [
      { key: 'normal', ...healthStats.normal },
      { key: 'wasted', ...healthStats.wasted },
      { key: 'severelyWasted', ...healthStats.severelyWasted },
      { key: 'overweight', ...healthStats.overweight },
    ];

    let cumulativeOffset = 0;
    return items.map((item) => {
      const dashLength = (item.count / total) * C;
      const offset = -cumulativeOffset;
      cumulativeOffset += dashLength;
      return {
        ...item,
        dashArray: `${dashLength.toFixed(1)} ${C}`,
        dashOffset: offset.toFixed(1),
        visible: item.count > 0
      };
    });
  }, [healthStats]);

  // Donut Segments for Detail Health Donut (r=72, C=452)
  const healthSegmentsDetail = useMemo(() => {
    const total = healthStats.total;
    const C = 452;
    if (total === 0) return [];

    const items = [
      { key: 'normal', ...healthStats.normal },
      { key: 'wasted', ...healthStats.wasted },
      { key: 'severelyWasted', ...healthStats.severelyWasted },
      { key: 'overweight', ...healthStats.overweight },
    ];

    let cumulativeOffset = 0;
    return items.map((item) => {
      const dashLength = (item.count / total) * C;
      const offset = -cumulativeOffset;
      cumulativeOffset += dashLength;
      return {
        ...item,
        dashArray: `${dashLength.toFixed(1)} ${C}`,
        dashOffset: offset.toFixed(1),
        visible: item.count > 0
      };
    });
  }, [healthStats]);

  // Real Academic Year Trends computed dynamically from students
  const realYearTrends = useMemo(() => {
    const yearMap = new Map();
    liveStudents.forEach(st => {
      let yr = '2026';
      if (st.academic_year) {
        yr = String(st.academic_year).split('-')[0].trim();
      } else if (st.created_at) {
        yr = String(new Date(st.created_at).getFullYear());
      }
      if (!yearMap.has(yr)) {
        yearMap.set(yr, { year: yr, students: 0, male: 0, female: 0, assessed: 0 });
      }
      const entry = yearMap.get(yr);
      entry.students += 1;
      if (st.gender?.toLowerCase() === 'male') entry.male += 1;
      if (st.gender?.toLowerCase() === 'female') entry.female += 1;
      if ((st.assessments && st.assessments.length > 0) || st.latest_assessment_date) entry.assessed += 1;
    });

    if (yearMap.size === 0) {
      yearMap.set('2026', { year: '2026', students: 0, male: 0, female: 0, assessed: 0 });
    }

    const list = Array.from(yearMap.values()).sort((a, b) => String(a.year).localeCompare(String(b.year)));
    return list.map(item => ({
      ...item,
      coverage: item.students > 0 ? `${((item.assessed / item.students) * 100).toFixed(1)}%` : '0%'
    }));
  }, [liveStudents]);

  // Cluster-wise Health Statistics Table computed dynamically
  const clusterHealthStats = useMemo(() => {
    const map = new Map();
    const clusterNames = new Set();
    liveClusters.forEach(c => { if (c.name) clusterNames.add(c.name); });
    liveSchools.forEach(s => { if (s.cluster_name) clusterNames.add(s.cluster_name); });
    filteredStudents.forEach(st => { if (st.cluster_name) clusterNames.add(st.cluster_name); });

    clusterNames.forEach(cName => {
      if (selectedCluster === 'ALL' || selectedCluster.toLowerCase() === cName.toLowerCase()) {
        map.set(cName, {
          cluster: cName,
          normal: 0,
          wasted: 0,
          severelyWasted: 0,
          overweight: 0,
          obesity: 0,
          total: 0
        });
      }
    });

    filteredStudents.forEach(st => {
      const cName = st.cluster_name || 'Unassigned';
      if (!map.has(cName)) {
        if (selectedCluster === 'ALL' || selectedCluster.toLowerCase() === cName.toLowerCase()) {
          map.set(cName, {
            cluster: cName,
            normal: 0,
            wasted: 0,
            severelyWasted: 0,
            overweight: 0,
            obesity: 0,
            total: 0
          });
        }
      }
      const entry = map.get(cName);
      if (entry) {
        entry.total += 1;
        const nut = String(st.nutrition_status || '').toLowerCase();
        if (nut.includes('normal')) entry.normal += 1;
        else if (nut.includes('severe')) entry.severelyWasted += 1;
        else if (nut.includes('wasted') || nut.includes('thinness')) entry.wasted += 1;
        else if (nut.includes('overweight') || nut.includes('obese') || nut.includes('obesity')) entry.overweight += 1;
        else entry.normal += 1;
      }
    });

    return Array.from(map.values()).map(row => {
      const tot = row.total || 1;
      return {
        cluster: row.cluster,
        normal: `${row.normal} (${((row.normal / tot) * 100).toFixed(1)}%)`,
        wasted: `${row.wasted} (${((row.wasted / tot) * 100).toFixed(1)}%)`,
        severelyWasted: `${row.severelyWasted} (${((row.severelyWasted / tot) * 100).toFixed(1)}%)`,
        overweight: `${row.overweight} (${((row.overweight / tot) * 100).toFixed(1)}%)`,
        total: row.total
      };
    });
  }, [liveClusters, liveSchools, filteredStudents, selectedCluster]);

  // Detailed School Reports computed dynamically from active schools
  const detailedSchoolReports = useMemo(() => {
    return activeSchoolsData.map((s, index) => ({
      no: index + 1,
      school: s.name,
      total: s.totalStudents,
      male: s.male,
      female: s.female,
      assessed: s.assessed,
      pending: s.pending,
      normal: s.nutrition.normal,
      wasted: s.nutrition.wasted,
      severelyWasted: s.nutrition.severelyWasted,
      overweight: (s.nutrition.overweight || 0) + (s.nutrition.obesity || 0)
    }));
  }, [activeSchoolsData]);

  // Download Handlers
  const handleDownloadExcel = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'School,Cluster,Total Students,Male,Female,Assessed,Pending\n' +
      filteredSchools
        .map(
          (s) =>
            `"${s.name}","${s.cluster}",${s.totalStudents},${s.male},${s.female},${s.assessed},${s.pending}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Health_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
      {/* ========================================================================= */}
      {/* SCREEN 1: REPORTS & ANALYTICS OVERVIEW (IMAGE 1)                           */}
      {/* ========================================================================= */}
      {viewMode === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
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
                Reports & Analytics
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                Understand student health data across schools and years
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setViewMode('student_report')}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <FileSpreadsheet size={15} color="#16A34A" />
                <span>Student Report</span>
              </button>

              <button
                onClick={handleDownloadExcel}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <Download size={14} />
                <span>Download Excel</span>
              </button>

              <button
                onClick={handleDownloadPDF}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                flex: 1
              }}
            >
              {/* Year */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="ALL">All Years</option>
                </select>
              </div>

              {/* Cluster */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Cluster
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => {
                    setSelectedCluster(e.target.value);
                    setSelectedSchool('ALL');
                    setSelectedClass('ALL');
                    setSelectedSection('ALL');
                    setReportPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All Clusters</option>
                  {Array.from(new Set(activeSchoolsData.map(s => s.cluster).filter(Boolean))).map((cl) => (
                    <option key={cl} value={cl}>{cl}</option>
                  ))}
                </select>
              </div>

              {/* School */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedClass('ALL');
                    setSelectedSection('ALL');
                    setReportPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All Schools</option>
                  {activeSchoolsData
                    .filter(s => selectedCluster === 'ALL' || !s.cluster || s.cluster === selectedCluster)
                    .map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Class */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Class
                </label>
                <SearchableDropdown
                  value={selectedClass}
                  onChange={(val) => setSelectedClass(val)}
                  options={reportClassOptions}
                  allOptionLabel="All Classes"
                  placeholder="All Classes"
                  searchPlaceholder="Search class or group..."
                  icon={Layers}
                  minWidth="100%"
                />
              </div>

              {/* Section */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Section
                </label>
                <SearchableDropdown
                  value={selectedSection}
                  onChange={(val) => setSelectedSection(val)}
                  options={reportSectionOptions}
                  allOptionLabel="All Sections"
                  placeholder="All Sections"
                  searchPlaceholder="Search section or batch..."
                  icon={Users}
                  minWidth="100%"
                />
              </div>

              {/* Health Category */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Health Category
                </label>
                <select
                  value={selectedHealthCategory}
                  onChange={(e) => setSelectedHealthCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Normal">Normal</option>
                  <option value="Wasted">Wasted</option>
                  <option value="Severely Wasted">Severely Wasted</option>
                  <option value="Stunted">Stunted</option>
                  <option value="Severely Stunted">Severely Stunted</option>
                  <option value="Underweight">Underweight</option>
                  <option value="Severely Underweight">Severely Underweight</option>
                  <option value="Overweight">Overweight (incl. Obesity)</option>
                </select>
              </div>
            </div>

            {/* Apply Filters Button */}
            <div style={{ paddingTop: '18px' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F05A24',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(240, 90, 36, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04B18')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F05A24')}
              >
                <Filter size={14} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Top 4 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Total Students */}
            <div
              onClick={() => setViewMode('gender')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={24} color="#0284C7" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    {totalStudents.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center' }}>
                    ↑ 10%
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>vs. previous year</span>
              </div>
            </div>

            {/* Total Schools */}
            <div
              onClick={() => setViewMode('school_wise')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#CCFBF1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <School size={24} color="#0D9488" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Schools</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    12
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center' }}>
                    ↑ 20%
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>vs. previous year</span>
              </div>
            </div>

            {/* Total Clusters */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#FFEDD5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Network size={24} color="#EA580C" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Clusters</span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  3
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>No change vs. previous year</span>
              </div>
            </div>

            {/* Total Assessments */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ClipboardCheck size={24} color="#D97706" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Assessments</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    4,892
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', display: 'flex', alignItems: 'center' }}>
                    ↑ 18%
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>vs. previous year</span>
              </div>
            </div>
          </div>

          {/* 4 Interactive Chart Cards (2x2 Grid) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Chart 1: Student Gender Distribution (Clickable to Gender Analysis) */}
            <div
              onClick={() => setViewMode('gender')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F05A24';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="#F05A24" />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Student Gender Distribution
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Total {totalStudents.toLocaleString()} students
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#F05A24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Analysis <ArrowRight size={13} />
                </span>
              </div>

              {/* Donut Chart and Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '36px', minHeight: '190px' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="28"
                      strokeDasharray="194 377"
                      strokeDashoffset="0"
                      transform="rotate(-90 80 80)"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="28"
                      strokeDasharray="183 377"
                      strokeDashoffset="-194"
                      transform="rotate(-90 80 80)"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                      2,486
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>
                      Students
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', minWidth: '60px' }}>
                      Male
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {totalMale.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      {malePercent}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', minWidth: '60px' }}>
                      Female
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {totalFemale.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      {femalePercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: School-wise Student Distribution (Clickable to School-wise Analysis) */}
            <div
              onClick={() => setViewMode('school_wise')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F05A24';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <School size={18} color="#F05A24" />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      School-wise Student Distribution
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Top schools by student count
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#F05A24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Analysis <ArrowRight size={13} />
                </span>
              </div>

              {/* Horizontal Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {activeSchoolsData.slice(0, 5).map((item) => {
                  const maxCount = Math.max(...activeSchoolsData.map(s => s.totalStudents || 0), 1);
                  const count = item.totalStudents || item.sampleCount || 0;
                  const widthPercent = (count / maxCount) * 100;
                  return (
                    <div key={item.id || item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '145px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'right'
                        }}
                      >
                        {item.name}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: '14px',
                          backgroundColor: '#F1F5F9',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${widthPercent}%`,
                            height: '100%',
                            backgroundColor: item.color || '#F97316',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                      <span style={{ width: '32px', fontSize: '11.5px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingLeft: '155px',
                    paddingRight: '36px',
                    fontSize: '10px',
                    color: '#94A3B8',
                    marginTop: '4px'
                  }}
                >
                  <span>0</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                  <span>400</span>
                  <span>500</span>
                  <span>600</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#94A3B8', paddingLeft: '110px' }}>
                  Number of Students
                </div>
              </div>
            </div>

            {/* Chart 3: Year-wise Student Statistics (Clickable to Year-wise Statistics) */}
            <div
              onClick={() => setViewMode('year_wise')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F05A24';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart2 size={18} color="#F05A24" />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Year-wise Student Statistics
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Total students across years
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#F05A24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Analysis <ArrowRight size={13} />
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '14px', padding: '10px 10px 0 20px', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    bottom: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: '9.5px',
                    color: '#94A3B8',
                    textAlign: 'right',
                    width: '32px'
                  }}
                >
                  <span>3,000</span>
                  <span>2,000</span>
                  <span>1,000</span>
                  <span>0</span>
                </div>

                <div
                  style={{
                    flex: 1,
                    marginLeft: '36px',
                    height: '100%',
                    borderLeft: '1px solid #E2E8F0',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-around',
                    paddingBottom: '2px'
                  }}
                >
                  {YEAR_TRENDS.map((yt) => {
                    const heightPercent = (yt.students / 3000) * 100;
                    return (
                      <div
                        key={yt.year}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          width: '42px'
                        }}
                      >
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0F172A' }}>
                          {yt.students.toLocaleString()}
                        </span>
                        <div
                          style={{
                            width: '32px',
                            height: `${heightPercent}%`,
                            maxHeight: '130px',
                            backgroundColor: '#0D9488',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s ease'
                          }}
                        />
                        <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>
                          {yt.year}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart 4: Health Category Distribution (Clickable to Health Statistics) */}
            <div
              onClick={() => setViewMode('health_stats')}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F05A24';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart size={18} color="#F05A24" />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Health Category Distribution
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Nutritional status of all students
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '11.5px', color: '#F05A24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Statistics <ArrowRight size={13} />
                </span>
              </div>

              {/* Donut and Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', minHeight: '190px' }}>
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    <circle
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="24"
                      strokeDasharray="232 339"
                      strokeDashoffset="0"
                      transform="rotate(-90 75 75)"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="24"
                      strokeDasharray="52 339"
                      strokeDashoffset="-232"
                      transform="rotate(-90 75 75)"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="24"
                      strokeDasharray="26 339"
                      strokeDashoffset="-284"
                      transform="rotate(-90 75 75)"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="24"
                      strokeDasharray="17 339"
                      strokeDashoffset="-310"
                      transform="rotate(-90 75 75)"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="54"
                      fill="none"
                      stroke="#991B1B"
                      strokeWidth="24"
                      strokeDasharray="12 339"
                      strokeDashoffset="-327"
                      transform="rotate(-90 75 75)"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                      2,486
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                      Students
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Normal', color: '#22C55E', count: 1701, pct: '68.4%' },
                    { label: 'Wasted', color: '#F59E0B', count: 378, pct: '15.2%' },
                    { label: 'Severely Wasted', color: '#F97316', count: 194, pct: '7.8%' },
                    { label: 'Overweight', color: '#EF4444', count: 213, pct: '8.6%' }
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ minWidth: '95px', color: '#475569', fontWeight: 500 }}>{item.label}</span>
                      <span style={{ minWidth: '40px', fontWeight: 700, color: '#0F172A' }}>{item.count}</span>
                      <span style={{ color: '#64748B' }}>{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: HEALTH STATISTICS (SCREENSHOT 1)                                */}
      {/* ========================================================================= */}
      {viewMode === 'health_stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button
              onClick={() => setViewMode('overview')}
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
            <button
              onClick={() => setViewMode('overview')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                padding: 0
              }}
            >
              Reports & Analytics
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Health Statistics</span>
          </div>

          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
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
                Health Statistics
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                View the nutritional status distribution of students
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleDownloadExcel}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <Download size={14} />
                <span>Download Excel</span>
              </button>

              <button
                onClick={handleDownloadPDF}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ minWidth: '140px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div style={{ minWidth: '160px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Cluster
                </label>
                <select
                  value={selectedCluster}
                  onChange={(e) => setSelectedCluster(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All Clusters</option>
                  <option value="Cluster A">Cluster A</option>
                  <option value="Cluster B">Cluster B</option>
                  <option value="Cluster C">Cluster C</option>
                </select>
              </div>

              <div style={{ minWidth: '180px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value);
                    setSelectedClass('ALL');
                    setSelectedSection('ALL');
                    setReportPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">All Schools</option>
                  {activeSchoolsData
                    .filter(s => selectedCluster === 'ALL' || !s.cluster || s.cluster === selectedCluster)
                    .map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                </select>
              </div>

              <div style={{ minWidth: '140px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                >
                  <option value="All Grades">All Grades</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                </select>
              </div>
            </div>

            <div style={{ paddingTop: '18px' }}>
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#F05A24',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(240, 90, 36, 0.35)'
                }}
              >
                <Filter size={14} />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Top 5 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px'
            }}
          >
            {/* Normal */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} color="#16A34A" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Normal</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    1,701
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16A34A' }}>
                    68.4%
                  </span>
                </div>
              </div>
            </div>

            {/* Wasted */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} color="#D97706" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Wasted</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    378
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#D97706' }}>
                    15.2%
                  </span>
                </div>
              </div>
            </div>

            {/* Severely Wasted */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFEDD5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} color="#EA580C" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Severely Wasted</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    194
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#EA580C' }}>
                    7.8%
                  </span>
                </div>
              </div>
            </div>

            {/* Overweight */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} color="#DB2777" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Overweight</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    213
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#DB2777' }}>
                    8.6%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Overall Health Distribution Donut */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#F05A24" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Overall Health Distribution
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Total 2,486 students
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {/* Normal: 68.4% (309 / 452) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="32"
                    strokeDasharray="309 452"
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                  />
                  {/* Wasted: 15.2% (69 / 452) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="32"
                    strokeDasharray="69 452"
                    strokeDashoffset="-309"
                    transform="rotate(-90 100 100)"
                  />
                  {/* Severely Wasted: 7.8% (35 / 452) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="32"
                    strokeDasharray="35 452"
                    strokeDashoffset="-378"
                    transform="rotate(-90 100 100)"
                  />
                  {/* Overweight: 8.6% (39 / 452) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="32"
                    strokeDasharray="39 452"
                    strokeDashoffset="-413"
                    transform="rotate(-90 100 100)"
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                    2,486
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                    Students
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Normal', color: '#22C55E', count: '1,701', pct: '68.4%' },
                  { label: 'Wasted', color: '#F59E0B', count: '378', pct: '15.2%' },
                  { label: 'Severely Wasted', color: '#F97316', count: '194', pct: '7.8%' },
                  { label: 'Overweight', color: '#EF4444', count: '213', pct: '8.6%' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                    <span style={{ minWidth: '120px', color: '#475569', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ minWidth: '55px', fontWeight: 800, color: '#0F172A' }}>{item.count}</span>
                    <span style={{ color: '#64748B' }}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section: Cluster-wise Health Statistics Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <School size={18} color="#F05A24" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Cluster-wise Health Statistics
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Distribution of nutritional status across clusters
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Cluster</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                        Normal
                      </span>
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                        Wasted
                      </span>
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                        Severely Wasted
                      </span>
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                        Overweight
                      </span>
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(clusterHealthStats.length > 0 ? clusterHealthStats : []).map((row) => (
                    <tr
                      key={row.cluster}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        {row.cluster}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#16A34A', fontWeight: 500 }}>
                        {row.normal}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#D97706', fontWeight: 500 }}>
                        {row.wasted}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#EA580C', fontWeight: 500 }}>
                        {row.severelyWasted}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#DC2626', fontWeight: 500 }}>
                        {row.overweight}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Showing 1-5 of 5 clusters</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  1
                </button>
                <button
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: SCHOOL-WISE STUDENT REPORT (SCREENSHOT 2)                        */}
      {/* ========================================================================= */}
      {viewMode === 'student_report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button
              onClick={() => setViewMode('overview')}
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
            <button
              onClick={() => setViewMode('overview')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                padding: 0
              }}
            >
              Reports & Analytics
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>School-wise Student Report</span>
          </div>

          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
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
                School-wise Student Report
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                Detailed list of students and health status by school
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleDownloadExcel}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <FileSpreadsheet size={15} color="#16A34A" />
                <span>Download Excel</span>
              </button>

              <button
                onClick={handleDownloadPDF}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <FileText size={15} color="#DC2626" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={() => window.print()}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <Printer size={15} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Filter Summary Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#E0F2FE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Filter size={16} color="#0284C7" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Filter Summary
                  </h4>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Showing data based on the applied filters
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewMode('overview')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #0284C7',
                  backgroundColor: '#FFFFFF',
                  color: '#0284C7',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Filter size={13} />
                <span>Edit Filters</span>
              </button>
            </div>

            {/* 5 Filter Blocks Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}
            >
              {/* Year */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <Calendar size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Year</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>2026</div>
                </div>
              </div>

              {/* Cluster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <Network size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Cluster</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>All Clusters</div>
                </div>
              </div>

              {/* School */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <School size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>School</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>All Schools</div>
                </div>
              </div>

              {/* Grade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <GraduationCap size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Grade</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>All Grades</div>
                </div>
              </div>

              {/* Report Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
                <FileText size={16} color="#64748B" />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Report Type</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>School-wise Student Report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Report Table Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <School size={18} color="#F05A24" />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    School-wise Student Report
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Showing detailed student data for each school
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Total Students: <strong style={{ color: '#0F172A', fontWeight: 800 }}>2,486</strong>
              </div>
            </div>

            {/* 12-Column Comprehensive Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1050px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>#</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>School</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Total Students</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Male</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Female</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Assessed</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Pending</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Normal</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Wasted</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Severely Wasted</th>
                    <th style={{ padding: '10px 12px', fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>Overweight</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailedSchoolReports.length > 0 ? detailedSchoolReports : []).map((row) => (
                    <tr
                      key={row.no}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B' }}>{row.no}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>
                        {row.school}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                        {row.total}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#475569' }}>{row.male}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#475569' }}>{row.female}</td>
                      {/* Assessed pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.assessed}
                        </span>
                      </td>
                      {/* Pending pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FFEDD5', color: '#EA580C', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.pending}
                        </span>
                      </td>
                      {/* Normal pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.normal}
                        </span>
                      </td>
                      {/* Wasted pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.wasted}
                        </span>
                      </td>
                      {/* Severely Wasted pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FFEDD5', color: '#EA580C', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.severelyWasted}
                        </span>
                      </td>
                      {/* Overweight pill */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#FCE7F3', color: '#DB2777', padding: '2px 8px', borderRadius: '10px' }}>
                          {row.overweight}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Page size and pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Showing 1-10 of 25 schools
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={reportPageSize}
                  onChange={(e) => setReportPageSize(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: '#F05A24',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    1
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    2
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    3
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: GENDER ANALYSIS (PREVIOUS IMAGES)                                */}
      {/* ========================================================================= */}
      {viewMode === 'gender' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button
              onClick={() => setViewMode('overview')}
              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <Home size={15} />
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <button
              onClick={() => setViewMode('overview')}
              style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 500, fontSize: '13px', padding: 0 }}
            >
              Reports & Analytics
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Gender Analysis</span>
          </div>

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Gender Analysis
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 400 }}>
              View the gender distribution of students across schools
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="#0284C7" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Students</span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>2,486</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#16A34A" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Male Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>1,280</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>51.5%</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#DB2777" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Female Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>1,206</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>48.5%</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#F05A24" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Overall Gender Distribution
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Total 2,486 students</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="68" fill="none" stroke="#0D9488" strokeWidth="32" strokeDasharray="220 427" strokeDashoffset="0" transform="rotate(-90 90 90)" />
                  <circle cx="90" cy="90" r="68" fill="none" stroke="#F97316" strokeWidth="32" strokeDasharray="207 427" strokeDashoffset="-220" transform="rotate(-90 90 90)" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>2,486</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Students</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', minWidth: '70px' }}>Male</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>1,280</span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>51.5%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', minWidth: '70px' }}>Female</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>1,206</span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>48.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: SCHOOL-WISE ANALYSIS                                            */}
      {/* ========================================================================= */}
      {viewMode === 'school_wise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button onClick={() => setViewMode('overview')} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <Home size={15} />
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <button onClick={() => setViewMode('overview')} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 500, fontSize: '13px', padding: 0 }}>
              Reports & Analytics
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>School-wise Analysis</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                School-wise Analysis
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 400 }}>
                Compare student health data across schools
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handleDownloadExcel} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={14} />
                <span>Download Excel</span>
              </button>
              <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                <Download size={14} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* Horizontal multi-color bar chart */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="#F05A24" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>School-wise Student Count</h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Total number of students in each school (2026)</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
              {activeSchoolsData.map((item) => {
                const maxStudentCount = Math.max(...activeSchoolsData.map(s => s.totalStudents || 0), 1);
                const count = item.totalStudents || item.sampleCount || 0;
                const widthPercent = (count / maxStudentCount) * 100;
                return (
                  <div key={item.id || item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '160px', fontSize: '12px', fontWeight: 500, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </span>
                    <div style={{ flex: 1, height: '18px', backgroundColor: '#F1F5F9', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${widthPercent}%`, height: '100%', backgroundColor: item.color || '#0D9488', borderRadius: '6px', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ width: '40px', fontSize: '12px', fontWeight: 700, color: '#0F172A', textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: YEAR-WISE STATISTICS                                            */}
      {/* ========================================================================= */}
      {viewMode === 'year_wise' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button onClick={() => setViewMode('overview')} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
              <Home size={15} />
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <button onClick={() => setViewMode('overview')} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: 500, fontSize: '13px', padding: 0 }}>
              Reports & Analytics
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Year-wise Statistics</span>
          </div>

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Year-wise Statistics
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 400 }}>
              Track student health data trends across academic years
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} color="#0284C7" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Students (All Years)</span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>6,446</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#16A34A" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Male Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>3,312</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>51.4%</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#FCE7F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#DB2777" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Female Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A' }}>3,134</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>48.6%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
