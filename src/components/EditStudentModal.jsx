import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  School,
  Calendar,
  Layers,
  Scale,
  Ruler,
  AlertCircle,
  Save,
} from 'lucide-react';
import { api } from '../services/api';

export default function EditStudentModal({
  isOpen = true,
  student,
  schools = [],
  onClose,
  onSuccess,
}) {
  if (!isOpen || !student) return null;

  // Form states
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [className, setClassName] = useState('Class 1');
  const [section, setSection] = useState('A');
  const [sectionError, setSectionError] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [enrollmentStatus, setEnrollmentStatus] = useState('Active');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Submission / error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  // Populate initial values from student prop
  useEffect(() => {
    if (!student) return;

    setName(student.name || student.raw?.name || '');
    setSchoolId(student.school_id || student.raw?.school_id || '');

    // Class / section
    const cls = student.classVal || student.class_name || student.raw?.class_name || 'Class 1';
    setClassName(cls.startsWith('Class ') ? cls : `Class ${cls}`);
    setSection(student.section || student.raw?.section || 'A');

    // DOB
    const rawDob = student.dob || student.raw?.dob || '';
    if (rawDob) {
      try {
        const d = new Date(rawDob);
        if (!isNaN(d.getTime())) {
          setDob(d.toISOString().split('T')[0]);
        } else {
          setDob(rawDob);
        }
      } catch {
        setDob(rawDob);
      }
    } else {
      setDob('');
    }

    setGender(student.gender || student.raw?.gender || 'Female');
    setEnrollmentStatus(student.enrollmentStatus || student.raw?.enrollment_status || 'Active');
    setAcademicYear(student.academicYear || student.raw?.academic_year || '2026-2027');

    const h = student.height || student.raw?.height_cm;
    const w = student.weight || student.raw?.weight_kg;
    setHeightCm(h && h > 0 ? String(h) : '');
    setWeightKg(w && w > 0 ? String(w) : '');
    setErrorMsg('');
  }, [student]);

  // Live Age Calculation
  const ageDisplay = useMemo(() => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  }, [dob]);

  // Live BMI Calculation
  const liveBmi = useMemo(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h > 0 && w > 0) {
      const hm = h / 100;
      return (w / (hm * hm)).toFixed(2);
    }
    return null;
  }, [heightCm, weightKg]);

  // Live Quick Nutrition Classification Preview
  const liveStatusPreview = useMemo(() => {
    if (!liveBmi) return null;
    const bmiVal = parseFloat(liveBmi);
    if (bmiVal < 13.5) return { status: 'Severely Wasted', color: '#DC2626', bg: '#FEE2E2', border: '#FCA5A5' };
    if (bmiVal < 15.0) return { status: 'Wasted', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' };
    if (bmiVal > 21.0) return { status: 'Overweight', color: '#D97706', bg: '#FEF3C7', border: '#FCD34D' };
    return { status: 'Normal', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' };
  }, [liveBmi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Student full name is required.');
      return;
    }
    if (nameError) {
      setErrorMsg(nameError);
      return;
    }
    if (sectionError) {
      setErrorMsg(sectionError);
      return;
    }
    if (!schoolId) {
      setErrorMsg('Please select a school for this student.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        school_id: schoolId,
        class_name: className.trim(),
        section: section.trim().toUpperCase(),
        dob: dob || null,
        gender: gender,
        enrollment_status: enrollmentStatus,
        academic_year: academicYear,
        height_cm: heightCm ? parseFloat(heightCm) : null,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
      };

      const updated = await api.updateStudent(student.id, payload);
      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to update student:', err);
      setErrorMsg(err.message || 'An error occurred while saving student changes.');
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Edit Student Details
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                  }}
                >
                  {student.id}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                Update student identity, school allocation, and growth metrics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: '20px 24px',
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 150px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Error Banner */}
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#B91C1C',
                  fontSize: '13px',
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Basic Information */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Student Identity
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: nameError ? '#DC2626' : '#334155' }}>
                      Full Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span style={{ fontSize: '11px', color: name.length >= 20 ? '#EA580C' : '#94A3B8', fontWeight: 600 }}>
                      {name.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => {
                      if (!name.trim()) setNameError('Student full name is required');
                    }}
                    placeholder="e.g. Ananya Sharma"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: nameError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: nameError ? '#FEF2F2' : '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, background-color 0.15s',
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Gender
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
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                      Date of Birth
                    </label>
                    {ageDisplay && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '1px 6px', borderRadius: '6px' }}>
                        Age: {ageDisplay}
                      </span>
                    )}
                  </div>
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
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: School & Academic Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                2. School & Class Allocation
              </div>

              {/* School Selector (All Schools) */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  School <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">Select School...</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.cluster_name ? `(${s.cluster_name})` : ''}
                      </option>
                    ))}
                  </select>
                  <School size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '11px', pointerEvents: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                {/* Class */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Class / Grade
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Class 3"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Section */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: sectionError ? '#DC2626' : '#334155', marginBottom: '6px' }}>
                    Section
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={section}
                    onChange={handleSectionChange}
                    onBlur={() => {
                      if (!section.trim()) setSectionError('Section is required');
                    }}
                    placeholder="e.g. A"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: sectionError ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: sectionError ? '#FEF2F2' : '#FFFFFF',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.15s, background-color 0.15s',
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

                {/* Academic Year */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Academic Year
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={academicYear || '2026-2027'}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#64748B',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>

                {/* Enrollment Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Enrollment Status
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={enrollmentStatus || 'Active'}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#64748B',
                      outline: 'none',
                      backgroundColor: '#F8FAFC',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Physical Measurements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3. Health & Physical Metrics (Latest)
                </div>
                {liveStatusPreview && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: liveStatusPreview.bg,
                      color: liveStatusPreview.color,
                      border: `1px solid ${liveStatusPreview.border}`,
                      padding: '3px 10px',
                      borderRadius: '10px',
                    }}
                  >
                    WHO Preview: {liveStatusPreview.status}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                {/* Height */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Height (cm)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="30"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="e.g. 125.5"
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Ruler size={15} color="#64748B" style={{ position: 'absolute', left: '10px', top: '12px', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Weight (kg)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="200"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="e.g. 24.5"
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box',
                      }}
                    />
                    <Scale size={15} color="#64748B" style={{ position: 'absolute', left: '10px', top: '12px', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Calculated BMI Display */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Body Mass Index (BMI)
                  </label>
                  <div
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: liveBmi ? '#0F172A' : '#94A3B8',
                    }}
                  >
                    {liveBmi ? `${liveBmi} kg/m²` : 'Enter H & W'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 6px rgba(235, 90, 29, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
