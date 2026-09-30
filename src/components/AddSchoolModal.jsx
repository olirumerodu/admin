import React, { useState } from 'react';
import { X, School, Building, MapPin, Layers, Hash } from 'lucide-react';

export default function AddSchoolModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [clusterName, setClusterName] = useState('ERODE');
  const [address, setAddress] = useState('');
  const [classesRange, setClassesRange] = useState('1-8');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('School name is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // POST to backend API /api/v1/schools
      const payload = {
        name: name.trim(),
        code: code.trim() || `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
        cluster_name: clusterName,
        address: address.trim() || 'Central District',
        classes_range: classesRange
      };

      const res = await fetch('/api/v1/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create school');
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Unable to register school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Register New School</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Add a primary or secondary school for health screening programs
            </p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">School Name</label>
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

          <div className="form-group">
            <label className="form-label">School Code</label>
            <div className="input-container">
              <span className="input-icon"><Hash size={18} /></span>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SCH-042 or 345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">District / Cluster</label>
              <div className="input-container">
                <span className="input-icon"><Building size={18} /></span>
                <select
                  className="form-input"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="ERODE">ERODE</option>
                  <option value="GOBI">GOBI</option>
                  <option value="BHAVANI">BHAVANI</option>
                  <option value="PERUNDURAI">PERUNDURAI</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Classes Range</label>
              <div className="input-container">
                <span className="input-icon"><Layers size={18} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 1-8 or 1-12"
                  value={classesRange}
                  onChange={(e) => setClassesRange(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Campus Address / Location</label>
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
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
