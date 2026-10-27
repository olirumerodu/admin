import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  UserPlus,
  Scale,
  Ruler,
  Calendar,
  Building2,
  Activity,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { getNutritionStatusColor, getNutritionStatusBg, getNutritionStatusBorder } from './StudentsManagementView';

export default function TCStudentIntakeModal({ isOpen, onClose, school, onSuccess }) {
  if (!isOpen) return null;

  // Step state: 1 = Demographics & Verification, 2 = Intake Anthropometrics, 3 = Triage Result
  const [step, setStep] = useState(1);

  // Form Fields
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [sectionError, setSectionError] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [examinerName, setExaminerName] = useState('Admin');
  const [notes, setNotes] = useState('');

  // Real-time on-field validation handlers
  const handleNameChange = (e) => {
    const raw = e.target.value;
    if (/[^a-zA-Z\s]/.test(raw)) {
      setNameError('Numbers and special characters are not allowed');
    } else if (raw.length > 20) {
      setNameError('Name cannot exceed 20 characters');
    } else {
      setNameError('');
    }
    const sanitized = raw.replace(/[^a-zA-Z\s]/g, '').slice(0, 20);
    setName(sanitized);
  };

  const handleNameBlur = () => {
    if (!name.trim()) {
      setNameError('Student full name is required');
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
    }
  };

  const handleSectionChange = (e) => {
    const raw = e.target.value;
    if (/[^a-zA-Z]/.test(raw)) {
      setSectionError('Only alphabetic characters are allowed (e.g. A, B)');
    } else {
      setSectionError('');
    }
    const sanitized = raw.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    setSection(sanitized);
  };

  const handleSectionBlur = () => {
    if (!section.trim()) {
      setSectionError('Section is required');
    }
  };

  // Lookup state
  const [isSearching, setIsSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [userConfirmedTransfer, setUserConfirmedTransfer] = useState(null); // true = transfer, false = brand new
  const [hasSearched, setHasSearched] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admitResult, setAdmitResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto trigger lookup when Name, DOB, or Gender changes
  useEffect(() => {
    if (name.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleLookup();
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setMatches([]);
      setSelectedMatch(null);
      setUserConfirmedTransfer(null);
      setHasSearched(false);
    }
  }, [name, dob, gender]);

  const handleLookup = async () => {
    if (!name.trim()) return;
    setIsSearching(true);
    setErrorMessage('');
    try {
      const res = await api.tcLookup({
        name: name.trim(),
        dob: dob || '',
        gender: gender,
        exclude_school_id: school?.id || null
      });
      const found = res?.matches || [];
      setMatches(found);
      setHasSearched(true);
      if (found.length > 0) {
        setSelectedMatch(found[0]);
        setUserConfirmedTransfer(null); // prompt user
      } else {
        setSelectedMatch(null);
        setUserConfirmedTransfer(false); // register as new
      }
    } catch (err) {
      console.error('TC lookup error:', err);
      setErrorMessage(err.message || 'Failed to search previous records');
    } finally {
      setIsSearching(false);
    }
  };

  // Live BMI estimate
  const liveBmi = (() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h > 40 && w > 3) {
      const hm = h / 100;
      return (w / (hm * hm)).toFixed(2);
    }
    return null;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter student name.');
      return;
    }
    if (!dob) {
      setErrorMessage('Please select date of birth.');
      return;
    }
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (!h || h <= 30 || h >= 250) {
      setErrorMessage('Please enter a valid height in cm (30 - 250).');
      return;
    }
    if (!w || w <= 3 || w >= 200) {
      setErrorMessage('Please enter a valid weight in kg (3 - 200).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        existing_student_id: (userConfirmedTransfer && selectedMatch) ? selectedMatch.id : null,
        school_id: school?.id,
        class_name: className,
        section: section,
        name: name.trim(),
        dob: dob,
        gender: gender,
        height_cm: h,
        weight_kg: w,
        assessment_date: assessmentDate,
        examiner_name: examinerName,
        notes: notes || `Admitted under TC tracking (${userConfirmedTransfer && selectedMatch ? 'Transferred' : 'New Admission'})`
      };

      const res = await api.tcAdmit(payload);
      setAdmitResult(res);
      setStep(3);
    } catch (err) {
      console.error('Error admitting student:', err);
      setErrorMessage(err.message || 'Failed to admit TC student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const availableClasses = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(14, 165, 233, 0.2)',
              border: '1px solid rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowRightLeft size={20} color="#38BDF8" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.02em' }}>
                Admit TC / Transfer Student
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Admitting into <strong style={{ color: '#E2E8F0' }}>{school?.name || 'Selected School'}</strong> &bull; Match records by Name, DOB & Gender
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progression Indicator */}
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: step >= 1 ? '#0284C7' : '#94A3B8'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: step >= 1 ? '#0284C7' : '#E2E8F0',
              color: step >= 1 ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>1</span>
            <span>Student Verification</span>
          </div>

          <ChevronRight size={14} color="#CBD5E1" />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: step >= 2 ? '#0284C7' : '#94A3B8'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: step >= 2 ? '#0284C7' : '#E2E8F0',
              color: step >= 2 ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>2</span>
            <span>Intake Measurements & Triage</span>
          </div>

          <ChevronRight size={14} color="#CBD5E1" />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            color: step >= 3 ? '#16A34A' : '#94A3B8'
          }}>
            <span style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: step >= 3 ? '#16A34A' : '#E2E8F0',
              color: step >= 3 ? '#FFFFFF' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>3</span>
            <span>Admission Outcome</span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', flex: 1 }}>
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#B91C1C',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: DEMOGRAPHICS & LOOKUP */}
          {step === 1 && (
            <div>
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#0369A1',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  Enter the student's <strong>Full Name, Date of Birth, and Gender</strong>. The system automatically searches prior records from their former school across the cluster to compare past health checkups.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: nameError ? '#DC2626' : '#334155' }}>
                      Student Full Name *
                    </label>
                    <span style={{ fontSize: '11px', color: name.length >= 20 ? '#EA580C' : '#94A3B8', fontWeight: 600 }}>
                      {name.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={name}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    placeholder="e.g. Harish Menon"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: nameError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: nameError ? '#FEF2F2' : '#FFFFFF',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  />
                  {nameError ? (
                    <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', fontWeight: 500 }}>
                      {nameError}
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                      Alphabetic & spaces only (max 20 chars)
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Admit to Class *
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF',
                      color: className ? '#0F172A' : '#94A3B8'
                    }}
                  >
                    <option value="" disabled>Select Class</option>
                    {availableClasses.map((cls) => (
                      <option key={cls} value={cls} style={{ color: '#0F172A' }}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: sectionError ? '#DC2626' : '#334155', marginBottom: '6px' }}>
                    Section *
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={section}
                    onChange={handleSectionChange}
                    onBlur={handleSectionBlur}
                    placeholder="Enter Section (e.g. A)"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: sectionError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: sectionError ? '#FEF2F2' : '#FFFFFF',
                      transition: 'border-color 0.15s, background-color 0.15s'
                    }}
                  />
                  {sectionError ? (
                    <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', fontWeight: 500 }}>
                      {sectionError}
                    </div>
                  ) : (
                    <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '4px' }}>
                      Alphabetic only (e.g. A, B)
                    </div>
                  )}
                </div>
              </div>

              {/* SEARCH / MATCH RESULTS SECTION */}
              <div style={{
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: '#F8FAFC',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#64748B" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      Historical School Record Match Status
                    </span>
                  </div>
                  {isSearching && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0284C7' }}>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Checking cluster records...</span>
                    </div>
                  )}
                </div>

                {isSearching ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                    Scanning database for matching records by Name, DOB, and Gender...
                  </div>
                ) : matches.length > 0 ? (
                  <div>
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '14px',
                      fontSize: '12px',
                      color: '#1E40AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Sparkles size={16} color="#3B82F6" />
                      <span>Found <strong>{matches.length} matching student record(s)</strong> from previous school(s) in database!</span>
                    </div>

                    {matches.map((m) => {
                      const isChosen = selectedMatch?.id === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMatch(m)}
                          style={{
                            border: isChosen ? '2px solid #0284C7' : '1px solid #CBD5E1',
                            borderRadius: '10px',
                            padding: '14px',
                            backgroundColor: isChosen ? '#F0F9FF' : '#FFFFFF',
                            cursor: 'pointer',
                            marginBottom: '10px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{m.name}</span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: '#E2E8F0',
                                  color: '#334155'
                                }}>
                                  ID: {m.id}
                                </span>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: m.enrollment_status === 'TC Issued' ? '#FEE2E2' : '#EFF6FF',
                                  color: m.enrollment_status === 'TC Issued' ? '#DC2626' : '#2563EB',
                                  border: `1px solid ${m.enrollment_status === 'TC Issued' ? '#FCA5A5' : '#BFDBFE'}`
                                }}>
                                  {m.enrollment_status === 'TC Issued' ? 'TC Issued' : m.enrollment_status}
                                </span>
                                {!m.is_exact_match && (
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#B45309',
                                    border: '1px solid #FDE047'
                                  }}>
                                    DOB on record: {m.dob}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Building2 size={13} />
                                <span>Former School: <strong>{m.school_name}</strong> ({m.school_code}) &bull; Cluster: <strong>{m.cluster_name || 'N/A'}</strong></span>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              backgroundColor: getNutritionStatusBg(m.latest_nutrition_status),
                              color: getNutritionStatusColor(m.latest_nutrition_status),
                              border: `1px solid ${getNutritionStatusBorder(m.latest_nutrition_status)}`
                            }}>
                              Last Status: {m.latest_nutrition_status}
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#475569'
                          }}>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Past Class:</span> <strong>{m.class_name} ({m.section})</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Assessments:</span> <strong>{m.assessment_count} Checkups</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Latest Height:</span> <strong>{m.latest_height_cm ? `${m.latest_height_cm} cm` : '—'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Latest Weight:</span> <strong>{m.latest_weight_kg ? `${m.latest_weight_kg} kg` : '—'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Latest BMI:</span> <strong>{m.latest_bmi ? m.latest_bmi : '—'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#94A3B8' }}>Z-Score:</span> <strong>{m.latest_bmi_for_age_zscore !== null ? m.latest_bmi_for_age_zscore : '—'}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* CONFIRMATION PROMPT */}
                    <div style={{
                      marginTop: '16px',
                      padding: '14px',
                      backgroundColor: '#FEF9C3',
                      border: '1px solid #FDE047',
                      borderRadius: '10px'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#854D0E', marginBottom: '8px' }}>
                        Is this the same student transferring to {school?.name}?
                      </div>
                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#713F12' }}>
                        Confirming will link and migrate their past health assessments and growth history to this school.
                      </p>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedMatch?.dob) {
                              setDob(selectedMatch.dob);
                            }
                            setUserConfirmedTransfer(true);
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: userConfirmedTransfer === true ? '#16A34A' : '#FFFFFF',
                            color: userConfirmedTransfer === true ? '#FFFFFF' : '#166534',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>
                            {selectedMatch && selectedMatch.dob !== dob
                              ? `Yes, Confirm Transfer (Sync DOB to ${selectedMatch.dob})`
                              : 'Yes, Confirm Transfer & Link Records'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUserConfirmedTransfer(false)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: '1px solid #CBD5E1',
                            backgroundColor: userConfirmedTransfer === false ? '#64748B' : '#FFFFFF',
                            color: userConfirmedTransfer === false ? '#FFFFFF' : '#475569'
                          }}
                        >
                          <span>No, Different Student (Register as New)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : hasSearched ? (
                  <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1'
                  }}>
                    <UserPlus size={24} color="#64748B" style={{ margin: '0 auto 6px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      No prior records found across schools
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      Student will be registered as a <strong>New Admission</strong>. Baseline anthropometrics will be recorded next.
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '12px' }}>
                    Type the student name and select DOB above to verify prior school records.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!name.trim() || !dob || !className || !section.trim() || !!nameError || !!sectionError || (matches.length > 0 && userConfirmedTransfer === null)}
                  onClick={() => {
                    if (!name.trim()) {
                      setNameError('Student full name is required');
                      return;
                    }
                    if (!section.trim()) {
                      setSectionError('Section is required');
                      return;
                    }
                    setStep(2);
                  }}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: (!name.trim() || !dob || !className || !section.trim() || !!nameError || !!sectionError || (matches.length > 0 && userConfirmedTransfer === null)) ? '#94A3B8' : '#0284C7',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: (!name.trim() || !dob || !className || !section.trim() || !!nameError || !!sectionError || (matches.length > 0 && userConfirmedTransfer === null)) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Proceed to Measurements</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INTAKE ANTHROPOMETRICS */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div style={{
                marginBottom: '16px',
                padding: '12px 16px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} color="#16A34A" />
                <div>
                  Student: <strong>{name}</strong> &bull; DOB: <strong>{dob}</strong> &bull; Admitting to: <strong>{className} ({section})</strong>
                  <div style={{ fontSize: '11px', color: '#15803D', marginTop: '2px' }}>
                    Mode: {userConfirmedTransfer && selectedMatch ? `Transferred from ${selectedMatch.school_name}` : 'New Student Intake'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Intake Height (cm) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Ruler size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="number"
                      step="0.1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="e.g. 132.5"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Intake Weight (kg) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Scale size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 26.4"
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* BMI Live Preview */}
              {liveBmi && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#0284C7" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      Calculated BMI: <strong>{liveBmi} kg/m²</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    WHO AnthroPlus Z-scores & nutritional triage applied on submission
                  </span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assessment Date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="date"
                      value={assessmentDate}
                      onChange={(e) => setAssessmentDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Examiner / Officer Name
                  </label>
                  <input
                    type="text"
                    value={examinerName}
                    onChange={(e) => setExaminerName(e.target.value)}
                    placeholder="e.g. Admin"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Intake Notes / Clinical Observations
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional intake notes, medical diet recommendations..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '9px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#16A34A',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Admitting Student...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Confirm Admission & Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: TRIAGE RESULT OUTCOME */}
          {step === 3 && admitResult && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: admitResult.is_follow_up_required ? '#FEF2F2' : '#DCFCE7',
                border: `2px solid ${admitResult.is_follow_up_required ? '#FCA5A5' : '#86EFAC'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <CheckCircle2 size={36} color={admitResult.is_follow_up_required ? '#DC2626' : '#16A34A'} />
              </div>

              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                Student Successfully Admitted!
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748B' }}>
                {admitResult.student?.name} (ID: {admitResult.student?.id}) has been registered in {school?.name}
              </p>

              {/* Triage Banner */}
              <div style={{
                padding: '16px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'left',
                backgroundColor: admitResult.is_follow_up_required ? '#FEF2F2' : '#F0FDF4',
                border: `1.5px solid ${admitResult.is_follow_up_required ? '#F87171' : '#4ADE80'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: admitResult.is_follow_up_required ? '#B91C1C' : '#15803D'
                  }}>
                    Assigned Destination Roster
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '12px',
                    backgroundColor: getNutritionStatusBg(admitResult.nutrition_status),
                    color: getNutritionStatusColor(admitResult.nutrition_status),
                    border: `1px solid ${getNutritionStatusBorder(admitResult.nutrition_status)}`
                  }}>
                    {admitResult.nutrition_status}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: admitResult.is_follow_up_required ? '#991B1B' : '#166534', marginBottom: '6px' }}>
                  {admitResult.is_follow_up_required
                    ? 'Added to Monthly Tracking (Critical Intervention)'
                    : 'Added to Standard School Student Profile'}
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: admitResult.is_follow_up_required ? '#7F1D1D' : '#14532D', lineHeight: 1.5 }}>
                  {admitResult.is_follow_up_required
                    ? `Because the student's intake assessment indicates ${admitResult.nutrition_status} (BMI Z-score: ${admitResult.bmi_zscore || '—'}), they have been placed on active Monthly Tracking for targeted supplemental nutrition and recovery monitoring.`
                    : `The student's intake assessment indicates ${admitResult.nutrition_status} (BMI Z-score: ${admitResult.bmi_zscore || '—'}). They are enrolled in the standard general student registry.`}
                </p>
              </div>

              {/* Summary Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                padding: '14px',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                marginBottom: '24px',
                fontSize: '12px'
              }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '11px' }}>Admit Type</div>
                  <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>{admitResult.admitted_type}</strong>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '11px' }}>Height</div>
                  <strong style={{ color: '#0F172A' }}>{heightCm} cm</strong>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '11px' }}>Weight</div>
                  <strong style={{ color: '#0F172A' }}>{weightKg} kg</strong>
                </div>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: '11px' }}>Intake BMI</div>
                  <strong style={{ color: '#0F172A' }}>{admitResult.bmi} kg/m²</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                Done & Refresh Student Roster
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
