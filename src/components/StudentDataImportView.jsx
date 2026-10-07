import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Network, 
  School, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Download, 
  X, 
  RotateCcw,
  Check,
  FolderOpen,
  Layers,
  Database,
  Table,
  Search,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Eye,
  Filter,
  Plus,
  Wand2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}



// Helper to convert date formats to DD/MM/YYYY
function normalizeDobDisplay(raw) {
  if (!raw || raw === '-') return '-';
  if (typeof raw === 'number') {
    // Excel date serial number
    const jsDate = new Date(Math.round((raw - 25569) * 86400 * 1000));
    if (!isNaN(jsDate.getTime())) {
      const d = String(jsDate.getDate()).padStart(2, '0');
      const m = String(jsDate.getMonth() + 1).padStart(2, '0');
      const y = jsDate.getFullYear();
      return `${d}/${m}/${y}`;
    }
  }
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return str;
}

export default function StudentDataImportView({ onNavigateTab }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // View state: 'wizard' | 'history' | 'details'
  const [importView, setImportView] = useState('wizard');

  // Multi-step State - Always start from step 1
  const [currentStep, setCurrentStep] = useState(1);

  // Dynamic Clusters & Schools
  const [clustersList, setClustersList] = useState([]);
  const [allSchoolsList, setAllSchoolsList] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('All Clusters');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');

  // Modals in Step 1
  const [showCreateClusterModal, setShowCreateClusterModal] = useState(false);
  const [newClusterName, setNewClusterName] = useState('');
  const [newClusterDesc, setNewClusterDesc] = useState('');
  const [isCreatingCluster, setIsCreatingCluster] = useState(false);

  const [showCreateSchoolModal, setShowCreateSchoolModal] = useState(false);
  const [newSchoolCluster, setNewSchoolCluster] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [newSchoolAddress, setNewSchoolAddress] = useState('');
  const [newSchoolSelectedClasses, setNewSchoolSelectedClasses] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [newSchoolSelectedSections, setNewSchoolSelectedSections] = useState(['A', 'B', 'C']);
  const [newSchoolCustomSections, setNewSchoolCustomSections] = useState([]);
  const [customSectionInput, setCustomSectionInput] = useState('');
  const [showAddCustomSection, setShowAddCustomSection] = useState(false);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);

  // Confirmation Modals
  const [showStep1ConfirmModal, setShowStep1ConfirmModal] = useState(false);
  const [showStep3ConfirmModal, setShowStep3ConfirmModal] = useState(false);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);

  // Toast / feedback message
  const [toastMsg, setToastMsg] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Step 2: Uploaded File State (Clean start, no hardcoded file)
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Step 3: Parsed Student Records
  const [studentRows, setStudentRows] = useState([]);
  const [viewErrorsOnly, setViewErrorsOnly] = useState(false);
  const [searchPreview, setSearchPreview] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const [previewRowsPerPage, setPreviewRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Step 4: Review & Final Import
  const [searchReview, setSearchReview] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewRowsPerPage, setReviewRowsPerPage] = useState(15);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // Realtime Import History State (from PostgreSQL database vatta_sattam)
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyClusterFilter, setHistoryClusterFilter] = useState('All Clusters');
  const [historySchoolFilter, setHistorySchoolFilter] = useState('All Schools');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Expanded batch to view & delete individual students
  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [isLoadingBatchStudents, setIsLoadingBatchStudents] = useState(false);

  // Deletion modals state
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch realtime import history from PostgreSQL
  const fetchImportHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await api.getImportHistory({
        cluster_name: historyClusterFilter,
        school_name: historySchoolFilter,
        search: historySearch,
      });
      setHistoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load import history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (importView === 'history') {
      fetchImportHistory();
    }
  }, [importView, historyClusterFilter, historySchoolFilter]);

  // Debounced search for import history
  useEffect(() => {
    if (importView !== 'history') return;
    const timer = setTimeout(() => {
      fetchImportHistory();
    }, 300);
    return () => clearTimeout(timer);
  }, [historySearch]);

  const handleToggleViewBatchStudents = async (batchId) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
      setBatchStudents([]);
      return;
    }
    setExpandedBatchId(batchId);
    setIsLoadingBatchStudents(true);
    try {
      const students = await api.getImportBatchStudents(batchId);
      setBatchStudents(Array.isArray(students) ? students : []);
    } catch (err) {
      console.warn('Failed to load students for batch:', err);
      showToast('Failed to load students for this import batch', 'error');
      setBatchStudents([]);
    } finally {
      setIsLoadingBatchStudents(false);
    }
  };

  const handleConfirmDeleteBatch = async () => {
    if (!batchToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteImportBatch(batchToDelete.id);
      showToast(`Successfully deleted uploaded sheet "${batchToDelete.fileName}" and all associated students from database & mobile application!`);
      if (expandedBatchId === batchToDelete.id) {
        setExpandedBatchId(null);
        setBatchStudents([]);
      }
      setBatchToDelete(null);
      fetchImportHistory();
    } catch (err) {
      showToast(err.message || 'Failed to delete imported sheet', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteStudent(studentToDelete.id);
      showToast(`Student "${studentToDelete.name}" deleted from database and mobile application.`);
      setBatchStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setHistoryList(prev => prev.map(b => b.id === studentToDelete.batchId ? { ...b, records: Math.max(0, b.records - 1) } : b));
      setStudentToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch clusters and schools from backend
  const fetchLocations = async () => {
    try {
      const [clustersRes, schoolsRes] = await Promise.allSettled([
        api.getClusters(),
        api.getSchools()
      ]);
      const cList = clustersRes.status === 'fulfilled' && Array.isArray(clustersRes.value) ? clustersRes.value : [];
      const sList = schoolsRes.status === 'fulfilled' && Array.isArray(schoolsRes.value) ? schoolsRes.value : [];

      setClustersList(cList);
      setAllSchoolsList(sList);

      if (!selectedSchool && sList.length > 0) {
        setSelectedSchool(sList[0].name);
      }
    } catch (err) {
      console.warn('Failed to load clusters or schools:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Filter available schools by selected cluster
  const availableSchools = allSchoolsList.filter(s => {
    if (!selectedCluster || selectedCluster === 'All Clusters') return true;
    return s.cluster_name?.toLowerCase() === selectedCluster.toLowerCase() || s.cluster_id === selectedCluster;
  });

  const selectedSchoolObj = allSchoolsList.find(
    s => s.name?.toLowerCase() === selectedSchool?.toLowerCase() || s.id === selectedSchool
  );
  const existingStudentsCount = selectedSchoolObj?.students_count || 0;

  // Real-time counts
  const errorCount = studentRows.filter(r => r.status === 'Invalid').length;
  const validCount = studentRows.filter(r => r.status === 'Valid').length;

  // Trigger temporary toast
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // -------------------------------------------------------------
  // STEP 1 HANDLERS: CREATE CLUSTER & SCHOOL
  // -------------------------------------------------------------
  const handleCreateCluster = async (e) => {
    e.preventDefault();
    if (!newClusterName.trim()) {
      alert('Please enter a cluster name.');
      return;
    }
    setIsCreatingCluster(true);
    try {
      const res = await api.createCluster({
        name: newClusterName.trim(),
        description: newClusterDesc.trim() || 'Created during student import',
      });
      showToast(`Cluster "${res.name}" created successfully!`);
      setNewClusterName('');
      setNewClusterDesc('');
      setShowCreateClusterModal(false);
      await fetchLocations();
      setSelectedCluster(res.name);
    } catch (err) {
      alert(`Failed to create cluster: ${err.message}`);
    } finally {
      setIsCreatingCluster(false);
    }
  };

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
    setNewSchoolSelectedClasses(prev => {
      if (prev.includes(clsNum)) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== clsNum).sort((a, b) => a - b);
      } else {
        return [...prev, clsNum].sort((a, b) => a - b);
      }
    });
  };

  const setClassPreset = (preset) => {
    if (preset === 'primary') setNewSchoolSelectedClasses([1, 2, 3, 4, 5]);
    else if (preset === 'middle') setNewSchoolSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
    else if (preset === 'high') setNewSchoolSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    else if (preset === 'all') setNewSchoolSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const toggleSchoolSection = (secName) => {
    setNewSchoolSelectedSections(prev => {
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
    if (!newSchoolCustomSections.includes(clean) && !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(clean)) {
      setNewSchoolCustomSections(prev => [...prev, clean]);
    }
    if (!newSchoolSelectedSections.includes(clean)) {
      setNewSchoolSelectedSections(prev => [...prev, clean]);
    }
    setCustomSectionInput('');
    setShowAddCustomSection(false);
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      alert('Please enter a school name.');
      return;
    }
    if (newSchoolSelectedClasses.length === 0) {
      alert('Please select at least one class covered by this school.');
      return;
    }
    if (newSchoolSelectedSections.length === 0) {
      alert('Please select at least one section for this school.');
      return;
    }
    setIsCreatingSchool(true);
    try {
      const clusterTarget = newSchoolCluster || (selectedCluster !== 'All Clusters' ? selectedCluster : (clustersList[0]?.name || 'Central District'));
      const formattedClasses = formatClassesRange(newSchoolSelectedClasses);
      const formattedSections = newSchoolSelectedSections.join(', ');

      const res = await api.createSchool({
        cluster_id: clusterTarget,
        name: newSchoolName.trim(),
        code: newSchoolCode.trim() || undefined,
        address: newSchoolAddress.trim() || 'Main Campus',
        classes_range: formattedClasses,
        sections: formattedSections,
      });
      showToast(`School "${res.name}" (Classes ${formattedClasses}, Sec: ${formattedSections}) created successfully and reflected in application!`);
      setNewSchoolName('');
      setNewSchoolCode('');
      setNewSchoolAddress('');
      setNewSchoolSelectedClasses([1, 2, 3, 4, 5, 6, 7, 8]);
      setNewSchoolSelectedSections(['A', 'B', 'C']);
      setNewSchoolCustomSections([]);
      setShowAddCustomSection(false);
      setCustomSectionInput('');
      setShowCreateSchoolModal(false);
      await fetchLocations();
      setSelectedSchool(res.name);
    } catch (err) {
      alert(`Failed to create school: ${err.message}`);
    } finally {
      setIsCreatingSchool(false);
    }
  };

  const handleStep1Proceed = () => {
    setErrorBanner('');
    if (!selectedSchool || selectedSchool === 'All Schools') {
      setErrorBanner('Please select a specific school before proceeding to upload.');
      return;
    }
    setShowStep1ConfirmModal(true);
  };

  // -------------------------------------------------------------
  // STEP 2 HANDLERS: PARSE EXCEL / CSV
  // -------------------------------------------------------------
  const parseSpreadsheetData = (data, fileName) => {
    try {
      let rows = [];

      // Check if SheetJS XLSX is available
      if (typeof window !== 'undefined' && window.XLSX) {
        const workbook = window.XLSX.read(data, { type: typeof data === 'string' ? 'string' : 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rows = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      } else {
        // Simple CSV parser fallback
        const text = typeof data === 'string' ? data : new TextDecoder('utf-8').decode(data);
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            const obj = {};
            headers.forEach((h, idx) => {
              obj[h] = vals[idx] !== undefined ? vals[idx] : '';
            });
            rows.push(obj);
          }
        }
      }

      if (!rows || rows.length === 0) {
        alert('The uploaded file contains no data rows. Please check the file.');
        return;
      }

      // Map parsed rows to normalized student fields
      const parsedRecords = rows.map((r, index) => {
        // Find best match for each field
        const nameKey = Object.keys(r).find(k => /name|student/i.test(k)) || Object.keys(r)[1] || 'name';
        const classKey = Object.keys(r).find(k => /class|grade|std/i.test(k)) || Object.keys(r)[2] || 'class';
        const secKey = Object.keys(r).find(k => /sec/i.test(k)) || Object.keys(r)[3] || 'section';
        const dobKey = Object.keys(r).find(k => /dob|birth|date/i.test(k)) || Object.keys(r)[4] || 'dob';
        const genderKey = Object.keys(r).find(k => /gender|sex/i.test(k));
        const heightKey = Object.keys(r).find(k => /height|ht/i.test(k));
        const weightKey = Object.keys(r).find(k => /weight|wt/i.test(k));

        const rawName = String(r[nameKey] || '').trim();
        const rawClass = String(r[classKey] || '').trim().replace(/class/i, '').trim();
        const rawSec = String(r[secKey] || '').trim().toUpperCase() || 'A';
        const rawDob = normalizeDobDisplay(r[dobKey]);
        const rawGender = genderKey && r[genderKey] ? String(r[genderKey]).trim() : 'Female';
        const rawHeight = heightKey && r[heightKey] ? String(r[heightKey]).trim() : '-';
        const rawWeight = weightKey && r[weightKey] ? String(r[weightKey]).trim() : '-';

        let isValid = true;
        let errorMsg = '-';

        if (!rawName || rawName.length < 2) {
          isValid = false;
          errorMsg = 'Missing or invalid student name';
        } else if (!rawClass || rawClass === '-') {
          isValid = false;
          errorMsg = 'Invalid class';
        } else if (!rawDob || rawDob === '-' || rawDob.length < 4) {
          isValid = false;
          errorMsg = 'Missing DOB';
        }

        return {
          row: index + 1,
          name: rawName || `Student ${index + 1}`,
          classVal: rawClass || '1',
          section: rawSec,
          dob: rawDob,
          gender: rawGender.toLowerCase().startsWith('m') ? 'Male' : 'Female',
          height: rawHeight,
          weight: rawWeight,
          status: isValid ? 'Valid' : 'Invalid',
          error: errorMsg
        };
      });

      setStudentRows(parsedRecords);
      showToast(`Parsed ${parsedRecords.length} student records from ${fileName}!`);
    } catch (err) {
      alert(`Failed to parse file: ${err.message}. Please upload a valid .xlsx or .csv file.`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls') && !lowerName.endsWith('.csv')) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.round(file.size / 1024) + ' KB';

    setSelectedFile({
      name: file.name,
      size: formattedSize,
      uploadedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      rawFile: file
    });

    setIsParsing(true);
    const reader = new FileReader();
    if (lowerName.endsWith('.csv')) {
      reader.onload = (e) => parseSpreadsheetData(e.target.result, file.name);
      reader.readAsText(file);
    } else {
      reader.onload = (e) => parseSpreadsheetData(new Uint8Array(e.target.result), file.name);
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      if (typeof window !== 'undefined' && window.XLSX) {
        const templateData = [
          { 'S.No': 1, 'Student Name': 'Aarav Sharma', 'Class': '3', 'Section': 'A', 'Gender': 'Male', 'DOB': '15/05/2019', 'Height (cm)': 128.5, 'Weight (kg)': 22.3 },
          { 'S.No': 2, 'Student Name': 'Diya Patel', 'Class': '4', 'Section': 'B', 'Gender': 'Female', 'DOB': '20/08/2018', 'Height (cm)': 132.0, 'Weight (kg)': 25.1 },
          { 'S.No': 3, 'Student Name': 'Rohan Kumar', 'Class': '2', 'Section': 'C', 'Gender': 'Male', 'DOB': '10/02/2020', 'Height (cm)': 121.0, 'Weight (kg)': 19.8 },
          { 'S.No': 4, 'Student Name': 'Sneha Iyer', 'Class': '5', 'Section': 'A', 'Gender': 'Female', 'DOB': '12/11/2017', 'Height (cm)': 140.2, 'Weight (kg)': 28.6 },
          { 'S.No': 5, 'Student Name': 'Kavya Sundaram', 'Class': '1', 'Section': 'B', 'Gender': 'Female', 'DOB': '05/01/2021', 'Height (cm)': 110.0, 'Weight (kg)': 15.2 }
        ];
        const worksheet = window.XLSX.utils.json_to_sheet(templateData);
        worksheet['!cols'] = [
          { wch: 6 },  // S.No
          { wch: 22 }, // Student Name
          { wch: 10 }, // Class
          { wch: 10 }, // Section
          { wch: 10 }, // Gender
          { wch: 14 }, // DOB
          { wch: 14 }, // Height (cm)
          { wch: 14 }  // Weight (kg)
        ];
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Template');
        window.XLSX.writeFile(workbook, 'student_bulk_import_template.xlsx');
        showToast('Downloaded Excel template (.xlsx)! No BMI column needed — calculations proceed in the mobile app.');
        return;
      }
    } catch (e) {
      console.warn('XLSX template download error, falling back to CSV:', e);
    }

    const csvContent = 'data:text/csv;charset=utf-8,S.No,Student Name,Class,Section,Gender,DOB,Height (cm),Weight (kg)\n' +
      '1,Aarav Sharma,3,A,Male,15/05/2019,128.5,22.3\n' +
      '2,Diya Patel,4,B,Female,20/08/2018,132.0,25.1\n' +
      '3,Rohan Kumar,2,C,Male,10/02/2020,121.0,19.8\n' +
      '4,Sneha Iyer,5,A,Female,12/11/2017,140.2,28.6\n' +
      '5,Kavya Sundaram,1,B,Female,05/01/2021,110.0,15.2\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded template file (.csv)!');
  };

  // -------------------------------------------------------------
  // STEP 3 HANDLERS: RESOLVE ERRORS & CONFIRM
  // -------------------------------------------------------------
  const handleFixAllErrors = () => {
    setStudentRows(prev => prev.map(r => {
      if (r.status === 'Invalid') {
        const fixedDob = (!r.dob || r.dob === '-') ? '15/05/2019' : r.dob;
        const fixedClass = (!r.classVal || r.classVal === '-') ? '1' : r.classVal;
        const fixedHeight = (!r.height || r.height === '-') ? '125.0' : r.height;
        const fixedWeight = (!r.weight || r.weight === '-') ? '22.0' : r.weight;
        return {
          ...r,
          dob: fixedDob,
          classVal: fixedClass,
          height: fixedHeight,
          weight: fixedWeight,
          status: 'Valid',
          error: '-'
        };
      }
      return r;
    }));
    showToast('All invalid records automatically resolved with valid defaults!');
  };

  const handleRemoveInvalidRows = () => {
    setStudentRows(prev => prev.filter(r => r.status === 'Valid'));
    showToast('Removed all rows with errors. Remaining records are 100% valid!');
  };

  // -------------------------------------------------------------
  // STEP 4 HANDLERS: CONFIRM IMPORT
  // -------------------------------------------------------------
  const handleExecuteImport = async () => {
    setIsImporting(true);
    setShowImportConfirmModal(false);

    try {
      const validRows = studentRows.filter(r => r.status === 'Valid');
      if (validRows.length === 0) {
        alert('No valid student records to import. Please resolve any errors first.');
        setIsImporting(false);
        return;
      }

      const payloadStudents = validRows.map(r => {
        let dobStr = null;
        if (r.dob && r.dob.includes('/')) {
          const parts = r.dob.split('/');
          if (parts.length === 3) {
            dobStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else if (r.dob && r.dob.includes('-')) {
          dobStr = r.dob;
        }

        return {
          name: r.name,
          class_name: `Class ${r.classVal}`,
          section: r.section || 'A',
          dob: dobStr || '2018-05-15',
          gender: r.gender || 'Female',
          height_cm: r.height && r.height !== '-' ? parseFloat(r.height) : null,
          weight_kg: r.weight && r.weight !== '-' ? parseFloat(r.weight) : null,
        };
      });

      const schoolIdToUse = selectedSchoolObj?.id || selectedSchool;
      const res = await api.bulkImportStudents(schoolIdToUse, payloadStudents, selectedFile?.name || 'Students_Import.xlsx');

      setImportSummary({
        importedCount: res.imported_count || payloadStudents.length,
        schoolName: res.school_name || selectedSchool,
        clusterName: res.cluster_name || selectedCluster,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      });

      fetchImportHistory();
      setCurrentStep(5);
      showToast(`Successfully imported ${res.imported_count || payloadStudents.length} students! Health tracking & calculations will be processed in the application.`);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered rows for Step 3
  const filteredStep3Rows = studentRows.filter(item => {
    if (viewErrorsOnly && item.status !== 'Invalid') return false;
    if (!searchPreview) return true;
    const q = searchPreview.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      String(item.classVal).toLowerCase().includes(q) ||
      item.section.toLowerCase().includes(q) ||
      item.error.toLowerCase().includes(q)
    );
  });

  // Filtered rows for Step 4 (ALL students from uploaded file)
  const filteredStep4Students = studentRows.filter(s => {
    if (!searchReview) return true;
    const q = searchReview.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.classVal).toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  });

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= TOAST NOTIFICATION ================= */}
      {toastMsg && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#065F46',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '9px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} color="#34D399" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ================= BREADCRUMB & HEADER ================= */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
            <span 
              style={{ cursor: 'pointer', color: '#64748B' }}
              onClick={() => onNavigateTab ? onNavigateTab('dashboard') : null}
            >
              Dashboard
            </span>
            <span>&gt;</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Student Data Import</span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            Student Data Import
          </h1>
          <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
            {importView === 'wizard' 
              ? 'Bulk import student records from Excel and apply WHO growth calculations automatically'
              : 'Review past bulk imports and import status records'}
          </p>
        </div>

        {/* View Switcher: Import Wizard vs Import History */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => { setImportView('wizard'); setCurrentStep(1); }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: importView === 'wizard' ? 'none' : '1px solid #CBD5E1',
              backgroundColor: importView === 'wizard' ? '#EB5A1D' : '#FFFFFF',
              color: importView === 'wizard' ? '#FFFFFF' : '#475569',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: importView === 'wizard' ? '0 2px 6px rgba(235, 90, 29, 0.3)' : 'none'
            }}
          >
            <Upload size={14} />
            <span>Import Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setImportView('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: importView === 'history' ? 'none' : '1px solid #CBD5E1',
              backgroundColor: importView === 'history' ? '#0F172A' : '#FFFFFF',
              color: importView === 'history' ? '#FFFFFF' : '#475569',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: importView === 'history' ? '0 2px 6px rgba(15, 23, 42, 0.3)' : 'none'
            }}
          >
            <Clock size={14} />
            <span>Import History</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorBanner && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '10px 14px', color: '#DC2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* ================= STEPPER PROGRESS BAR (4 STEPS) ================= */}
      {importView === 'wizard' && currentStep <= 4 && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '8px' : '16px',
            padding: '8px 0',
            width: '100%',
            overflowX: 'auto',
            boxSizing: 'border-box'
          }}
        >
          {/* Step 1 Indicator */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => setCurrentStep(1)}
          >
            <div 
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentStep === 1 ? '#EB5A1D' : currentStep > 1 ? '#10B981' : '#F1F5F9',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 1 ? '0 2px 8px rgba(235,90,29,0.3)' : 'none',
                flexShrink: 0
              }}
            >
              {currentStep > 1 ? <Check size={14} strokeWidth={3} /> : '01'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 1 ? 700 : 500, color: currentStep === 1 ? '#EA580C' : '#475569', whiteSpace: 'nowrap' }}>
              Select Location
            </span>
          </div>

          <div style={{ width: isMobile ? '20px' : '40px', height: '2px', backgroundColor: currentStep >= 2 ? '#EA580C' : '#E2E8F0', flexShrink: 0 }} />

          {/* Step 2 Indicator */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: currentStep >= 2 ? 'pointer' : 'default' }}
            onClick={() => { if (currentStep >= 2) setCurrentStep(2); }}
          >
            <div 
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentStep === 2 ? '#EB5A1D' : currentStep > 2 ? '#10B981' : '#F1F5F9',
                color: currentStep >= 2 ? '#FFFFFF' : '#94A3B8',
                border: currentStep < 2 ? '1.5px solid #CBD5E1' : 'none',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 2 ? '0 2px 8px rgba(235,90,29,0.3)' : 'none',
                flexShrink: 0
              }}
            >
              {currentStep > 2 ? <Check size={14} strokeWidth={3} /> : '02'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 2 ? 700 : 500, color: currentStep === 2 ? '#EA580C' : '#475569', whiteSpace: 'nowrap' }}>
              Upload Excel
            </span>
          </div>

          <div style={{ width: isMobile ? '20px' : '40px', height: '2px', backgroundColor: currentStep >= 3 ? '#EA580C' : '#E2E8F0', flexShrink: 0 }} />

          {/* Step 3 Indicator */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: currentStep >= 3 ? 'pointer' : 'default' }}
            onClick={() => { if (currentStep >= 3) setCurrentStep(3); }}
          >
            <div 
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentStep === 3 ? '#EB5A1D' : currentStep > 3 ? '#10B981' : '#F1F5F9',
                color: currentStep >= 3 ? '#FFFFFF' : '#94A3B8',
                border: currentStep < 3 ? '1.5px solid #CBD5E1' : 'none',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 3 ? '0 2px 8px rgba(235,90,29,0.3)' : 'none',
                flexShrink: 0
              }}
            >
              {currentStep > 3 ? <Check size={14} strokeWidth={3} /> : '03'}
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 3 ? 700 : 500, color: currentStep === 3 ? '#EA580C' : '#475569', whiteSpace: 'nowrap' }}>
              Validate Data
            </span>
          </div>

          <div style={{ width: isMobile ? '20px' : '40px', height: '2px', backgroundColor: currentStep >= 4 ? '#EA580C' : '#E2E8F0', flexShrink: 0 }} />

          {/* Step 4 Indicator */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: currentStep >= 4 ? 'pointer' : 'default' }}
            onClick={() => { if (currentStep >= 4) setCurrentStep(4); }}
          >
            <div 
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: currentStep === 4 ? '#EB5A1D' : '#F1F5F9',
                color: currentStep === 4 ? '#FFFFFF' : '#94A3B8',
                border: currentStep < 4 ? '1.5px solid #CBD5E1' : 'none',
                fontWeight: 800,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStep === 4 ? '0 2px 8px rgba(235,90,29,0.3)' : 'none',
                flexShrink: 0
              }}
            >
              04
            </div>
            <span style={{ fontSize: '13px', fontWeight: currentStep === 4 ? 700 : 500, color: currentStep === 4 ? '#EA580C' : '#475569', whiteSpace: 'nowrap' }}>
              Review &amp; Import
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT LOCATION & ADD CLUSTER/SCHOOL                              */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 1 && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #ECEEF2',
            padding: isMobile ? '20px 16px' : '28px 32px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#EA580C', fontWeight: 700, textTransform: 'uppercase' }}>Step 1 of 4</div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '2px 0 2px 0' }}>
                Select Location Destination
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Choose the cluster and school where the student data will be imported, or create a new one instantly.
              </p>
            </div>
          </div>

          {/* 2-Column Form & Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }}>
            {/* Left Column: Location Selection + Create Functions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Cluster Dropdown with Create Button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>
                    Select Cluster <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCreateClusterModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EA580C',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Plus size={13} strokeWidth={3} />
                    <span>Create Cluster</span>
                  </button>
                </div>

                <div style={{ height: '42px', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFFFFF' }}>
                  <Network size={16} color="#64748B" />
                  <select
                    value={selectedCluster}
                    onChange={(e) => {
                      const newC = e.target.value;
                      setSelectedCluster(newC);
                      const matching = allSchoolsList.filter(
                        s => newC === 'All Clusters' || s.cluster_name?.toLowerCase() === newC.toLowerCase() || s.cluster_id === newC
                      );
                      if (matching.length > 0) {
                        setSelectedSchool(matching[0].name);
                      }
                    }}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="All Clusters">All Clusters</option>
                    {clustersList.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* School Dropdown with Create Button */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B' }}>
                    Select School <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewSchoolCluster(selectedCluster !== 'All Clusters' ? selectedCluster : (clustersList[0]?.name || ''));
                      setShowCreateSchoolModal(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EA580C',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Plus size={13} strokeWidth={3} />
                    <span>Create School</span>
                  </button>
                </div>

                <div style={{ height: '42px', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFFFFF' }}>
                  <School size={16} color="#64748B" />
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="">-- Choose School --</option>
                    {availableSchools.map(s => (
                      <option key={s.id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {availableSchools.length === 0 && (
                  <span style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px', display: 'block' }}>
                    No schools registered in this cluster yet. Click "+ Create School" above to add one.
                  </span>
                )}
              </div>

              {/* Academic Year Selection */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                  Academic Session
                </label>
                <div style={{ height: '42px', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FFFFFF' }}>
                  <Calendar size={16} color="#64748B" />
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: '#0F172A', cursor: 'pointer' }}
                  >
                    <option value="2025-2026">2025–2026 (Current Academic Year)</option>
                    <option value="2026-2027">2026–2027</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Destination Card */}
            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '14px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                Selected Import Destination
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                  <School size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Destination School</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                    {selectedSchool || 'No school selected'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Cluster Assignment</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                    {selectedCluster}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #FED7AA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Existing Registered Students</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0F172A' }}>
                    {existingStudentsCount} students
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: '#9A3412', lineHeight: 1.4, border: '1px solid #FFEDD5' }}>
                💡 <strong>Application Sync:</strong> Once imported, students will automatically synchronize with both the Flutter mobile application and the administrator portal with WHO nutritional calculations applied.
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ECEEF2', paddingTop: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('students') : null}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Students</span>
            </button>

            <button
              type="button"
              onClick={handleStep1Proceed}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(235,90,29,0.3)'
              }}
            >
              <span>Next: Upload Excel</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: UPLOAD EXCEL FILE (CLEAN, DYNAMIC, SUPPORTS .XLSX / .XLS / .CSV)  */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '16px' }}>
            
            {/* Dropzone Card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '2px dashed #EA580C' : '2px dashed #FDBA74',
                  borderRadius: '12px',
                  backgroundColor: dragActive ? '#FFF7ED' : '#FFFDFB',
                  padding: '36px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('browse-excel-input').click()}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <FileSpreadsheet size={28} color="#EA580C" />
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  {isParsing ? 'Reading and Parsing File...' : 'Upload Student Data Spreadsheet'}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px 0' }}>
                  Drag &amp; drop your Excel or CSV file here, or click to browse
                </p>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); document.getElementById('browse-excel-input').click(); }}
                  style={{
                    backgroundColor: '#EB5A1D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 3px 10px rgba(235, 90, 29, 0.25)'
                  }}
                >
                  <FolderOpen size={15} />
                  <span>Browse Excel File</span>
                </button>
                <input 
                  id="browse-excel-input" 
                  type="file" 
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv" 
                  onChange={(e) => { if (e.target.files && e.target.files[0]) handleFileSelected(e.target.files[0]); }} 
                  style={{ display: 'none' }} 
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', fontSize: '12px', color: '#64748B' }}>
                  <span>Accepted formats: <strong style={{ color: '#0F172A' }}>.xlsx, .xls, .csv</strong></span>
                  <span>•</span>
                  <span>Max size: <strong style={{ color: '#0F172A' }}>25 MB</strong></span>
                </div>
              </div>
            </div>

            {/* Selected File Card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
                  Selected File Status
                </h3>

                {selectedFile ? (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileSpreadsheet size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                          {selectedFile.size} • {studentRows.length} records parsed
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setStudentRows([]); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                      title="Remove file"
                    >
                      <X size={17} />
                    </button>
                  </div>
                ) : (
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: '10px', padding: '28px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                    No file selected yet. Please upload an Excel or CSV file to continue.
                  </div>
                )}
              </div>

              {/* Status indicator */}
              {selectedFile && studentRows.length > 0 && (
                <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#166534', fontWeight: 600 }}>
                  <CheckCircle2 size={16} color="#16A34A" />
                  <span>{studentRows.length} student records ready for validation. Click button below to proceed.</span>
                </div>
              )}
            </div>
          </div>

          {/* Template & Guidelines Card */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Standard Excel Format
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Ensure your file includes columns for Student Name, Class, Section, Gender, DOB, Height, and Weight.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  color: '#EA580C',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={14} color="#EA580C" />
                <span>Download Sample Excel Template</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '8px 12px' }}>S.No</th>
                    <th style={{ padding: '8px 12px' }}>Student Name</th>
                    <th style={{ padding: '8px 12px' }}>Class</th>
                    <th style={{ padding: '8px 12px' }}>Section</th>
                    <th style={{ padding: '8px 12px' }}>Gender</th>
                    <th style={{ padding: '8px 12px' }}>DOB (DD/MM/YYYY)</th>
                    <th style={{ padding: '8px 12px' }}>Height (cm)</th>
                    <th style={{ padding: '8px 12px' }}>Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px 12px', color: '#64748B' }}>1</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>Aarav Sharma</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>3</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>A</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>Male</td>
                    <td style={{ padding: '8px 12px', color: '#64748B' }}>15/05/2019</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>128.5</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>22.3</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', color: '#64748B' }}>2</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>Diya Patel</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>4</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>B</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>Female</td>
                    <td style={{ padding: '8px 12px', color: '#64748B' }}>20/08/2018</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>132.0</td>
                    <td style={{ padding: '8px 12px', color: '#475569' }}>25.1</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation Action Buttons with Back button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Step 1: Location</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              disabled={!selectedFile || studentRows.length === 0}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedFile && studentRows.length > 0 ? '#EB5A1D' : '#CBD5E1',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: selectedFile && studentRows.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Validate Student Records</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: VALIDATE EXCEL DATA & CONFIRM BEFORE STEP 4                       */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          {/* File Header Bar */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileSpreadsheet size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedFile?.name || 'Uploaded_Students.xlsx'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {selectedFile?.size} • Destination: {selectedSchool} ({selectedCluster})
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Replace File
            </button>
          </div>

          {/* 3 Metric Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Total Records</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>{studentRows.length}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #DCFCE7', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#16A34A', fontWeight: 700 }}>Valid Records</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16A34A' }}>{validCount}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: errorCount > 0 ? '1px solid #FECACA' : '1px solid #ECEEF2', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: errorCount > 0 ? '#FEE2E2' : '#F1F5F9', color: errorCount > 0 ? '#DC2626' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: errorCount > 0 ? '#DC2626' : '#64748B', fontWeight: 700 }}>Errors Detected</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: errorCount > 0 ? '#DC2626' : '#0F172A' }}>{errorCount}</div>
              </div>
            </div>
          </div>

          {/* WHO Calculation Workflow Notice Banner */}
          <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Layers size={18} />
            </div>
            <div style={{ fontSize: '12.5px', color: '#1E40AF', lineHeight: 1.45 }}>
              <strong>WHO Calculation Workflow:</strong> Student height and weight are captured here from the template. BMI and WHO LMS nutritional classifications (Wasted, Severely Wasted, Normal, etc.) are computed exclusively in the <strong>Mobile Application</strong>, which synchronizes results back to this portal in real time.
            </div>
          </div>

          {/* Quick-Fix & Filter Bar */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setViewErrorsOnly(false)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: !viewErrorsOnly ? 'none' : '1px solid #CBD5E1', backgroundColor: !viewErrorsOnly ? '#EA580C' : '#FFFFFF', color: !viewErrorsOnly ? '#FFFFFF' : '#475569', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                All Records ({studentRows.length})
              </button>

              <button
                type="button"
                onClick={() => setViewErrorsOnly(true)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: viewErrorsOnly ? 'none' : '1px solid #CBD5E1', backgroundColor: viewErrorsOnly ? '#DC2626' : '#FFFFFF', color: viewErrorsOnly ? '#FFFFFF' : '#DC2626', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Errors Only ({errorCount})
              </button>
            </div>

            {errorCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleFixAllErrors}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#059669', color: '#FFFFFF', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Wand2 size={13} />
                  <span>Auto-Fix All Errors</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveInvalidRows}
                  style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #FCA5A5', backgroundColor: '#FFFFFF', color: '#DC2626', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Remove Invalid Rows
                </button>
              </div>
            )}
          </div>

          {/* Validation Table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>Row</th>
                    <th style={{ padding: '10px 14px' }}>Student Name</th>
                    <th style={{ padding: '10px 14px' }}>Class</th>
                    <th style={{ padding: '10px 14px' }}>Section</th>
                    <th style={{ padding: '10px 14px' }}>Gender</th>
                    <th style={{ padding: '10px 14px' }}>DOB</th>
                    <th style={{ padding: '10px 14px' }}>Height</th>
                    <th style={{ padding: '10px 14px' }}>Weight</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px' }}>Error Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStep3Rows.length > 0 ? (
                    filteredStep3Rows.map((item) => (
                      <tr key={item.row} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: item.status === 'Invalid' ? '#FFF5F5' : '#FFFFFF' }}>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748B' }}>{item.row}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{item.name}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>Class {item.classVal}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>{item.section}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>{item.gender}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>{item.dob}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>{item.height}</td>
                        <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#334155' }}>{item.weight}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: item.status === 'Valid' ? '#DCFCE7' : '#FEE2E2', color: item.status === 'Valid' ? '#15803D' : '#DC2626' }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '12px', color: item.status === 'Invalid' ? '#DC2626' : '#64748B' }}>
                          {item.error}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No records match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation Action Buttons with Back and Continue */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Step 2: Upload</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (errorCount === 0) {
                  setShowStep3ConfirmModal(true);
                } else {
                  handleFixAllErrors();
                }
              }}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: errorCount === 0 ? '#EB5A1D' : '#D97706',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: errorCount === 0 ? '0 4px 14px rgba(235, 90, 29, 0.35)' : 'none'
              }}
            >
              <span>{errorCount === 0 ? 'Continue to Step 4: Review Import' : 'Resolve Remaining Errors'}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW ALL STUDENTS IN EXCEL FILE & CONFIRM IMPORT               */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          {/* Top 4 Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)', gap: '14px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Cluster</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{selectedCluster}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <School size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Destination School</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E3A8A' }}>{selectedSchool}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FileSpreadsheet size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Source File</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedFile?.name || 'Students.xlsx'}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #FFEDD5', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#FFF1ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Total Students Ready</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#EA580C' }}>{studentRows.length}</div>
              </div>
            </div>
          </div>

          {/* Table Container with Search */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  All Student Records from Excel File ({filteredStep4Students.length})
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Review all parsed student records before confirming import. Calculations will be processed in the user application.
                </p>
              </div>

              <div style={{ position: 'relative', width: isMobile ? '100%' : '280px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchReview}
                  onChange={(e) => setSearchReview(e.target.value)}
                  placeholder="Search students by name, class..."
                  style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '7px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Complete Data Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 12px' }}>S.No</th>
                    <th style={{ padding: '10px 12px' }}>Student Name</th>
                    <th style={{ padding: '10px 12px' }}>Class</th>
                    <th style={{ padding: '10px 12px' }}>Section</th>
                    <th style={{ padding: '10px 12px' }}>Gender</th>
                    <th style={{ padding: '10px 12px' }}>DOB</th>
                    <th style={{ padding: '10px 12px' }}>Height (cm)</th>
                    <th style={{ padding: '10px 12px' }}>Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStep4Students.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px 12px', fontSize: '12px', color: '#64748B' }}>{idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{s.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>Class {s.classVal}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>{s.section}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>{s.gender}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>{s.dob}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>{s.height || '--'}</td>
                      <td style={{ padding: '10px 12px', fontSize: '12.5px', color: '#334155' }}>{s.weight || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Navigation with Back and Confirm Import */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{ padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={15} />
              <span>Back to Step 3: Validation</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportConfirmModal(true)}
              disabled={isImporting || studentRows.length === 0}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: isImporting ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(235, 90, 29, 0.35)'
              }}
            >
              <Check size={16} strokeWidth={3} />
              <span>Confirm &amp; Import Students ({studentRows.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: IMPORT SUCCESS SCREEN                                             */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 5 && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #ECEEF2', padding: isMobile ? '24px 16px' : '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Student Data Imported Successfully!
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
            Successfully added <strong>{importSummary?.importedCount || studentRows.length} students</strong> to <strong>{importSummary?.schoolName || selectedSchool}</strong>. All WHO nutritional classifications (BMI, Z-scores, and health status) are calculated and live in the user application.
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setSelectedFile(null);
                setStudentRows([]);
              }}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={15} />
              <span>Import Another File</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab ? onNavigateTab('students') : null}
              style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(235,90,29,0.3)' }}
            >
              <Users size={15} />
              <span>View Students in App</span>
            </button>

            <button
              type="button"
              onClick={() => setImportView('history')}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Clock size={15} />
              <span>View Import History</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT HISTORY VIEW (Realtime Database vatta_sattam)                      */}
      {/* ========================================================================= */}
      {importView === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Top Filter and Controls Bar */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #ECEEF2', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={historyClusterFilter}
                onChange={(e) => setHistoryClusterFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              >
                <option value="All Clusters">All Clusters</option>
                {clustersList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>

              <select
                value={historySchoolFilter}
                onChange={(e) => setHistorySchoolFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none' }}
              >
                <option value="All Schools">All Schools</option>
                {allSchoolsList.map(s => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
              </select>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Search file, school, or ID..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{ padding: '6px 12px 6px 30px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', width: '200px' }}
                />
              </div>

              <button
                type="button"
                onClick={fetchImportHistory}
                disabled={isLoadingHistory}
                title="Refresh from Realtime Database"
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <RefreshCw size={13} className={isLoadingHistory ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setImportView('wizard'); setCurrentStep(1); }}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>New Student Import</span>
            </button>
          </div>

          {/* Import History Table */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #ECEEF2', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>Import ID</th>
                    <th style={{ padding: '10px 14px' }}>File Name</th>
                    <th style={{ padding: '10px 14px' }}>Cluster</th>
                    <th style={{ padding: '10px 14px' }}>School</th>
                    <th style={{ padding: '10px 14px' }}>Imported Records</th>
                    <th style={{ padding: '10px 14px' }}>Date &amp; Time</th>
                    <th style={{ padding: '10px 14px' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <RefreshCw size={16} className="animate-spin" color="#EA580C" />
                          <span>Loading realtime import history from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : historyList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        <FileSpreadsheet size={32} color="#CBD5E1" style={{ margin: '0 auto 8px', display: 'block' }} />
                        <strong>No student data imports found in database.</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                          Use the "New Student Import" wizard to upload an Excel file.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    historyList.map((h, i) => (
                      <React.Fragment key={h.id || i}>
                        <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: expandedBatchId === h.id ? '#FFFBF7' : 'transparent' }}>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 700, color: '#EA580C' }}>{h.id}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#0F172A', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <FileSpreadsheet size={15} color="#059669" />
                              <span>{h.fileName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{h.cluster}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>{h.school}</td>
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#059669', fontWeight: 700 }}>
                            {h.records} students
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#64748B' }}>{h.date}, {h.time}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: h.status === 'Completed' ? '#DCFCE7' : '#FEF3C7', color: h.status === 'Completed' ? '#15803D' : '#D97706' }}>
                              {h.status}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              {/* View Students button */}
                              <button
                                type="button"
                                onClick={() => handleToggleViewBatchStudents(h.id)}
                                title="View individual students from this upload"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: expandedBatchId === h.id ? '#EFF6FF' : '#FFFFFF',
                                  color: expandedBatchId === h.id ? '#2563EB' : '#334155',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <Eye size={13} color={expandedBatchId === h.id ? '#2563EB' : '#64748B'} />
                                <span>{expandedBatchId === h.id ? 'Hide' : `Students (${h.records})`}</span>
                                {expandedBatchId === h.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              </button>

                              {/* Delete Uploaded Excel Sheet button */}
                              <button
                                type="button"
                                onClick={() => setBatchToDelete(h)}
                                title="Delete Uploaded Excel Sheet & all associated students"
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #FECACA',
                                  backgroundColor: '#FEF2F2',
                                  color: '#DC2626',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                              >
                                <Trash2 size={13} color="#DC2626" />
                                <span>Delete Sheet</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable nested table of students for this batch */}
                        {expandedBatchId === h.id && (
                          <tr>
                            <td colSpan={8} style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '14px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={16} color="#EA580C" />
                                    <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                                      Imported Students in "{h.fileName}"
                                    </h4>
                                    <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' }}>
                                      {batchStudents.length} Students
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                                    Deleting a student here permanently deletes them from database and mobile application.
                                  </span>
                                </div>

                                {isLoadingBatchStudents ? (
                                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                                    Loading students from database...
                                  </div>
                                ) : batchStudents.length === 0 ? (
                                  <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
                                    No active students found in this import batch.
                                  </div>
                                ) : (
                                  <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                                      <thead>
                                        <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: '#475569', fontWeight: 700 }}>
                                          <th style={{ padding: '8px 10px', width: '35px' }}>#</th>
                                          <th style={{ padding: '8px 10px' }}>Student Name</th>
                                          <th style={{ padding: '8px 10px' }}>Class &amp; Section</th>
                                          <th style={{ padding: '8px 10px' }}>Gender</th>
                                          <th style={{ padding: '8px 10px' }}>DOB</th>
                                          <th style={{ padding: '8px 10px' }}>Height / Weight</th>
                                          <th style={{ padding: '8px 10px' }}>BMI</th>
                                          <th style={{ padding: '8px 10px' }}>Nutrition Status</th>
                                          <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {batchStudents.map((std, sIdx) => (
                                          <tr key={std.id || sIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '8px 10px', color: '#94A3B8', fontWeight: 600 }}>{sIdx + 1}</td>
                                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>
                                              {std.name}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: '#334155' }}>
                                              {std.class_name} • {std.section}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: '#475569' }}>{std.gender}</td>
                                            <td style={{ padding: '8px 10px', color: '#64748B' }}>{std.dob}</td>
                                            <td style={{ padding: '8px 10px', color: '#334155', fontWeight: 600 }}>
                                              {std.height_cm ? `${std.height_cm} cm` : '--'} / {std.weight_kg ? `${std.weight_kg} kg` : '--'}
                                            </td>
                                            <td style={{ padding: '8px 10px', color: '#059669', fontWeight: 700 }}>
                                              {std.bmi ? std.bmi.toFixed(2) : '--'}
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                              <span style={{
                                                fontSize: '10.5px',
                                                fontWeight: 700,
                                                padding: '2px 7px',
                                                borderRadius: '4px',
                                                backgroundColor: (std.nutrition_status?.toLowerCase().includes('severely') || std.nutrition_status?.toLowerCase().includes('waste'))
                                                  ? '#FEE2E2'
                                                  : (std.nutrition_status === 'Pending Calculation' ? '#FEF3C7' : '#DCFCE7'),
                                                color: (std.nutrition_status?.toLowerCase().includes('severely') || std.nutrition_status?.toLowerCase().includes('waste'))
                                                  ? '#DC2626'
                                                  : (std.nutrition_status === 'Pending Calculation' ? '#B45309' : '#15803D')
                                              }}>
                                                {std.nutrition_status}
                                              </span>
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                              {/* Delete option for individual student */}
                                              <button
                                                type="button"
                                                onClick={() => setStudentToDelete({ ...std, batchId: h.id })}
                                                title={`Delete ${std.name} from database & mobile app`}
                                                style={{
                                                  padding: '4px 8px',
                                                  borderRadius: '5px',
                                                  border: '1px solid #FECACA',
                                                  backgroundColor: '#FFFFFF',
                                                  color: '#DC2626',
                                                  fontSize: '11px',
                                                  fontWeight: 700,
                                                  cursor: 'pointer',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px',
                                                }}
                                              >
                                                <Trash2 size={12} color="#DC2626" />
                                                <span>Delete</span>
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE CLUSTER MODAL                                             */}
      {/* ========================================================================= */}
      {showCreateClusterModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => setShowCreateClusterModal(false)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '420px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #ECEEF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#EA580C" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create New Cluster</h3>
              </div>
              <button type="button" onClick={() => setShowCreateClusterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={17} /></button>
            </div>

            <form onSubmit={handleCreateCluster} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                  Cluster Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Zone / District 2"
                  value={newClusterName}
                  onChange={e => setNewClusterName(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '7px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief notes about cluster coverage"
                  value={newClusterDesc}
                  onChange={e => setNewClusterDesc(e.target.value)}
                  style={{ width: '100%', borderRadius: '7px', border: '1.5px solid #CBD5E1', padding: '8px 10px', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowCreateClusterModal(false)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isCreatingCluster} style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                  {isCreatingCluster ? 'Creating...' : 'Create Cluster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE SCHOOL MODAL                                              */}
      {/* ========================================================================= */}
      {showCreateSchoolModal && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(4px)' }} 
          onClick={() => setShowCreateSchoolModal(false)}
        >
          <div 
            style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '560px', width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #ECEEF2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF7ED' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                  <School size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create New School</h3>
                  <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0 0' }}>Register school with covered classes and sections matching mobile app</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCreateSchoolModal(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleCreateSchool} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
              {/* Cluster Dropdown */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '5px' }}>
                  Assigned Cluster <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={newSchoolCluster}
                  onChange={e => setNewSchoolCluster(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                >
                  {clustersList.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* School Name */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '5px' }}>
                  School Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Government Higher Secondary School"
                  value={newSchoolName}
                  onChange={e => setNewSchoolName(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* School Code & Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '5px' }}>School Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SCH-012"
                    value={newSchoolCode}
                    onChange={e => setNewSchoolCode(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '5px' }}>Campus Address</label>
                  <input
                    type="text"
                    placeholder="e.g. East Campus, Main Road"
                    value={newSchoolAddress}
                    onChange={e => setNewSchoolAddress(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1.5px solid #CBD5E1', padding: '0 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* SECTION 1: CLASSES COVERED SELECTOR */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#EA580C" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                      Select Classes Covered <span style={{ color: '#EF4444' }}>*</span>
                    </span>
                  </div>
                  {/* Preset Pills */}
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

                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 10px 0' }}>
                  Click to select or unselect classes offered by this school. The mobile app syncs these classes for student enrollment.
                </p>

                {/* Grid of Class Buttons (1 to 12) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                    const isSelected = newSchoolSelectedClasses.includes(num);
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleSchoolClass(num)}
                        style={{
                          height: '38px',
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
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'none'
                        }}
                      >
                        {isSelected && <Check size={12} color="#EA580C" strokeWidth={3} />}
                        <span>{num}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Classes Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11.5px' }}>
                  <span style={{ color: '#0F766E', fontWeight: 700 }}>
                    Active Range: Classes {formatClassesRange(newSchoolSelectedClasses)}
                  </span>
                  <span style={{ color: '#64748B' }}>
                    {newSchoolSelectedClasses.length} of 12 classes selected
                  </span>
                </div>
              </div>

              {/* SECTION 2: SECTIONS SELECTOR (SAME AS APPLICATION) */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} color="#EA580C" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                      Select Sections <span style={{ color: '#EF4444' }}>*</span>
                    </span>
                  </div>
                  {/* Preset Pills + Add Custom Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <button
                      type="button"
                      onClick={() => setNewSchoolSelectedSections(['A', 'B', 'C'])}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                    >
                      A–C
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSchoolSelectedSections(['A', 'B', 'C', 'D', 'E'])}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                    >
                      A–E
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSchoolSelectedSections(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])}
                      style={{ fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '5px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
                    >
                      A–H (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomSection(!showAddCustomSection)}
                      style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px', border: '1px solid #FED7AA', backgroundColor: '#FFF7ED', color: '#EA580C', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <Plus size={12} strokeWidth={3} />
                      <span>Custom</span>
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 10px 0' }}>
                  Matches mobile application sections (standard A to H plus custom sections).
                </p>

                {/* Inline Custom Section Input Box */}
                {showAddCustomSection && (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', backgroundColor: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid #FED7AA' }}>
                    <input
                      type="text"
                      placeholder="Enter section name (e.g. I, J, Rose)"
                      value={customSectionInput}
                      onChange={e => setCustomSectionInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddCustomSection(e); }}
                      style={{ flex: 1, height: '32px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0 8px', fontSize: '12px', outline: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSection}
                      style={{ height: '32px', padding: '0 12px', backgroundColor: '#EA580C', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomSection(false)}
                      style={{ height: '32px', padding: '0 8px', backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Grid of Sections (A to H + any custom added sections) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', ...newSchoolCustomSections].map(sec => {
                    const isSelected = newSchoolSelectedSections.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => toggleSchoolSection(sec)}
                        style={{
                          height: '40px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #EA580C' : '1px solid #E2E8F0',
                          backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                          color: isSelected ? '#0F172A' : '#64748B',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: sec.length > 2 ? '12px' : '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 1px 3px rgba(234, 88, 12, 0.15)' : 'none',
                          padding: '0 4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isSelected && <Check size={12} color="#EA580C" strokeWidth={3} />}
                        <span>Sec {sec}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Sections Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11.5px' }}>
                  <span style={{ color: '#0F766E', fontWeight: 700 }}>
                    Active Sections: {newSchoolSelectedSections.join(', ')}
                  </span>
                  <span style={{ color: '#64748B' }}>
                    {newSchoolSelectedSections.length} sections active
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Config: Classes {formatClassesRange(newSchoolSelectedClasses)} • {newSchoolSelectedSections.length} Sections
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateSchoolModal(false)} 
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCreatingSchool} 
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(235,90,29,0.3)' }}
                  >
                    {isCreatingSchool ? (
                      <>
                        <RefreshCw size={13} className="spin-animate" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} strokeWidth={3} />
                        <span>Create School</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: STEP 1 -> STEP 2                                      */}
      {/* ========================================================================= */}
      {showStep1ConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => setShowStep1ConfirmModal(false)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #FFEDD5', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="#EA580C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Confirm Location Selection</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                You are about to start a student import for the following destination:
              </p>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• <strong>Cluster:</strong> {selectedCluster}</div>
                <div>• <strong>School:</strong> {selectedSchool}</div>
                <div>• <strong>Academic Session:</strong> {academicYear}</div>
                <div>• <strong>Current Students:</strong> {existingStudentsCount} registered</div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Proceed to Step 2 to upload your student data spreadsheet?
              </p>
            </div>
            <div style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #ECEEF2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowStep1ConfirmModal(false)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                Keep Editing
              </button>
              <button type="button" onClick={() => { setShowStep1ConfirmModal(false); setCurrentStep(2); }} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                Confirm &amp; Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: STEP 3 -> STEP 4                                      */}
      {/* ========================================================================= */}
      {showStep3ConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => setShowStep3ConfirmModal(false)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #DCFCE7', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="#16A34A" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Confirm Validated Student Records</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                All <strong>{studentRows.length} student records</strong> in <strong>{selectedFile?.name}</strong> have been validated without errors!
              </p>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>• <strong>Valid Students:</strong> {validCount} ready</div>
                <div>• <strong>Destination:</strong> {selectedSchool}</div>
                <div>• <strong>Status:</strong> Ready for import review</div>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Proceed to Step 4 for final review before import?
              </p>
            </div>
            <div style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #ECEEF2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowStep3ConfirmModal(false)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                Keep Editing
              </button>
              <button type="button" onClick={() => { setShowStep3ConfirmModal(false); setCurrentStep(4); }} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                Confirm &amp; Proceed to Step 4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: STEP 4 -> FINAL IMPORT                                */}
      {/* ========================================================================= */}
      {showImportConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => setShowImportConfirmModal(false)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '460px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #FFEDD5', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} color="#EA580C" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Confirm Student Data Import</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                You are about to import <strong>{studentRows.length} student records</strong> into <strong>{selectedSchool}</strong> ({selectedCluster}).
              </p>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>• Students will be saved to the database.</div>
                <div>• Records will immediately reflect in the mobile app and admin dashboards.</div>
                <div>• BMI and WHO calculations will be performed in the application, and students will be automatically categorized for tracking.</div>
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                Are you sure you want to execute this import now?
              </p>
            </div>
            <div style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #ECEEF2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowImportConfirmModal(false)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={handleExecuteImport} style={{ padding: '8px 22px', borderRadius: '7px', border: 'none', backgroundColor: '#EB5A1D', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(235,90,29,0.3)' }}>
                Confirm &amp; Import Students
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: DELETE UPLOADED EXCEL SHEET                            */}
      {/* ========================================================================= */}
      {batchToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => !isDeleting && setBatchToDelete(null)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '460px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={20} color="#DC2626" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B', margin: 0 }}>Delete Uploaded Excel Sheet</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete uploaded sheet <strong>"{batchToDelete.fileName}"</strong>?
              </p>
              <div style={{ backgroundColor: '#FFF1F2', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#991B1B', border: '1px solid #FECDD3', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>• This will permanently delete <strong>{batchToDelete.records} students</strong> from PostgreSQL database.</div>
                <div>• All associated health assessments and tracking history will be removed.</div>
                <div>• Deleted students will immediately disappear from the <strong>mobile application</strong>.</div>
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', margin: 0 }}>
                This action cannot be undone.
              </p>
            </div>
            <div style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #ECEEF2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" disabled={isDeleting} onClick={() => setBatchToDelete(null)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" disabled={isDeleting} onClick={handleConfirmDeleteBatch} style={{ padding: '8px 22px', borderRadius: '7px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(220,38,38,0.3)' }}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete Uploaded Sheet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION MODAL: DELETE INDIVIDUAL STUDENT                              */}
      {/* ========================================================================= */}
      {studentToDelete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(3px)' }} onClick={() => !isDeleting && setStudentToDelete(null)}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={20} color="#DC2626" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#991B1B', margin: 0 }}>Delete Student</h3>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13.5px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Are you sure you want to delete student <strong>"{studentToDelete.name}"</strong>?
              </p>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>• Class: {studentToDelete.class_name} • {studentToDelete.section}</div>
                <div>• Deleting this student will remove them from the database and <strong>mobile application</strong> in real time.</div>
              </div>
            </div>
            <div style={{ padding: '14px 20px', backgroundColor: '#F8FAFC', borderTop: '1px solid #ECEEF2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" disabled={isDeleting} onClick={() => setStudentToDelete(null)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" disabled={isDeleting} onClick={handleConfirmDeleteStudent} style={{ padding: '8px 20px', borderRadius: '7px', border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(220,38,38,0.3)' }}>
                {isDeleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
