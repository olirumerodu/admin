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
  const [manualClassesInput, setManualClassesInput] = useState('1-8');

  // Sections Configuration (Optional)
  const [manualSectionsInput, setManualSectionsInput] = useState('A, B, C');

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

  // Handle Place Type Switching
  const handleSelectPlaceType = (type) => {
    setPlaceType(type);
    if (type === 'anganwadi') {
      setManualClassesInput('Anganwadi');
      setManualSectionsInput('None');
      if (!name) setName('');
      if (!code) setCode('ANG-');
    } else if (type === 'daycare') {
      setManualClassesInput('Pre-KG, LKG, UKG');
      setManualSectionsInput('A');
      if (!code) setCode('DC-');
    } else if (type === 'custom') {
      setManualClassesInput('');
      setManualSectionsInput('None');
    } else {
      // standard school
      setManualClassesInput('1-8');
      setManualSectionsInput('A, B, C');
      if (code.startsWith('ANG-') || code.startsWith('DC-')) setCode('');
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
        : (manualClassesInput.trim() || (placeType === 'daycare' ? 'Pre-KG, LKG, UKG' : '1-8'));

      // 2. Resolve sections
      const finalSections = placeType === 'anganwadi'
        ? 'None'
        : (manualSectionsInput.trim() || 'None');

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

          {/* CLASSES COVERED */}
          {placeType !== 'anganwadi' && (
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
                  {placeType === 'daycare' ? 'Select daycare / preschool level' : 'Enter classes manually (e.g. 1-8)'}
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
                    placeholder="Enter classes manually (e.g. 1-8)..."
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
          {placeType !== 'anganwadi' && (
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
