import React, { useState, useEffect } from 'react';
import { X, School, Building, MapPin, Layers, Hash, Users, Edit2, Home, Edit3 } from 'lucide-react';
import { api } from '../services/api';

export default function EditSchoolModal({ isOpen, onClose, onSuccess, school }) {
  const [placeType, setPlaceType] = useState('school'); // 'school' | 'anganwadi' | 'daycare' | 'custom'
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [clusters, setClusters] = useState([]);
  const [address, setAddress] = useState('');
  const [manualClassesInput, setManualClassesInput] = useState('');
  const [manualSectionsInput, setManualSectionsInput] = useState('A, B, C');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch clusters on modal open
  useEffect(() => {
    if (!isOpen) return;
    const fetchClusters = async () => {
      try {
        const data = await api.getClusters();
        if (Array.isArray(data) && data.length > 0) {
          setClusters(data);
        }
      } catch (err) {
        console.warn('Failed to load clusters for edit school modal:', err);
      }
    };
    fetchClusters();
  }, [isOpen]);

  // Populate school data when school changes
  useEffect(() => {
    if (!school || !isOpen) return;

    setName(school.name || '');
    setCode(school.code || '');
    setClusterName(school.cluster_name || school.cluster_id || '');
    setAddress(school.address || '');

    const classes = school.classes_range || '';
    const sections = school.sections || '';
    const lowerName = (school.name || '').toLowerCase();
    const lowerClasses = classes.toLowerCase();

    // Determine placeType
    let detectedType = 'school';
    if (lowerClasses === 'anganwadi' || lowerName.includes('anganwadi')) {
      detectedType = 'anganwadi';
    } else if (
      lowerClasses.includes('pre-kg') || 
      lowerClasses.includes('lkg') || 
      lowerClasses.includes('ukg') || 
      lowerName.includes('daycare') || 
      lowerName.includes('balwadi')
    ) {
      detectedType = 'daycare';
    } else if (classes === 'None' || classes === 'General') {
      detectedType = 'custom';
    } else {
      detectedType = 'school';
    }

    setPlaceType(detectedType);
    setManualClassesInput(classes || (detectedType === 'daycare' ? 'Pre-KG, LKG, UKG' : (detectedType === 'anganwadi' ? 'Anganwadi' : (detectedType === 'custom' ? 'General' : ''))));
    setManualSectionsInput(sections || (detectedType === 'anganwadi' || detectedType === 'custom' ? 'None' : 'A, B, C'));
    setError('');
  }, [school, isOpen]);

  if (!isOpen || !school) return null;

  // Handle Place Type Switching
  const handleSelectPlaceType = (type) => {
    setPlaceType(type);
    if (type === 'anganwadi') {
      setManualClassesInput('Anganwadi');
      setManualSectionsInput('None');
    } else if (type === 'daycare') {
      if (!manualClassesInput || manualClassesInput === 'Anganwadi' || manualClassesInput === 'General') {
        setManualClassesInput('Pre-KG, LKG, UKG');
      }
      if (manualSectionsInput === 'None' || !manualSectionsInput) {
        setManualSectionsInput('A');
      }
    } else if (type === 'custom') {
      setManualClassesInput('General');
      setManualSectionsInput('None');
    } else {
      // standard school - no hardcoded 1-8
      if (manualClassesInput === 'Anganwadi' || manualClassesInput.includes('Pre-KG') || manualClassesInput === 'General') {
        setManualClassesInput('');
      }
      if (manualSectionsInput === 'None' || !manualSectionsInput) {
        setManualSectionsInput('A, B, C');
      }
    }
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
      const finalClasses = placeType === 'anganwadi'
        ? 'Anganwadi'
        : (placeType === 'custom'
          ? 'General'
          : (manualClassesInput.trim() || (placeType === 'daycare' ? 'Pre-KG, LKG, UKG' : 'All Classes')));

      // 2. Resolve sections
      const finalSections = (placeType === 'anganwadi' || placeType === 'custom')
        ? 'None'
        : (manualSectionsInput.trim() || 'None');

      const payload = {
        name: name.trim(),
        code: code.trim() || null,
        cluster_id: clusterName || school.cluster_id || 'Cluster A',
        address: address.trim() || '',
        classes_range: finalClasses,
        sections: finalSections,
      };

      const res = await api.updateSchool(school.id, payload);
      if (onSuccess) {
        onSuccess(res || { ...school, ...payload, cluster_name: clusterName });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Unable to update school or student place.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          height: '630px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECEEF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
              <Edit2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Edit School / Student Center
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Modify center details, cluster assignment, classes, and sections
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ margin: '14px 20px 0 20px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', fontSize: '12.5px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
            {/* Institution / Place Type Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px', display: 'block' }}>
                Place / Center Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'school', label: 'School', icon: School, desc: 'Class 1–8' },
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
                        height: '76px',
                        padding: '8px 6px',
                        borderRadius: '10px',
                        border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>
              {placeType === 'anganwadi' ? 'Anganwadi Center Name' : placeType === 'custom' ? 'Place / Center Name' : 'School Name'}{' '}
              <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div className="input-container" style={{ height: '42px' }}>
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
                onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}
                required
              />
            </div>
          </div>

          {/* Cluster and Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>
                District / Cluster
              </label>
              <div className="input-container" style={{ height: '42px' }}>
                <span className="input-icon">
                  <Building size={18} />
                </span>
                <select
                  className="form-input"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0F172A',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  {clusters.length > 0 ? (
                    clusters.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value={clusterName || 'Cluster A'}>{clusterName || 'Cluster A'}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>
                {placeType === 'anganwadi' ? 'Center Code / ID' : 'School Code / ID'}
              </label>
              <div className="input-container" style={{ height: '42px' }}>
                <span className="input-icon">
                  <Hash size={18} />
                </span>
                <input
                  type="text"
                  className="form-input"
                  placeholder={placeType === 'anganwadi' ? 'e.g. ANG01' : 'e.g. GHS01, KMH01'}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', display: 'block', color: '#334155' }}>
              Campus Address / Location <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div className="input-container" style={{ height: '42px' }}>
              <span className="input-icon">
                <MapPin size={18} />
              </span>
              <input
                type="text"
                className="form-input"
                placeholder="Village / Town / Ward / Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}
              />
            </div>
          </div>

          {/* CLASSES COVERED */}
          {placeType !== 'anganwadi' && placeType !== 'custom' && (
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} color="#EA580C" />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                    Classes / Groups Covered
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#EA580C', backgroundColor: '#FFF7ED', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {placeType === 'daycare' ? 'Preschool Levels' : 'Manual Entry'}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {placeType === 'daycare' ? 'Select daycare / preschool level' : 'Enter classes covered (e.g. 1-10, 1-12, 1-8, 1-5)'}
                </span>
              </div>

              <div>
                {placeType === 'daycare' ? (
                  <select
                    value={manualClassesInput}
                    onChange={(e) => setManualClassesInput(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      padding: '0 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Pre-KG, LKG, UKG">Pre-KG, LKG, UKG (All Pre-primary)</option>
                    <option value="Pre-KG">Pre-KG</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter classes (e.g. 1-10, 1-12, 1-8, 1-5)..."
                    value={manualClassesInput}
                    onChange={(e) => setManualClassesInput(e.target.value)}
                    style={{
                      width: '100%',
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
                )}
              </div>
            </div>
          )}

          {/* SECTIONS OFFERED */}
          {placeType !== 'anganwadi' && placeType !== 'custom' && (
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
                  {placeType === 'daycare' ? 'Enter section (e.g. A, B or None)' : 'Enter sections manually (e.g. A, B, C)'}
                </span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={placeType === 'daycare' ? "Enter sections (e.g. A, B or None)..." : "Type sections manually (e.g. A, B, C or None)..."}
                  value={manualSectionsInput}
                  onChange={(e) => setManualSectionsInput(e.target.value)}
                  style={{
                    width: '100%',
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
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>Quick insert:</span>
                  {(placeType === 'daycare' ? ['A', 'A, B', 'None'] : ['A, B, C', 'A, B', 'A, B, C, D', 'None']).map(tag => (
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
            </div>
          )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', padding: '14px 20px', borderTop: '1px solid #ECEEF2', backgroundColor: '#FFFFFF', flexShrink: 0 }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose} 
              style={{
                height: '38px',
                padding: '0 20px',
                minWidth: '95px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{
                height: '38px',
                padding: '0 22px',
                minWidth: '130px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#C2410C')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#EA580C')}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
