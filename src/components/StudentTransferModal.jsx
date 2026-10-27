import React, { useState } from 'react';
import { X, FileText, ArrowRightLeft, School, Calendar, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { api } from '../services/api';

export default function StudentTransferModal({ isOpen = true, student, schools = [], onClose, onSuccess, onOpenCertificate }) {
  if (!isOpen || !student) return null;

  const [activeTab, setActiveTab] = useState('tc'); // 'tc' or 'transfer'
  const [tcDate, setTcDate] = useState(new Date().toISOString().split('T')[0]);
  const [tcReason, setTcReason] = useState('Family Relocated');
  const [customTcReason, setCustomTcReason] = useState('');
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [targetClass, setTargetClass] = useState(student?.classVal || student?.class_name || 'Class 1');
  const [targetSection, setTargetSection] = useState(student?.section || 'A');
  const [transferReason, setTransferReason] = useState('Admitted to higher middle school campus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  const availableTargetSchools = schools.filter(s => s.id !== student?.school_id && s.name !== student?.raw?.school_name);

  const handleIssueTc = async () => {
    if (!student) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const reason = tcReason === 'Other' ? customTcReason || 'Transfer Certificate issued' : tcReason;
      const res = await api.issueTc(student.id, {
        tc_date: tcDate,
        tc_reason: reason,
      });

      setSuccessData({
        type: 'tc',
        message: `Transfer Certificate issued successfully for ${student.name}.`,
        student: res,
      });
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Error issuing TC:', err);
      setErrorMsg(err.message || 'Failed to issue TC. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferSchool = async () => {
    if (!student || !targetSchoolId) {
      setErrorMsg('Please select a destination school.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.transferSchool(student.id, {
        target_school_id: targetSchoolId,
        target_class_name: `Class ${String(targetClass).replace(/class\s*/i, '').trim()}`,
        target_section: String(targetSection).replace(/section\s*/i, '').trim(),
        reason: transferReason,
      });

      setSuccessData({
        type: 'transfer',
        message: `Student transferred successfully! New student ID: ${res.id}`,
        student: res,
      });
      if (onSuccess) onSuccess(res);
    } catch (err) {
      console.error('Error transferring student:', err);
      setErrorMsg(err.message || 'Failed to transfer student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '560px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
              Issue TC & School Transfer
            </h2>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              {student?.name} • ID: {student?.id}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        {!successData && (
          <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <button
              type="button"
              onClick={() => setActiveTab('tc')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'tc' ? '#FFFFFF' : 'transparent',
                fontWeight: activeTab === 'tc' ? 700 : 500,
                color: activeTab === 'tc' ? '#EA580C' : '#64748B',
                borderBottom: activeTab === 'tc' ? '2.5px solid #EA580C' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <FileText size={16} />
              <span>Issue TC (Student Exit)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transfer')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                background: activeTab === 'transfer' ? '#FFFFFF' : 'transparent',
                fontWeight: activeTab === 'transfer' ? 700 : 500,
                color: activeTab === 'transfer' ? '#2563EB' : '#64748B',
                borderBottom: activeTab === 'transfer' ? '2.5px solid #2563EB' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <ArrowRightLeft size={16} />
              <span>Transfer to Another School</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '22px 24px' }}>
          {successData ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px auto',
                }}
              >
                <CheckCircle size={32} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                {successData.type === 'tc' ? 'Transfer Certificate Issued' : 'School Transfer Complete'}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '22px' }}>
                {successData.message}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    if (onOpenCertificate) onOpenCertificate(successData.student || student);
                  }}
                  style={{
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Printer size={15} />
                  <span>Print TC Health Certificate (PDF)</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : activeTab === 'tc' ? (
            /* TAB 1: ISSUE TC */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#9A3412',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Issuing TC archives the student from active screening lists while <strong>permanently preserving</strong> all past health checkups, height/weight metrics, and WHO curves for medical records.
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TC Issue Date
                </label>
                <input
                  type="date"
                  value={tcDate}
                  onChange={(e) => setTcDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Reason for Transfer Certificate
                </label>
                <select
                  value={tcReason}
                  onChange={(e) => setTcReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Family Relocated">Family Relocated / Moved to Another City</option>
                  <option value="Admitted to Private School">Admitted to Private School</option>
                  <option value="Completed Primary / Middle School">Completed Primary / Middle School</option>
                  <option value="Medical / Personal Reasons">Medical / Personal Reasons</option>
                  <option value="Other">Other Reason...</option>
                </select>
              </div>

              {tcReason === 'Other' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Specify Reason
                  </label>
                  <input
                    type="text"
                    placeholder="Enter TC reason..."
                    value={customTcReason}
                    onChange={(e) => setCustomTcReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: TRANSFER SCHOOL */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#1E40AF',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <School size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  The student will be moved to the new school and assigned a clean sequential ID for that school. <strong>All past health assessments will travel with the student seamlessly!</strong>
                </span>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Target Destination School <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  value={targetSchoolId}
                  onChange={(e) => setTargetSchoolId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">-- Select Destination School --</option>
                  {availableTargetSchools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `[${s.code}]` : ''} ({s.cluster_name || 'Cluster'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Target Class
                  </label>
                  <input
                    type="text"
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Target Section
                  </label>
                  <input
                    type="text"
                    value={targetSection}
                    onChange={(e) => setTargetSection(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Transfer Reason
                </label>
                <input
                  type="text"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '12.5px' }}>
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!successData && (
          <div
            style={{
              padding: '14px 24px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>

            {activeTab === 'tc' ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleIssueTc}
                disabled={isSubmitting}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#EA580C',
                  borderColor: '#EA580C',
                }}
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Issue TC'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleTransferSchool}
                disabled={isSubmitting || !targetSchoolId}
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#2563EB',
                  borderColor: '#2563EB',
                }}
              >
                {isSubmitting ? 'Transferring...' : 'Confirm School Transfer'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
