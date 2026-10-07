import React, { useState, useEffect } from 'react';
import { School, Plus, MapPin, Users, BookOpen, Search, CheckCircle, FileText } from 'lucide-react';
import AddSchoolModal from '../AddSchoolModal';
import SchoolGrowthChartModal from '../SchoolGrowthChartModal';
import { api } from '../../services/api';

export default function SchoolsView({ schools, onRefresh, onSelectSchoolFilter }) {
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [growthModalSchool, setGrowthModalSchool] = useState(null);
  const [allStudents, setAllStudents] = useState([]);

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
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => onSelectSchoolFilter && onSelectSchoolFilter(school.id)}
                        >
                          View Students
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
    </div>
  );
}
