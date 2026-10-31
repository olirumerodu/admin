/**
 * Centralized Scoping Filter Utility for Cluster Administrators and Staff
 * Ensures Admin users only see the allotted access assigned by Super Admin:
 * - Assigned Clusters
 * - Assigned Schools (if specific schools assigned)
 * - Students belonging to those assigned schools/clusters
 * - Realtime counts and reports accurately match the scoped data
 * Super Admin sees everything unrestricted.
 */
export function filterScopeData({
  clusters = [],
  schools = [],
  students = [],
  users = [],
  isClusterAdmin = false,
  isSuperAdmin = false,
  assignedClusterIds = [],
  assignedSchoolIds = []
}) {
  // Super Admin or unrestricted administrator sees everything completely unrestricted
  if (isSuperAdmin) {
    return {
      filteredClusters: Array.isArray(clusters) ? clusters : [],
      filteredSchools: Array.isArray(schools) ? schools : [],
      filteredStudents: Array.isArray(students) ? students : [],
      filteredUsers: Array.isArray(users) ? users : []
    };
  }

  // 1. Normalize assigned cluster tokens (handles JSON strings, arrays, UUIDs, and names)
  let clusterTokens = assignedClusterIds;
  if (typeof clusterTokens === 'string') {
    try {
      const parsed = JSON.parse(clusterTokens);
      if (Array.isArray(parsed)) clusterTokens = parsed;
      else clusterTokens = [clusterTokens];
    } catch {
      clusterTokens = [clusterTokens];
    }
  }
  const normClusters = (Array.isArray(clusterTokens) ? clusterTokens : [clusterTokens])
    .map(x => String(x || '').trim().toLowerCase())
    .filter(x => Boolean(x) && x !== 'all' && x !== 'all clusters');

  // 2. Normalize assigned school tokens (handles JSON strings, arrays, UUIDs, and names)
  let schoolTokens = assignedSchoolIds;
  if (typeof schoolTokens === 'string') {
    try {
      const parsed = JSON.parse(schoolTokens);
      if (Array.isArray(parsed)) schoolTokens = parsed;
      else schoolTokens = schoolTokens.split(',').map(s => s.trim());
    } catch {
      schoolTokens = schoolTokens.split(',').map(s => s.trim());
    }
  }
  const normSchools = (Array.isArray(schoolTokens) ? schoolTokens : [schoolTokens])
    .map(x => String(x || '').trim().toLowerCase())
    .filter(x => Boolean(x) && x !== 'all' && x !== 'all schools' && x !== 'all assigned schools');

  // If Cluster Admin has no assigned clusters or schools (Pending Scope / Unassigned):
  // They have zero allotted access! Return empty sets.
  if (normClusters.length === 0 && normSchools.length === 0) {
    return {
      filteredClusters: [],
      filteredSchools: [],
      filteredStudents: [],
      filteredUsers: []
    };
  }

  // 3. Filter clusters:
  // Match assigned cluster IDs/names, or clusters that contain any assigned school
  const filteredClusters = (clusters || []).filter(c => {
    if (!c) return false;
    const cId = String(c.id || '').toLowerCase();
    const cName = String(c.name || '').toLowerCase();
    if (normClusters.length > 0) {
      return normClusters.includes(cId) || normClusters.includes(cName);
    }
    // If no cluster restriction but schools restricted, check if any assigned school is in this cluster
    if (normSchools.length > 0 && Array.isArray(schools)) {
      return schools.some(s => {
        const sClusterId = String(s.cluster_id || '').toLowerCase();
        const sClusterName = String(s.cluster_name || s.cluster || '').toLowerCase();
        const matchCluster = sClusterId === cId || sClusterName === cName;
        if (!matchCluster) return false;
        const sId = String(s.id || '').toLowerCase();
        const sName = String(s.name || '').toLowerCase();
        const sCode = String(s.code || '').toLowerCase();
        return normSchools.includes(sId) || normSchools.includes(sName) || normSchools.includes(sCode);
      });
    }
    return true;
  });

  // Allowed cluster identifiers
  const allowedClusterIds = new Set(filteredClusters.map(c => String(c.id || '').toLowerCase()));
  const allowedClusterNames = new Set(filteredClusters.map(c => String(c.name || '').toLowerCase()));
  normClusters.forEach(token => {
    allowedClusterIds.add(token);
    allowedClusterNames.add(token);
  });

  // 4. Filter schools:
  // Must match assigned clusters (if cluster scoped).
  // AND if specific schools are assigned, must match assigned schools!
  const filteredSchools = (schools || []).filter(s => {
    if (!s) return false;
    const sId = String(s.id || '').toLowerCase();
    const sName = String(s.name || '').toLowerCase();
    const sCode = String(s.code || '').toLowerCase();
    const sClusterId = String(s.cluster_id || '').toLowerCase();
    const sClusterName = String(s.cluster_name || s.cluster || '').toLowerCase();

    const matchesCluster = (
      allowedClusterIds.size === 0 ||
      allowedClusterIds.has(sClusterId) ||
      allowedClusterNames.has(sClusterId) ||
      allowedClusterNames.has(sClusterName) ||
      allowedClusterIds.has(sClusterName)
    );

    if (!matchesCluster) return false;

    // If specific schools are assigned, restrict strictly to those schools
    if (normSchools.length > 0) {
      return normSchools.includes(sId) || normSchools.includes(sName) || normSchools.includes(sCode);
    }

    return true;
  });

  // Allowed school identifiers (both UUIDs, names, and codes)
  const allowedSchoolIds = new Set(filteredSchools.map(s => String(s.id || '').toLowerCase()));
  const allowedSchoolNames = new Set(filteredSchools.map(s => String(s.name || '').toLowerCase()));
  const allowedSchoolCodes = new Set(filteredSchools.map(s => String(s.code || '').toLowerCase()));

  // 5. Filter students:
  // Must belong to the filtered schools
  const filteredStudents = (students || []).filter(st => {
    if (!st) return false;
    const stSchoolId = String(st.school_id || '').toLowerCase();
    const stSchoolName = String(st.school_name || '').toLowerCase();
    const stClusterId = String(st.cluster_id || '').toLowerCase();
    const stClusterName = String(st.cluster_name || '').toLowerCase();

    // Check school membership first
    const inSchool = (
      (stSchoolId && allowedSchoolIds.has(stSchoolId)) ||
      (stSchoolName && allowedSchoolNames.has(stSchoolName)) ||
      (stSchoolName && allowedSchoolCodes.has(stSchoolName)) ||
      (stSchoolId && allowedSchoolNames.has(stSchoolId))
    );

    if (inSchool) return true;

    // If no specific schools are assigned, allow any student in the allowed cluster
    if (normSchools.length === 0) {
      return (
        allowedClusterIds.has(stClusterId) ||
        allowedClusterNames.has(stClusterName) ||
        allowedClusterIds.has(stClusterName)
      );
    }

    return false;
  });

  // 6. Filter users:
  // Users belonging to the allowed clusters or schools
  const filteredUsers = (users || []).filter(u => {
    if (!u) return false;
    const uClusterId = String(u.cluster_id || u.assigned_cluster_id || '').toLowerCase();
    const uSchoolName = String(u.school_name || '').toLowerCase();
    if (allowedClusterIds.has(uClusterId) || allowedClusterNames.has(uClusterId)) return true;
    if (allowedSchoolNames.has(uSchoolName)) return true;
    if (u.assigned_cluster_ids) {
      let uClusters = u.assigned_cluster_ids;
      if (typeof uClusters === 'string') {
        try { uClusters = JSON.parse(uClusters); } catch { uClusters = [uClusters]; }
      }
      if (Array.isArray(uClusters)) {
        if (uClusters.some(uc => allowedClusterNames.has(String(uc).toLowerCase()) || allowedClusterIds.has(String(uc).toLowerCase()))) {
          return true;
        }
      }
    }
    if (u.assigned_school_ids) {
      let uSchools = u.assigned_school_ids;
      if (typeof uSchools === 'string') {
        try { uSchools = JSON.parse(uSchools); } catch { uSchools = [uSchools]; }
      }
      if (Array.isArray(uSchools)) {
        if (uSchools.some(us => allowedSchoolNames.has(String(us).toLowerCase()) || allowedSchoolIds.has(String(us).toLowerCase()))) {
          return true;
        }
      }
    }
    return false;
  });

  return {
    filteredClusters,
    filteredSchools,
    filteredStudents,
    filteredUsers
  };
}
