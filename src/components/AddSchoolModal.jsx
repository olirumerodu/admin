import React, { useState, useEffect } from 'react';
import { X, School, Building, MapPin, Layers, Hash, Users, Check, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function AddSchoolModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [clusters, setClusters] = useState([]);
  const [address, setAddress] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedSections, setSelectedSections] = useState(['A', 'B', 'C']);
  const [customSections, setCustomSections] = useState([]);
  const [customSectionInput, setCustomSectionInput] = useState('');
  const [showAddCustomSection, setShowAddCustomSection] = useState(false);
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

  const formatClassesRange = (classes) => {
    if (!classes || classes.length === 0) return '1–8';
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
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== clsNum).sort((a, b) => a - b);
      } else {
        return [...prev, clsNum].sort((a, b) => a - b);
      }
    });
  };

  const setClassPreset = (preset) => {
    if (preset === 'primary') setSelectedClasses([1, 2, 3, 4, 5]);
    else if (preset === 'middle') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
    else if (preset === 'high') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    else if (preset === 'all') setSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const toggleSchoolSection = (secName) => {
    setSelectedSections(prev => {
      const clean = secName.trim().toUpperCase();
      if (prev.includes(clean)) {
        if (prev.length <= 1) return prev;
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
      setError('School name is required.');
      return;
    }
    if (selectedClasses.length === 0) {
      setError('Please select at least one class covered.');
      return;
    }
    if (selectedSections.length === 0) {
      setError('Please select at least one section.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const formattedClasses = formatClassesRange(selectedClasses);
      const formattedSections = selectedSections.join(', ');
      const payload = {
        name: name.trim(),
        code: code.trim() || null,
        cluster_id: clusterName || 'Cluster A',
        address: address.trim() || '',
        classes_range: formattedClasses,
        sections: formattedSections,
      };

      await api.createSchool(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Unable to register school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #ECEEF2' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>Register New School</h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Add school with classes and sections matching mobile application
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
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>School Name <span style={{ color: '#EF4444' }}>*</span></label>
            <div className="input-container">
              <span className="input-icon"><School size={18} /></span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Government Higher Secondary School"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>School Code</label>
              <div className="input-container">
                <span className="input-icon"><Hash size={18} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SCH-042"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '12px', fontWeight: 700 }}>Campus Address / Location</label>
            <div className="input-container">
              <span className="input-icon"><MapPin size={18} /></span>
              <input
                type="text"
                className="form-input"
                placeholder="Town / Village / Taluk"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Classes Covered Selector */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="#EA580C" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  Classes Covered <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => setClassPreset('primary')}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                >
                  1–5
                </button>
                <button
                  type="button"
                  onClick={() => setClassPreset('middle')}
                  style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED', color: '#EA580C', cursor: 'pointer' }}
                >
                  1–8
                </button>
                <button
                  type="button"
                  onClick={() => setClassPreset('high')}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                >
                  1–10
                </button>
                <button
                  type="button"
                  onClick={() => setClassPreset('all')}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                >
                  1–12
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                const isSelected = selectedClasses.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleSchoolClass(num)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      color: isSelected ? '#0F172A' : '#64748B',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <Check size={12} color="#EA580C" strokeWidth={3} />}
                    <span>{num}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#0F766E', fontWeight: 700 }}>
              <span>Active: Classes {formatClassesRange(selectedClasses)}</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>{selectedClasses.length} classes</span>
            </div>
          </div>

          {/* Sections Selector */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '12px 14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} color="#EA580C" />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  Sections Offered <span style={{ color: '#EF4444' }}>*</span>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedSections(['A', 'B', 'C'])}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                >
                  A–C
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSections(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])}
                  style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                >
                  A–H
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomSection(!showAddCustomSection)}
                  style={{ fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED', color: '#EA580C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Plus size={11} strokeWidth={3} />
                  <span>Custom</span>
                </button>
              </div>
            </div>

            {showAddCustomSection && (
              <div style={{ display: 'flex', gap: '6px', margin: '8px 0', backgroundColor: '#FFFFFF', padding: '6px 8px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                <input
                  type="text"
                  placeholder="e.g. I, J, Rose"
                  value={customSectionInput}
                  onChange={e => setCustomSectionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCustomSection(e); }}
                  style={{ flex: 1, height: '30px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0 8px', fontSize: '12px', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSection}
                  style={{ height: '30px', padding: '0 10px', backgroundColor: '#EA580C', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', margin: '8px 0' }}>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', ...customSections].map(sec => {
                const isSelected = selectedSections.includes(sec);
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => toggleSchoolSection(sec)}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      color: isSelected ? '#0F172A' : '#64748B',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: sec.length > 2 ? '11.5px' : '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <Check size={12} color="#EA580C" strokeWidth={3} />}
                    <span>Sec {sec}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#0F766E', fontWeight: 700 }}>
              <span>Sections: {selectedSections.join(', ')}</span>
              <span style={{ color: '#64748B', fontWeight: 500 }}>{selectedSections.length} active</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', borderTop: '1px solid #ECEEF2', paddingTop: '12px' }}>
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
              {loading ? 'Registering...' : 'Register School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
