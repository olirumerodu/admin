/**
 * Multi-Attribute Student Search Matcher
 * Matches query against:
 * 1. Student Name
 * 2. Unique IDs (ID, idCode, EMIS number, Admission No, Previous Student ID)
 * 3. Date of Birth (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, Month Name, Day, Year)
 * 4. Class and Section (Class 1, 1, Section A, A, 1-A, 1A, Class 1-A, Class 1 A)
 * 5. School and Cluster names
 */
export function matchStudentSearch(student, searchQuery) {
  if (!searchQuery || typeof searchQuery !== 'string') return true;
  const q = searchQuery.toLowerCase().trim();
  if (!q) return true;

  // 1. Student Name
  const name = String(student.name || '').toLowerCase();
  if (name.includes(q)) return true;

  // 2. Unique Student Identifiers
  const id = String(student.id || '').toLowerCase();
  const idCode = String(student.idCode || '').toLowerCase();
  const prevId = String(student.previousStudentId || student.previous_student_id || '').toLowerCase();
  const emis = String(student.emis_number || student.emisNumber || '').toLowerCase();
  const admNo = String(student.admission_no || student.admissionNumber || '').toLowerCase();
  if (id.includes(q) || idCode.includes(q) || prevId.includes(q) || emis.includes(q) || admNo.includes(q)) {
    return true;
  }

  // 3. Class and Section
  const rawClass = String(student.classVal || student.class_name || student.className || '').toLowerCase();
  const classNum = rawClass.replace(/class\s*/i, '').trim();
  const classFull = `class ${classNum}`.trim();
  
  const rawSection = String(student.section || '').toLowerCase();
  const sectionLetter = rawSection.replace(/section\s*/i, '').trim();
  const sectionFull = `section ${sectionLetter}`.trim();

  // Direct class or section match
  if (classNum === q || classFull === q || classFull.includes(q)) return true;
  if (sectionLetter === q || sectionFull === q || sectionFull.includes(q)) return true;

  // Combined Class & Section combinations (e.g. "1A", "1-A", "1 A", "Class 1-A", "Class 1 A", "Class 1 Section A")
  if (classNum && sectionLetter) {
    const combos = [
      `${classNum}${sectionLetter}`,
      `${classNum}-${sectionLetter}`,
      `${classNum} ${sectionLetter}`,
      `class ${classNum}${sectionLetter}`,
      `class ${classNum}-${sectionLetter}`,
      `class ${classNum} ${sectionLetter}`,
      `class ${classNum} section ${sectionLetter}`,
    ];
    if (combos.some(combo => combo === q || combo.includes(q))) return true;
  }

  // 4. Date of Birth (DOB) - Various formats
  const rawDob = String(student.dob || '').toLowerCase();
  const dobFormatted = String(student.dobFormatted || '').toLowerCase();
  if (rawDob.includes(q) || dobFormatted.includes(q)) return true;

  if (student.dob) {
    try {
      const d = new Date(student.dob);
      if (!isNaN(d.getTime())) {
        const y = String(d.getFullYear());
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const shortMonth = d.toLocaleDateString('en-US', { month: 'short' }).toLowerCase();
        const longMonth = d.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();

        const dateVariants = [
          `${day}/${m}/${y}`,
          `${day}-${m}-${y}`,
          `${y}-${m}-${day}`,
          `${y}/${m}/${day}`,
          `${day} ${shortMonth} ${y}`,
          `${day} ${longMonth} ${y}`,
          `${shortMonth} ${y}`,
          `${longMonth} ${y}`,
          y,
        ];
        if (dateVariants.some(v => v === q || v.includes(q))) return true;
      }
    } catch (_) {}
  }

  // 5. School and Cluster names
  const schoolName = String(student.school_name || student.schoolName || '').toLowerCase();
  const schoolCode = String(student.school_code || student.schoolCode || '').toLowerCase();
  const clusterName = String(student.cluster_name || student.clusterName || '').toLowerCase();
  if (schoolName.includes(q) || schoolCode.includes(q) || clusterName.includes(q)) return true;

  return false;
}

