import React, { useState, useEffect } from 'react';
import { X, Network, Edit2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function EditClusterModal({ isOpen, onClose, onSuccess, cluster }) {
  const [clusterName, setClusterName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cluster) {
      setClusterName(cluster.name || '');
      setDescription(cluster.description || '');
      setError('');
    }
  }, [cluster, isOpen]);

  if (!isOpen || !cluster) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clusterName.trim()) {
      setError('Please enter a cluster name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clusterId = cluster.id || cluster.name;
      const res = await api.updateCluster(clusterId, {
        name: clusterName.trim(),
        description: description.trim() || `${clusterName.trim()} Cluster`,
      });
      if (onSuccess) onSuccess(res || { ...cluster, name: clusterName.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update cluster.');
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
          maxWidth: '440px',
          width: '100%',
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
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Edit Cluster
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>
                Update cluster name and regional details
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', color: '#DC2626', fontSize: '12.5px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
              Cluster / District Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="e.g. Erode Cluster, Bhavani Block"
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
              Description / Notes <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Educational District Region"
              style={{
                width: '100%',
                height: '40px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                padding: '0 12px',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(235,90,29,0.3)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="spin-animate" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
