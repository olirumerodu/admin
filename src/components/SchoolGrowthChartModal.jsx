import React, { useRef } from 'react';
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
  Building2
} from 'lucide-react';

export default function SchoolGrowthChartModal({ isOpen, onClose, school, students = [], clusterName }) {
  const printContentRef = useRef(null);

  if (!isOpen || !school) return null;

  // Normalize and filter students belonging to this school
  const schoolStudents = (students || []).map(s => {
    const raw = s.raw || s;
    const hasAssessments = Array.isArray(raw.assessments) && raw.assessments.length > 0;
    const latestA = hasAssessments ? raw.assessments[0] : null;
    const currentStatus = s.currentStatus || raw.nutrition_status || latestA?.nutrition_status || 'Pending Assessment';
    const bmiZ = s.bmiZScore ?? (raw.latest_bmi_for_age_zscore ?? latestA?.bmi_for_age_zscore ?? null);
    const statusLower = currentStatus.toLowerCase();
    const isSW = s.isSeverelyWasted || statusLower.includes('severely wasted') || statusLower.includes('severe thinness') || (typeof bmiZ === 'number' && bmiZ < -3.0);
    const isW = !isSW && (s.isWasted || statusLower.includes('wasted') || statusLower.includes('thinness') || (typeof bmiZ === 'number' && bmiZ < -2.0));
    const isNorm = !isSW && !isW && (statusLower.includes('normal') || statusLower.includes('healthy') || (typeof bmiZ === 'number' && bmiZ >= -2.0 && bmiZ <= 1.0));
    const isOver = statusLower.includes('overweight') || statusLower.includes('obese') || (typeof bmiZ === 'number' && bmiZ > 1.0);
    const hasAssess = hasAssessments || (s.latestAssessment && s.latestAssessment !== 'Pending' && s.latestAssessment !== 'None') || raw.latest_assessment_date;
    
    // Class number normalization
    const rawCls = s.classVal || raw.class_name || '1';
    const clsNum = String(rawCls).replace(/class\s*/i, '').trim();
    const sec = s.section || raw.section || 'A';

    return {
      id: raw.id || s.id,
      idCode: raw.id || s.id || '',
      name: raw.name || s.name,
      school_id: raw.school_id || s.school_id,
      school_name: raw.school_name || s.school_name,
      classVal: clsNum,
      section: sec,
      bmi: raw.bmi || s.bmi || latestA?.bmi || 0,
      bmiZScore: bmiZ,
      currentStatus: currentStatus,
      isSeverelyWasted: isSW,
      isWasted: isW,
      isNormal: isNorm,
      isOverweight: isOver,
      hasAssessment: Boolean(hasAssess),
      nextDueDateFormatted: s.nextDueDateFormatted || (hasAssess ? 'Due Next Month' : 'Pending Assessment'),
      raw: raw
    };
  }).filter(s => 
    s.school_id === school.id || s.school_name === school.name || (s.raw && (s.raw.school_id === school.id || s.raw.school_name === school.name))
  );

  const totalEnrolled = schoolStudents.length || school.students || school.students_count || 0;
  
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

  const swPct = assessedCount > 0 ? ((swCount / assessedCount) * 100).toFixed(1) : '0';
  const wPct = assessedCount > 0 ? ((wCount / assessedCount) * 100).toFixed(1) : '0';
  const normPct = assessedCount > 0 ? ((normCount / assessedCount) * 100).toFixed(1) : '0';
  const overPct = assessedCount > 0 ? ((overCount / assessedCount) * 100).toFixed(1) : '0';

  // Critical follow-up roster list
  const criticalRoster = severelyWastedStudents.concat(wastedStudents);

  // Group by grade/class 1 through 8 strictly from real school students
  const classBreakdown = [1, 2, 3, 4, 5, 6, 7, 8].map(cls => {
    const inCls = schoolStudents.filter(s => s.classVal === String(cls));
    const clsCount = inCls.length;
    const clsAssessed = inCls.filter(s => s.hasAssessment).length;
    const clsSW = inCls.filter(s => s.isSeverelyWasted).length;
    const clsW = inCls.filter(s => s.isWasted).length;
    const clsNorm = inCls.filter(s => s.isNormal).length;
    return {
      classNum: cls,
      enrolled: clsCount,
      assessed: clsAssessed,
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
                School Nutritional Growth & Surveillance Report
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Institutional Clinical Summary & Follow-Up Planning Document
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
            {/* Document Header */}
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#2563EB' }}>
                    Department of School Education & Health Surveillance
                  </div>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '3px 0 0 0' }}>
                    SCHOOL NUTRITIONAL GROWTH REPORT
                  </h1>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {school.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B' }}>
                  <div><strong>Cluster:</strong> {clusterName || school.cluster_name || 'Erode Cluster'}</div>
                  <div><strong>Academic Session:</strong> 2025–2026</div>
                  <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div><strong>School Code:</strong> {school.code || 'SCH-ERD-042'}</div>
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
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{normCount}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>{normPct}% of total</div>
              </div>

              {/* Wasted */}
              <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#C2410C', fontWeight: 600 }}>Wasted (Moderate)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C', marginTop: '2px' }}>{wCount}</div>
                <div style={{ fontSize: '10px', color: '#C2410C' }}>{wPct}% (Needs care)</div>
              </div>

              {/* Severely Wasted */}
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px' }}>
                <div style={{ fontSize: '10.5px', color: '#B91C1C', fontWeight: 700 }}>Severely Wasted</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>{swCount}</div>
                <div style={{ fontSize: '10px', color: '#B91C1C', fontWeight: 600 }}>{swPct}% (High Priority)</div>
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1' }}>Grade</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Enrolled</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Assessed</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Normal</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#D97706' }}>Wasted</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: '#DC2626' }}>Severely Wasted</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Action Required</th>
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
                        ) : (
                          <span style={{ color: '#16A34A', fontSize: '10px' }}>Routine Monitoring</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FEF2F2' }}>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', width: '30px' }}>#</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1' }}>Student Name</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1' }}>ID / Code</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Grade-Sec</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>BMI</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Z-Score</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Classification</th>
                    <th style={{ padding: '5px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Next Assessment Due</th>
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
        </div>
      </div>
    </div>
  );
}
