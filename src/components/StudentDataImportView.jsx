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
  Trash2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Eye,
  Filter,
  FastForward,
  Info,
  FileText
} from 'lucide-react';

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

export default function StudentDataImportView({ onNavigateTab }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const isStacked = windowWidth < 1080;

  // View state: 'wizard' | 'history' | 'details'
  const [importView, setImportView] = useState('wizard');

  // Multi-step State (Default to Step 4: Review Student Import as requested)
  const [currentStep, setCurrentStep] = useState(4);

  // Step 1: Location selection
  const [selectedCluster, setSelectedCluster] = useState('Cluster A');
  const [selectedSchool, setSelectedSchool] = useState('Greenwood Public School');

  // Existing student counts mapping dynamically by school
  const schoolStudentCounts = {
    'Greenwood Public School': 126,
    'Sunrise International School': 368,
    'Riverdale Higher Secondary': 312,
    'Maple Leaf Public School': 286,
    'St. Mary\'s Matriculation School': 248,
  };

  const existingStudentsCount = schoolStudentCounts[selectedSchool] || 126;

  // Step 2: File Upload state (Preloaded with sample from screenshot)
  const [selectedFile, setSelectedFile] = useState({
    name: 'Greenwood_Students_2026.xlsx',
    size: '248 KB',
    uploadedTime: '29 Sep 2026, 10:24 AM'
  });
  const [dragActive, setDragActive] = useState(false);

  // Step 3: Student Data Preview state
  const [viewErrorsOnly, setViewErrorsOnly] = useState(false);
  const [searchPreview, setSearchPreview] = useState('');
  const [previewRowsPerPage, setPreviewRowsPerPage] = useState(10);
  const [previewPage, setPreviewPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  // Student records for Step 3 (matching mockup exact 10 preview rows)
  const [studentRows, setStudentRows] = useState([
    { row: 1, name: 'Aarav Sharma', classVal: '3', section: 'A', dob: '15/05/2019', height: '128.5', weight: '22.3', status: 'Valid', error: '-' },
    { row: 2, name: 'Diya Patel', classVal: '4', section: 'B', dob: '20/08/2018', height: '132', weight: '25.1', status: 'Valid', error: '-' },
    { row: 23, name: 'Kavya Nair', classVal: '3', section: 'A', dob: '-', height: '126', weight: '21.4', status: 'Invalid', error: 'Missing DOB' },
    { row: 24, name: 'Arjun Mehta', classVal: '5', section: 'C', dob: '12/11/2017', height: '140.2', weight: '28.6', status: 'Valid', error: '-' },
    { row: 45, name: 'Rohan Kumar', classVal: '-', section: 'B', dob: '10/02/2019', height: '135', weight: '24.8', status: 'Invalid', error: 'Invalid Class' },
    { row: 67, name: 'Sneha Iyer', classVal: '4', section: 'A', dob: '18/07/2018', height: '130', weight: '23.1', status: 'Valid', error: '-' },
    { row: 78, name: 'Vikram Singh', classVal: '2', section: 'C', dob: '25/03/2020', height: '-', weight: '20.5', status: 'Invalid', error: 'Missing Height' },
    { row: 91, name: 'Ananya Das', classVal: '3', section: 'B', dob: '19/09/2019', height: '132', weight: '-', status: 'Invalid', error: 'Missing Weight' },
    { row: 122, name: 'Ishaan Gupta', classVal: '5', section: 'A', dob: '05/06/2018', height: '138', weight: '26.7', status: 'Valid', error: '-' },
    { row: 126, name: 'Meera Joshi', classVal: '4', section: 'C', dob: '28/01/2020', height: '129', weight: '22.9', status: 'Valid', error: '-' },
  ]);

  const [importSuccess, setImportSuccess] = useState(false);

  // Dynamic computation of valid vs error count
  const errorCount = studentRows.filter(r => r.status === 'Invalid').length;
  const validCount = 126 - errorCount;
  const totalRowsCount = 126;

  // Filter & sort preview data
  const filteredRows = studentRows.filter(item => {
    if (viewErrorsOnly && item.status !== 'Invalid') return false;
    if (!searchPreview) return true;
    const query = searchPreview.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      String(item.classVal).toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.error.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (!sortField) return 0;
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  const handleSortPreview = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleFixAllErrors = () => {
    setStudentRows(prev => prev.map(r => {
      if (r.status === 'Invalid') {
        let fixedDob = r.dob === '-' ? '14/04/2019' : r.dob;
        let fixedClass = r.classVal === '-' ? '3' : r.classVal;
        let fixedHeight = r.height === '-' ? '131.0' : r.height;
        let fixedWeight = r.weight === '-' ? '24.0' : r.weight;
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
  };

  // File drop handler
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const formattedSize = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      : Math.round(file.size / 1024) + ' KB';

    setSelectedFile({
      name: file.name,
      size: formattedSize,
      uploadedTime: '29 Sep 2026, 10:24 AM'
    });
  };

  // Step Navigators
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setImportSuccess(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResetImport = () => {
    setCurrentStep(1);
    setImportSuccess(false);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const csvContent = 'data:text/csv;charset=utf-8,S.No,Student Name,Class,Section,DOB,Height,Weight\n' +
      '1,Aarav Sharma,3,A,15/05/2019,128.5,22.3\n' +
      '2,Diya Patel,4,B,20/08/2018,132,25.1\n' +
      '3,Rohan Kumar,2,C,10/02/2020,121,19.8\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Step 4 Review Search
  const [searchReview, setSearchReview] = useState('');

  // Step 4 Data matching Image 1 exactly (10 student rows)
  const reviewStudents = [
    { sno: 1, name: 'Aarav Sharma', classVal: '3', section: 'A', dob: '15/05/2019', height: '128.5', weight: '22.3' },
    { sno: 2, name: 'Diya Patel', classVal: '4', section: 'B', dob: '20/08/2018', height: '132', weight: '25.1' },
    { sno: 3, name: 'Rohan Kumar', classVal: '2', section: 'C', dob: '10/02/2020', height: '121', weight: '19.8' },
    { sno: 4, name: 'Sneha Iyer', classVal: '5', section: 'A', dob: '12/11/2017', height: '140.2', weight: '28.6' },
    { sno: 5, name: 'Arjun Mehta', classVal: '3', section: 'B', dob: '19/07/2018', height: '130', weight: '23.4' },
    { sno: 6, name: 'Kavya Nair', classVal: '4', section: 'C', dob: '25/03/2019', height: '135', weight: '24.9' },
    { sno: 7, name: 'Ishaan Gupta', classVal: '2', section: 'A', dob: '05/06/2018', height: '126', weight: '21.7' },
    { sno: 8, name: 'Meera Joshi', classVal: '5', section: 'B', dob: '28/01/2020', height: '138', weight: '26.1' },
    { sno: 9, name: 'Vikram Singh', classVal: '3', section: 'C', dob: '14/09/2019', height: '132', weight: '23.5' },
    { sno: 10, name: 'Ananya Das', classVal: '4', section: 'A', dob: '18/12/2018', height: '129', weight: '22.8' },
  ];

  const filteredReviewStudents = reviewStudents.filter(s => {
    if (!searchReview) return true;
    const q = searchReview.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.classVal.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    );
  });

  // History state matching Image 3 exactly
  const initialImportHistory = [
    { id: 'IMP-001', fileName: 'Greenwood_Students.xlsx', cluster: 'Cluster A', school: 'Greenwood Public School', records: 122, total: 126, failed: 4, uploadedBy: 'Admin', date: '30 Sep 2026', time: '10:24 AM', status: 'Completed', fileSize: '248 KB' },
    { id: 'IMP-002', fileName: 'Oakridge_Students.xlsx', cluster: 'Cluster B', school: 'Oakridge Academy', records: 98, total: 100, failed: 2, uploadedBy: 'Admin', date: '28 Sep 2026', time: '11:15 AM', status: 'Completed', fileSize: '210 KB' },
    { id: 'IMP-003', fileName: 'Riverside_Students.xlsx', cluster: 'Cluster A', school: 'Riverside International', records: 45, total: 52, failed: 7, uploadedBy: 'Priya', date: '25 Sep 2026', time: '02:30 PM', status: 'Partial', fileSize: '180 KB' },
    { id: 'IMP-004', fileName: 'Sunrise_Students.xlsx', cluster: 'Cluster C', school: 'Sunrise Public School', records: 0, total: 60, failed: 60, uploadedBy: 'Admin', date: '22 Sep 2026', time: '09:45 AM', status: 'Failed', fileSize: '195 KB' },
    { id: 'IMP-005', fileName: 'Maplewood_Students.xlsx', cluster: 'Cluster B', school: 'Maplewood High School', records: 156, total: 156, failed: 0, uploadedBy: 'Admin', date: '20 Sep 2026', time: '04:12 PM', status: 'Completed', fileSize: '320 KB' },
    { id: 'IMP-006', fileName: 'Hillview_Students.xlsx', cluster: 'Cluster C', school: 'Hillview School', records: 63, total: 75, failed: 12, uploadedBy: 'Karthik', date: '18 Sep 2026', time: '11:00 AM', status: 'Partial', fileSize: '175 KB' },
    { id: 'IMP-007', fileName: 'Lakeside_Students.xlsx', cluster: 'Cluster A', school: 'Lakeside Public School', records: 89, total: 90, failed: 1, uploadedBy: 'Admin', date: '15 Sep 2026', time: '01:20 PM', status: 'Completed', fileSize: '230 KB' },
    { id: 'IMP-008', fileName: 'Cedar_Students.xlsx', cluster: 'Cluster D', school: 'Cedar High School', records: 0, total: 40, failed: 40, uploadedBy: 'Meena', date: '12 Sep 2026', time: '10:05 AM', status: 'Failed', fileSize: '145 KB' },
    { id: 'IMP-009', fileName: 'Pinehill_Students.xlsx', cluster: 'Cluster B', school: 'Pinehill Academy', records: 110, total: 110, failed: 0, uploadedBy: 'Admin', date: '10 Sep 2026', time: '03:40 PM', status: 'Completed', fileSize: '265 KB' },
    { id: 'IMP-010', fileName: 'Valleyview_Students.xlsx', cluster: 'Cluster D', school: 'Valleyview School', records: 34, total: 42, failed: 8, uploadedBy: 'Priya', date: '08 Sep 2026', time: '09:15 AM', status: 'Partial', fileSize: '160 KB' },
  ];

  const [historyList, setHistoryList] = useState(initialImportHistory);
  const [historyClusterFilter, setHistoryClusterFilter] = useState('All Clusters');
  const [historySchoolFilter, setHistorySchoolFilter] = useState('All Schools');
  const [historyDateFilter, setHistoryDateFilter] = useState('Select Date Range');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All Status');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(initialImportHistory[0]);

  // Error records state matching Image 4 exactly
  const [detailErrorSearch, setDetailErrorSearch] = useState('');
  const errorRecords = [
    { row: 23, name: 'Aarav', classVal: '3', section: 'A', dob: '-', height: '128.5', weight: '22.3', issue: 'Missing DOB' },
    { row: 45, name: 'Kiran', classVal: '-', section: 'B', dob: '10/02/2019', height: '135', weight: '24.8', issue: 'Invalid Class' },
    { row: 78, name: 'Sneha', classVal: '4', section: 'C', dob: '18/07/2018', height: '-', weight: '23.1', issue: 'Missing Height' },
    { row: 91, name: 'Vikram', classVal: '3', section: 'B', dob: '19/09/2019', height: '132', weight: '-', issue: 'Missing Weight' },
  ];

  const filteredErrorRecords = errorRecords.filter(item => {
    if (!detailErrorSearch) return true;
    const q = detailErrorSearch.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.issue.toLowerCase().includes(q);
  });

  const filteredHistory = historyList.filter(item => {
    if (historyClusterFilter !== 'All Clusters' && item.cluster !== historyClusterFilter) return false;
    if (historySchoolFilter !== 'All Schools' && item.school !== historySchoolFilter) return false;
    if (historyStatusFilter !== 'All Status' && item.status !== historyStatusFilter) return false;
    if (historySearch && !item.fileName.toLowerCase().includes(historySearch.toLowerCase())) return false;
    return true;
  });

  const handleClearHistoryFilters = () => {
    setHistoryClusterFilter('All Clusters');
    setHistorySchoolFilter('All Schools');
    setHistoryDateFilter('Select Date Range');
    setHistoryStatusFilter('All Status');
    setHistorySearch('');
  };

  const handleDownloadErrorReport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Row,Student,Class,Section,DOB,Height,Weight,Issue\n' +
      errorRecords.map(r => `${r.row},${r.name},${r.classVal},${r.section},${r.dob},${r.height},${r.weight},${r.issue}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `error_report_${selectedRecord?.id || 'IMP-001'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRecordReport = (item) => {
    const csvContent = 'data:text/csv;charset=utf-8,Import ID,File Name,Cluster,School,Records,Uploaded By,Date,Status\n' +
      `${item.id},${item.fileName},${item.cluster},${item.school},${item.records},${item.uploadedBy},${item.date},${item.status}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${item.id}_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* ================= BREADCRUMB ================= */}
      {importView === 'history' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '1px' }}>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', transition: 'color 0.15s ease' }}
            onClick={() => { setImportView('wizard'); setCurrentStep(4); }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Student Data Import
          </span>
          <span>&gt;</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Import History</span>
        </div>
      )}

      {importView === 'details' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '1px' }}>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', transition: 'color 0.15s ease' }}
            onClick={() => { setImportView('wizard'); setCurrentStep(4); }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Student Data Import
          </span>
          <span>&gt;</span>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', transition: 'color 0.15s ease' }}
            onClick={() => setImportView('history')}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Import History
          </span>
          <span>&gt;</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>Import Details</span>
        </div>
      )}

      {importView === 'wizard' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '1px' }}>
          <span 
            style={{ cursor: 'pointer', color: '#64748B', transition: 'color 0.15s ease' }}
            onClick={() => setCurrentStep(1)}
            onMouseEnter={(e) => e.currentTarget.style.color = '#EA580C'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
          >
            Student Data Import
          </span>
          {currentStep > 1 && (
            <>
              <span>&gt;</span>
              <span style={{ color: '#0F172A', fontWeight: 600 }}>
                {currentStep === 2 && 'Upload Student Excel'}
                {currentStep === 3 && 'Validate Student Data'}
                {currentStep === 4 && 'Review Student Import'}
                {currentStep === 5 && 'Import Success'}
              </span>
              {currentStep === 4 && <span>&gt;</span>}
            </>
          )}
        </div>
      )}

      {/* ================= PAGE TITLE & SUBTITLE ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 
            style={{ 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#0F172A', 
              letterSpacing: '-0.02em', 
              margin: 0,
              lineHeight: 1.15 
            }}
          >
            {importView === 'history' && 'Import History'}
            {importView === 'details' && 'Import Details'}
            {importView === 'wizard' && (
              <>
                {currentStep === 1 && 'Student Data Import'}
                {currentStep === 2 && 'Upload Student Excel'}
                {currentStep === 3 && 'Validate Student Data'}
                {currentStep === 4 && 'Review Student Import'}
                {currentStep === 5 && 'Import Success'}
              </>
            )}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            {importView === 'history' && 'Track all student data imports'}
            {importView === 'details' && 'View import summary, timeline and error details.'}
            {importView === 'wizard' && (
              <>
                {currentStep === 1 && 'Upload student records and make them available in the mobile application'}
                {currentStep === 2 && 'Upload student records and make them available in the mobile application'}
                {currentStep === 3 && 'Review the uploaded data and fix the errors before importing.'}
                {currentStep === 4 && 'Verify the student details before importing to the selected school.'}
                {currentStep === 5 && 'The student data has been successfully imported into the system.'}
              </>
            )}
          </p>
        </div>

        {/* Top-right badge on Import Details screen */}
        {importView === 'details' && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              backgroundColor: '#ECFDF5', 
              border: '1px solid #D1FAE5', 
              borderRadius: '10px', 
              padding: '8px 16px' 
            }}
          >
            <FileSpreadsheet size={22} color="#059669" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                {selectedRecord?.id || 'IMP-001'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Import ID</div>
            </div>
          </div>
        )}
      </div>

      {/* ================= STEPPER PROGRESS BAR (4 STEPS) ================= */}
      {importView === 'wizard' && currentStep <= 4 && (
        <div 
          style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '16px',
          padding: '4px 0 8px 0',
          width: '100%',
          overflowX: 'auto',
          boxSizing: 'border-box'
        }}
      >
        {/* Step 01: Select Location */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setCurrentStep(1)}
        >
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 1 ? '#EB5A1D' : '#FFEDD5',
              color: currentStep === 1 ? '#FFFFFF' : '#EA580C',
              fontWeight: 800,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            01
          </div>
          <span 
            style={{ 
              fontSize: '13px', 
              fontWeight: currentStep === 1 ? 700 : 500, 
              color: currentStep === 1 ? '#EA580C' : '#475569',
              whiteSpace: 'nowrap'
            }}
          >
            Select Location
          </span>

          {currentStep >= 2 && (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Check size={11} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Connecting line 1 -> 2 */}
        <div 
          style={{ 
            width: isMobile ? '24px' : '48px', 
            height: '2px', 
            backgroundColor: currentStep >= 2 ? '#EA580C' : '#E2E8F0', 
            flexShrink: 0 
          }} 
        />

        {/* Step 02: Upload Excel */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setCurrentStep(2)}
        >
          <div 
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 2 ? '#EB5A1D' : currentStep > 2 ? '#FFEDD5' : '#F1F5F9',
              color: currentStep === 2 ? '#FFFFFF' : currentStep > 2 ? '#EA580C' : '#64748B',
              border: currentStep >= 2 ? 'none' : '1.5px solid #CBD5E1',
              fontWeight: 800,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: currentStep === 2 ? '0 2px 8px rgba(235, 90, 29, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            02
          </div>
          <span 
            style={{ 
              fontSize: '13px', 
              fontWeight: currentStep === 2 ? 700 : 500, 
              color: currentStep === 2 ? '#EA580C' : '#475569',
              whiteSpace: 'nowrap'
            }}
          >
            Upload Excel
          </span>

          {currentStep > 2 && (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Check size={11} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Connecting line 2 -> 3 */}
        <div 
          style={{ 
            width: isMobile ? '24px' : '48px', 
            height: '2px', 
            backgroundColor: currentStep >= 3 ? '#EA580C' : '#E2E8F0', 
            flexShrink: 0 
          }} 
        />

        {/* Step 03: Validate Data */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setCurrentStep(3)}
        >
          <div 
            style={{
              width: currentStep === 3 ? '32px' : '28px',
              height: currentStep === 3 ? '32px' : '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 3 ? '#EB5A1D' : currentStep > 3 ? '#FFEDD5' : '#F1F5F9',
              color: currentStep === 3 ? '#FFFFFF' : currentStep > 3 ? '#EA580C' : '#64748B',
              border: currentStep >= 3 ? 'none' : '1.5px solid #CBD5E1',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: currentStep === 3 ? '0 2px 8px rgba(235, 90, 29, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            03
          </div>
          <span 
            style={{ 
              fontSize: '13px', 
              fontWeight: currentStep === 3 ? 700 : 500, 
              color: currentStep === 3 ? '#EA580C' : '#475569',
              whiteSpace: 'nowrap'
            }}
          >
            Validate Data
          </span>

          {currentStep > 3 && (
            <div 
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#EA580C',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Check size={11} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* Connecting line 3 -> 4 */}
        <div 
          style={{ 
            width: isMobile ? '24px' : '48px', 
            height: '2px', 
            backgroundColor: currentStep > 3 ? '#EA580C' : '#E2E8F0', 
            flexShrink: 0 
          }} 
        />

        {/* Step 04: Confirm Import */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setCurrentStep(4)}
        >
          <div 
            style={{
              width: currentStep === 4 ? '32px' : '28px',
              height: currentStep === 4 ? '32px' : '28px',
              borderRadius: '50%',
              backgroundColor: currentStep === 4 ? '#EB5A1D' : '#F1F5F9',
              color: currentStep === 4 ? '#FFFFFF' : '#64748B',
              border: currentStep === 4 ? 'none' : '1.5px solid #CBD5E1',
              fontWeight: 700,
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: currentStep === 4 ? '0 2px 8px rgba(235, 90, 29, 0.35)' : 'none',
              flexShrink: 0
            }}
          >
            04
          </div>
          <span 
            style={{ 
              fontSize: '13px', 
              fontWeight: currentStep === 4 ? 700 : 500, 
              color: currentStep === 4 ? '#EA580C' : '#64748B',
              whiteSpace: 'nowrap'
            }}
          >
            Confirm Import
          </span>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: UPLOAD STUDENT EXCEL (MATCHES ATTACHED SCREENSHOT EXACTLY)        */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* ROW 1: Upload Drag & Drop Card (Left) + Selected File Card (Right) */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)',
              gap: '16px',
              alignItems: 'stretch'
            }}
          >
            {/* Card 1: Upload Student Data Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            >
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: dragActive ? '1.5px dashed #EA580C' : '1.5px dashed #FDBA74',
                  borderRadius: '12px',
                  backgroundColor: dragActive ? '#FFF7ED' : '#FFFDFB',
                  padding: '28px 20px 20px 20px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                {/* Excel Logo Badge */}
                <div 
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#FFEDD5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.15)'
                  }}
                >
                  <div 
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#EA580C',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    X
                  </div>
                </div>

                {/* Heading */}
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '12px 0 3px 0' }}>
                  Upload Student Data
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 4px 0' }}>
                  Drag &amp; Drop Excel file here
                </p>
                <span style={{ fontSize: '12px', color: '#94A3B8', margin: '2px 0 10px 0' }}>or</span>

                {/* Browse Excel Button */}
                <button
                  type="button"
                  onClick={() => document.getElementById('browse-excel-input').click()}
                  style={{
                    backgroundColor: '#EB5A1D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 3px 10px rgba(235, 90, 29, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
                >
                  <FolderOpen size={16} />
                  <span>Browse Excel File</span>
                </button>
                <input 
                  id="browse-excel-input" 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />

                {/* File Specifications Line */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '14px',
                    marginTop: '22px',
                    fontSize: '12px',
                    color: '#64748B',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#64748B" />
                    <span>Accepted format: <strong style={{ color: '#0F172A' }}>.xlsx</strong></span>
                  </div>
                  <span style={{ color: '#CBD5E1' }}>|</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Database size={14} color="#64748B" />
                    <span>Maximum file size: <strong style={{ color: '#0F172A' }}>10 MB</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Selected File Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
              }}
            >
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px 0' }}>
                  Selected File
                </h3>

                {selectedFile ? (
                  <div 
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div 
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          backgroundColor: '#E0F2FE',
                          color: '#0284C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileSpreadsheet size={22} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                          File Name
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {selectedFile.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>
                          File Size
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                          {selectedFile.size}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748B',
                        padding: '4px',
                        alignSelf: 'flex-start'
                      }}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    style={{
                      border: '1px dashed #CBD5E1',
                      borderRadius: '10px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      color: '#94A3B8',
                      fontSize: '12.5px'
                    }}
                  >
                    No file selected. Please browse or drag and drop an Excel file.
                  </div>
                )}
              </div>

              {/* Validate Excel Button */}
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                disabled={!selectedFile}
                style={{
                  backgroundColor: selectedFile ? '#EB5A1D' : '#FDBA74',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: selectedFile ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: selectedFile ? '0 4px 14px rgba(235, 90, 29, 0.35)' : 'none',
                  marginTop: '16px',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { if (selectedFile) e.currentTarget.style.backgroundColor = '#D94D12'; }}
                onMouseLeave={(e) => { if (selectedFile) e.currentTarget.style.backgroundColor = '#EB5A1D'; }}
              >
                <span>Validate Excel</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ROW 2: Required Excel Format (Left) + Important Info Card (Right) */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.8fr) minmax(0, 1fr)',
              gap: '16px',
              alignItems: 'stretch'
            }}
          >
            {/* Card 3: Required Excel Format */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div 
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFEDD5',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Table size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Required Excel Format
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Your Excel file must contain the following columns in the same order.
                  </p>
                </div>
              </div>

              {/* Sample Table matching mockup */}
              <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '8px 12px' }}>S.No</th>
                      <th style={{ padding: '8px 12px' }}>Student Name</th>
                      <th style={{ padding: '8px 12px' }}>Class</th>
                      <th style={{ padding: '8px 12px' }}>Section</th>
                      <th style={{ padding: '8px 12px' }}>DOB</th>
                      <th style={{ padding: '8px 12px' }}>Height</th>
                      <th style={{ padding: '8px 12px' }}>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>1</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>Aarav Sharma</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>3</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>A</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>15/05/2019</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>128.5</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>22.3</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>2</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>Diya Patel</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>4</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>B</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>20/08/2018</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>132</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>25.1</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>3</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>Rohan Kumar</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>2</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>C</td>
                      <td style={{ padding: '8px 12px', color: '#64748B' }}>10/02/2020</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>121</td>
                      <td style={{ padding: '8px 12px', color: '#475569' }}>19.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download Excel Template Button */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '8px',
                  color: '#EA580C',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFEDD5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF7ED'}
              >
                <Download size={15} color="#EA580C" />
                <span>Download Excel Template</span>
              </button>
            </div>

            {/* Card 4: Important Checklist Card */}
            <div 
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '14px',
                padding: '20px',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}
                >
                  i
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                  Important
                </h3>
              </div>

              <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.35 }}>
                The Excel sheet must contain exactly these required fields:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { num: 1, label: 'S.No' },
                  { num: 2, label: 'Student Name' },
                  { num: 3, label: 'Class' },
                  { num: 4, label: 'Section' },
                  { num: 5, label: 'DOB' },
                  { num: 6, label: 'Height' },
                  { num: 7, label: 'Weight' },
                ].map((item) => (
                  <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#EA580C',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {item.num}
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: SELECT LOCATION (PREVIOUS STEP)                                   */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #ECEEF2',
            padding: isMobile ? '20px 16px' : '28px 32px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header with Pin Icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <MapPin size={22} />
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                  Step 1 of 4
                </div>
                <h2 
                  style={{ 
                    fontSize: '20px', 
                    fontWeight: 800, 
                    color: '#0F172A', 
                    margin: '3px 0 2px 0', 
                    letterSpacing: '-0.01em' 
                  }}
                >
                  Select Location
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Choose the cluster and school where the student data will be imported.
                </p>
              </div>
            </div>

            {/* 2-Column Row: Left (Dropdown Selectors), Right (Selected Destination Box) */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: isStacked ? '1fr' : 'minmax(0, 1.4fr) minmax(0, 1fr)',
                gap: '24px',
                alignItems: 'start'
              }}
            >
              {/* Left Column: Cluster & School Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Select Cluster Field */}
                <div>
                  <label 
                    style={{ 
                      fontSize: '12.5px', 
                      fontWeight: 700, 
                      color: '#1E293B', 
                      display: 'block', 
                      marginBottom: '6px' 
                    }}
                  >
                    Select Cluster <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  
                  <div 
                    style={{
                      height: '44px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '9px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <Network size={18} color="#64748B" />
                      <select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#0F172A',
                          width: '100%',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="Cluster A">Cluster A</option>
                        <option value="North Cluster">North Cluster</option>
                        <option value="East Cluster">East Cluster</option>
                        <option value="West Cluster">West Cluster</option>
                        <option value="Central Cluster">Central Cluster</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Select School Field */}
                <div>
                  <label 
                    style={{ 
                      fontSize: '12.5px', 
                      fontWeight: 700, 
                      color: '#1E293B', 
                      display: 'block', 
                      marginBottom: '6px' 
                    }}
                  >
                    Select School <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  
                  <div 
                    style={{
                      height: '44px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '9px',
                      padding: '0 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <School size={18} color="#64748B" />
                      <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#0F172A',
                          width: '100%',
                          cursor: 'pointer',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="Greenwood Public School">Greenwood Public School</option>
                        <option value="Sunrise International School">Sunrise International School</option>
                        <option value="Riverdale Higher Secondary">Riverdale Higher Secondary</option>
                        <option value="Maple Leaf Public School">Maple Leaf Public School</option>
                        <option value="St. Mary's Matriculation School">St. Mary's Matriculation School</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected Destination Card */}
              <div 
                style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  borderRadius: '14px',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  Selected Destination
                </div>

                {/* Cluster & School Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#FFEDD5',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <School size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      {selectedCluster}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '3px', fontWeight: 500 }}>
                      {selectedSchool}
                    </div>
                  </div>
                </div>

                {/* Existing Students Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '8px' }}>
                  <Users size={22} color="#475569" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                      {existingStudentsCount}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      existing students
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blue Info Callout Banner */}
            <div 
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div 
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: '#3B82F6',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                i
              </div>
              <span style={{ fontSize: '13px', color: '#1E3A8A', fontWeight: 500 }}>
                Students uploaded here will become available for further assessment in the mobile application.
              </span>
            </div>

            {/* Bottom Continue Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  backgroundColor: '#EB5A1D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '11px 26px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(235, 90, 29, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: VALIDATE STUDENT DATA (MATCHES ATTACHED SCREENSHOT EXACTLY)        */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          
          {/* Card 1: Uploaded Excel File Header Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECEEF2',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              boxSizing: 'border-box',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Green Excel Document Badge */}
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                  }}
                >
                  X
                </div>
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {selectedFile ? selectedFile.name : 'Greenwood_Students_2026.xlsx'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', fontWeight: 500 }}>
                  Uploaded on 29 Sep 2026, 10:24 AM &nbsp;|&nbsp; {selectedFile ? selectedFile.size : '248 KB'}
                </div>
              </div>
            </div>

            {/* Replace File Button */}
            <div>
              <input 
                id="replace-excel-input" 
                type="file" 
                accept=".xlsx,.xls" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button
                type="button"
                onClick={() => document.getElementById('replace-excel-input').click()}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#94A3B8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
              >
                <Upload size={15} color="#0F172A" />
                <span>Replace File</span>
              </button>
            </div>
          </div>

          {/* Card 2: Three Summary Metric KPI Cards */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, minmax(0, 1fr))',
              gap: '16px'
            }}
          >
            {/* Total Rows Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxSizing: 'border-box'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={22} color="#0284C7" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Total Rows
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  126
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  Total student records in Excel file
                </div>
              </div>
            </div>

            {/* Valid Rows Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxSizing: 'border-box'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Check size={14} strokeWidth={3.5} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Valid Rows
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {validCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  Rows with no errors
                </div>
              </div>
            </div>

            {/* Rows With Errors Card */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #ECEEF2',
                borderRadius: '14px',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxSizing: 'border-box'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <div 
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  !
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  Rows With Errors
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {errorCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                  Rows that need to be fixed
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Student Data Preview Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #ECEEF2',
              borderRadius: '14px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box'
            }}
          >
            {/* Header: Title + Subtitle + (Toggle & Search) */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Student Data Preview
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Review the data and resolve the errors before proceeding.
                </p>
              </div>

              {/* View Errors Only Toggle & Search Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                
                {/* View Errors Only Toggle Switch */}
                <div 
                  onClick={() => setViewErrorsOnly(!viewErrorsOnly)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div 
                    style={{
                      width: '38px',
                      height: '20px',
                      borderRadius: '999px',
                      backgroundColor: viewErrorsOnly ? '#EA580C' : '#CBD5E1',
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <div 
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: '#FFFFFF',
                        position: 'absolute',
                        top: '2px',
                        left: viewErrorsOnly ? '20px' : '2px',
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                    View Errors Only
                  </span>
                </div>

                {/* Search Input Bar */}
                <div 
                  style={{
                    height: '38px',
                    minWidth: isMobile ? '100%' : '270px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxSizing: 'border-box'
                  }}
                >
                  <Search size={15} color="#94A3B8" />
                  <input 
                    type="text"
                    value={searchPreview}
                    onChange={(e) => setSearchPreview(e.target.value)}
                    placeholder="Search by name, class or status..."
                    style={{
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      width: '100%',
                      fontFamily: 'inherit'
                    }}
                  />
                  {searchPreview && (
                    <X 
                      size={14} 
                      color="#94A3B8" 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => setSearchPreview('')} 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div 
              style={{
                overflowX: 'auto',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                width: '100%'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    {[
                      { key: 'row', label: 'Row' },
                      { key: 'name', label: 'Student Name' },
                      { key: 'classVal', label: 'Class' },
                      { key: 'section', label: 'Section' },
                      { key: 'dob', label: 'DOB' },
                      { key: 'height', label: 'Height (cm)' },
                      { key: 'weight', label: 'Weight (kg)' },
                      { key: 'status', label: 'Status' },
                      { key: 'error', label: 'Error Message' },
                    ].map((col) => (
                      <th 
                        key={col.key}
                        onClick={() => handleSortPreview(col.key)}
                        style={{
                          padding: '11px 14px',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span>{col.label}</span>
                          <ChevronsUpDown size={12} color="#94A3B8" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((item) => {
                    const isInvalid = item.status === 'Invalid';
                    return (
                      <tr 
                        key={item.row}
                        style={{
                          backgroundColor: isInvalid ? '#FEF2F2' : '#FFFFFF',
                          borderBottom: isInvalid ? '1px solid #FEE2E2' : '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '11px 14px', color: '#64748B', fontWeight: 600 }}>
                          {item.row}
                        </td>
                        <td style={{ padding: '11px 14px', color: '#0F172A', fontWeight: 600 }}>
                          {item.name}
                        </td>
                        <td style={{ padding: '11px 14px', color: item.classVal === '-' ? '#DC2626' : '#475569', fontWeight: item.classVal === '-' ? 700 : 500 }}>
                          {item.classVal}
                        </td>
                        <td style={{ padding: '11px 14px', color: '#475569' }}>
                          {item.section}
                        </td>
                        <td style={{ padding: '11px 14px', color: item.dob === '-' ? '#DC2626' : '#64748B', fontWeight: item.dob === '-' ? 700 : 500 }}>
                          {item.dob}
                        </td>
                        <td style={{ padding: '11px 14px', color: item.height === '-' ? '#DC2626' : '#475569', fontWeight: item.height === '-' ? 700 : 500 }}>
                          {item.height}
                        </td>
                        <td style={{ padding: '11px 14px', color: item.weight === '-' ? '#DC2626' : '#475569', fontWeight: item.weight === '-' ? 700 : 500 }}>
                          {item.weight}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {isInvalid ? (
                            <span 
                              style={{
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <div 
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#DC2626',
                                  color: '#FFFFFF',
                                  fontSize: '8px',
                                  fontWeight: 900,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                !
                              </div>
                              Invalid
                            </span>
                          ) : (
                            <span 
                              style={{
                                backgroundColor: '#DCFCE7',
                                color: '#15803D',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <CheckCircle2 size={12} color="#15803D" />
                              Valid
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '11px 14px', color: isInvalid ? '#DC2626' : '#94A3B8', fontWeight: isInvalid ? 600 : 400 }}>
                          {item.error}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '4px'
              }}
            >
              <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                Showing 1–{filteredRows.length} of 126 rows
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* 10 per page selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={previewRowsPerPage}
                    onChange={(e) => setPreviewRowsPerPage(Number(e.target.value))}
                    style={{
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: '#334155',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                {/* Page Buttons: < 1 2 3 4 5 > */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {[1, 2, 3, 4, 5].map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPreviewPage(pg)}
                      style={{
                        width: '30px',
                        height: '30px',
                        border: pg === previewPage ? 'none' : '1px solid #CBD5E1',
                        borderRadius: '6px',
                        backgroundColor: pg === previewPage ? '#EA580C' : '#FFFFFF',
                        color: pg === previewPage ? '#FFFFFF' : '#475569',
                        fontWeight: pg === previewPage ? 700 : 500,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    type="button"
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Bottom) */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '6px',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {/* Right Buttons & Error Alert */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                
                {/* Cancel Import Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#EF4444',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                    e.currentTarget.style.borderColor = '#EF4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#FCA5A5';
                  }}
                >
                  <Trash2 size={15} color="#EF4444" />
                  <span>Cancel Import</span>
                </button>

                {/* Continue to Preview Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (errorCount === 0) {
                      setCurrentStep(4);
                    } else {
                      // Allow proceeding or auto-fixing for demonstration
                      handleFixAllErrors();
                    }
                  }}
                  style={{
                    backgroundColor: errorCount === 0 ? '#EB5A1D' : '#FDBA74',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px 24px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: errorCount === 0 ? '0 4px 14px rgba(235, 90, 29, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (errorCount === 0) e.currentTarget.style.backgroundColor = '#D94D12';
                  }}
                  onMouseLeave={(e) => {
                    if (errorCount === 0) e.currentTarget.style.backgroundColor = '#EB5A1D';
                  }}
                  title={errorCount > 0 ? "Click to quick-resolve errors and proceed" : "Proceed to Confirm Import"}
                >
                  <span>Continue to Preview</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Red warning message under button */}
              {errorCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div 
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    !
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>
                    Please resolve the {errorCount} errors to continue.
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: REVIEW STUDENT IMPORT (MATCHES IMAGE 1 EXACTLY - FULLY DYNAMIC)   */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Top 4 Summary Cards Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)', 
              gap: '16px' 
            }}
          >
            {/* Card 1: Cluster */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Building2 size={24} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Cluster</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {selectedCluster}
                </div>
              </div>
            </div>

            {/* Card 2: School */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <School size={24} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>School</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A8A', marginTop: '2px' }}>
                  {selectedSchool}
                </div>
              </div>
            </div>

            {/* Card 3: File */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileSpreadsheet size={24} color="#059669" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>File</div>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#0F172A', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={selectedFile?.name || 'Greenwood_Students_2026.xlsx'}
                >
                  {selectedFile?.name || 'Greenwood_Students_2026.xlsx'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  {selectedFile?.size || '248 KB'}
                </div>
              </div>
            </div>

            {/* Card 4: Students Ready to Import */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF1ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={24} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Students Ready to Import</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  122
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  out of 126 rows
                </div>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div 
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FEF3C7',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div 
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '13px',
                flexShrink: 0
              }}
            >
              !
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#92400E' }}>
              These students will be added to the selected school and become available in the mobile application.
            </span>
          </div>

          {/* Student Preview Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Student Preview
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Review the list of students that will be imported.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: isMobile ? '100%' : '270px' }}>
                  <Search 
                    size={15} 
                    color="#94A3B8" 
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
                  />
                  <input
                    type="text"
                    value={searchReview}
                    onChange={(e) => setSearchReview(e.target.value)}
                    placeholder="Search by student name, class or section..."
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', whiteSpace: 'nowrap' }}>
                  Showing 1–{filteredReviewStudents.length} of 122 students
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '60px' }}>S.No</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Student Name</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '80px' }}>Class</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '80px' }}>Section</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '130px' }}>DOB</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '120px' }}>Height (cm)</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '120px' }}>Weight (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviewStudents.map((item) => (
                    <tr 
                      key={item.sno} 
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#64748B' }}>{item.sno}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>{item.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.classVal}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.section}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.dob}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.height}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '8px',
              paddingBottom: '20px'
            }}
          >
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#EF4444',
                  border: '1.5px solid #FCA5A5',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                <Trash2 size={15} color="#EF4444" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                style={{
                  backgroundColor: '#EB5A1D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 24px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(235, 90, 29, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
              >
                <Check size={16} strokeWidth={3} />
                <span>Confirm Import</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: IMPORT SUCCESS (MATCHES IMAGE 2 EXACTLY - FULLY DYNAMIC)          */}
      {/* ========================================================================= */}
      {importView === 'wizard' && currentStep === 5 && (
        <div 
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #ECEEF2',
            padding: isMobile ? '24px 16px' : '36px 32px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Confetti decorations */}
          <div style={{ position: 'absolute', top: 22, left: 130, width: '10px', height: '18px', backgroundColor: '#10B981', transform: 'rotate(25deg)', borderRadius: '2px', opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 45, left: 65, width: '12px', height: '12px', backgroundColor: '#F59E0B', transform: 'rotate(45deg)', borderRadius: '2px', opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 25, right: 120, width: '10px', height: '18px', backgroundColor: '#3B82F6', transform: 'rotate(-30deg)', borderRadius: '2px', opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 52, right: 55, width: '12px', height: '12px', backgroundColor: '#EC4899', transform: 'rotate(15deg)', borderRadius: '2px', opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 90, left: 105, width: '14px', height: '8px', backgroundColor: '#8B5CF6', transform: 'rotate(-20deg)', borderRadius: '2px', opacity: 0.7 }} />
          <div style={{ position: 'absolute', top: 85, right: 160, width: '10px', height: '16px', backgroundColor: '#10B981', transform: 'rotate(40deg)', borderRadius: '2px', opacity: 0.7 }} />

          {/* Center checkmark */}
          <div style={{ textAlign: 'center', padding: '10px 0 20px 0' }}>
            <div 
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}
            >
              <div 
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Check size={32} strokeWidth={3.5} />
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '16px 0 0 0' }}>
              Import Completed
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', margin: '4px 0 0 0' }}>
              122 students successfully imported.
            </p>
          </div>

          {/* 3 Summary Cards */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, 1fr)', 
              gap: '16px',
              marginTop: '12px'
            }}
          >
            {/* Cluster */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Building2 size={24} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Cluster</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {selectedCluster}
                </div>
              </div>
            </div>

            {/* School */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <School size={24} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>School</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A8A', marginTop: '2px' }}>
                  {selectedSchool}
                </div>
              </div>
            </div>

            {/* File */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileSpreadsheet size={24} color="#059669" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>File</div>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#0F172A', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={selectedFile?.name || 'Greenwood_Students_2026.xlsx'}
                >
                  {selectedFile?.name || 'Greenwood_Students_2026.xlsx'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  {selectedFile?.size || '248 KB'}
                </div>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isStacked ? '1fr' : 'repeat(3, 1fr)', 
              gap: '16px',
              marginTop: '16px'
            }}
          >
            {/* Imported */}
            <div 
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #DCFCE7',
                borderRadius: '12px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={22} color="#059669" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>Imported</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  122
                </div>
              </div>
            </div>

            {/* Skipped */}
            <div 
              style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderRadius: '12px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FastForward size={22} color="#D97706" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#D97706' }}>Skipped</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  4
                </div>
              </div>
            </div>

            {/* Errors */}
            <div 
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FEE2E2',
                borderRadius: '12px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={22} color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>Errors</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  0
                </div>
              </div>
            </div>
          </div>

          {/* Blue info banner */}
          <div 
            style={{
              backgroundColor: '#F0F9FF',
              border: '1px solid #E0F2FE',
              borderLeft: '4px solid #0284C7',
              borderRadius: '10px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px'
            }}
          >
            <div 
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px',
                flexShrink: 0
              }}
            >
              i
            </div>
            <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#0369A1' }}>
              The imported students are now available in the mobile application for further assessments.
            </span>
          </div>

          {/* 3 Action Buttons */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', 
              gap: '14px', 
              marginTop: '28px' 
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigateTab) onNavigateTab('students');
              }}
              style={{
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(235, 90, 29, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
            >
              <Users size={16} />
              <span>View Students</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <Upload size={16} />
              <span>Import Another File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setImportView('history');
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <FileText size={16} />
              <span>View Import History</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT HISTORY VIEW (MATCHES IMAGE 3 EXACTLY - FULLY DYNAMIC)             */}
      {/* ========================================================================= */}
      {importView === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Top Filter Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Top row of 4 dropdowns */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)',
                gap: '14px'
              }}
            >
              {/* Cluster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Cluster</span>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={historyClusterFilter}
                    onChange={(e) => setHistoryClusterFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 34px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All Clusters">All Clusters</option>
                    <option value="Cluster A">Cluster A</option>
                    <option value="Cluster B">Cluster B</option>
                    <option value="Cluster C">Cluster C</option>
                    <option value="Cluster D">Cluster D</option>
                  </select>
                </div>
              </div>

              {/* School */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>School</span>
                <div style={{ position: 'relative' }}>
                  <School size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={historySchoolFilter}
                    onChange={(e) => setHistorySchoolFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 34px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All Schools">All Schools</option>
                    <option value="Greenwood Public School">Greenwood Public School</option>
                    <option value="Oakridge Academy">Oakridge Academy</option>
                    <option value="Riverside International">Riverside International</option>
                    <option value="Sunrise Public School">Sunrise Public School</option>
                    <option value="Maplewood High School">Maplewood High School</option>
                    <option value="Hillview School">Hillview School</option>
                    <option value="Lakeside Public School">Lakeside Public School</option>
                    <option value="Cedar High School">Cedar High School</option>
                    <option value="Pinehill Academy">Pinehill Academy</option>
                    <option value="Valleyview School">Valleyview School</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Date</span>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={historyDateFilter}
                    onChange={(e) => setHistoryDateFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 34px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Select Date Range">Select Date Range</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="September 2026">September 2026</option>
                    <option value="All Time">All Time</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Status</span>
                <div style={{ position: 'relative' }}>
                  <CheckCircle2 size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  <select
                    value={historyStatusFilter}
                    onChange={(e) => setHistoryStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px 8px 34px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      color: '#0F172A',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All Status">All Status</option>
                    <option value="Completed">Completed</option>
                    <option value="Partial">Partial</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom row: Search input + Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? '100%' : '320px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search file name..."
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleClearHistoryFilters}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                >
                  Clear Filters
                </button>

                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    backgroundColor: '#EB5A1D',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(235, 90, 29, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
                >
                  <Filter size={15} />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)',
              gap: '16px'
            }}
          >
            {/* Total Imports */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Imports</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  28
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  All time imports
                </div>
              </div>
            </div>

            {/* Completed */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Completed</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  20
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  71% of total
                </div>
              </div>
            </div>

            {/* Partial */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Partial</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  5
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  18% of total
                </div>
              </div>
            </div>

            {/* Failed */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Failed</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  3
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  11% of total
                </div>
              </div>
            </div>
          </div>

          {/* Import Records Table Card */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Import Records
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option>10 per page</option>
                  <option>25 per page</option>
                  <option>50 per page</option>
                </select>

                <div style={{ fontSize: '12.5px', color: '#64748B' }}>
                  Showing 1–{filteredHistory.length} of 28 records
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Import ID ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      File Name ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Cluster ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      School ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Records ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Uploaded By ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Date ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Status ↕
                    </th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                        {item.id}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#0F172A' }}>
                        {item.fileName}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {item.cluster}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {item.school}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {item.records}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {item.uploadedBy}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>
                        {item.date}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px' }}>
                        {item.status === 'Completed' && (
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Completed</span>
                          </div>
                        )}
                        {item.status === 'Partial' && (
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#FFFBEB',
                              color: '#D97706',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <Clock size={13} />
                            <span>Partial</span>
                          </div>
                        )}
                        {item.status === 'Failed' && (
                          <div 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            <AlertCircle size={13} />
                            <span>Failed</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(item);
                              setImportView('details');
                            }}
                            title="View Details"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#EA580C';
                              e.currentTarget.style.color = '#EA580C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#E2E8F0';
                              e.currentTarget.style.color = '#64748B';
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadRecordReport(item)}
                            title="Download Report"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#EA580C';
                              e.currentTarget.style.color = '#EA580C';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#E2E8F0';
                              e.currentTarget.style.color = '#64748B';
                            }}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <button
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                &lt;
              </button>

              <button
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#EB5A1D',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                1
              </button>

              <button
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                2
              </button>

              <button
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                3
              </button>

              <button
                type="button"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMPORT DETAILS VIEW (MATCHES IMAGE 4 EXACTLY - FULLY DYNAMIC)             */}
      {/* ========================================================================= */}
      {importView === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Top 5 Info Cards */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(5, 1fr)',
              gap: '14px'
            }}
          >
            {/* File */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileSpreadsheet size={22} color="#059669" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>File</div>
                <div 
                  style={{ 
                    fontSize: '13.5px', 
                    fontWeight: 700, 
                    color: '#0F172A', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={selectedRecord?.fileName || 'Greenwood_Students.xlsx'}
                >
                  {selectedRecord?.fileName || 'Greenwood_Students.xlsx'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                  {selectedRecord?.fileSize || '248 KB'}
                </div>
              </div>
            </div>

            {/* Cluster */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF7ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Building2 size={22} color="#EA580C" />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>Cluster</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {selectedRecord?.cluster || selectedCluster}
                </div>
              </div>
            </div>

            {/* School */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <School size={22} color="#2563EB" />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>School</div>
                <div 
                  style={{ 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    color: '#0F172A', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={selectedRecord?.school || selectedSchool}
                >
                  {selectedRecord?.school || selectedSchool}
                </div>
              </div>
            </div>

            {/* Uploaded By */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={22} color="#2563EB" />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>Uploaded By</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  {selectedRecord?.uploadedBy === 'Admin' ? 'Administrator' : selectedRecord?.uploadedBy || 'Administrator'}
                </div>
              </div>
            </div>

            {/* Uploaded Date */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Calendar size={22} color="#475569" />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>Uploaded Date</div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                  30 September 2026
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                  {selectedRecord?.time || '10:24 AM'}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)',
              gap: '16px'
            }}
          >
            {/* Total Records */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total Records</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {selectedRecord?.total || 126}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  Total rows in file
                </div>
              </div>
            </div>

            {/* Imported */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Imported</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {selectedRecord?.records || 122}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  Successfully imported
                </div>
              </div>
            </div>

            {/* Failed */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Failed</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, marginTop: '2px' }}>
                  {selectedRecord?.failed || 4}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '1px' }}>
                  Records with errors
                </div>
              </div>
            </div>

            {/* Status */}
            <div 
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #ECEEF2',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Status</div>
                <div style={{ marginTop: '2px' }}>
                  <span 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    + {selectedRecord?.status || 'Partial'}
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Completed with some errors
                </div>
              </div>
            </div>
          </div>

          {/* Import Timeline Section */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Import Timeline
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                Track the progress of this import process.
              </p>
            </div>

            {/* Timeline Track with 4 connected stages */}
            <div style={{ marginTop: '20px', position: 'relative' }}>
              {/* Connecting line */}
              <div 
                style={{
                  position: 'absolute',
                  top: '13px',
                  left: '12.5%',
                  right: '12.5%',
                  height: '2px',
                  backgroundColor: '#10B981',
                  zIndex: 1
                }}
              />

              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: isStacked ? (isMobile ? '1fr' : 'repeat(2, 1fr)') : 'repeat(4, 1fr)',
                  gap: '16px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {/* Stage 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      marginBottom: '10px'
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div 
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>File Uploaded</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      <Calendar size={12} />
                      <span>{selectedRecord?.date || '30 Sep 2026'}, {selectedRecord?.time || '10:24 AM'}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Excel file uploaded successfully.
                    </div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      marginBottom: '10px'
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div 
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Validation Completed</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      <Calendar size={12} />
                      <span>{selectedRecord?.date || '30 Sep 2026'}, 10:25 AM</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Data validation finished. 4 errors found.
                    </div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      marginBottom: '10px'
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div 
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Import Confirmed</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      <Calendar size={12} />
                      <span>{selectedRecord?.date || '30 Sep 2026'}, 10:26 AM</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      Import process started.
                    </div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      marginBottom: '10px'
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div 
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Students Created</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '11.5px', color: '#64748B', marginTop: '4px' }}>
                      <Calendar size={12} />
                      <span>{selectedRecord?.date || '30 Sep 2026'}, 10:26 AM</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      {selectedRecord?.records || 122} students imported successfully.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Records Section */}
          <div 
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #ECEEF2',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Error Records
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '3px 0 0 0' }}>
                  List of records that could not be imported.
                </p>
              </div>

              <div style={{ position: 'relative', width: isMobile ? '100%' : '270px' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={detailErrorSearch}
                  onChange={(e) => setDetailErrorSearch(e.target.value)}
                  placeholder="Search by student name or issue..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #FEE2E2', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '60px' }}>Row</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>Student</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '80px' }}>Class</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '80px' }}>Section</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '130px' }}>DOB</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '120px' }}>Height</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '120px' }}>Weight</th>
                    <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', width: '160px' }}>Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredErrorRecords.map((item) => (
                    <tr 
                      key={item.row} 
                      style={{ 
                        backgroundColor: '#FFF5F5',
                        borderBottom: '1px solid #FEE2E2',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFF5F5'}
                    >
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.row}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 500, color: '#0F172A' }}>{item.name}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.classVal}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.section}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.dob}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.height}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#475569' }}>{item.weight}</td>
                      <td style={{ padding: '10px 14px', fontSize: '12.5px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#DC2626', fontWeight: 600 }}>
                          <AlertCircle size={14} color="#DC2626" />
                          <span>{item.issue}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '8px',
              paddingBottom: '20px'
            }}
          >
            <button
              type="button"
              onClick={() => setImportView('history')}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1.5px solid #CBD5E1',
                borderRadius: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <ArrowLeft size={16} />
              <span>Back to Import History</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadErrorReport}
              style={{
                backgroundColor: '#EB5A1D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 24px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(235, 90, 29, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D94D12'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EB5A1D'}
            >
              <Download size={16} />
              <span>Download Error Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
