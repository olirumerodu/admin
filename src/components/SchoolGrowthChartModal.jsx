import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Printer, 
  School, 
  FileText, 
  Users, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  TrendingUp,
  CheckCircle2,
  Building2,
  RotateCcw
} from 'lucide-react';
import StudentHealthLogo from './StudentHealthLogo';
import { api } from '../services/api';

const ROMAN_TO_NUM = {
  'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
  'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10',
  'xi': '11', 'xii': '12'
};

const normalizeClassNumber = (val) => {
  if (!val) return '';
  const clean = String(val).replace(/^(class|grade)\s*/i, '').replace(/(st|nd|rd|th)$/i, '').trim();
  const lower = clean.toLowerCase();
  if (ROMAN_TO_NUM[lower] !== undefined) return ROMAN_TO_NUM[lower];
  return clean;
};

const cleanStr = (v) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();

export default function SchoolGrowthChartModal({ isOpen, onClose, school, students = [], clusterName }) {
  const printContentRef = useRef(null);
  const [fetchedStudents, setFetchedStudents] = useState([]);
  const [loadingSchoolData, setLoadingSchoolData] = useState(false);

  // Flexible school matcher tokens
  const sId = cleanStr(school?.id);
  const sName = cleanStr(school?.name);
  const sCode = cleanStr(school?.code);

  const filterStudentsForSchool = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.filter(st => {
      const raw = st.raw || st;
      const stSchoolId = cleanStr(st.school_id || raw.school_id);
      const stSchoolName = cleanStr(st.school_name || raw.school_name);
      const stSchoolCode = cleanStr(st.school_code || raw.school_code);
      return (
        (sId && stSchoolId && stSchoolId === sId) ||
        (sName && stSchoolName && stSchoolName === sName) ||
        (sCode && stSchoolCode && stSchoolCode === sCode)
      );
    });
  };

  // Auto-fetch students for this specific school if not provided or empty
  useEffect(() => {
    if (!isOpen || !school) return;

    const matchedFromProp = filterStudentsForSchool(students);
    if (matchedFromProp.length > 0) {
      setFetchedStudents(matchedFromProp);
      setLoadingSchoolData(false);
      return;
    }

    // Also check if students passed was already pre-filtered for this school
    if (Array.isArray(students) && students.length > 0) {
      const allBelong = students.every(st => {
        const raw = st.raw || st;
        const stId = cleanStr(st.school_id || raw.school_id);
        const stNm = cleanStr(st.school_name || raw.school_name);
        return (!stId || !sId || stId === sId) && (!stNm || !sName || stNm === sName);
      });
      if (allBelong) {
        setFetchedStudents(students);
        setLoadingSchoolData(false);
        return;
      }
    }

    // Direct targeted fetch for this school from backend API
    let isCancelled = false;
    const targetId = school.id;
    if (targetId) {
      setLoadingSchoolData(true);
      api.getStudents({ school_id: targetId })
        .then(res => {
          if (!isCancelled) {
            if (Array.isArray(res) && res.length > 0) {
              setFetchedStudents(res);
            } else {
              setFetchedStudents(matchedFromProp);
            }
          }
        })
        .catch(err => {
          console.warn('SchoolGrowthChartModal student fetch error:', err);
          if (!isCancelled) {
            setFetchedStudents(matchedFromProp);
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoadingSchoolData(false);
          }
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, school?.id, school?.name, students]);

  if (!isOpen || !school) return null;

  const activeStudentsSource = (() => {
    const matchedFromProp = filterStudentsForSchool(students);
    if (matchedFromProp.length > 0) return matchedFromProp;
    if (fetchedStudents.length > 0) return fetchedStudents;
    return Array.isArray(students) ? students : [];
  })();

  // Normalize and filter students belonging to this school
  const schoolStudents = activeStudentsSource.map(s => {
    const raw = s.raw || s;
    const hasAssessments = Array.isArray(raw.assessments) && raw.assessments.length > 0;
    const latestA = hasAssessments ? raw.assessments[0] : null;
    const currentStatus = s.currentStatus || raw.nutrition_status || latestA?.nutrition_status || 'Pending Assessment';
    const bmiZ = s.bmiZScore ?? (raw.latest_bmi_for_age_zscore ?? latestA?.bmi_for_age_zscore ?? null);
    const statusLower = currentStatus.toLowerCase();
    const isSW = s.isSeverelyWasted || statusLower.includes('severely wasted') || statusLower.includes('severe thinness') || (typeof bmiZ === 'number' && bmiZ < -3.0);
    const isW = !isSW && (s.isWasted || statusLower.includes('wasted') || statusLower.includes('thinness') || (typeof bmiZ === 'number' && bmiZ < -2.0));
    const isNorm = !isSW && !isW && (statusLower.includes('normal') || statusLower.includes('healthy') || (typeof bmiZ === 'number' && bmiZ >= -2.0 && bmiZ <= 1.0));
    const isOver = statusLower.includes('overweight') || statusLower.includes('obese') || statusLower.includes('obesity') || (typeof bmiZ === 'number' && bmiZ > 1.0);
    const hasAssess = Boolean(
      hasAssessments ||
      (raw.assessments && raw.assessments.length > 0) ||
      (s.latestAssessment && s.latestAssessment !== 'Pending' && s.latestAssessment !== 'None') ||
      raw.latest_assessment_date ||
      (raw.nutrition_status && raw.nutrition_status !== 'Pending Assessment') ||
      typeof raw.latest_bmi_for_age_zscore === 'number' ||
      (typeof bmiZ === 'number') ||
      (raw.bmi && raw.bmi > 0)
    );
    
    // Ensure there is NO category called Obese or Obesity — map strictly to Overweight
    let finalStatus = currentStatus;
    if (isOver || statusLower.includes('obese') || statusLower.includes('obesity')) {
      finalStatus = 'Overweight';
    } else if (isSW) {
      finalStatus = 'Severely Wasted';
    } else if (isW) {
      finalStatus = 'Wasted';
    } else if (isNorm) {
      finalStatus = 'Normal';
    }

    // Class number normalization (handles Roman numerals I-XII, Class 1-12, etc.)
    const rawCls = s.classVal || raw.class_name || '1';
    const clsNum = normalizeClassNumber(rawCls);
    const sec = s.section || raw.section || 'A';
    const genderVal = raw.gender || s.gender || '—';

    return {
      id: raw.id || s.id,
      idCode: raw.id || s.id || '',
      name: raw.name || s.name,
      gender: genderVal,
      school_id: raw.school_id || s.school_id,
      school_name: raw.school_name || s.school_name,
      classVal: clsNum,
      rawCls: rawCls,
      section: sec,
      bmi: raw.bmi || s.bmi || latestA?.bmi || 0,
      bmiZScore: bmiZ,
      currentStatus: finalStatus,
      isSeverelyWasted: isSW,
      isWasted: isW,
      isNormal: isNorm,
      isOverweight: isOver,
      hasAssessment: Boolean(hasAssess),
      nextDueDateFormatted: s.nextDueDateFormatted || (hasAssess ? 'Due Next Month' : 'Pending Assessment'),
      raw: raw
    };
  }).filter(s => {
    if (activeStudentsSource === fetchedStudents) return true;
    const stSchoolId = cleanStr(s.school_id || s.raw?.school_id);
    const stSchoolName = cleanStr(s.school_name || s.raw?.school_name);
    const stSchoolCode = cleanStr(s.school_code || s.raw?.school_code);
    return (
      (sId && stSchoolId && stSchoolId === sId) ||
      (sName && stSchoolName && stSchoolName === sName) ||
      (sCode && stSchoolCode && stSchoolCode === sCode) ||
      activeStudentsSource.length <= (school.students || school.students_count || 350)
    );
  });

  const totalEnrolled = schoolStudents.length || school.students || school.students_count || 0;
  
  // Dynamic academic session: from school students or current date
  const studentAcademicYear = schoolStudents.find(s => s.raw?.academic_year || s.academicYear)?.raw?.academic_year || 
    schoolStudents.find(s => s.academicYear)?.academicYear ||
    (students || []).find(s => s.raw?.academic_year || s.academicYear)?.raw?.academic_year ||
    (students || []).find(s => s.academicYear)?.academicYear;

  const currentAcademicSession = (() => {
    if (studentAcademicYear) {
      return String(studentAcademicYear).replace('-', '–');
    }
    const now = new Date();
    const curYear = now.getFullYear();
    return now.getMonth() >= 5 ? `${curYear}–${curYear + 1}` : `${curYear - 1}–${curYear}`;
  })();
  
  // Categorize students strictly by real status and Z-scores
  const severelyWastedStudents = schoolStudents.filter(s => s.isSeverelyWasted);
  const wastedStudents = schoolStudents.filter(s => s.isWasted);
  const normalStudents = schoolStudents.filter(s => s.isNormal);
  const overweightStudents = schoolStudents.filter(s => s.isOverweight);

  const assessedStudents = schoolStudents.filter(s => s.hasAssessment);
  const assessedCount = assessedStudents.length > 0 ? assessedStudents.length : (school.assessed || 0);

  const pendingCount = Math.max(0, totalEnrolled - assessedCount);
  const coveragePct = totalEnrolled > 0 ? Math.round((assessedCount / totalEnrolled) * 100) : 0;

  // Real database metrics with zero hardcoding
  const swCount = severelyWastedStudents.length;
  const wCount = wastedStudents.length;
  const normCount = normalStudents.length;
  const overCount = overweightStudents.length;

  // Gender-wise breakdown for all categories
  const maleEnrolled = schoolStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleEnrolled = schoolStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const maleAssessed = assessedStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleAssessed = assessedStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const maleNorm = normalStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleNorm = normalStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const maleW = wastedStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleW = wastedStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const maleSW = severelyWastedStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleSW = severelyWastedStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const maleOver = overweightStudents.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
  const femaleOver = overweightStudents.filter(s => String(s.gender || '').toLowerCase() === 'female').length;

  const swPct = assessedCount > 0 ? ((swCount / assessedCount) * 100).toFixed(1) : '0';
  const wPct = assessedCount > 0 ? ((wCount / assessedCount) * 100).toFixed(1) : '0';
  const normPct = assessedCount > 0 ? ((normCount / assessedCount) * 100).toFixed(1) : '0';
  const overPct = assessedCount > 0 ? ((overCount / assessedCount) * 100).toFixed(1) : '0';

  // Critical follow-up roster list
  const criticalRoster = severelyWastedStudents.concat(wastedStudents);

  // Derive which classes belong to this school (from classes_range and actual students)
  const displayClasses = (() => {
    const classSet = new Set();
    if (school?.classes_range) {
      const cr = String(school.classes_range).trim();
      const match = cr.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        for (let i = start; i <= end; i++) classSet.add(i);
      }
    }
    schoolStudents.forEach(st => {
      const num = parseInt(st.classVal, 10);
      if (!isNaN(num) && num > 0) classSet.add(num);
    });
    if (classSet.size === 0) {
      for (let i = 1; i <= 8; i++) classSet.add(i);
    }
    return Array.from(classSet).sort((a, b) => {
      const numA = typeof a === 'number' ? a : parseInt(a, 10);
      const numB = typeof b === 'number' ? b : parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a).localeCompare(String(b));
    });
  })();

  // Group by grade/class strictly from real school students
  const classBreakdown = displayClasses.map(cls => {
    const clsStr = String(cls);
    const inCls = schoolStudents.filter(s => s.classVal === clsStr || normalizeClassNumber(s.classVal) === clsStr);
    const clsCount = inCls.length;
    const clsMale = inCls.filter(s => String(s.gender || '').toLowerCase() === 'male').length;
    const clsFemale = inCls.filter(s => String(s.gender || '').toLowerCase() === 'female').length;
    const clsAssessed = inCls.filter(s => s.hasAssessment).length;
    const clsAssessedMale = inCls.filter(s => s.hasAssessment && String(s.gender || '').toLowerCase() === 'male').length;
    const clsAssessedFemale = inCls.filter(s => s.hasAssessment && String(s.gender || '').toLowerCase() === 'female').length;
    const clsSW = inCls.filter(s => s.isSeverelyWasted).length;
    const clsW = inCls.filter(s => s.isWasted).length;
    const clsNorm = inCls.filter(s => s.isNormal).length;
    return {
      classNum: cls,
      enrolled: clsCount,
      enrolledMale: clsMale,
      enrolledFemale: clsFemale,
      assessed: clsAssessed,
      assessedMale: clsAssessedMale,
      assessedFemale: clsAssessedFemale,
      normal: clsNorm,
      wasted: clsW,
      severelyWasted: clsSW
    };
  });

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print or save the School Growth Chart as PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>School_Growth_Report_${school.name.replace(/\s+/g, '_')}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 0;
              background-color: #FFFFFF;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            .print-root {
              width: 100%;
              max-width: 820px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #CBD5E1;
              padding: 6px 8px;
              font-size: 11px;
            }
            th {
              background-color: #F8FAFC !important;
              font-weight: 700;
              text-align: left;
              white-space: nowrap !important;
            }
          </style>
        </head>
        <body>
          <div class="print-root">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <School size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>
                School Nutritional Growth Report
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Official School Health & Growth Report
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Printer size={15} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#FAF9F6' }}>
          {loadingSchoolData && schoolStudents.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '360px', gap: '14px', color: '#64748B' }}>
              <RotateCcw size={32} className="animate-spin" color="#EA580C" />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>Loading Nutritional Growth Report...</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Synchronizing WHO assessment metrics for {school.name}</div>
            </div>
          ) : (
            <div
              ref={printContentRef}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                color: '#0F172A'
              }}
            >
            {/* WAATTASAATTAM Brand Report Header */}
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <StudentHealthLogo size={52} showText={false} isWhite={false} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#EA580C' }}>
                      WAATTASAATTAM • STUDENT HEALTH TRACKING
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0', letterSpacing: '-0.3px' }}>
                      SCHOOL NUTRITIONAL GROWTH REPORT
                    </h1>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
                  <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div><strong>Academic Session:</strong> {currentAcademicSession}</div>
                </div>
              </div>

              {/* HIGHLIGHTED SCHOOL BANNER */}
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '2px solid #3B82F6',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(59, 130, 246, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: '#1E3A8A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.8px', color: '#2563EB' }}>
                      SCHOOL INFORMATION
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                      {school.name}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        Cluster: {clusterName || school.cluster_name || 'Erode Cluster'}
                      </span>
                      <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        School Code: {school.code || 'N/A'}
                      </span>
                      <span style={{ backgroundColor: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600 }}>
                        Total Enrolled: {totalEnrolled} Students
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Alert / Status Stamp */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '12px',
                    backgroundColor: swCount > 0 ? '#FEE2E2' : wCount > 0 ? '#FFEDD5' : '#DCFCE7',
                    color: swCount > 0 ? '#B91C1C' : wCount > 0 ? '#C2410C' : '#15803D',
                    border: `1px solid ${swCount > 0 ? '#FCA5A5' : wCount > 0 ? '#FDBA74' : '#86EFAC'}`
                  }}>
                    {swCount > 0 ? '🔴 URGENT INTERVENTION' : wCount > 0 ? '🟠 MONITORING REQUIRED' : '🟢 HEALTHY CAMPUS'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                    {coveragePct}% Screening Coverage Completed
                  </div>
                </div>
              </div>
            </div>



            {/* Top KPI Cards Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px',
                marginBottom: '16px'
              }}
            >
              {/* Total Enrolled */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>Total Enrolled</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{totalEnrolled}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Students registered</div>
              </div>

              {/* Assessed */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 600 }}>Screening Coverage</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A', marginTop: '2px' }}>{coveragePct}%</div>
                <div style={{ fontSize: '10px', color: '#15803D' }}>{assessedCount} Assessed</div>
              </div>

              {/* Normal */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600 }}>Normal Weight</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{normPct}%</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>{normCount} Assessed</div>
              </div>

              {/* Wasted */}
              <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#C2410C', fontWeight: 600 }}>Wasted (Moderate)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', marginTop: '2px' }}>{wPct}%</div>
                <div style={{ fontSize: '10px', color: '#C2410C' }}>{wCount} (Needs care)</div>
              </div>

              {/* Severely Wasted */}
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 700 }}>Severely Wasted</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>{swPct}%</div>
                <div style={{ fontSize: '10px', color: '#B91C1C', fontWeight: 600 }}>{swCount} (High Priority)</div>
              </div>
            </div>

            {/* Visual Distribution Bar */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  School Nutritional Health Distribution (WHO Z-Scores)
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '10.5px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10B981', display: 'inline-block' }} /> Normal ({normPct}%)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#F59E0B', display: 'inline-block' }} /> Wasted ({wPct}%)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#EF4444', display: 'inline-block' }} /> Severely Wasted ({swPct}%)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#8B5CF6', display: 'inline-block' }} /> Overweight ({overPct}%)
                  </span>
                </div>
              </div>

              {/* Stacked Progress Bar */}
              <div style={{ height: '14px', borderRadius: '7px', display: 'flex', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
                <div style={{ width: `${normPct}%`, backgroundColor: '#10B981' }} title={`Normal: ${normPct}%`} />
                <div style={{ width: `${wPct}%`, backgroundColor: '#F59E0B' }} title={`Wasted: ${wPct}%`} />
                <div style={{ width: `${swPct}%`, backgroundColor: '#EF4444' }} title={`Severely Wasted: ${swPct}%`} />
                <div style={{ width: `${overPct}%`, backgroundColor: '#8B5CF6' }} title={`Overweight: ${overPct}%`} />
              </div>
            </div>

            {/* Class-wise Nutritional Breakdown Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                Class / Grade Level Nutritional Breakdown
              </div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>Grade</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Enrolled</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Assessed</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Normal</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#D97706', whiteSpace: 'nowrap' }}>Wasted</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#DC2626', whiteSpace: 'nowrap' }}>Severely Wasted</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Action Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classBreakdown.map((row, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', fontWeight: 600 }}>Class {row.classNum}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{row.enrolled}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{row.assessed}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#16A34A', fontWeight: 600 }}>{row.normal}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#D97706', fontWeight: 700 }}>{row.wasted}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>{row.severelyWasted}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                          {row.severelyWasted > 0 ? (
                            <span style={{ color: '#DC2626', fontWeight: 700, fontSize: '10px' }}>⚠️ Clinical Follow-up</span>
                          ) : row.wasted > 0 ? (
                            <span style={{ color: '#D97706', fontWeight: 600, fontSize: '10px' }}>Supplementary Diet</span>
                          ) : row.enrolled > 0 ? (
                            <span style={{ color: '#16A34A', fontSize: '10px' }}>Routine Monitoring</span>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '10px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* High Priority Follow-Up Roster for Upcoming Months */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
                  ⚠️ Critical Nutrition Follow-Up Roster (Upcoming Monthly Assessments)
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                  Showing students requiring upcoming monthly clinical re-assessment
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FEF2F2' }}>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', width: '30px', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>Student Name</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>ID / Code</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Grade-Sec</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>BMI</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Z-Score</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Classification</th>
                      <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Next Assessment Due</th>
                    </tr>
                  </thead>
                <tbody>
                  {criticalRoster.length > 0 ? (
                    criticalRoster.map((st, idx) => {
                      const isSW = st.isSeverelyWasted || String(st.currentStatus || '').toLowerCase().includes('severely wasted') || (typeof st.bmiZScore === 'number' && st.bmiZScore < -3);
                      const dueStr = st.nextDueDateFormatted || 'Pending Assessment';

                      return (
                        <tr key={idx} style={{ backgroundColor: isSW ? '#FFF5F5' : '#FFFFFF' }}>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', fontWeight: 600 }}>{st.name}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', color: '#64748B' }}>{st.id || st.idCode}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Class {st.classVal}-{st.section}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }}>{st.bmi ? st.bmi : '—'}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: isSW ? '#DC2626' : '#EA580C', fontWeight: 700 }}>
                            {typeof st.bmiZScore === 'number' ? `${st.bmiZScore.toFixed(2)} SD` : '—'}
                          </td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              backgroundColor: isSW ? '#FEE2E2' : '#FFEDD5',
                              color: isSW ? '#DC2626' : '#EA580C'
                            }}>
                              {isSW ? 'Severely Wasted' : 'Wasted'}
                            </span>
                          </td>
                          <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 600, color: '#0F172A' }}>
                            {dueStr}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#16A34A', backgroundColor: '#F0FDF4' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <CheckCircle2 size={16} color="#16A34A" />
                          <span style={{ fontWeight: 600, fontSize: '11px' }}>
                            No students currently classified as Severely Wasted or Wasted in this school. All assessed students are within normal or monitored growth parameters.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Institutional Action Plan & Directives */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '20px',
                fontSize: '11px'
              }}
            >
              <div style={{ fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                ADMINISTRATIVE ACTION DIRECTIVES:
              </div>
              <ul style={{ margin: '0 0 0 16px', padding: 0, color: '#475569', lineHeight: 1.5 }}>
                <li>Ensure 100% daily attendance of critical list students at the Midday Meal Nutrition counter.</li>
                <li>Conduct mandatory follow-up assessment for all listed students before the 25th of the upcoming month.</li>
                <li>Distribute individual Growth Chart reference sheets to the respective class teachers and parents.</li>
              </ul>
            </div>

            {/* Official Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px dashed #CBD5E1' }}>
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  School Headmaster / Principal
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  District Health & Nutrition Officer
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '130px' }}>
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '12px 6px', fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Institutional Seal
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
