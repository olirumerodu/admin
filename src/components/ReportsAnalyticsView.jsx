import React, { useState, useMemo } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';

// Master Dataset for schools, years, gender, nutrition and assessments
const MASTER_SCHOOLS_DATA = [
  {
    id: 'greenwood',
    name: 'Greenwood Public School',
    cluster: 'Cluster A',
    totalStudents: 938,
    sampleCount: 486,
    male: 486,
    female: 452,
    assessed: 812,
    pending: 126,
    color: '#0D9488', // Teal
    classes: {
      'Grade 1': { total: 180, male: 92, female: 88, assessed: 160 },
      'Grade 2': { total: 190, male: 98, female: 92, assessed: 170 },
      'Grade 3': { total: 195, male: 102, female: 93, assessed: 168 },
      'Grade 4': { total: 185, male: 96, female: 89, assessed: 158 },
      'Grade 5': { total: 188, male: 98, female: 90, assessed: 156 }
    },
    nutrition: {
      normal: 642,
      wasted: 142,
      severelyWasted: 74,
      overweight: 48,
      obesity: 32
    }
  },
  {
    id: 'oakridge',
    name: 'Oakridge Academy',
    cluster: 'Cluster A',
    totalStudents: 622,
    sampleCount: 324,
    male: 324,
    female: 298,
    assessed: 540,
    pending: 82,
    color: '#3B82F6', // Blue
    classes: {
      'Grade 1': { total: 120, male: 62, female: 58, assessed: 105 },
      'Grade 2': { total: 124, male: 65, female: 59, assessed: 110 },
      'Grade 3': { total: 130, male: 68, female: 62, assessed: 112 },
      'Grade 4': { total: 122, male: 64, female: 58, assessed: 106 },
      'Grade 5': { total: 126, male: 65, female: 61, assessed: 107 }
    },
    nutrition: {
      normal: 425,
      wasted: 94,
      severelyWasted: 48,
      overweight: 33,
      obesity: 22
    }
  },
  {
    id: 'st-jude',
    name: 'St. Jude High School',
    cluster: 'Cluster B',
    totalStudents: 420,
    sampleCount: 214,
    male: 214,
    female: 206,
    assessed: 356,
    pending: 64,
    color: '#8B5CF6', // Purple
    classes: {
      'Grade 1': { total: 80, male: 41, female: 39, assessed: 68 },
      'Grade 2': { total: 84, male: 43, female: 41, assessed: 72 },
      'Grade 3': { total: 86, male: 44, female: 42, assessed: 74 },
      'Grade 4': { total: 82, male: 42, female: 40, assessed: 70 },
      'Grade 5': { total: 88, male: 44, female: 44, assessed: 72 }
    },
    nutrition: {
      normal: 288,
      wasted: 64,
      severelyWasted: 33,
      overweight: 21,
      obesity: 14
    }
  },
  {
    id: 'riverside',
    name: 'Riverside International',
    cluster: 'Cluster B',
    totalStudents: 374,
    sampleCount: 198,
    male: 198,
    female: 176,
    assessed: 318,
    pending: 56,
    color: '#F97316', // Orange
    classes: {
      'Grade 1': { total: 72, male: 38, female: 34, assessed: 62 },
      'Grade 2': { total: 74, male: 39, female: 35, assessed: 64 },
      'Grade 3': { total: 78, male: 41, female: 37, assessed: 66 },
      'Grade 4': { total: 74, male: 39, female: 35, assessed: 62 },
      'Grade 5': { total: 76, male: 41, female: 35, assessed: 64 }
    },
    nutrition: {
      normal: 256,
      wasted: 57,
      severelyWasted: 29,
      overweight: 19,
      obesity: 13
    }
  },
  {
    id: 'sunrise',
    name: 'Sunrise Global School',
    cluster: 'Cluster C',
    totalStudents: 132,
    sampleCount: 176,
    male: 58,
    female: 74,
    assessed: 110,
    pending: 22,
    color: '#F43F5E', // Pink
    classes: {
      'Grade 1': { total: 26, male: 11, female: 15, assessed: 22 },
      'Grade 2': { total: 26, male: 12, female: 14, assessed: 21 },
      'Grade 3': { total: 28, male: 12, female: 16, assessed: 24 },
      'Grade 4': { total: 26, male: 11, female: 15, assessed: 21 },
      'Grade 5': { total: 26, male: 12, female: 14, assessed: 22 }
    },
    nutrition: {
      normal: 90,
      wasted: 21,
      severelyWasted: 10,
      overweight: 6,
      obesity: 5
    }
  }
];

