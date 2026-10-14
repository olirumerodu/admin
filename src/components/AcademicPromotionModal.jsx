import React, { useState, useMemo } from 'react';
import { X, GraduationCap, CheckCircle, AlertCircle, ArrowRight, RotateCcw, Search, School, Users, Check, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function AcademicPromotionModal({ isOpen = true, school, allStudents = [], onClose, onSuccess }) {
  if (!isOpen || !school) return null;

  const [currentYear, setCurrentYear] = useState('2026-2027');
  const [targetYear, setTargetYear] = useState('2027-2028');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [repeatingIds, setRepeatingIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [promotionResult, setPromotionResult] = useState(null);

  const handleCurrentYearChange = (val) => {
    setCurrentYear(val);
    const m = val.match(/^(\d{4})-(\d{4})$/);
    if (m) {
      setTargetYear(`${parseInt(m[1], 10) + 1}-${parseInt(m[2], 10) + 1}`);
    }
  };

  // Extract max/terminal class from classes_range e.g. "1–8" -> 8
  const terminalClassNum = useMemo(() => {
    if (!school) return 8;
    const cr = String(school.classes_range || '1–8');
    const nums = cr.match(/\d+/g);
    return nums ? Math.max(...nums.map(Number)) : 8;
  }, [school]);

  // Filter students belonging to this school who are active
  const schoolStudents = useMemo(() => {
    if (!school) return [];
    return allStudents.filter(s => {
      const isThisSchool = s.school_id === school.id || s.school_name?.toLowerCase() === school.name?.toLowerCase();
      const isActive = !s.enrollment_status || s.enrollment_status === 'Active';
      return isThisSchool && isActive;
    });
  }, [allStudents, school]);

  // Analyze each student's outcome based on repeating set
  const analyzedStudents = useMemo(() => {
    return schoolStudents.map((std, idx) => {
      const rawCls = std.class_name || 'Class 1';
      const nums = String(rawCls).match(/\d+/g);
      const currClsNum = nums ? parseInt(nums[0], 10) : 1;
      const isRepeating = repeatingIds.has(std.id);

      let action = 'Promoted';
      let nextClass = `Class ${currClsNum + 1}`;
      let badgeColor = '#16A34A';
      let badgeBg = '#DCFCE7';

      if (isRepeating) {
        action = 'Repeating';
        nextClass = rawCls;
        badgeColor = '#D97706';
        badgeBg = '#FEF3C7';
      } else if (currClsNum >= terminalClassNum) {
        action = 'Graduated';
        nextClass = 'Alumni / Graduated';
        badgeColor = '#9333EA';
        badgeBg = '#F3E8FF';
      }

      return {
        ...std,
        sno: idx + 1,
        currClsNum,
        rawCls,
        nextClass,
        action,
        badgeColor,
        badgeBg,
      };
    });
  }, [schoolStudents, repeatingIds, terminalClassNum]);

  // Counts summary
  const summary = useMemo(() => {
    let promoted = 0;
    let graduated = 0;
    let repeating = 0;
    analyzedStudents.forEach(s => {
      if (s.action === 'Promoted') promoted++;
      else if (s.action === 'Graduated') graduated++;
      else if (s.action === 'Repeating') repeating++;
    });
    return { total: analyzedStudents.length, promoted, graduated, repeating };
  }, [analyzedStudents]);

  // Filter for display table
  const displayedStudents = useMemo(() => {
    return analyzedStudents.filter(s => {
      if (classFilter !== 'All' && s.rawCls !== classFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [analyzedStudents, classFilter, search]);

  const uniqueClasses = useMemo(() => {
    const set = new Set(schoolStudents.map(s => s.class_name || 'Class 1'));
    return Array.from(set).sort();
  }, [schoolStudents]);

  const toggleStudent = (stdId) => {
    setRepeatingIds(prev => {
      const next = new Set(prev);
      if (next.has(stdId)) {
        next.delete(stdId);
      } else {
        next.add(stdId);
      }
      return next;
    });
  };

  const handleSelectAll = (promoteAll = true) => {
    if (promoteAll) {
      setRepeatingIds(new Set());
    } else {
      setRepeatingIds(new Set(schoolStudents.map(s => s.id)));
    }
  };

  const handleExecutePromotion = async () => {
    if (!school) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        from_year: currentYear,
        to_year: targetYear,
        terminal_class: terminalClassNum,
        repeating_student_ids: Array.from(repeatingIds),
        promoted_by: 'Administrator',
      };

      const result = await api.promoteAcademicYear(school.id, payload);
      setPromotionResult(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error('Promotion error:', err);
      setErrorMsg(err.message || 'Academic year promotion failed. Please try again.');
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
          maxWidth: '920px',
          maxHeight: '90vh',
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
            padding: '20px 24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(251, 146, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FB923C',
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                Academic Year Rollover & Student Promotion
              </h2>
              <div style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '2px' }}>
                {school?.name} • Grades Range: {school?.classes_range || '1–8'}
              </div>
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
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* SUCCESS SCREEN */}
          {promotionResult ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <CheckCircle size={36} />
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                Academic Year Promoted Successfully!
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', maxWidth: '500px', margin: '0 auto 24px auto' }}>
                {promotionResult.message}
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '14px',
                  maxWidth: '540px',
                  margin: '0 auto 32px auto',
                }}
              >
                <div style={{ padding: '14px', backgroundColor: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A' }}>{promotionResult.promoted_count}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>Students Promoted (+1)</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FAF5FF', borderRadius: '10px', border: '1px solid #E9D5FF' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#9333EA' }}>{promotionResult.graduated_count}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#7E22CE' }}>Class {terminalClassNum} Graduated</div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#FFFBEB', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706' }}>{promotionResult.repeating_count}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>Retained / Repeating</div>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={onClose}
                style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
              >
                Close & View Updated Students
              </button>
            </div>
          ) : (
            <>
              {/* Year Transition Control Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>
                      Current Year
                    </label>
                    <input
                      type="text"
                      value={currentYear}
                      onChange={(e) => handleCurrentYearChange(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        width: '120px',
                      }}
                    />
                  </div>

                  <ArrowRight size={20} color="#EA580C" style={{ marginTop: '16px' }} />

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', display: 'block', textTransform: 'uppercase' }}>
                      New Academic Year
                    </label>
                    <input
                      type="text"
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: '1.5px solid #EA580C',
                        borderRadius: '6px',
                        width: '120px',
                        color: '#EA580C',
                      }}
                    />
                  </div>
                </div>

                {/* Summary badges */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                    ● {summary.promoted} to Promote
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#F3E8FF', color: '#9333EA' }}>
                    ● {summary.graduated} Graduating (Class {terminalClassNum})
                  </span>
                  {summary.repeating > 0 && (
                    <span style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706' }}>
                      ● {summary.repeating} Repeating
                    </span>
                  )}
                </div>
              </div>

              {/* Informational Notice */}
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  color: '#1E40AF',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  All students are checked <strong>[✓]</strong> to automatically promote (+1 standard). Class {terminalClassNum} students will be marked as <strong>Graduated / Alumni</strong>. Uncheck any student who is repeating the same class.
                </span>
              </div>

              {/* Controls: Search, Class Filter, Bulk Select */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="global-search-bar" style={{ maxWidth: '280px' }}>
                    <Search size={15} color="#94A3B8" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search student or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="filter-select"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    style={{ padding: '7px 12px', fontSize: '12px' }}
                  >
                    <option value="All">All Classes ({schoolStudents.length})</option>
                    {uniqueClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    onClick={() => handleSelectAll(true)}
                  >
                    Promote All [✓]
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    onClick={() => handleSelectAll(false)}
                  >
                    Repeat All [ ]
                  </button>
                </div>
              </div>

              {/* Students Preview Table */}
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '10px 12px', textAlign: 'center', width: '50px' }}>Promote?</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Student ID</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left' }}>Student Name</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Current Class</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Target Next Class</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStudents.length > 0 ? (
                      displayedStudents.map((std) => {
                        const isRepeating = repeatingIds.has(std.id);
                        return (
                          <tr
                            key={std.id}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              backgroundColor: isRepeating ? '#FFFBEB' : '#FFFFFF',
                              cursor: 'pointer',
                            }}
                            onClick={() => toggleStudent(std.id)}
                          >
                            <td style={{ padding: '10px 12px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={!isRepeating}
                                onChange={() => toggleStudent(std.id)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#EA580C' }}
                              />
                            </td>
                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F172A' }}>{std.id}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 600 }}>{std.name}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748B' }}>
                              {std.rawCls}-{std.section}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                              {std.nextClass}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: std.badgeColor,
                                  backgroundColor: std.badgeBg,
                                }}
                              >
                                {std.action}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                          No students found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {errorMsg && (
                <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '13px' }}>
                  {errorMsg}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!promotionResult && (
          <div
            style={{
              padding: '16px 24px',
              backgroundColor: '#F8FAFC',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '12.5px', color: '#64748B' }}>
              <strong>{schoolStudents.length} Active Students</strong> in this school
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleExecutePromotion}
                disabled={isSubmitting || schoolStudents.length === 0}
                style={{
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isSubmitting ? (
                  <span>Promoting...</span>
                ) : (
                  <>
                    <GraduationCap size={16} />
                    <span>Confirm & Promote for {targetYear}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
