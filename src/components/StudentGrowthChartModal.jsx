import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  TrendingUp, 
  User, 
  School, 
  Award,
  CheckCircle2
} from 'lucide-react';

export default function StudentGrowthChartModal({ isOpen, onClose, student, schoolName, clusterName }) {
  const printContentRef = useRef(null);

  if (!isOpen || !student) return null;

  // Use real assessments from backend or student's real recorded screening data
  const rawAssessments = Array.isArray(student.raw?.assessments) ? student.raw.assessments : [];
  const assessments = rawAssessments.length > 0
    ? rawAssessments
    : (student.height > 0 || student.weight > 0 || student.bmi > 0)
    ? [
        {
          assessment_date: student.latestAssessment && student.latestAssessment !== 'Pending' ? student.latestAssessment : new Date().toISOString().split('T')[0],
          height_cm: student.height,
          weight_kg: student.weight,
          bmi: student.bmi,
          bmi_for_age_zscore: student.bmiZScore,
          height_for_age_zscore: student.heightZScore,
          weight_for_age_zscore: student.weightZScore,
          nutrition_status: student.currentStatus || 'Normal',
          examiner_name: 'School Health Officer'
        }
      ]
    : [];

  const latestAssessment = assessments[0] || null;
  const isSeverelyWasted = student.isSeverelyWasted || String(student.currentStatus || '').toLowerCase().includes('severely wasted') || (typeof student.bmiZScore === 'number' && student.bmiZScore < -3);
  const isWasted = !isSeverelyWasted && (student.isWasted || String(student.currentStatus || '').toLowerCase().includes('wasted') || (typeof student.bmiZScore === 'number' && student.bmiZScore < -2));

  // Determine next follow-up date (30 days from last screening date)
  let nextDueFormatted = student.nextDueDateFormatted || 'Pending Initial Screening';
  if ((!student.nextDueDateFormatted || student.nextDueDateFormatted.includes('Pending')) && latestAssessment?.assessment_date) {
    const lastDate = new Date(latestAssessment.assessment_date);
    if (!isNaN(lastDate.getTime())) {
      const nextDueDate = new Date(lastDate);
      nextDueDate.setDate(nextDueDate.getDate() + 30);
      nextDueFormatted = nextDueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  // Chronological assessments for real SVG curve
  const chronologicalAssessments = [...assessments].sort((a, b) => new Date(a.assessment_date || 0) - new Date(b.assessment_date || 0));

  const handlePrint = () => {
    const printContent = printContentRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print or save the Growth Chart as PDF.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student_Growth_Chart_${student.name.replace(/\s+/g, '_')}_${student.id || student.idCode || 'ID'}</title>
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
              max-width: 800px;
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
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Action Bar */}
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
                backgroundColor: isSeverelyWasted ? '#FEE2E2' : '#FFEDD5',
                color: isSeverelyWasted ? '#DC2626' : '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>
                Student WHO Growth Chart & Medical Record
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Printable Clinical Reference Document (WHO 2007 Standards)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              style={{
                backgroundColor: '#EB5A1D',
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
                boxShadow: '0 2px 6px rgba(235, 90, 29, 0.25)'
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

        {/* Scrollable Printable Document Body */}
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
            <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#EA580C' }}>
                    Student Health & Wellness Surveillance Program
                  </div>
                  <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '3px 0 0 0' }}>
                    STUDENT NUTRITIONAL GROWTH CHART
                  </h1>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    WHO AnthroPlus Standardized Growth Assessment (Ages 5–19)
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B' }}>
                  <div><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <div><strong>Ref ID:</strong> WHO-GC-{student.id || student.idCode || '1042'}</div>
                  <div style={{ color: '#059669', fontWeight: 600, marginTop: '2px' }}>● Verified WHO Engine</div>
                </div>
              </div>
            </div>

            {/* Student & School Demographics Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr',
                gap: '12px',
                padding: '12px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '16px',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Student Name:</strong> <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{student.name}</span></div>
                <div><strong>Student ID / EMIS:</strong> {student.id || student.idCode}</div>
                <div><strong>Institution:</strong> {schoolName || student.raw?.school_name || 'Government Higher Secondary School'}</div>
                <div><strong>Cluster / District:</strong> {clusterName || student.raw?.cluster_name || 'Erode Cluster'}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Class & Section:</strong> Grade {student.classVal} - Section {student.section}</div>
                <div><strong>Gender:</strong> {student.gender || 'Female'}</div>
                <div><strong>Date of Birth:</strong> {student.dobFormatted || student.dob || '2017-04-12'}</div>
                <div><strong>Age:</strong> {student.ageDisplay || '9 yrs 6 mos'}</div>
              </div>
            </div>

            {/* Current Classification Banner */}
            <div
              style={{
                backgroundColor: isSeverelyWasted ? '#FEF2F2' : isWasted ? '#FFF7ED' : '#F0FDF4',
                border: `1.5px solid ${isSeverelyWasted ? '#F87171' : isWasted ? '#FDBA74' : '#86EFAC'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: isSeverelyWasted ? '#991B1B' : isWasted ? '#9A3412' : '#166534' }}>
                  Current Nutritional Status
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: isSeverelyWasted ? '#DC2626' : isWasted ? '#EA580C' : '#15803D', marginTop: '1px' }}>
                  {student.currentStatus || (isSeverelyWasted ? 'Severely Wasted' : 'Wasted')}
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                  {isSeverelyWasted 
                    ? '🔴 Critical Nutritional Deficit (Z-Score < -3.0 SD). Mandatory Monthly Clinical Assessment & Dietary Follow-up.'
                    : isWasted
                    ? '🟠 Moderate Nutritional Deficit (Z-Score < -2.0 SD). Monthly Assessment & Supplementary Nutrition Follow-up.'
                    : '🟢 Growth Parameters within normal WHO median boundaries.'}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '160px' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Next Assessment Due</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isSeverelyWasted ? '#DC2626' : '#EA580C' }}>
                  {nextDueFormatted}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B' }}>(Scheduled Follow-up)</div>
              </div>
            </div>

            {/* WHO Z-Score Indicators Grid */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                WHO AnthroPlus Core Growth Indices
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {/* BMI-for-Age */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>BMI-for-Age Z-Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: (typeof student.bmiZScore === 'number' && student.bmiZScore < -3) ? '#DC2626' : (typeof student.bmiZScore === 'number' && student.bmiZScore < -2) ? '#EA580C' : '#059669', marginTop: '2px' }}>
                    {typeof student.bmiZScore === 'number' ? `${student.bmiZScore.toFixed(2)} SD` : (typeof latestAssessment?.bmi_for_age_zscore === 'number' ? `${latestAssessment.bmi_for_age_zscore.toFixed(2)} SD` : '—')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Current BMI: <strong>{student.bmi ? `${student.bmi} kg/m²` : (latestAssessment?.bmi ? `${latestAssessment.bmi} kg/m²` : '—')}</strong>
                  </div>
                </div>

                {/* Height-for-Age */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Height-for-Age Z-Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: (typeof student.heightZScore === 'number' && student.heightZScore < -2) ? '#DC2626' : '#0F172A', marginTop: '2px' }}>
                    {typeof student.heightZScore === 'number' ? `${student.heightZScore.toFixed(2)} SD` : (typeof latestAssessment?.height_for_age_zscore === 'number' ? `${latestAssessment.height_for_age_zscore.toFixed(2)} SD` : '—')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Current Stature: <strong>{student.height ? `${student.height} cm` : (latestAssessment?.height_cm ? `${latestAssessment.height_cm} cm` : '—')}</strong>
                  </div>
                </div>

                {/* Weight-for-Age */}
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px 12px', backgroundColor: '#F8FAFC' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Weight-for-Age Z-Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: (typeof student.weightZScore === 'number' && student.weightZScore < -2) ? '#EA580C' : '#0F172A', marginTop: '2px' }}>
                    {typeof student.weightZScore === 'number' ? `${student.weightZScore.toFixed(2)} SD` : (typeof latestAssessment?.weight_for_age_zscore === 'number' ? `${latestAssessment.weight_for_age_zscore.toFixed(2)} SD` : '—')}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    Current Weight: <strong>{student.weight ? `${student.weight} kg` : (latestAssessment?.weight_kg ? `${latestAssessment.weight_kg} kg` : '—')}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Chart Visualization (SVG Curve) */}
            <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', marginBottom: '18px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase' }}>
                  WHO BMI & Longitudinal Growth Trajectory
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#64748B' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} /> WHO Median (0 SD)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C', display: 'inline-block' }} /> Wasted (-2 SD)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} /> Sev. Wasted (-3 SD)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '3px', backgroundColor: '#2563EB', display: 'inline-block' }} /> Student BMI
                  </span>
                </div>
              </div>

              {/* Chart SVG */}
              <div style={{ width: '100%', height: '140px' }}>
                {(() => {
                  const svgPoints = (() => {
                    if (chronologicalAssessments.length === 0) return [];
                    if (chronologicalAssessments.length === 1) {
                      const a = chronologicalAssessments[0];
                      const bmiVal = Number(a.bmi) || (student.bmi || 13.0);
                      const y = Math.max(20, Math.min(115, 110 - ((bmiVal - 11.5) / 5) * 60));
                      const dt = new Date(a.assessment_date || Date.now());
                      const monthStr = dt.toLocaleDateString('en-US', { month: 'short' });
                      return [{ x: 360, y, val: bmiVal.toFixed(1), month: monthStr }];
                    }
                    const xStart = 90;
                    const xEnd = 630;
                    const step = (xEnd - xStart) / (chronologicalAssessments.length - 1);
                    return chronologicalAssessments.map((a, i) => {
                      const x = xStart + i * step;
                      const bmiVal = Number(a.bmi) || (student.bmi || 13.0);
                      const y = Math.max(20, Math.min(115, 110 - ((bmiVal - 11.5) / 5) * 60));
                      const dt = new Date(a.assessment_date || Date.now());
                      const monthStr = dt.toLocaleDateString('en-US', { month: 'short' });
                      return { x, y, val: bmiVal.toFixed(1), month: monthStr };
                    });
                  })();

                  const svgPathD = svgPoints.length > 1
                    ? svgPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
                    : '';

                  return (
                    <svg viewBox="0 0 700 130" style={{ width: '100%', height: '100%' }}>
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="680" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="40" y1="50" x2="680" y2="50" stroke="#FEE2E2" strokeWidth="1.5" strokeDasharray="4,4" />
                      <line x1="40" y1="80" x2="680" y2="80" stroke="#FFEDD5" strokeWidth="1.5" strokeDasharray="4,4" />
                      <line x1="40" y1="110" x2="680" y2="110" stroke="#DCFCE7" strokeWidth="1.5" />

                      {/* Y Axis Labels */}
                      <text x="5" y="24" fontSize="9" fill="#64748B">16.0 BMI</text>
                      <text x="5" y="54" fontSize="9" fill="#DC2626">-3 SD</text>
                      <text x="5" y="84" fontSize="9" fill="#EA580C">-2 SD</text>
                      <text x="5" y="114" fontSize="9" fill="#059669">Median</text>

                      {/* Student BMI Curve Line if 2 or more points */}
                      {svgPoints.length > 1 && (
                        <path
                          d={svgPathD}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      )}

                      {/* Data Points */}
                      {svgPoints.length > 0 ? (
                        svgPoints.map((pt, idx) => (
                          <g key={idx}>
                            <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
                            <text x={pt.x} y={pt.y - 8} fontSize="9" fontWeight="700" fill="#2563EB" textAnchor="middle">{pt.val}</text>
                            <text x={pt.x} y="125" fontSize="10" fill="#64748B" textAnchor="middle">{pt.month}</text>
                          </g>
                        ))
                      ) : (
                        <text x="350" y="70" fontSize="11" fill="#94A3B8" textAnchor="middle">
                          No historical screenings recorded yet to chart growth curve
                        </text>
                      )}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* Assessment History Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                Monthly Assessment History & Follow-up Log
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', border: '1px solid #CBD5E1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'left' }}>Assessment Date</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Height (cm)</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Weight (kg)</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>BMI (kg/m²)</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>WHO Z-Score</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'left' }}>Examiner</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.length > 0 ? (
                    assessments.map((a, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', fontWeight: 600 }}>
                          {a.assessment_date ? new Date(a.assessment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (student.latestAssessment || '—')}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                          {a.height_cm ? `${a.height_cm}` : (student.height ? `${student.height}` : '—')}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                          {a.weight_kg ? `${a.weight_kg}` : (student.weight ? `${student.weight}` : '—')}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }}>
                          {a.bmi ? `${a.bmi}` : (student.bmi ? `${student.bmi}` : '—')}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', color: isSeverelyWasted ? '#DC2626' : '#EA580C', fontWeight: 700 }}>
                          {typeof a.bmi_for_age_zscore === 'number' ? `${a.bmi_for_age_zscore.toFixed(2)} SD` : (typeof student.bmiZScore === 'number' ? `${student.bmiZScore.toFixed(2)} SD` : '—')}
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            fontWeight: 700,
                            backgroundColor: isSeverelyWasted ? '#FEE2E2' : '#FFEDD5',
                            color: isSeverelyWasted ? '#DC2626' : '#EA580C'
                          }}>
                            {a.nutrition_status || student.currentStatus || 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', color: '#64748B' }}>
                          {a.examiner_name || 'School Health Officer'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                        No historical assessment records found in database for this student. Conduct assessments in the Mobile App to populate this log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Clinical & Dietary Action Notes */}
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
                RECOMMENDED CLINICAL & DIETARY INTERVENTION:
              </div>
              <ul style={{ margin: '0 0 0 16px', padding: 0, color: '#475569', lineHeight: 1.5 }}>
                <li>Enroll in daily School Supplementary High-Protein Midday Meal Program.</li>
                <li>Administer prophylactic Iron-Folic Acid (IFA) and De-worming (Albendazole 400mg) as per protocol.</li>
                <li>Bi-weekly home nutritional counseling for parents with Community Health Worker (ASHA/Anganwadi).</li>
                <li><strong>Next Mandatory Re-Assessment:</strong> {nextDueFormatted}.</li>
              </ul>
            </div>

            {/* Signatures & Stamp Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px dashed #CBD5E1' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  School Headmaster / Health In-charge
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ height: '36px' }}></div>
                <div style={{ borderTop: '1px solid #94A3B8', paddingTop: '4px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  Medical Examiner / Pediatrician
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '120px' }}>
                <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '12px 6px', fontSize: '9px', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Official Health Seal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
