/**
 * API Service for Student Health Admin Portal
 * Connects to backend via Vite proxy or direct backend URL from environment
 * Provides real-time synchronization between User Application and Admin Panel
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL 
  || (import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '')}/api/v1` : '/api/v1');

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('sh_admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  /**
   * Login user (admin or staff)
   */
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.message || 'Login failed. Please check credentials.');
    }
    return data;
  },

  /**
   * Fetch Dashboard Overview Metrics (pure real-time data from backend)
   */
  async getMetrics(schoolId = null) {
    const url = schoolId && schoolId !== 'ALL' 
      ? `${API_BASE}/dashboard/metrics?school_id=${encodeURIComponent(schoolId)}` 
      : `${API_BASE}/dashboard/metrics`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return await res.json();
  },

  /**
   * Fetch Real-Time Dashboard Activity Feed
   */
  async getActivities(limit = 10) {
    try {
      const res = await fetch(`${API_BASE}/dashboard/activities?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch activities:', err);
      return [];
    }
  },

  /**
   * Fetch All Clusters / Districts
   */
  async getClusters() {
    const res = await fetch(`${API_BASE}/clusters`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch clusters');
    return await res.json();
  },

  /**
   * Create Cluster
   */
  async createCluster(clusterData) {
    const res = await fetch(`${API_BASE}/clusters`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(clusterData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create cluster');
    }
    return await res.json();
  },

  /**
   * Delete Cluster
   */
  async deleteCluster(clusterId) {
    const res = await fetch(`${API_BASE}/clusters/${encodeURIComponent(clusterId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to delete cluster');
    }
    return await res.json();
  },

  /**
   * Update Cluster
   */
  async updateCluster(clusterId, clusterData) {
    const res = await fetch(`${API_BASE}/clusters/${encodeURIComponent(clusterId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(clusterData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update cluster');
    }
    return await res.json();
  },

  /**
   * Fetch All Schools (optionally filtered by cluster)
   */
  async getSchools(clusterId = null) {
    const url = clusterId ? `${API_BASE}/schools?cluster_id=${encodeURIComponent(clusterId)}` : `${API_BASE}/schools`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch schools');
    return await res.json();
  },

  /**
   * Create School
   */
  async createSchool(schoolData) {
    const res = await fetch(`${API_BASE}/schools`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(schoolData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create school');
    }
    return await res.json();
  },

  /**
   * Update School
   */
  async updateSchool(schoolId, schoolData) {
    const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(schoolId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(schoolData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update school');
    }
    return await res.json();
  },

  /**
   * Delete School
   */
  async deleteSchool(schoolId) {
    const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(schoolId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete school');
    return await res.json();
  },

  /**
   * Fetch Students with optional query parameters
   */
  async getStudents(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.school_id) searchParams.append('school_id', params.school_id);
    if (params.cluster_id) searchParams.append('cluster_id', params.cluster_id);
    if (params.class_name) searchParams.append('class_name', params.class_name);
    if (params.dob) searchParams.append('dob', params.dob);
    if (params.search) searchParams.append('search', params.search);
    if (params.is_follow_up_required !== undefined) {
      searchParams.append('is_follow_up_required', params.is_follow_up_required);
    }

    const queryStr = searchParams.toString();
    const url = queryStr ? `${API_BASE}/students?${queryStr}` : `${API_BASE}/students`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  },

  /**
   * Get single student by ID
   */
  async getStudentById(studentId) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Student ${studentId} not found`);
    return await res.json();
  },

  /**
   * Create New Student
   */
  async createStudent(studentData) {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create student');
    }
    return await res.json();
  },

  /**
   * Update Student
   */
  async updateStudent(studentId, studentData) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update student');
    }
    return await res.json();
  },

  /**
   * Delete Student
   */
  async deleteStudent(studentId) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete student');
    return await res.json();
  },

  /**
   * 1-Click Academic Year Promotion for School
   */
  async promoteAcademicYear(schoolId, promoData) {
    const res = await fetch(`${API_BASE}/schools/${encodeURIComponent(schoolId)}/promote-academic-year`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(promoData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Academic year promotion failed.');
    }
    return await res.json();
  },

  /**
   * Issue Transfer Certificate (TC) to student
   */
  async issueTc(studentId, tcData = {}) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/issue-tc`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tcData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to issue TC.');
    }
    return await res.json();
  },

  /**
   * Transfer student to another school
   */
  async transferSchool(studentId, transferData) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/transfer-school`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transferData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to transfer student.');
    }
    return await res.json();
  },

  /**
   * Search for historical TC student records by Name, DOB, and Gender across all schools
   */
  async tcLookup(params) {
    const res = await fetch(`${API_BASE}/students/tc-lookup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to search for student records.');
    }
    return await res.json();
  },

  /**
   * Admit a TC student into a new school & class with initial intake anthropometrics
   */
  async tcAdmit(data) {
    const res = await fetch(`${API_BASE}/students/tc-admit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to admit student.');
    }
    return await res.json();
  },

  /**
   * Reactivate student
   */
  async reactivateStudent(studentId) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/reactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to reactivate student.');
    }
    return await res.json();
  },

  /**
   * Fetch All Health Assessments
   */
  async getAssessments(studentId = null) {
    const url = studentId ? `${API_BASE}/assessments?student_id=${encodeURIComponent(studentId)}` : `${API_BASE}/assessments`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return await res.json();
  },

  /**
   * Create Health Assessment for a Student
   */
  async createAssessment(studentId, assessmentData) {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(studentId)}/assessments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assessmentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to record assessment');
    }
    return await res.json();
  },

  /**
   * Fetch Registered Users / Staff (real-time from backend)
   */
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  /**
   * Get Next Available Sequential User ID starting from USR001
   */
  async getNextUserId() {
    try {
      const res = await fetch(`${API_BASE}/users/next-id`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return { next_user_id: 'USR001' };
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch next user ID:', err);
      return { next_user_id: 'USR001' };
    }
  },

  /**
   * Create User (Admin user creation)
   */
  async createUser(userData) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to create user');
    }
    return await res.json();
  },

  /**
   * Update User (change status, role, assigned cluster, etc.)
   */
  async updateUser(userId, userData) {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to update user');
    }
    return await res.json();
  },

  /**
   * Delete User
   */
  async deleteUser(userId) {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return await res.json();
  },

  /**
   * Monthly Reports
   */
  async getMonthlyReports(schoolId = null, academicYear = null, month = null) {
    const searchParams = new URLSearchParams();
    if (schoolId) searchParams.append('school_id', schoolId);
    if (academicYear) searchParams.append('academic_year', academicYear);
    if (month) searchParams.append('month', month);

    const queryStr = searchParams.toString();
    const url = queryStr ? `${API_BASE}/reports/monthly?${queryStr}` : `${API_BASE}/reports/monthly`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch monthly reports');
    return await res.json();
  },

  /**
   * Tracking Reports (Follow-up cases)
   */
  async getTrackingReports(schoolId = null, clusterId = null) {
    const searchParams = new URLSearchParams();
    if (schoolId) searchParams.append('school_id', schoolId);
    if (clusterId) searchParams.append('cluster_id', clusterId);

    const queryStr = searchParams.toString();
    const url = queryStr ? `${API_BASE}/reports/tracking?${queryStr}` : `${API_BASE}/reports/tracking`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch tracking reports');
    return await res.json();
  },

  /**
   * Forgot Password request
   */
  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to dispatch verification code.');
    }
    return data;
  },

  /**
   * Verify OTP and Reset Password
   */
  async verifyOtpAndReset(email, otp, newPassword) {
    const verifyRes = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_or_phone: email, otp }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      throw new Error(verifyData.detail || 'OTP verification failed');
    }

    const resetRes = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reset_token: verifyData.reset_token, new_password: newPassword }),
    });
    return await resetRes.json();
  },

  /**
   * Bulk Import Students directly to PostgreSQL Database
   */
  async bulkImportStudents(schoolId, students, fileName = 'Import_Data.xlsx', options = {}) {
    const payload = {
      school_id: schoolId || 'default-school',
      students: Array.isArray(students) ? students : [],
      file_name: fileName || 'Import_Data.xlsx',
      academic_year: options.academicYear || '2026-2027',
      assessment_date: options.assessmentDate || null,
      auto_mark_absent: options.autoMarkAbsent !== false,
    };

    const res = await fetch(`${API_BASE}/students/bulk-import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let errorMsg = `Bulk import failed (Status: ${res.status})`;
      try {
        const err = await res.json();
        if (typeof err.detail === 'string') {
          errorMsg = err.detail;
        } else if (Array.isArray(err.detail)) {
          errorMsg = err.detail.map(d => {
            const loc = Array.isArray(d.loc) ? d.loc.filter(l => l !== 'body').join('.') : '';
            return loc ? `${loc}: ${d.msg}` : d.msg;
          }).join('\n');
        } else if (err.message) {
          errorMsg = err.message;
        }
      } catch (e) {
        try {
          const txt = await res.text();
          if (txt) errorMsg = txt;
        } catch (_) {}
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  },

  /**
   * Fetch Realtime Import History from PostgreSQL
   */
  async getImportHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.cluster_name && params.cluster_name !== 'All Clusters') query.append('cluster_name', params.cluster_name);
    if (params.school_name && params.school_name !== 'All Schools') query.append('school_name', params.school_name);
    if (params.search) query.append('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/import-history${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch import history');
    return await res.json();
  },

  /**
   * Fetch Students for a specific Import Batch
   */
  async getImportBatchStudents(importId) {
    const res = await fetch(`${API_BASE}/import-history/${encodeURIComponent(importId)}/students`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch import batch students');
    return await res.json();
  },

  /**
   * Delete an entire uploaded Excel sheet / import batch
   */
  async deleteImportBatch(importId) {
    const res = await fetch(`${API_BASE}/import-history/${encodeURIComponent(importId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete imported Excel sheet');
    return await res.json();
  },

  /**
   * Real-Time Notifications
   */
  async getNotifications() {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
      return [];
    }
  },

  /**
   * Send / Schedule Notification
   */
  async createNotification(notifData) {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(notifData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to send notification');
    }
    return await res.json();
  },

  /**
   * Delete Notification
   */
  async deleteNotification(notifId) {
    const res = await fetch(`${API_BASE}/notifications/${encodeURIComponent(notifId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    return await res.json();
  },

  /**
   * Dispatch upcoming assessment reminders (In-app broadcast + Email via SMTP)
   */
  async sendUpcomingReminders(schoolId = null, targetEmail = null) {
    const params = new URLSearchParams();
    if (schoolId) params.set('school_id', schoolId);
    if (targetEmail) params.set('target_email', targetEmail);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts/send-upcoming-reminders${qs}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send upcoming reminders');
    }
    return await res.json();
  },

  /**
   * Real-time School Visit Schedules
   */
  async getSchoolVisitSchedules(clusterId = null, schoolId = null) {
    const params = new URLSearchParams();
    if (clusterId && clusterId !== 'ALL' && clusterId !== 'All Clusters') params.set('cluster_id', clusterId);
    if (schoolId && schoolId !== 'ALL' && schoolId !== 'All Schools') params.set('school_id', schoolId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts/school-visit-schedules${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch school visit schedules');
    return await res.json();
  },

  /**
   * Run Cadence Check and Dispatch Alerts (3 days before, 2 days before, tomorrow, evening, next morning)
   */
  async checkSchoolVisitSchedules(schoolId = null, forceStage = null) {
    const params = new URLSearchParams();
    if (schoolId) params.set('school_id', schoolId);
    if (forceStage) params.set('force_stage', forceStage);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts/check-school-visit-schedules${qs}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to check school visit schedules');
    }
    return await res.json();
  },

  /**
   * Dispatch Visit Completed Receipt with Real-time Metrics
   */
  async sendSchoolVisitCompleted(schoolId, examinerName = null) {
    const params = new URLSearchParams();
    params.set('school_id', schoolId);
    if (examinerName) params.set('examiner_name', examinerName);
    const res = await fetch(`${API_BASE}/alerts/send-school-visit-completed?${params.toString()}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to dispatch visit completed receipt');
    }
    return await res.json();
  },

  /**
   * Fetch Real-time Severely Wasted / Wasted Students with Lower BMI or 3-Month Non-Improvement
   */
  async getChronicWastingStudents(schoolId = null, clusterId = null) {
    const params = new URLSearchParams();
    if (schoolId && schoolId !== 'ALL' && schoolId !== 'All Schools') params.set('school_id', schoolId);
    if (clusterId && clusterId !== 'ALL' && clusterId !== 'All Clusters') params.set('cluster_id', clusterId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts/chronic-wasting-students${qs}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch chronic wasting students');
    return await res.json();
  },

  /**
   * Scan and Dispatch Chronic Malnutrition & Lower BMI Email Alerts to Assigned Assessor and Admins
   */
  async checkChronicWastingAlerts(studentId = null) {
    const params = new URLSearchParams();
    if (studentId) params.set('student_id', studentId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/alerts/check-chronic-wasting-alerts${qs}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to dispatch chronic wasting alerts');
    }
    return await res.json();
  },

  /**
   * Monthly Student Progress Report (Cluster-wise & School-wise)
   */
  async getMonthlyProgressReport(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.month && params.month !== 'ALL' && params.month !== 'All Months') query.set('month', params.month);
      if (params.clusterId && params.clusterId !== 'ALL' && params.clusterId !== 'All Clusters') query.set('cluster_id', params.clusterId);
      if (params.schoolId && params.schoolId !== 'ALL' && params.schoolId !== 'All Schools') query.set('school_id', params.schoolId);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/reports/monthly-progress${qs}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch monthly progress report');
      return await res.json();
    } catch (err) {
      console.warn('getMonthlyProgressReport notice:', err);
      return null;
    }
  },

  /**
   * System Status Check
   */
  async getSystemStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
};

