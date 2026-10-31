import React, { useRef } from 'react';
import {
  X,
  Printer,
  Building2,
  School,
  FileText,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Activity,
  Calendar,
  Award
} from 'lucide-react';
import StudentHealthLogo from './StudentHealthLogo';

export default function ClusterGrowthChartModal({
  isOpen,
  onClose,
  cluster,
  schools = [],
  students = [],
  progressData = null,
  assessmentMonth = null
}) {
  const printContentRef = useRef(null);

  if (!isOpen || !cluster) return null;

  const clusterName = cluster.name || 'All Clusters';
  const clusterId = cluster.id;

  // Build a fast lookup for month-over-month trajectory from progressData
  const progressMap = new Map();
  if (progressData && Array.isArray(progressData.students)) {
    progressData.students.forEach((ps) => {
      progressMap.set(String(ps.student_id), ps);
    });
  }

  // Filter and normalize students belonging to this cluster / block
  const clusterStudents = (students || []).map((s) => {
    const raw = s.raw || s;
    const sId = String(raw.id || s.id || '');
    const pInfo = progressMap.get(sId);

    const hasAssessments = Array.isArray(raw.assessments) && raw.assessments.length > 0;
    const latestA = hasAssessments ? raw.assessments[0] : null;
    const prevA = hasAssessments && raw.assessments.length > 1 ? raw.assessments[1] : null;

    let currentStatus = s.currentStatus || raw.nutrition_status || latestA?.nutrition_status || 'Normal';
    if (String(currentStatus).toLowerCase().includes('obese') || String(currentStatus).toLowerCase().includes('obesity')) {
      currentStatus = 'Overweight';
    }
    const statusLower = String(currentStatus).toLowerCase().trim();

    const bmiVal = Number(pInfo?.bmi ?? (raw.bmi || s.bmi || latestA?.bmi || 0));
    const prevBmiVal = Number(pInfo?.prev_bmi ?? (s.prev_bmi || prevA?.bmi || 0));
    const bmiZ = pInfo?.bmi_zscore ?? (s.bmiZScore ?? (raw.latest_bmi_for_age_zscore ?? latestA?.bmi_for_age_zscore ?? null));
    const wtZ = s.weightZScore ?? (raw.weight_for_age_zscore ?? latestA?.weight_for_age_zscore ?? null);

    const isSW = s.isSeverelyWasted ||
      statusLower.includes('severely wasted') ||
      statusLower.includes('severe thinness') ||
      (typeof bmiZ === 'number' && bmiZ < -3.0);

    const isW = !isSW && (
      s.isWasted ||
      statusLower.includes('wasted') ||
      statusLower.includes('thinness') ||
      (typeof bmiZ === 'number' && bmiZ < -2.0)
    );

    const isWeightApplicable = s.isWeightApplicable ?? raw.latest_weight_for_age_applicable ?? latestA?.weight_for_age_applicable ?? true;
    const isUnderweight = !isSW && !isW && isWeightApplicable && (
      statusLower.includes('underweight') ||
      (typeof wtZ === 'number' && wtZ < -2.0)
    );

    const isOverweight = statusLower.includes('overweight') ||
      statusLower.includes('obese') ||
      statusLower.includes('obesity') ||
      (typeof bmiZ === 'number' && bmiZ > 1.0);

    const isNorm = !isSW && !isW && !isUnderweight && !isOverweight && (
      statusLower.includes('normal') ||
      statusLower.includes('healthy') ||
      (typeof bmiZ === 'number' && bmiZ >= -2.0 && bmiZ <= 1.0)
    );

    // Strictly ensure there is NO category called Obese or Obesity — all map to Overweight
    if (isOverweight || statusLower.includes('obese') || statusLower.includes('obesity')) {
      currentStatus = 'Overweight';
    } else if (isSW) {
      currentStatus = 'Severely Wasted';
    } else if (isW) {
      currentStatus = 'Wasted';
    } else if (isUnderweight) {
      currentStatus = 'Underweight';
    } else if (isNorm) {
      currentStatus = 'Normal';
    }

    let prevStatus = pInfo?.prev_status || prevA?.nutrition_status || null;
    if (prevStatus && (String(prevStatus).toLowerCase().includes('obese') || String(prevStatus).toLowerCase().includes('obesity'))) {
      prevStatus = 'Overweight';
    }

    // Trajectory Determination (100% dynamic based on BMI delta)
    let progStatus = pInfo?.progress_status;
    let bmiDelta = pInfo?.bmi_delta;

    if (!progStatus) {
      if (prevBmiVal > 0 && bmiVal > 0) {
        bmiDelta = Math.round((bmiVal - prevBmiVal) * 100) / 100;
        if (isOverweight) {
          // For overweight children, BMI reduction towards normal is positive recovery
          if (bmiDelta < 0) {
            progStatus = 'improved';
          } else if (bmiDelta > 0) {
            progStatus = 'deteriorated';
          } else {
            progStatus = 'stable';
          }
        } else if (bmiDelta > 0 && (isSW || isW || isNorm)) {
          progStatus = 'improved';
        } else if (bmiDelta < 0 && (isSW || isW)) {
          progStatus = 'deteriorated';
        } else {
          progStatus = 'stable';
        }
      } else {
        progStatus = 'baseline_only';
      }
    }

    const isRecovering = pInfo?.progress_status === 'improved' || progStatus === 'improved';
    const isNoImprovement = pInfo?.progress_status === 'deteriorated' ||
      pInfo?.is_deteriorated ||
      progStatus === 'deteriorated';

    const hasAssess = Boolean(
      pInfo ||
      hasAssessments ||
      (s.latestAssessment && s.latestAssessment !== 'Pending' && s.latestAssessment !== 'None') ||
      raw.latest_assessment_date
    );

    const rawCls = s.classVal || raw.class_name || pInfo?.class_name || '1';
    const clsNum = String(rawCls).replace(/class\s*/i, '').trim();
    const sec = s.section || raw.section || pInfo?.section || 'A';

    return {
      id: sId,
      idCode: sId,
      name: raw.name || s.name || pInfo?.name || 'Student',
      gender: raw.gender || s.gender || pInfo?.gender || '—',
      school_id: raw.school_id || s.school_id || pInfo?.school_id,
      school_name: raw.school_name || s.school_name || pInfo?.school_name || 'School',
      cluster_id: raw.cluster_id || s.cluster_id || pInfo?.cluster_id,
      cluster_name: raw.cluster_name || s.cluster_name || pInfo?.cluster_name || clusterName,
      classVal: clsNum,
      section: sec,
      height_cm: raw.height_cm || s.height_cm || pInfo?.height_cm || '—',
      weight_kg: raw.weight_kg || s.weight_kg || pInfo?.weight_kg || '—',
      bmi: bmiVal > 0 ? bmiVal : (raw.bmi || s.bmi || '—'),
      prev_bmi: prevBmiVal > 0 ? prevBmiVal : null,
      bmi_delta: bmiDelta,
      bmiZScore: bmiZ,
      currentStatus: currentStatus,
      prev_status: prevStatus,
      progress_status: progStatus,
      isSeverelyWasted: isSW,
      isWasted: isW,
      isUnderweight: isUnderweight,
      isNormal: isNorm,
      isOverweight: isOverweight,
      isRecovering: isRecovering,
      isNoImprovement: isNoImprovement,
      hasAssessment: hasAssess,
      nextDueDateFormatted: s.nextDueDateFormatted || (hasAssess ? 'Due Next Month' : 'Pending Assessment'),
      raw: raw
    };
  }).filter((s) => {
    if (!clusterId || clusterId === 'ALL' || clusterName === 'All Clusters') return true;
    return (
      s.cluster_id === clusterId ||
      s.cluster_name?.toLowerCase() === clusterName.toLowerCase() ||
      (s.raw && (s.raw.cluster_id === clusterId || s.raw.cluster_name?.toLowerCase() === clusterName.toLowerCase()))
    );
  });

  // Calculate high-level cluster statistics
  const totalEnrolled = clusterStudents.length || cluster.studentsCount || cluster.students_count || 0;
  const assessedStudents = clusterStudents.filter((s) => s.hasAssessment);
  const assessedCount = assessedStudents.length > 0 ? assessedStudents.length : (cluster.assessed || 0);
  const coveragePct = totalEnrolled > 0 ? Math.round((assessedCount / totalEnrolled) * 100) : 0;

  // Filter rosters for required categories
  const recoveringStudents = clusterStudents.filter((s) => s.isRecovering);
  const severelyWastedStudents = clusterStudents.filter((s) => s.isSeverelyWasted);
  const wastedStudents = clusterStudents.filter((s) => s.isWasted);
  const underweightStudents = clusterStudents.filter((s) => s.isUnderweight);
  const normalStudents = clusterStudents.filter((s) => s.isNormal);
  const overweightStudents = clusterStudents.filter((s) => s.isOverweight);
  // Combined Normal & Above Normal (Overweight) cohort
  const normalAndAboveStudents = clusterStudents.filter((s) => s.isNormal || s.isOverweight);
  const noImprovementStudents = clusterStudents.filter((s) => s.isNoImprovement);

  const recoveringCount = recoveringStudents.length;
  const swCount = severelyWastedStudents.length;
  const wCount = wastedStudents.length;
  const underCount = underweightStudents.length;
  const normCount = normalStudents.length;
  const overCount = overweightStudents.length;
  const noImpCount = noImprovementStudents.length;

  const recoveringPct = assessedCount > 0 ? ((recoveringCount / assessedCount) * 100).toFixed(1) : '0';
  const swPct = assessedCount > 0 ? ((swCount / assessedCount) * 100).toFixed(1) : '0';
  const wPct = assessedCount > 0 ? ((wCount / assessedCount) * 100).toFixed(1) : '0';
  const underPct = assessedCount > 0 ? ((underCount / assessedCount) * 100).toFixed(1) : '0';
  const normPct = assessedCount > 0 ? ((normCount / assessedCount) * 100).toFixed(1) : '0';
  const overPct = assessedCount > 0 ? ((overCount / assessedCount) * 100).toFixed(1) : '0';
  const noImpPct = assessedCount > 0 ? ((noImpCount / assessedCount) * 100).toFixed(1) : '0';

  // Academic year label
  const currentAcademicSession = (() => {
    const studentAcademicYear = clusterStudents.find((s) => s.raw?.academic_year || s.academicYear)?.raw?.academic_year;
    if (studentAcademicYear) return String(studentAcademicYear).replace('-', '–');
    const now = new Date();
    const curYear = now.getFullYear();
    return now.getMonth() >= 5 ? `${curYear}–${curYear + 1}` : `${curYear - 1}–${curYear}`;
  })();

  // School-by-school breakdown
  const clusterSchools = schools.filter((sch) => {
    if (!clusterId || clusterId === 'ALL' || clusterName === 'All Clusters') return true;
    return (
      sch.cluster_id === clusterId ||
      sch.cluster_name?.toLowerCase() === clusterName.toLowerCase() ||
      sch.clusterName?.toLowerCase() === clusterName.toLowerCase()
    );
  });

  const schoolsBreakdown = clusterSchools.map((sch) => {
    const sStudents = clusterStudents.filter(
      (st) => st.school_id === sch.id || st.school_name?.toLowerCase() === sch.name?.toLowerCase()
    );
    const sEnrolled = sStudents.length || sch.students || sch.studentsCount || 0;
    const sAssessed = sStudents.filter((st) => st.hasAssessment).length;
    const sRecovering = sStudents.filter((st) => st.isRecovering).length;
    const sSW = sStudents.filter((st) => st.isSeverelyWasted).length;
    const sW = sStudents.filter((st) => st.isWasted).length;
    const sUnder = sStudents.filter((st) => st.isUnderweight).length;
    const sNorm = sStudents.filter((st) => st.isNormal).length;
    const sOver = sStudents.filter((st) => st.isOverweight).length;
    const sNoImp = sStudents.filter((st) => st.isNoImprovement).length;

    return {
      id: sch.id,
      name: sch.name,
      code: sch.code || '—',
      enrolled: sEnrolled,
      assessed: sAssessed,
      recovering: sRecovering,
      severelyWasted: sSW,
      wasted: sW,
      underweight: sUnder,
      normal: sNorm,
      overweight: sOver,
      noImprovement: sNoImp
    };
  });

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print or save the Overall Cluster Report as PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cluster_Overall_Health_Report_${clusterName.replace(/\s+/g, '_')}</title>
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
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th, td {
              border: 1px solid #CBD5E1;
              padding: 6px 8px;
              font-size: 10.5px;
            }
            th {
              background-color: #F8FAFC !important;
              font-weight: 700;
              text-align: left;
              white-space: nowrap !important;
            }
            .section-header {
              page-break-after: avoid;
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

  // Reusable component for fully expanded, non-collapsible category tables
  const renderCategoryTable = (
    title,
    iconEmoji,
    badgeColor,
    badgeBg,
    badgeBorder,
    studentList,
    description,
    isRecoveringCategory = false,
    showNextDue = true
  ) => {
    return (
      <div style={{ marginBottom: '22px', pageBreakInside: 'avoid' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          borderLeft: `4px solid ${badgeColor}`,
          paddingLeft: '8px'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {iconEmoji} {title} ({studentList.length} Students)
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
              {description}
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: badgeBg,
            color: badgeColor,
            border: `1px solid ${badgeBorder}`
          }}>
            {studentList.length} Total
          </span>
        </div>

        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #CBD5E1' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', width: '28px', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>Student Name</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>ID / Code</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>School Name</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Grade-Sec</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Gender</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>BMI</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Z-Score</th>
                <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Classification</th>
                {isRecoveringCategory && (
                  <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Recovery Progress</th>
                )}
                {showNextDue && (
                  <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Next Due</th>
                )}
              </tr>
            </thead>
          <tbody>
            {studentList.length > 0 ? (
              studentList.map((st, idx) => {
                const isStOverweight = st.isOverweight;
                return (
                  <tr
                    key={st.id || idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#64748B' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', fontWeight: 700, color: '#0F172A' }}>
                      {st.name}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', color: '#64748B' }}>
                      {st.idCode}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', color: '#334155', fontWeight: 600 }}>
                      {st.school_name}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                      Class {st.classVal}-{st.section}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#475569' }}>
                      {st.gender}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }}>
                      {st.bmi ? st.bmi : '—'}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: isStOverweight ? '#7E22CE' : badgeColor }}>
                      {typeof st.bmiZScore === 'number' ? `${st.bmiZScore.toFixed(2)} SD` : '—'}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        backgroundColor: isStOverweight ? '#FAF5FF' : badgeBg,
                        color: isStOverweight ? '#7E22CE' : badgeColor,
                        border: isStOverweight ? '1px solid #E9D5FF' : 'none',
                        display: 'inline-block'
                      }}>
                        {st.currentStatus}
                      </span>
                    </td>
                    {isRecoveringCategory && (
                      <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '9.5px',
                          fontWeight: 700,
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          display: 'inline-block'
                        }}>
                          {st.prev_bmi ? `BMI: ${st.prev_bmi} → ${st.bmi} (${(st.bmi_delta !== null && st.bmi_delta !== undefined) ? (st.bmi_delta > 0 ? `+${st.bmi_delta}` : `${st.bmi_delta}`) : (st.bmi - st.prev_bmi > 0 ? `+${(st.bmi - st.prev_bmi).toFixed(2)}` : (st.bmi - st.prev_bmi).toFixed(2))})` : 'Recovering to Normal'}
                        </span>
                      </td>
                    )}
                    {showNextDue && (
                      <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 600, color: '#0F172A' }}>
                        {st.nextDueDateFormatted}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9 + (isRecoveringCategory ? 1 : 0) + (showNextDue ? 1 : 0)} style={{ padding: '16px', textAlign: 'center', color: '#16A34A', backgroundColor: '#F0FDF4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} color="#16A34A" />
                    <span style={{ fontWeight: 600, fontSize: '11px' }}>
                      No students currently classified under this category in {clusterName}.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    );
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
          maxWidth: '960px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #ECEEF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>
                Overall Cluster / Block Nutritional Report
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Comprehensive Cluster Tracking & Recovery Assessment
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
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 700,
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
              title="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#FAF9F6' }}>
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
            {/* Report Brand Header */}
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <StudentHealthLogo size={52} showText={false} isWhite={false} />
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800, color: '#EA580C' }}>
                      WAATTASAATTAM • STUDENT HEALTH TRACKING SYSTEM
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0', letterSpacing: '-0.3px' }}>
                      OVERALL CLUSTER / BLOCK NUTRITIONAL PROGRESS REPORT
                    </h1>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
                  <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div><strong>Academic Session:</strong> {currentAcademicSession}</div>
                  {assessmentMonth && <div><strong>Assessment Period:</strong> {assessmentMonth}</div>}
                </div>
              </div>

              {/* Cluster / Block Overview Banner */}
              <div
                style={{
                  marginTop: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '2px solid #2563EB',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
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
                      CLUSTER / BLOCK JURISDICTION
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                      {clusterName}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        Schools in Cluster: {clusterSchools.length || cluster.schoolsCount || 0}
                      </span>
                      <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        Total Enrolled: {totalEnrolled} Students
                      </span>
                      <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 700 }}>
                        Total Assessed: {assessedCount} ({coveragePct}%)
                      </span>
                    </div>
                  </div>
                </div>

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
                    {swCount > 0 ? '🔴 URGENT BLOCK INTERVENTION' : wCount > 0 ? '🟠 ACTIVE MONITORING REQUIRED' : '🟢 HEALTHY CLUSTER'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                    {recoveringCount > 0 ? `🔺 ${recoveringCount} Students actively recovering` : 'Routine Nutrition Monitoring'}
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Cluster Key Metric Cards Row 1 (Percentages prominent) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '14px'
              }}
            >
              {/* Card 1: Recovering / Improved */}
              <div style={{ backgroundColor: '#ECFDF5', border: '1.5px solid #6EE7B7', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Recovering / Improved</span>
                  <TrendingUp size={15} color="#059669" />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '2px', lineHeight: 1.1 }}>{recoveringPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#047857', fontWeight: 600, marginTop: '2px' }}>{recoveringCount} Students recovering</div>
              </div>

              {/* Card 2: Severely Wasted */}
              <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase' }}>Severely Wasted</span>
                  <AlertTriangle size={15} color="#DC2626" />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#DC2626', marginTop: '2px', lineHeight: 1.1 }}>{swPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 600, marginTop: '2px' }}>{swCount} Students severely wasted</div>
              </div>

              {/* Card 3: Wasted */}
              <div style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FDBA74', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#C2410C', fontWeight: 700, textTransform: 'uppercase' }}>Wasted</span>
                  <Activity size={15} color="#EA580C" />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#EA580C', marginTop: '2px', lineHeight: 1.1 }}>{wPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#C2410C', fontWeight: 600, marginTop: '2px' }}>{wCount} Students wasted</div>
              </div>

              {/* Card 4: Normal Nutritional Status */}
              <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>Normal Weight</span>
                  <CheckCircle2 size={15} color="#16A34A" />
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#16A34A', marginTop: '2px', lineHeight: 1.1 }}>{normPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 600, marginTop: '2px' }}>{normCount} Students normal weight</div>
              </div>
            </div>

            {/* Second Row of Metric Cards: Underweight, Overweight, Dropped BMI, Total Monitored */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                marginBottom: '20px'
              }}
            >
              {/* Card 5: Underweight */}
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#92400E', fontWeight: 700, textTransform: 'uppercase' }}>Underweight</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#B45309', marginTop: '2px', lineHeight: 1.1 }}>{underPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#92400E', marginTop: '2px' }}>{underCount} Students underweight</div>
              </div>

              {/* Card 6: Overweight */}
              <div style={{ backgroundColor: '#FAF5FF', border: '1px solid #D8B4FE', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#6B21A8', fontWeight: 700, textTransform: 'uppercase' }}>Overweight</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#7E22CE', marginTop: '2px', lineHeight: 1.1 }}>{overPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#6B21A8', marginTop: '2px' }}>{overCount} Students overweight</div>
              </div>

              {/* Card 7: No Improvement / Dropped BMI */}
              <div style={{ backgroundColor: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10.5px', color: '#9F1239', fontWeight: 700, textTransform: 'uppercase' }}>BMI Dropped</span>
                  <TrendingDown size={14} color="#BE123C" />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#BE123C', marginTop: '2px', lineHeight: 1.1 }}>{noImpPct}%</div>
                <div style={{ fontSize: '10.5px', color: '#9F1239', marginTop: '2px' }}>{noImpCount} Students deteriorating</div>
              </div>

              {/* Card 8: Screening Coverage */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Screening Coverage</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginTop: '2px', lineHeight: 1.1 }}>{coveragePct}%</div>
                <div style={{ fontSize: '10.5px', color: '#475569', marginTop: '2px' }}>{assessedCount} of {totalEnrolled} screened</div>
              </div>
            </div>

            {/* School-by-School Distribution Table for this Cluster */}
            <div style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏫 School-by-School Nutritional & Recovery Distribution
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                  Breakdown across {schoolsBreakdown.length} schools under {clusterName}
                </div>
              </div>

              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #CBD5E1' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', width: '28px', textAlign: 'center', whiteSpace: 'nowrap' }}>#</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>School Name</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>School Code</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Enrolled</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Assessed</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#059669', backgroundColor: '#ECFDF5', whiteSpace: 'nowrap' }}>Recovering</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#DC2626', backgroundColor: '#FEF2F2', whiteSpace: 'nowrap' }}>Severely Wasted</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#EA580C', backgroundColor: '#FFF7ED', whiteSpace: 'nowrap' }}>Wasted</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#D97706', backgroundColor: '#FEF3C7', whiteSpace: 'nowrap' }}>Underweight</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#16A34A', backgroundColor: '#F0FDF4', whiteSpace: 'nowrap' }}>Normal</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#7E22CE', backgroundColor: '#FAF5FF', whiteSpace: 'nowrap' }}>Overweight</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#BE123C', backgroundColor: '#FFF1F2', whiteSpace: 'nowrap' }}>Dropped</th>
                    </tr>
                  </thead>
                <tbody>
                  {schoolsBreakdown.length > 0 ? (
                    schoolsBreakdown.map((s, idx) => (
                      <tr key={s.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#64748B' }}>{idx + 1}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', fontWeight: 700, color: '#0F172A' }}>{s.name}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#64748B' }}>{s.code}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 600 }}>{s.enrolled}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 600 }}>{s.assessed}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 800, color: '#059669', backgroundColor: s.recovering > 0 ? '#DCFCE7' : 'transparent' }}>
                          {s.recovering}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 800, color: '#DC2626', backgroundColor: s.severelyWasted > 0 ? '#FEE2E2' : 'transparent' }}>
                          {s.severelyWasted}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 800, color: '#EA580C', backgroundColor: s.wasted > 0 ? '#FFEDD5' : 'transparent' }}>
                          {s.wasted}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: '#D97706' }}>
                          {s.underweight}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: '#16A34A' }}>
                          {s.normal}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700, color: '#7E22CE' }}>
                          {s.overweight}
                        </td>
                        <td style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 800, color: '#BE123C', backgroundColor: s.noImprovement > 0 ? '#FFE4E6' : 'transparent' }}>
                          {s.noImprovement}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" style={{ padding: '16px', textAlign: 'center', color: '#64748B' }}>
                        No schools registered under this cluster.
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
              </div>
            </div>

            {/* =================================================================== */}
            {/* COMPREHENSIVE STUDENT ROSTERS BY CATEGORY (NO COLLAPSIBLE CONTENT) */}
            {/* =================================================================== */}

            {/* 1. RECOVERING / IMPROVED STUDENTS ROSTER */}
            {renderCategoryTable(
              'Recovering & Improved Students Roster',
              '🔺',
              '#059669',
              '#ECFDF5',
              '#A7F3D0',
              recoveringStudents,
              'Students actively gaining weight/BMI towards normal health or upgraded nutrition classification',
              true
            )}

            {/* 2. SEVERELY WASTED STUDENTS ROSTER */}
            {renderCategoryTable(
              'Severely Wasted Students Roster',
              '🔴',
              '#DC2626',
              '#FEF2F2',
              '#FECACA',
              severelyWastedStudents,
              'Critical priority cohort requiring mandatory therapeutic nutrition and daily clinical monitoring'
            )}

            {/* 3. WASTED STUDENTS ROSTER */}
            {renderCategoryTable(
              'Wasted Students Roster',
              '🟠',
              '#EA580C',
              '#FFF7ED',
              '#FED7AA',
              wastedStudents,
              'High priority cohort requiring supplementary protein rations and weekly growth assessment'
            )}

            {/* 4. UNDERWEIGHT STUDENTS ROSTER */}
            {renderCategoryTable(
              'Underweight Students Roster',
              '🟡',
              '#D97706',
              '#FEF3C7',
              '#FDE68A',
              underweightStudents,
              'Students with Weight-for-Age Z-score below -2.0 SD requiring targeted dietary interventions'
            )}

            {/* 5. NORMAL & ABOVE NORMAL (OVERWEIGHT) STUDENTS ROSTER (WITHOUT NEXT DUE COLUMN) */}
            {renderCategoryTable(
              'Normal & Above Normal (Overweight) Students Roster',
              '🟢',
              '#16A34A',
              '#F0FDF4',
              '#BBF7D0',
              normalAndAboveStudents,
              'Students maintaining standard WHO normal parameters or above normal (overweight) percentiles',
              false,
              false
            )}

            {/* 6. NO IMPROVEMENT / DROPPED BMI STUDENTS ROSTER */}
            {renderCategoryTable(
              'No Improvement / Dropped BMI Students Roster',
              '🔻',
              '#BE123C',
              '#FFF1F2',
              '#FECDD3',
              noImprovementStudents,
              'Students with downward BMI trajectory or declining nutritional classification requiring clinical evaluation',
              false,
              true
            )}

            {/* Administrative Action Directives */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '20px',
                fontSize: '11px',
                pageBreakInside: 'avoid'
              }}
            >
              <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px', textTransform: 'uppercase' }}>
                CLUSTER / BLOCK DIRECTIVES FOR MONTHLY TRACKING & CLINICAL ACTION:
              </div>
              <ul style={{ margin: '0 0 0 16px', padding: 0, color: '#475569', lineHeight: 1.6 }}>
                <li><strong>100% Tracking Mandate:</strong> Ensure all Severely Wasted and Wasted students across all {clusterSchools.length} schools receive daily fortified midday meals.</li>
                <li><strong>Clinical Follow-Up:</strong> Re-assessment must be logged within 30 days of the last screening date for all listed critical and recovering students.</li>
                <li><strong>Parental Counseling:</strong> Distribute individual health advisory cards to parents of students in the recovering and critical cohorts.</li>
                <li><strong>Escalation:</strong> Immediately refer students on the "No Improvement / Dropped BMI" list to the nearest Primary Health Centre (PHC).</li>
              </ul>
            </div>

            {/* Official Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                paddingTop: '20px',
                borderTop: '1px dashed #CBD5E1',
                pageBreakInside: 'avoid'
              }}
            >
              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  Block Resource Teacher / Coordinator
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748B' }}>Cluster Educational Office</div>
              </div>

              <div style={{ textAlign: 'center', width: '220px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  Block Health & Nutrition Officer
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748B' }}>Health Department</div>
              </div>

              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                  District Project Director
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748B' }}>Olirum Erodu Foundation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
