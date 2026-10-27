import React from 'react';
import { X, Printer, ShieldCheck, Heart, FileText, CheckCircle2 } from 'lucide-react';
import StudentHealthLogo from './StudentHealthLogo';

export default function StudentTcCertificateModal({ isOpen = true, student, onClose }) {
  if (!isOpen || !student) return null;

  const raw = student.raw || student;
  const assessments = student.assessments || raw.assessments || [];
  const latestA = assessments.length > 0 ? assessments[0] : null;

  const handlePrint = () => {
    const printContent = document.getElementById('tc-health-certificate-print-root');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=950,height=1000');
    if (!printWindow) {
      alert('Please allow pop-ups to print the Transfer Certificate Health Record.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TC_Health_Certificate_${(student.name || 'Student').replace(/\s+/g, '_')}_${student.id || 'ID'}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 14mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 0;
              background-color: #FFFFFF;
            }
            * {
              box-sizing: border-box;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #CBD5E1;
              padding: 6px 10px;
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
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700 }}>
            <FileText size={18} color="#FB923C" />
            <span>Transfer Certificate (TC) — Official Student Health Record</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={handlePrint}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EA580C',
              }}
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          <div
            id="tc-health-certificate-print-root"
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '8px',
              padding: '24px 28px',
              color: '#0F172A',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {/* Certificate Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2.5px solid #EA580C',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <StudentHealthLogo size={58} showText={false} isWhite={false} />
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#EA580C', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    OLIRUM ERODU FOUNDATION • WAATTASAATTAM
                  </div>
                  <h1 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '2px 0 0 0', textTransform: 'uppercase' }}>
                    STUDENT HEALTH & GROWTH RECORD
                  </h1>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    Official Health Certificate Issued Upon Transfer / School Exit
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B' }}>
                <div><strong>Issue Date:</strong> {student.tc_date || new Date().toLocaleDateString('en-GB')}</div>
                <div><strong>Ref ID:</strong> TC-WHO-{student.id || 'N/A'}</div>
                <div style={{ color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>● Verified Health Screening</div>
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
                fontSize: '11.5px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Student Name:</strong> <span style={{ fontSize: '13px', fontWeight: 800 }}>{student.name}</span></div>
                <div><strong>Student ID:</strong> {student.id}</div>
                <div><strong>School:</strong> {student.schoolName || raw.school_name || 'Government Higher Secondary School'}</div>
                <div><strong>Cluster / District:</strong> {student.clusterName || raw.cluster_name || 'Erode Cluster'}</div>
                {raw.previous_school_name && (
                  <div style={{ color: '#2563EB' }}><strong>Transferred From:</strong> {raw.previous_school_name} (Old ID: {raw.previous_student_id})</div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Class & Section:</strong> Grade {student.classVal || raw.class_name} - Section {student.section}</div>
                <div><strong>Gender:</strong> {student.gender || 'Unknown'}</div>
                <div><strong>Date of Birth:</strong> {student.dobFormatted || student.dob || '-'}</div>
                <div><strong>TC Reason:</strong> {student.tc_reason || raw.tc_reason || 'School Transfer / Relocated'}</div>
              </div>
            </div>

            {/* Health Status Summary Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={20} color="#2563EB" />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E40AF' }}>
                    Latest Nutritional Classification: {student.healthStatus || latestA?.nutrition_status || 'Normal'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#3B82F6' }}>
                    WHO AnthroPlus Growth Standards Evaluated (Ages 5–19)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <div><strong>Height:</strong> {student.height || latestA?.height_cm || 0} cm</div>
                <div><strong>Weight:</strong> {student.weight || latestA?.weight_kg || 0} kg</div>
                <div><strong>BMI:</strong> {student.bmi || latestA?.bmi || 0}</div>
              </div>
            </div>

            {/* Cumulative Assessment History Table */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                CUMULATIVE HEALTH & GROWTH SCREENING TIMELINE
              </div>
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC' }}>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>Date</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', whiteSpace: 'nowrap' }}>Age</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Height</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Weight</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>BMI</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>BMI-for-Age (WHO)</th>
                      <th style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', whiteSpace: 'nowrap' }}>Nutrition Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.length > 0 ? (
                      assessments.map((a, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1' }}>{a.assessment_date || 'Baseline'}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1' }}>{a.age_display || '-'}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{a.height_cm} cm</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>{a.weight_kg} kg</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }}>{a.bmi}</td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center' }}>
                            {typeof a.bmi_for_age_zscore === 'number' ? `${a.bmi_for_age_zscore.toFixed(2)} SD` : '—'}
                          </td>
                          <td style={{ padding: '6px 8px', border: '1px solid #CBD5E1', textAlign: 'center', fontWeight: 700 }}>
                            {(a.nutrition_status?.toLowerCase().includes('obese') || a.nutrition_status?.toLowerCase().includes('obesity')) ? 'Overweight' : (a.nutrition_status || 'Normal')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: '10px', textAlign: 'center', color: '#64748B' }}>
                          Baseline checkup verified. Height: {student.height || 0} cm • Weight: {student.weight || 0} kg • BMI: {student.bmi || 0}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Medical Advice Box */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '28px',
                fontSize: '11px',
                color: '#475569',
              }}
            >
              <strong>Health Officer Remarks:</strong> Student physical development has been monitored under the Waattasaattam child health program following World Health Organization (WHO 2007) standards. Recommended for balanced nutrition and regular physical activity at destination institution.
            </div>

            {/* Official Authorization & Signatures */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                paddingTop: '20px',
                borderTop: '1px dashed #CBD5E1',
                textAlign: 'center',
                fontSize: '11px',
              }}
            >
              <div>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px solid #0F172A', paddingTop: '4px', fontWeight: 700 }}>
                  Screening Medical Officer
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Waattasaattam Health Team</div>
              </div>

              <div>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px solid #0F172A', paddingTop: '4px', fontWeight: 700 }}>
                  Headmaster / Principal
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Authorized Signatory</div>
              </div>

              <div>
                <div style={{ height: '40px' }} />
                <div style={{ borderTop: '1px solid #0F172A', paddingTop: '4px', fontWeight: 700 }}>
                  Official School Seal
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Date & Stamp</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