// Academic Year Trends Dataset
const YEAR_TRENDS = [
  { year: 2022, students: 1420, male: 730, female: 690, assessed: 1240, coverage: '87.3%' },
  { year: 2023, students: 1690, male: 870, female: 820, assessed: 1490, coverage: '88.2%' },
  { year: 2024, students: 1820, male: 940, female: 880, assessed: 1650, coverage: '90.7%' },
  { year: 2025, students: 2140, male: 1106, female: 1034, assessed: 1980, coverage: '92.5%' },
  { year: 2026, students: 2486, male: 1266, female: 1220, assessed: 2312, coverage: '93.0%' }
];

export default function ReportsAnalyticsView() {
  // Navigation Mode: 'overview' (Image 1) | 'gender' (Images 2/3) | 'school_wise' (Image 4) | 'year_wise' (Image 5)
  const [viewMode, setViewMode] = useState('overview');

  // Filter States
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedCluster, setSelectedCluster] = useState('ALL');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedHealthCategory, setSelectedHealthCategory] = useState('ALL');

  // Filtered dataset
  const filteredSchools = useMemo(() => {
    return MASTER_SCHOOLS_DATA.filter((s) => {
      const matchCluster = selectedCluster === 'ALL' || s.cluster === selectedCluster;
      const matchSchool = selectedSchool === 'ALL' || s.name === selectedSchool;
      return matchCluster && matchSchool;
    });
  }, [selectedCluster, selectedSchool]);

  // Aggregated dynamic metrics
  const totalStudents = useMemo(() => {
    return filteredSchools.reduce((acc, s) => acc + s.sampleCount, 0) || 2486;
  }, [filteredSchools]);

  const totalMale = useMemo(() => {
    return filteredSchools.reduce((acc, s) => acc + s.male, 0) || 1280;
  }, [filteredSchools]);

  const totalFemale = useMemo(() => {
    return filteredSchools.reduce((acc, s) => acc + s.female, 0) || 1206;
  }, [filteredSchools]);

  const malePercent = ((totalMale / (totalStudents || 1)) * 100).toFixed(1);
  const femalePercent = ((totalFemale / (totalStudents || 1)) * 100).toFixed(1);

  // Nutrition status breakdown
  const nutritionCounts = useMemo(() => {
    return filteredSchools.reduce(
      (acc, s) => {
        acc.normal += s.nutrition.normal;
        acc.wasted += s.nutrition.wasted;
        acc.severelyWasted += s.nutrition.severelyWasted;
        acc.overweight += s.nutrition.overweight;
        acc.obesity += s.nutrition.obesity;
        return acc;
      },
      { normal: 0, wasted: 0, severelyWasted: 0, overweight: 0, obesity: 0 }
    );
  }, [filteredSchools]);

  const totalNutr =
    nutritionCounts.normal +
      nutritionCounts.wasted +
      nutritionCounts.severelyWasted +
      nutritionCounts.overweight +
      nutritionCounts.obesity || 2486;

  const normalPct = ((nutritionCounts.normal / totalNutr) * 100).toFixed(1);
  const wastedPct = ((nutritionCounts.wasted / totalNutr) * 100).toFixed(1);
  const severelyWastedPct = ((nutritionCounts.severelyWasted / totalNutr) * 100).toFixed(1);
  const overweightPct = ((nutritionCounts.overweight / totalNutr) * 100).toFixed(1);
  const obesityPct = ((nutritionCounts.obesity / totalNutr) * 100).toFixed(1);

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
                  <option value="Cluster D">Cluster D</option>
                  <option value="Cluster E">Cluster E</option>
                  <option value="Cluster F">Cluster F</option>
                </select>
              </div>

              {/* School */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
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
                  <option value="Greenwood Public School">Greenwood Public School</option>
                  <option value="Oakridge Academy">Oakridge Academy</option>
                  <option value="St. Jude High School">St. Jude High School</option>
                  <option value="Riverside International">Riverside International</option>
                  <option value="Sunrise Global School">Sunrise Global School</option>
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
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
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
                  <option value="ALL">All Classes</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                </select>
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
                  <option value="Overweight">Overweight</option>
                  <option value="Obesity">Obesity</option>
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
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {/* Male arc (51.5% -> ~185.4 deg) */}
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
                    {/* Female arc (48.5% -> ~174.6 deg) */}
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
                  {/* Center Text */}
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

                {/* Legend Breakdown */}
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
                {[
                  { name: 'Greenwood Public School', count: 486 },
                  { name: 'Oakridge Academy', count: 324 },
                  { name: 'St. Jude High School', count: 214 },
                  { name: 'Riverside International', count: 198 },
                  { name: 'Sunrise Global School', count: 176 }
                ].map((item) => {
                  const widthPercent = (item.count / 600) * 100;
                  return (
                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            backgroundColor: '#F97316',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>
                      <span style={{ width: '32px', fontSize: '11.5px', fontWeight: 700, color: '#0F172A' }}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}

                {/* X Axis ticks */}
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

              {/* Vertical Bars Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '14px', padding: '10px 10px 0 20px', position: 'relative' }}>
                {/* Y Axis Grid & Labels */}
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

            {/* Chart 4: Health Category Distribution (Nutritional status) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
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

              {/* Donut and Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', minHeight: '190px' }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 150 150">
                    {/* Normal: 68.4% (258 / 377) */}
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
                    {/* Wasted: 15.2% (52 / 339) */}
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
                    {/* Severely Wasted: 7.8% (26 / 339) */}
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
                    {/* Overweight: 5.1% (17 / 339) */}
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
                    {/* Obesity: 3.5% (12 / 339) */}
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
                  {/* Center Text */}
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

                {/* Legend list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Normal', color: '#22C55E', count: 1701, pct: '68.4%' },
                    { label: 'Wasted', color: '#F59E0B', count: 378, pct: '15.2%' },
                    { label: 'Severely Wasted', color: '#F97316', count: 194, pct: '7.8%' },
                    { label: 'Overweight', color: '#EF4444', count: 127, pct: '5.1%' },
                    { label: 'Obesity', color: '#991B1B', count: 86, pct: '3.5%' }
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
      {/* SCREEN 2 & 3: GENDER ANALYSIS (IMAGES 2 & 3)                               */}
      {/* ========================================================================= */}
      {viewMode === 'gender' && (
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
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Gender Analysis</span>
          </div>

          {/* Title */}
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
              Gender Analysis
            </h1>
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748B',
                margin: '4px 0 0 0',
                fontWeight: 400
              }}
            >
              View the gender distribution of students across schools
            </p>
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
              {/* Year */}
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

              {/* Cluster */}
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

              {/* School */}
              <div style={{ minWidth: '180px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
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
                  <option value="Greenwood Public School">Greenwood Public School</option>
                  <option value="Oakridge Academy">Oakridge Academy</option>
                  <option value="St. Jude High School">St. Jude High School</option>
                  <option value="Riverside International">Riverside International</option>
                  <option value="Sunrise Global School">Sunrise Global School</option>
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

          {/* Top 3 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Total Students */}
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
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  2,486
                </div>
              </div>
            </div>

            {/* Male Students */}
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
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={24} color="#16A34A" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Male Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    1,280
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                    51.5%
                  </span>
                </div>
              </div>
            </div>

            {/* Female Students */}
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
                  backgroundColor: '#FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={24} color="#DB2777" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Female Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    1,206
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                    48.5%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Gender Distribution Donut */}
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
                  Overall Gender Distribution
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Total 2,486 students
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px', padding: '16px 0' }}>
              {/* SVG Donut */}
              <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle
                    cx="90"
                    cy="90"
                    r="68"
                    fill="none"
                    stroke="#0D9488"
                    strokeWidth="32"
                    strokeDasharray="220 427"
                    strokeDashoffset="0"
                    transform="rotate(-90 90 90)"
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r="68"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="32"
                    strokeDasharray="207 427"
                    strokeDashoffset="-220"
                    transform="rotate(-90 90 90)"
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

              {/* Legend Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', minWidth: '70px' }}>
                    Male
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    1,280
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    51.5%
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F97316' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', minWidth: '70px' }}>
                    Female
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                    1,206
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    48.5%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: School-wise Gender Distribution Table */}
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
                  School-wise Gender Distribution
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Number of male and female students in each school
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>School ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Male ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Female ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Total ↕</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Greenwood Public School', male: 486, female: 452, total: 938 },
                    { name: 'Oakridge Academy', male: 324, female: 298, total: 622 },
                    { name: 'St. Jude High School', male: 214, female: 206, total: 420 },
                    { name: 'Riverside International', male: 198, female: 176, total: 374 },
                    { name: 'Sunrise Global School', male: 58, female: 74, total: 132 }
                  ].map((row) => (
                    <tr
                      key={row.name}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.male}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.female}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Showing 1-5 of 5 schools</span>
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
      {/* SCREEN 4: SCHOOL-WISE ANALYSIS (IMAGE 4)                                   */}
      {/* ========================================================================= */}
      {viewMode === 'school_wise' && (
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
            <span style={{ color: '#0F172A', fontWeight: 600 }}>School-wise Analysis</span>
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
                School-wise Analysis
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                Compare student health data across schools
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
                  onChange={(e) => setSelectedSchool(e.target.value)}
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
                  <option value="Greenwood Public School">Greenwood Public School</option>
                  <option value="Oakridge Academy">Oakridge Academy</option>
                  <option value="St. Jude High School">St. Jude High School</option>
                  <option value="Riverside International">Riverside International</option>
                  <option value="Sunrise Global School">Sunrise Global School</option>
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

          {/* Top Section: Multi-colored Horizontal Bar Chart */}
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
                  School-wise Student Count
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Total number of students in each school (2026)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
              {[
                { name: 'Greenwood Public School', count: 938, color: '#0D9488' },
                { name: 'Oakridge Academy', count: 622, color: '#3B82F6' },
                { name: 'St. Jude High School', count: 420, color: '#8B5CF6' },
                { name: 'Riverside International', count: 374, color: '#F97316' },
                { name: 'Sunrise Global School', count: 132, color: '#F43F5E' }
              ].map((item) => {
                const widthPercent = (item.count / 1000) * 100;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        width: '160px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#475569',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {item.name}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '18px',
                        backgroundColor: '#F1F5F9',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPercent}%`,
                          height: '100%',
                          backgroundColor: item.color,
                          borderRadius: '6px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ width: '40px', fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                      {item.count}
                    </span>
                  </div>
                );
              })}

              {/* X Axis scale */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingLeft: '172px',
                  paddingRight: '46px',
                  fontSize: '10.5px',
                  color: '#94A3B8',
                  marginTop: '4px'
                }}
              >
                <span>0</span>
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
                <span>1,000</span>
              </div>
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#94A3B8', paddingLeft: '130px' }}>
                Number of Students
              </div>
            </div>
          </div>

          {/* Bottom Section: School-wise Details Table */}
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
                  School-wise Details
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Breakdown of total, gender and assessment status for each school
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>School ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Total Students ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Male ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Female ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessed ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Pending ↕</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Greenwood Public School', total: 938, male: 486, female: 452, assessed: 812, pending: 126 },
                    { name: 'Oakridge Academy', total: 622, male: 324, female: 298, assessed: 540, pending: 82 },
                    { name: 'St. Jude High School', total: 420, male: 214, female: 206, assessed: 356, pending: 64 },
                    { name: 'Riverside International', total: 374, male: 198, female: 176, assessed: 318, pending: 56 },
                    { name: 'Sunrise Global School', total: 132, male: 58, female: 74, assessed: 110, pending: 22 }
                  ].map((row) => (
                    <tr
                      key={row.name}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                        {row.total}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.male}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.female}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.assessed}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: '#FFEDD5',
                            color: '#EA580C',
                            padding: '3px 12px',
                            borderRadius: '12px',
                            display: 'inline-block'
                          }}
                        >
                          {row.pending}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Showing 1-5 of 5 schools</span>
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
      {/* SCREEN 5: YEAR-WISE STATISTICS (IMAGE 5)                                   */}
      {/* ========================================================================= */}
      {viewMode === 'year_wise' && (
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
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Year-wise Statistics</span>
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
                Year-wise Statistics
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                Track student health data trends across academic years
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
                  value="All Years"
                  onChange={() => {}}
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
                  <option value="All Years">All Years</option>
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
                  value="All Clusters"
                  onChange={() => {}}
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
                  <option value="All Clusters">All Clusters</option>
                  <option value="Cluster A">Cluster A</option>
                  <option value="Cluster B">Cluster B</option>
                </select>
              </div>

              <div style={{ minWidth: '180px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  School
                </label>
                <select
                  value="All Schools"
                  onChange={() => {}}
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
                  <option value="All Schools">All Schools</option>
                  <option value="Greenwood Public School">Greenwood Public School</option>
                  <option value="Oakridge Academy">Oakridge Academy</option>
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

          {/* Top 3 KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Total Students (All Years) */}
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
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Students (All Years)</span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  6,446
                </div>
              </div>
            </div>

            {/* Total Male Students */}
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
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={24} color="#16A34A" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Male Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    3,312
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                    51.4%
                  </span>
                </div>
              </div>
            </div>

            {/* Total Female Students */}
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
                  backgroundColor: '#FCE7F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={24} color="#DB2777" />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>Total Female Students</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                    3,134
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                    48.6%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Clustered Multi-Bar Chart */}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="#F05A24" />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Student Count by Year
                  </h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Total number of students across academic years
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Total Students</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Male</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F43F5E' }} />
                  <span style={{ color: '#475569', fontWeight: 500 }}>Female</span>
                </div>
              </div>
            </div>

            {/* Clustered Bars Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '240px', gap: '14px', padding: '16px 10px 0 20px', position: 'relative' }}>
              {/* Y Axis Grid & Labels */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  bottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '10px',
                  color: '#94A3B8',
                  textAlign: 'right',
                  width: '36px'
                }}
              >
                <span>3,000</span>
                <span>2,500</span>
                <span>2,000</span>
                <span>1,500</span>
                <span>1,000</span>
                <span>500</span>
                <span>0</span>
              </div>

              <div
                style={{
                  flex: 1,
                  marginLeft: '42px',
                  height: '100%',
                  borderLeft: '1px solid #E2E8F0',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  paddingBottom: '2px'
                }}
              >
                {[
                  { year: 2024, total: 1820, male: 940, female: 880 },
                  { year: 2025, total: 2140, male: 1106, female: 1034 },
                  { year: 2026, total: 2486, male: 1266, female: 1220 }
                ].map((item) => {
                  const totalH = (item.total / 3000) * 100;
                  const maleH = (item.male / 3000) * 100;
                  const femaleH = (item.female / 3000) * 100;

                  return (
                    <div
                      key={item.year}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {/* 3 bars clustered */}
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                        {/* Total Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                            {item.total.toLocaleString()}
                          </span>
                          <div
                            style={{
                              width: '54px',
                              height: `${totalH * 1.8}px`,
                              maxHeight: '170px',
                              backgroundColor: '#0D9488',
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                        </div>

                        {/* Male Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                            {item.male.toLocaleString()}
                          </span>
                          <div
                            style={{
                              width: '54px',
                              height: `${maleH * 1.8}px`,
                              maxHeight: '170px',
                              backgroundColor: '#3B82F6',
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                        </div>

                        {/* Female Bar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A' }}>
                            {item.female.toLocaleString()}
                          </span>
                          <div
                            style={{
                              width: '54px',
                              height: `${femaleH * 1.8}px`,
                              maxHeight: '170px',
                              backgroundColor: '#F43F5E',
                              borderRadius: '4px 4px 0 0'
                            }}
                          />
                        </div>
                      </div>

                      {/* Year label below */}
                      <span style={{ fontSize: '11.5px', color: '#475569', fontWeight: 600 }}>
                        {item.year}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Section: Year-wise Details Table */}
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
                  Year-wise Details
                </h3>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Detailed breakdown of student statistics by year
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Year ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Total Students ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Male ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Female ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Assessed ↕</th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Coverage ↕</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { year: '2024', total: '1,820', male: '940 (51.6%)', female: '880 (48.4%)', assessed: '1,650', coverage: '90.7%' },
                    { year: '2025', total: '2,140', male: '1,106 (51.7%)', female: '1,034 (48.3%)', assessed: '1,980', coverage: '92.5%' },
                    { year: '2026', total: '2,486', male: '1,266 (50.9%)', female: '1,220 (49.1%)', assessed: '2,312', coverage: '93.0%' }
                  ].map((row) => (
                    <tr
                      key={row.year}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                        {row.year}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        {row.total}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.male}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.female}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                        {row.assessed}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: row.coverage,
                                height: '100%',
                                backgroundColor: '#16A34A',
                                borderRadius: '3px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A' }}>
                            {row.coverage}
                          </span>
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
    </div>
  );
}
