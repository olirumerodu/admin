import React from 'react';
import { 
  Users, 
  School, 
  Heart, 
  AlertTriangle, 
  Activity, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp,
  Clock
} from 'lucide-react';

export default function OverviewView({ metrics, schools, students, onSelectStudent }) {
  const totalStudents = metrics?.total_students || students.length || 0;
  const normalCount = metrics?.count_normal || 0;
  const thinnessCount = metrics?.count_thinness || 0;
  const severeCount = metrics?.count_severe_thinness || 0;
  const followUpCount = metrics?.count_follow_up_required || 0;
  const normalPercent = totalStudents > 0 ? Math.round((normalCount / totalStudents) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="content-header">
        <div>
          <h2 className="content-title">Student Health Overview</h2>
          <p className="content-subtitle">
            Live health screening metrics and WHO AnthroPlus growth standards across registered schools.
          </p>
        </div>
      </div>

      {/* 5-Card Stats Metric Grid */}
      <div className="stat-cards-grid">
        {/* Total Screened */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Total Students</span>
            <div className="stat-card-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-card-number">{totalStudents}</div>
          <div className="stat-card-footer">
            <span className="badge-trend-up">{totalStudents > 0 ? Math.round(((metrics?.assessed_students || 0) / totalStudents) * 100) : 0}% screened</span>
            <span>in current academic term</span>
          </div>
        </div>

        {/* Total Schools */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Active Schools</span>
            <div className="stat-card-icon-wrap" style={{ background: '#FFF7ED', color: '#EA580C' }}>
              <School size={20} />
            </div>
          </div>
          <div className="stat-card-number">{metrics?.total_schools || schools.length || 0}</div>
          <div className="stat-card-footer">
            <span style={{ color: '#475569', fontWeight: 500 }}>
              Across {metrics?.total_clusters || 4} Districts / Clusters
            </span>
          </div>
        </div>

        {/* Normal Nutritional Status */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Normal Nutrition</span>
            <div className="stat-card-icon-wrap" style={{ background: '#ECFDF5', color: '#059669' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-card-number" style={{ color: '#059669' }}>
            {normalCount} <span style={{ fontSize: '18px', fontWeight: 600 }}>({normalPercent}%)</span>
          </div>
          <div className="stat-card-footer">
            <span className="badge-trend-up">Healthy BMI-for-Age</span>
          </div>
        </div>

        {/* Severe Thinness / Underweight */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Severe Thinness</span>
            <div className="stat-card-icon-wrap" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-card-number" style={{ color: '#DC2626' }}>{severeCount}</div>
          <div className="stat-card-footer">
            <span className="badge-trend-alert">Immediate Care</span>
            <span>nutritional intervention</span>
          </div>
        </div>

        {/* Follow-up Required */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-title">Clinical Follow-up</span>
            <div className="stat-card-icon-wrap" style={{ background: '#FFFBEB', color: '#D97706' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-card-number" style={{ color: '#D97706' }}>{followUpCount}</div>
          <div className="stat-card-footer">
            <span style={{ color: '#B45309', fontWeight: 600 }}>Attention Needed</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Row */}
      <div className="analytics-grid-two">
        {/* WHO Growth Classification Chart */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Nutritional Health Breakdown</h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Based on WHO AnthroPlus 2007 Reference Guidelines
              </p>
            </div>
            <span style={{ fontSize: '12px', background: '#F1F5F9', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 }}>
              Live Stats
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
            {/* Normal */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>🟢 Normal Nutritional Status</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{normalCount} Students ({normalPercent}%)</span>
              </div>
              <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${normalPercent}%`, 
                    backgroundColor: '#10B981', 
                    borderRadius: '99px',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>

            {/* Severe Thinness */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>🔴 Severe Thinness / Severely Wasted</span>
                <span style={{ fontWeight: 700, color: '#DC2626' }}>
                  {severeCount} Students ({totalStudents ? Math.round((severeCount / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${totalStudents ? (severeCount / totalStudents) * 100 : 0}%`, 
                    backgroundColor: '#EF4444', 
                    borderRadius: '99px',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>

            {/* Thinness / Mild */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>🟡 Thinness / Underweight</span>
                <span style={{ fontWeight: 700, color: '#D97706' }}>
                  {thinnessCount} Students ({totalStudents ? Math.round((thinnessCount / totalStudents) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '99px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${totalStudents ? (thinnessCount / totalStudents) * 100 : 0}%`, 
                    backgroundColor: '#F59E0B', 
                    borderRadius: '99px',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Participating Schools Quick Status */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Schools Coverage</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Coverage</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {schools.slice(0, 3).map((school) => (
              <div 
                key={school.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0E1B38' }}>
                    {school.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Cluster: {school.cluster_name || 'ERODE'} | Classes: {school.classes_range || 'All Classes'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="status-pill normal">
                    {school.coverage_percentage || 0}% Covered
                  </span>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    {school.students_count || 0} students
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Health Assessments Table */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Recent Student Screenings</h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Latest height, weight, BMI, and WHO health status reports
            </p>
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>School & Grade</th>
                <th>Age / Gender</th>
                <th>Height / Weight</th>
                <th>BMI</th>
                <th>Nutritional Status</th>
                <th>Follow-up</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((student) => {
                  const isSevere = student.nutrition_status?.toLowerCase().includes('severely') || 
                                   student.nutrition_status?.toLowerCase().includes('wasted');
                  const isNormal = student.nutrition_status?.toLowerCase().includes('normal');
                  
                  return (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600, color: '#0E1B38' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div 
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: student.avatar_bg_color || '#E0E7FF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              color: '#3730A3'
                            }}
                          >
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{student.school_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {student.class_name} {student.section ? `• ${student.section}` : ''}
                        </div>
                      </td>
                      <td>
                        <div>{student.latest_age_display || student.age_string || '10 Years'}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{student.gender}</div>
                      </td>
                      <td>
                        <div>{student.height_cm ? `${student.height_cm} cm` : '—'}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {student.weight_kg ? `${student.weight_kg} kg` : '—'}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {student.bmi ? student.bmi.toFixed(2) : '—'}
                      </td>
                      <td>
                        <span 
                          className={`status-pill ${isNormal ? 'normal' : isSevere ? 'danger' : 'warning'}`}
                        >
                          {student.nutrition_status || 'Screened'}
                        </span>
                      </td>
                      <td>
                        {student.is_follow_up_required ? (
                          <span style={{ color: '#DC2626', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} /> Required
                          </span>
                        ) : (
                          <span style={{ color: '#059669', fontSize: '12px' }}>None</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => onSelectStudent && onSelectStudent(student)}
                        >
                          View Health Card
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    No student screening records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
