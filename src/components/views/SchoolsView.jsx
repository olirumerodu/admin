import React, { useState, useEffect, useMemo } from 'react';
import { School, Plus, MapPin, Users, BookOpen, Search, CheckCircle, FileText, GraduationCap, Trash2, Building2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AddSchoolModal from '../AddSchoolModal';
import SchoolGrowthChartModal from '../SchoolGrowthChartModal';
import AcademicPromotionModal from '../AcademicPromotionModal';
import { api } from '../../services/api';

export default function SchoolsView({ schools = [], onRefresh, onSelectSchoolFilter }) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [growthModalSchool, setGrowthModalSchool] = useState(null);
  const [promotionModalSchool, setPromotionModalSchool] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleConfirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteSchool(schoolToDelete.id);
      showToast(`School "${schoolToDelete.name}" and all associated students deleted successfully.`);
      setSchoolToDelete(null);
      if (onRefresh) onRefresh();
      const updatedStudents = await api.getStudents();
      if (Array.isArray(updatedStudents)) setAllStudents(updatedStudents);
    } catch (err) {
      alert(`Failed to delete school: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    api.getStudents()
      .then(data => {
        if (Array.isArray(data)) setAllStudents(data);
      })
      .catch(err => console.warn('Failed to load students in SchoolsView:', err));
  }, []);

  const filteredSchools = schools.filter(s => 
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.code && s.code.toLowerCase().includes(search.toLowerCase())) ||
    (s.cluster_name && s.cluster_name.toLowerCase().includes(search.toLowerCase())) ||
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="content-title">Schools Directory</h2>
          <p className="content-subtitle">
            Manage participating educational institutions, track student enrollments, and monitor screening coverage.
          </p>
        </div>
        <div className="header-action-group">
          <button 
            className="btn-primary" 
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            <span>Add School</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEEF2', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <School size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Schools</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
              {schools.length.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Active institutions</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEEF2', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={24} color="#EA580C" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Students</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
              {allStudents.length.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Across all schools</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #ECEEF2', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={24} color="#2563EB" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Clusters & Districts</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
              {new Set(schools.map(s => s.cluster_name || s.cluster_id).filter(Boolean)).size.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Assigned regions</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div className="global-search-bar" style={{ maxWidth: '400px' }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            className="search-input"
            placeholder="Search school name, code, or cluster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Schools Table */}
      <div className="dashboard-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>School Name & Code</th>
                <th>District / Cluster</th>
                <th>Address</th>
                <th>Grades Range</th>
                <th>Enrolled Students</th>
                <th>Screening Coverage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div 
                          style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '8px', 
                            background: '#FFF7ED', 
                            color: '#EA580C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                          }}
                        >
                          <School size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0E1B38' }}>{school.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>Code: {school.code || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill info">
                        {school.cluster_name || 'ERODE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '13px' }}>
                        <MapPin size={14} color="#94A3B8" />
                        <span>{school.address || 'District Campus'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{school.classes_range || '1–8'}</span>
                      {school.sections && (
                        <div style={{ fontSize: '11px', color: '#0F766E', fontWeight: 600, marginTop: '2px' }}>
                          Sec: {school.sections}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Users size={15} color="#64748B" />
                        <span>{school.students_count || 0} Students</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill normal">
                        <CheckCircle size={13} />
                        <span>{school.coverage_percentage || 100}% Complete</span>
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setGrowthModalSchool(school)}
                          title="Download School Growth Report (PDF)"
                        >
                          <FileText size={13} color="#2563EB" />
                          <span>Growth Report</span>
                        </button>

                        <button 
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: '#FED7AA', color: '#EA580C' }}
                          onClick={() => setPromotionModalSchool(school)}
                          title="Academic Year Promotion Wizard"
                        >
                          <GraduationCap size={13} color="#EA580C" />
                          <span>Promote Year</span>
                        </button>

                        <button 
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => onSelectSchoolFilter && onSelectSchoolFilter(school.id)}
                        >
                          View Students
                        </button>

                        <button 
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: '#FECACA', color: '#DC2626', backgroundColor: '#FEF2F2' }}
                          onClick={() => setSchoolToDelete(school)}
                          title="Delete School"
                        >
                          <Trash2 size={13} color="#DC2626" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    No matching schools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddSchoolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          if (onRefresh) onRefresh();
        }}
      />

      <SchoolGrowthChartModal
        isOpen={Boolean(growthModalSchool)}
        onClose={() => setGrowthModalSchool(null)}
        school={growthModalSchool}
        students={allStudents}
        clusterName={growthModalSchool?.cluster_name}
      />

      {promotionModalSchool && (
        <AcademicPromotionModal
          school={promotionModalSchool}
          allStudents={allStudents}
          onClose={() => setPromotionModalSchool(null)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            api.getStudents().then(data => {
              if (Array.isArray(data)) setAllStudents(data);
            });
          }}
        />
      )}

      {/* ================= DELETE SCHOOL CONFIRMATION MODAL ================= */}
      {Boolean(schoolToDelete) && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <Trash2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Delete School / Institution</h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Permanent removal from database & mobile app</p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Are you sure you want to delete <strong style={{ color: '#0F172A' }}>"{schoolToDelete.name}"</strong>?
            </p>

            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#EA580C" />
                <span>Associated Data Impact:</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '4px', lineHeight: 1.4 }}>
                This will permanently delete this school, all <strong>{schoolToDelete.students_count || 0} enrolled students</strong>, and their health records. This action cannot be undone.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSchoolToDelete(null)}
                style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteSchool}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: isDeleting ? 0.7 : 1 }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete School'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {Boolean(toastMsg) && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '4px solid #10B981'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
