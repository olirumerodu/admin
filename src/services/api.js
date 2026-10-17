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
  async bulkImportStudents(schoolId, students, fileName = 'Import_Data.xlsx') {
    const res = await fetch(`${API_BASE}/students/bulk-import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        school_id: schoolId,
        students: students,
        file_name: fileName,
      }),
    });
    if (!res.ok) {
      let errorMsg = 'Failed to bulk import students';
      try {
        const err = await res.json();
        errorMsg = err.detail || errorMsg;
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

