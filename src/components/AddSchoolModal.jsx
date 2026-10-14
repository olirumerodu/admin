import React, { useState, useEffect } from 'react';
import { X, School, Building, MapPin, Layers, Hash, Users, Check, Plus, Home, Sparkles, Edit3, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

export default function AddSchoolModal({ isOpen, onClose, onSuccess }) {
  // Place & Institution Classification
  const [placeType, setPlaceType] = useState('school'); // 'school' | 'anganwadi' | 'daycare' | 'custom'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [clusters, setClusters] = useState([]);
  const [address, setAddress] = useState('');

  // Classes / Groups Configuration (Optional)
  const [classMode, setClassMode] = useState('standard'); // 'standard' | 'manual' | 'none'
  const [selectedClasses, setSelectedClasses] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [manualClassesInput, setManualClassesInput] = useState('Classes 1–8');

  // Sections Configuration (Optional)
  const [noSections, setNoSections] = useState(false);
  const [sectionMode, setSectionMode] = useState('standard'); // 'standard' | 'manual'
  const [selectedSections, setSelectedSections] = useState(['A', 'B', 'C']);
  const [customSections, setCustomSections] = useState([]);
  const [customSectionInput, setCustomSectionInput] = useState('');
  const [showAddCustomSection, setShowAddCustomSection] = useState(false);
  const [manualSectionsInput, setManualSectionsInput] = useState('A, B, C');

  // Classes & Sections Dropdown Selectors
  const [classSelectValue, setClassSelectValue] = useState('1-8');
  const [sectionSelectValue, setSectionSelectValue] = useState('A-C');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchClusters = async () => {
      try {
        const data = await api.getClusters();
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data);
          setClusterName(data[0].name);
        }
      } catch (err) {
        console.warn('Failed to load clusters for school modal:', err);
      }
    };
    fetchClusters();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClassSelectChange = (val) => {
    setClassSelectValue(val);
    if (val === '1-8') {
      setClassMode('standard');
      setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
    } else if (val === '1-5') {
      setClassMode('standard');
      setSelectedClasses([1, 2, 3, 4, 5]);
    } else if (val === '1-10') {
      setClassMode('standard');
      setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    } else if (val === '1-12') {
      setClassMode('standard');
      setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    } else if (val === 'anganwadi') {
      setClassMode('manual');
      setManualClassesInput('Anganwadi');
    } else if (val === 'balwadi') {
      setClassMode('manual');
      setManualClassesInput('Balwadi');
    } else if (val === 'prekg') {
      setClassMode('manual');
      setManualClassesInput('Pre-KG, LKG, UKG');
    } else if (val === 'general') {
      setClassMode('manual');
      setManualClassesInput('General');
    } else if (val === 'none') {
      setClassMode('none');
    } else if (val === 'manual') {
      setClassMode('manual');
      if (!manualClassesInput) setManualClassesInput('');
    }
  };

  const handleSectionSelectChange = (val) => {
    setSectionSelectValue(val);
    if (val === 'none') {
      setNoSections(true);
    } else if (val === 'A-C') {
      setNoSections(false);
      setSectionMode('standard');
      setSelectedSections(['A', 'B', 'C']);
    } else if (val === 'A-D') {
      setNoSections(false);
      setSectionMode('standard');
      setSelectedSections(['A', 'B', 'C', 'D']);
    } else if (val === 'A-H') {
      setNoSections(false);
      setSectionMode('standard');
      setSelectedSections(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    } else if (val === 'A') {
      setNoSections(false);
      setSectionMode('standard');
      setSelectedSections(['A']);
    } else if (val === 'manual') {
      setNoSections(false);
      setSectionMode('manual');
      if (!manualSectionsInput) setManualSectionsInput('');
    }
  };

  // Handle Place Type Switching
  const handleSelectPlaceType = (type) => {
    setPlaceType(type);
    if (type === 'anganwadi') {
      setClassSelectValue('anganwadi');
      setClassMode('manual');
      setManualClassesInput('Anganwadi');
      setSectionSelectValue('none');
      setManualSectionsInput('None');
      setNoSections(true);
      if (!name) setName('');
      if (!code) setCode('ANG-');
    } else if (type === 'daycare') {
      setClassSelectValue('prekg');
      setClassMode('manual');
      setManualClassesInput('Pre-KG & LKG');
      setSectionSelectValue('none');
      setManualSectionsInput('None');
      setNoSections(true);
      if (!code) setCode('DC-');
    } else if (type === 'custom') {
      setClassSelectValue('manual');
      setClassMode('manual');
      setManualClassesInput('');
      setSectionSelectValue('none');
      setManualSectionsInput('None');
      setNoSections(true);
    } else {
      // standard school
      setClassSelectValue('1-8');
      setClassMode('standard');
      setManualClassesInput('Classes 1–8');
      setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
      setSectionSelectValue('A-C');
      setManualSectionsInput('A, B, C');
      setNoSections(false);
      setSectionMode('standard');
      setSelectedSections(['A', 'B', 'C']);
      if (code.startsWith('ANG-') || code.startsWith('DC-')) setCode('');
    }
  };

  const formatClassesRange = (classes) => {
    if (!classes || classes.length === 0) return 'General';
    const sorted = [...classes].sort((a, b) => a - b);
    if (sorted.length === 1) return `Class ${sorted[0]}`;
    let isContiguous = true;
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] !== sorted[i] + 1) {
        isContiguous = false;
        break;
      }
    }
    if (isContiguous) {
      return `${sorted[0]}–${sorted[sorted.length - 1]}`;
    }
    return sorted.join(', ');
  };

  const toggleSchoolClass = (clsNum) => {
    setSelectedClasses(prev => {
      if (prev.includes(clsNum)) {
        return prev.filter(c => c !== clsNum).sort((a, b) => a - b);
      } else {
        return [...prev, clsNum].sort((a, b) => a - b);
      }
    });
  };

  const setClassPreset = (preset) => {
    setClassMode('standard');
    if (preset === 'primary') setSelectedClasses([1, 2, 3, 4, 5]);
    else if (preset === 'middle') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
    else if (preset === 'high') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    else if (preset === 'all') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const toggleSchoolSection = (secName) => {
    setSelectedSections(prev => {
      const clean = secName.trim().toUpperCase();
      if (prev.includes(clean)) {
        return prev.filter(s => s !== clean);
      } else {
        return [...prev, clean];
      }
    });
  };

  const handleAddCustomSection = (e) => {
    if (e) e.preventDefault();
    const clean = customSectionInput.trim().toUpperCase();
    if (!clean) return;
    if (!customSections.includes(clean) && !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(clean)) {
      setCustomSections(prev => [...prev, clean]);
    }
    if (!selectedSections.includes(clean)) {
      setSelectedSections(prev => [...prev, clean]);
    }
    setCustomSectionInput('');
    setShowAddCustomSection(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('School or Place name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Resolve classes range
      const finalClasses = manualClassesInput.trim() || 'Classes 1–8';

      // 2. Resolve sections
      const finalSections = manualSectionsInput.trim() || 'None';

      const payload = {
        name: name.trim(),
        code: code.trim() || null,
        cluster_id: clusterName || 'Cluster A',
        address: address.trim() || '',
        classes_range: finalClasses,
        sections: finalSections,
      };

      await api.createSchool(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Unable to register school or student place.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #ECEEF2' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F172A' }}>
              Register School / Student Center
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Create standard schools, Anganwadis, or student centers with optional class and section fields
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-banner danger" style={{ margin: '14px 20px 0 20px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
          {/* Institution / Place Type Selector */}
          <div>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
              Place / Center Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'school', label: 'School', icon: School, desc: 'Class 1–12' },
                { id: 'anganwadi', label: 'Anganwadi', icon: Home, desc: 'Early Childhood' },
                { id: 'daycare', label: 'Daycare / Pre-KG', icon: Building, desc: 'Pre-primary' },
                { id: 'custom', label: 'Custom Place', icon: Edit3, desc: 'Manual Entry' },
              ].map(item => {
                const isSelected = placeType === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectPlaceType(item.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'none'
                    }}
                  >
                    <IconComponent size={17} color={isSelected ? '#EA580C' : '#64748B'} />
                    <span style={{ fontSize: '11.5px', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#C2410C' : '#334155' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Place Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
              {placeType === 'anganwadi' ? 'Anganwadi Center Name' : placeType === 'custom' ? 'Place / Center Name' : 'School Name'}{' '}
              <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                {placeType === 'anganwadi' ? <Home size={18} /> : <School size={18} />}
              </span>
              <input
                type="text"
                className="form-input"
                placeholder={
                  placeType === 'anganwadi'
                    ? 'e.g. Anganwadi Center - Modachur, Erode'
                    : placeType === 'daycare'
                    ? 'e.g. Little Stars Balwadi & Daycare'
                    : placeType === 'custom'
                    ? 'e.g. Community Health Screening Center'
                    : 'e.g. Government Higher Secondary School'
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Cluster and Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>District / Cluster</label>
              <div className="input-container">
                <span className="input-icon"><Building size={18} /></span>
                <select
                  className="form-input"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  {clusters.length > 0 ? (
                    clusters.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="Cluster A">Cluster A</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
                {placeType === 'anganwadi' ? 'Center Code' : 'School / Place Code'}{' '}
                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div className="input-container">
                <span className="input-icon"><Hash size={18} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder={placeType === 'anganwadi' ? 'e.g. ANG-042' : 'e.g. SCH-042'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>
              Campus Address / Location <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div className="input-container">
              <span className="input-icon"><MapPin size={18} /></span>
              <input
                type="text"
                className="form-input"
                placeholder="Village / Town / Ward / Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* CLASSES COVERED MANUAL ENTRY & PRESETS */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="#EA580C" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  Classes / Groups Covered
                </span>
                <span style={{ fontSize: '10.5px', color: '#EA580C', backgroundColor: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Manual Typing
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Type directly or select preset
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type classes manually (e.g. Classes 1–8, Anganwadi, Pre-KG)..."
                value={manualClassesInput}
                onChange={(e) => setManualClassesInput(e.target.value)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setManualClassesInput(e.target.value);
                }}
                style={{
                  width: '145px',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>⚡ Presets...</option>
                <option value="Classes 1–8">Classes 1–8 (Standard Elementary)</option>
                <option value="Classes 1–5">Classes 1–5 (Primary)</option>
                <option value="Classes 1–10">Classes 1–10 (Secondary High)</option>
                <option value="Classes 1–12">Classes 1–12 (Higher Sec)</option>
                <option value="Anganwadi">Anganwadi (Early Childhood)</option>
                <option value="Balwadi">Balwadi (Pre-school Center)</option>
                <option value="Pre-KG & LKG">Pre-KG & LKG</option>
                <option value="General">General / All Ages</option>
                <option value="None">None / N/A</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>Quick insert:</span>
              {['Classes 1–8', 'Classes 1–5', 'Classes 1–10', 'Anganwadi', 'Balwadi', 'Pre-KG & LKG', 'General', 'None'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setManualClassesInput(tag)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: manualClassesInput === tag ? '#FFF7ED' : '#FFFFFF',
                    color: manualClassesInput === tag ? '#EA580C' : '#475569',
                    fontWeight: manualClassesInput === tag ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* SECTIONS OFFERED MANUAL ENTRY & PRESETS */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#EA580C" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  Sections / Batches Offered
                </span>
                <span style={{ fontSize: '10.5px', color: '#EA580C', backgroundColor: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Manual Typing
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Type directly or select preset
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Type sections manually (e.g. A, B, C or Batch 1, Batch 2 or None)..."
                value={manualSectionsInput}
                onChange={(e) => setManualSectionsInput(e.target.value)}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setManualSectionsInput(e.target.value);
                }}
                style={{
                  width: '145px',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>⚡ Presets...</option>
                <option value="A, B, C">A, B, C</option>
                <option value="A, B, C, D">A, B, C, D</option>
                <option value="A, B">A, B</option>
                <option value="A">Section A only</option>
                <option value="A, B, C, D, E, F, G, H">A through H</option>
                <option value="Batch 1, Batch 2">Batch 1, Batch 2</option>
                <option value="Morning, Afternoon">Morning, Afternoon</option>
                <option value="None">None (No sections)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>Quick insert:</span>
              {['A, B, C', 'A, B', 'A, B, C, D', 'Batch 1, Batch 2', 'None'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setManualSectionsInput(tag)}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: manualSectionsInput === tag ? '#FFF7ED' : '#FFFFFF',
                    color: manualSectionsInput === tag ? '#EA580C' : '#475569',
                    fontWeight: manualSectionsInput === tag ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', borderTop: '1px solid #ECEEF2', paddingTop: '14px' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose} 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {loading ? 'Registering...' : (placeType === 'anganwadi' ? 'Register Anganwadi' : 'Register School / Place')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
