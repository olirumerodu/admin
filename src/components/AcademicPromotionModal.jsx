import React, { useState, useEffect, useMemo } from 'react';
import { X, GraduationCap, CheckCircle, AlertCircle, ArrowRight, RotateCcw, Search, School, Users, Check, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, Calendar, CheckSquare, Square } from 'lucide-react';
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

  // Shift helper function: shifts a year string by delta (+1 or -1)
  const shiftAcademicYear = (yearStr, delta) => {
    if (!yearStr) {
      const cur = new Date().getFullYear();
      return `${cur}-${cur + 1}`;
    }
    const m = String(yearStr).trim().match(/^(\d{4})[-/–](\d{4})$/);
    if (m) {
      const y1 = parseInt(m[1], 10) + delta;
      const y2 = parseInt(m[2], 10) + delta;
      return `${y1}-${y2}`;
    }
    const single = String(yearStr).match(/\d{4}/);
    if (single) {
      const y = parseInt(single[0], 10) + delta;
      return `${y}-${y + 1}`;
    }
    return yearStr;
  };

  const handleCurrentYearChange = (val) => {
    setCurrentYear(val);
    const m = String(val).trim().match(/^(\d{4})[-/–](\d{4})$/);
    if (m) {
      setTargetYear(`${parseInt(m[1], 10) + 1}-${parseInt(m[2], 10) + 1}`);
    }
  };

  const handleShiftCurrentYear = (delta) => {
    const nextCurrent = shiftAcademicYear(currentYear, delta);
    setCurrentYear(nextCurrent);
    const m = String(nextCurrent).trim().match(/^(\d{4})[-/–](\d{4})$/);
    if (m) {
      setTargetYear(`${parseInt(m[1], 10) + 1}-${parseInt(m[2], 10) + 1}`);
    } else {
      setTargetYear(shiftAcademicYear(targetYear, delta));
    }
  };

  const handleShiftTargetYear = (delta) => {
    setTargetYear(prev => shiftAcademicYear(prev, delta));
  };

  // Filter students belonging to this school who are active
  const schoolStudents = useMemo(() => {
    if (!school) return [];
    return allStudents.filter(s => {
      const isThisSchool = s.school_id === school.id || s.school_name?.toLowerCase() === school.name?.toLowerCase();
      const isActive = !s.enrollment_status || s.enrollment_status === 'Active';
      return isThisSchool && isActive;
    });
  }, [allStudents, school]);

  // Maximum class number detected among actual active students in this school
  const maxStudentClassNum = useMemo(() => {
    let maxNum = 0;
    schoolStudents.forEach(s => {
      const rawCls = s.class_name || s.raw?.class_name || '';
      const nums = String(rawCls).match(/\d+/g);
      if (nums) {
        const n = parseInt(nums[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    return maxNum;
  }, [schoolStudents]);

  // Dynamic terminal (highest) class - no hardcoded 1-8 fallback!
  // Takes the highest detected between configured classes_range and actual students in the school.
  const autoTerminalClass = useMemo(() => {
    const cr = String(school?.classes_range || '');
    const nums = cr.match(/\d+/g);
    const crMax = nums ? Math.max(...nums.map(Number)) : 0;
    const highest = Math.max(crMax, maxStudentClassNum);
    return highest > 0 ? highest : (maxStudentClassNum > 0 ? maxStudentClassNum : 10);
  }, [school, maxStudentClassNum]);

  const [customTerminalClass, setCustomTerminalClass] = useState(null);

  // Keep customTerminalClass synced when school/students load
  useEffect(() => {
    if (autoTerminalClass) {
      setCustomTerminalClass(autoTerminalClass);
    }
  }, [autoTerminalClass]);

  const terminalClassNum = customTerminalClass || autoTerminalClass || 10;

  // Available options for terminal/graduating class dropdown
  const terminalClassOptions = useMemo(() => {
    const opts = new Set([terminalClassNum, autoTerminalClass, maxStudentClassNum]);
    [5, 8, 9, 10, 11, 12].forEach(n => {
      if (maxStudentClassNum <= 0 || n >= Math.min(maxStudentClassNum, 8)) {
        opts.add(n);
      }
    });
    return Array.from(opts).filter(n => n > 0).sort((a, b) => a - b);
  }, [terminalClassNum, autoTerminalClass, maxStudentClassNum]);

  // Dominant active academic year in this school to set default current & target year
  const dominantAcademicYear = useMemo(() => {
    if (!schoolStudents.length) return '2026-2027';
    const counts = {};
    schoolStudents.forEach(s => {
      const yr = s.academic_year || s.raw?.academic_year;
      if (yr) counts[yr] = (counts[yr] || 0) + 1;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return sorted[0] || '2026-2027';
  }, [schoolStudents]);

  useEffect(() => {
    if (dominantAcademicYear) {
      setCurrentYear(dominantAcademicYear);
      const m = dominantAcademicYear.match(/^(\d{4})-(\d{4})$/);
      if (m) {
        setTargetYear(`${parseInt(m[1], 10) + 1}-${parseInt(m[2], 10) + 1}`);
      }
    }
  }, [dominantAcademicYear]);

  // Quick selectable academic years (including past historical years and dominant year)
  const quickYears = useMemo(() => {
    const set = new Set(['2023-2024', '2024-2025', '2025-2026', '2026-2027', '2027-2028']);
    if (dominantAcademicYear) set.add(dominantAcademicYear);
    return Array.from(set).sort();
  }, [dominantAcademicYear]);

  // Analyze each student's outcome based on repeating set
  const analyzedStudents = useMemo(() => {
    return schoolStudents.map((std, idx) => {
      const rawCls = std.class_name || 'Class 1';
      const nums = String(rawCls).match(/\d+/g);
      const currClsNum = nums ? parseInt(nums[0], 10) : 1;
      const isRepeating = repeatingIds.has(std.id);

      let action = 'Promote';
      let nextClass = `Class ${currClsNum + 1}`;
      let badgeColor = '#16A34A';
      let badgeBg = '#DCFCE7';

      if (isRepeating) {
        action = 'Repeat';
        nextClass = rawCls;
        badgeColor = '#D97706';
        badgeBg = '#FEF3C7';
      } else if (currClsNum >= terminalClassNum) {
        action = 'Graduate';
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
      if (s.action === 'Promote') promoted++;
      else if (s.action === 'Graduate') graduated++;
      else if (s.action === 'Repeat') repeating++;
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
                {school?.name} • Grades Range: {school?.classes_range || `Classes 1–${terminalClassNum}`}
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
              {/* Year Transition Control Banner - Split Professionally */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)',
                  gap: '18px',
                  padding: '16px 20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  marginBottom: '20px',
                  alignItems: 'stretch',
                }}
              >
                {/* Left Section: Transition Inputs & Quick Jump */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Current Academic Year (From) - Stepper & Manual Enter */}
                    <div style={{ flex: '1 1 auto', minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>
                        From Academic Year
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleShiftCurrentYear(-1)}
                          title="Shift 1 Year Back (-1)"
                          style={{
                            padding: '7px 8px',
                            backgroundColor: '#F8FAFC',
                            border: 'none',
                            borderRight: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <input
                          type="text"
                          value={currentYear}
                          onChange={(e) => handleCurrentYearChange(e.target.value)}
                          placeholder="YYYY-YYYY"
                          title="Manual enter academic year or use ◀ / ▶ buttons to shift"
                          style={{
                            width: '100%',
                            minWidth: '80px',
                            padding: '6px 4px',
                            fontSize: '13px',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            color: '#0F172A',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleShiftCurrentYear(1)}
                          title="Shift 1 Year Forward (+1)"
                          style={{
                            padding: '7px 8px',
                            backgroundColor: '#F8FAFC',
                            border: 'none',
                            borderLeft: '1px solid #E2E8F0',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <ArrowRight size={18} color="#EA580C" style={{ marginTop: '18px', flexShrink: 0 }} />

                    {/* New Academic Year (To) - Stepper & Manual Enter */}
                    <div style={{ flex: '1 1 auto', minWidth: '140px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#EA580C', display: 'block', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>
                        To Academic Year
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #EA580C',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 2px rgba(234, 88, 12, 0.08)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleShiftTargetYear(-1)}
                          title="Shift 1 Year Back (-1)"
                          style={{
                            padding: '7px 8px',
                            backgroundColor: '#FFF7ED',
                            border: 'none',
                            borderRight: '1px solid #FFEDD5',
                            cursor: 'pointer',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FED7AA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFF7ED')}
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <input
                          type="text"
                          value={targetYear}
                          onChange={(e) => setTargetYear(e.target.value)}
                          placeholder="YYYY-YYYY"
                          title="Manual enter target academic year or use ◀ / ▶ buttons to shift"
                          style={{
                            width: '100%',
                            minWidth: '80px',
                            padding: '6px 4px',
                            fontSize: '13px',
                            fontWeight: 700,
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            color: '#EA580C',
                            backgroundColor: 'transparent',
                            fontFamily: 'inherit',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleShiftTargetYear(1)}
                          title="Shift 1 Year Forward (+1)"
                          style={{
                            padding: '7px 8px',
                            backgroundColor: '#FFF7ED',
                            border: 'none',
                            borderLeft: '1px solid #FFEDD5',
                            cursor: 'pointer',
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FED7AA')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFF7ED')}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Graduating Class */}
                    <div style={{ flex: '1 1 auto', minWidth: '130px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#7E22CE', display: 'block', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>
                        Graduating Class
                      </label>
                      <select
                        value={terminalClassNum}
                        onChange={(e) => setCustomTerminalClass(parseInt(e.target.value, 10))}
                        style={{
                          width: '100%',
                          height: '35px',
                          padding: '0 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          border: '1.5px solid #9333EA',
                          borderRadius: '8px',
                          backgroundColor: '#FFFFFF',
                          color: '#7E22CE',
                          cursor: 'pointer',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        {terminalClassOptions.map(n => (
                          <option key={n} value={n}>
                            Class {n} {n === autoTerminalClass ? '(Auto)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quick Select Previous / Current / Future Years */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Quick Jump:</span>
                    {quickYears.map(yr => {
                      const isSelected = currentYear === yr;
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => handleCurrentYearChange(yr)}
                          style={{
                            padding: '3px 9px',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                            color: isSelected ? '#EA580C' : '#475569',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {yr} {yr === dominantAcademicYear ? '(Current Data)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Section: Promotion Forecast KPI Cards occupying the right side */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <GraduationCap size={14} color="#7E22CE" />
                      <span>Cohort Promotion Forecast</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                      Total: {summary.total}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: summary.repeating > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '10px' }}>
                    {/* Promote KPI Tile */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#F0FDF4',
                        border: '1px solid #86EFAC',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }}></span>
                        <span>To Promote</span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D', lineHeight: 1.2, marginTop: '2px' }}>
                        {summary.promoted}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#166534', opacity: 0.85, marginTop: '2px' }}>
                        Next Grade
                      </div>
                    </div>

                    {/* Graduate KPI Tile */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#FAF5FF',
                        border: '1px solid #D8B4FE',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B21A8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9333EA' }}></span>
                        <span>To Graduate</span>
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#7E22CE', lineHeight: 1.2, marginTop: '2px' }}>
                        {summary.graduated}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#6B21A8', opacity: 0.85, marginTop: '2px' }}>
                        Class {terminalClassNum} Alumni
                      </div>
                    </div>

                    {/* Repeat KPI Tile if any */}
                    {summary.repeating > 0 && (
                      <div
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }}></span>
                          <span>To Repeat</span>
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309', lineHeight: 1.2, marginTop: '2px' }}>
                          {summary.repeating}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#92400E', opacity: 0.85, marginTop: '2px' }}>
                          Retained
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Professional Search Input Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '0 12px',
                      height: '38px',
                      width: '260px',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <Search size={15} color="#64748B" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search student or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        color: '#0F172A',
                        width: '100%',
                        fontFamily: 'inherit',
                      }}
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch('')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Professional Class Filter Dropdown */}
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <select
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 34px 0 12px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '8px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <option value="All">All Classes ({schoolStudents.length})</option>
                      {uniqueClasses.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      color="#64748B"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Bulk Select Buttons */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    style={{
                      height: '38px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #BBF7D0',
                      backgroundColor: '#F0FDF4',
                      color: '#15803D',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#DCFCE7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  >
                    <CheckSquare size={14} color="#16A34A" />
                    <span>Promote All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    style={{
                      height: '38px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FDE68A',
                      backgroundColor: '#FFFBEB',
                      color: '#B45309',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3C7')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFBEB')}
                  >
                    <Square size={14} color="#D97706" />
                    <span>Repeat All</span>
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
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Planned Action</th>
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
