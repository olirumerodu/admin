import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Bell,
  Clock,
  Send,
  Calendar,
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  X,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Users,
  Network,
  School,
  User,
  FileText,
  AlertCircle,
  CalendarDays,
  Smartphone,
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

// Initial dynamic dataset of notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Monthly Assessment Reminder',
    target: 'Cluster A',
    targetType: 'Specific Cluster',
    type: 'Monthly Assessment',
    category: 'Monthly Assessment',
    scheduledDate: '02 Oct 2026',
    scheduledTime: '09:00 AM',
    status: 'Scheduled',
    recipients: 482,
    delivered: 0,
    failed: 0,
    message: 'Dear School Coordinators and Staff, The monthly student health assessment schedule for Cluster A commences next week. Please verify student attendance lists.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '29 Sep 2026, 11:20 AM'
  },
  {
    id: 'notif-2',
    title: 'Quarterly Health Check Notification',
    target: 'Greenwood Public School',
    targetType: 'Specific School',
    type: 'Health Check',
    category: 'General Information',
    scheduledDate: '28 Sep 2026',
    scheduledTime: '10:30 AM',
    status: 'Sent',
    recipients: 126,
    delivered: 124,
    failed: 2,
    message: 'Dear Parents,\n\nThe quarterly health check for all students will be conducted next week. Please ensure your child is present on the scheduled date.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '25 Sep 2026, 04:15 PM'
  },
  {
    id: 'notif-3',
    title: 'Parent Meeting Reminder',
    target: 'Cluster B',
    targetType: 'Specific Cluster',
    type: 'General Update',
    category: 'Reminder',
    scheduledDate: '15 Sep 2026',
    scheduledTime: '02:00 PM',
    status: 'Sent',
    recipients: 324,
    delivered: 320,
    failed: 4,
    message: 'Dear Parents and Guardians, A virtual parent orientation session reviewing initial student health and nutrition reports is scheduled for this Friday.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '13 Sep 2026, 09:30 AM'
  },
  {
    id: 'notif-4',
    title: 'Vaccination Drive Announcement',
    target: 'All Students',
    targetType: 'All Users',
    type: 'Health Campaign',
    category: 'Important Update',
    scheduledDate: '10 Sep 2026',
    scheduledTime: '09:00 AM',
    status: 'Sent',
    recipients: 2486,
    delivered: 2470,
    failed: 16,
    message: 'Important Notice: The annual school immunization and booster drive schedule is now published. Please review and submit consent slips.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '08 Sep 2026, 02:45 PM'
  },
  {
    id: 'notif-5',
    title: 'Assessment Schedule Update',
    target: 'Oakridge Academy',
    targetType: 'Specific School',
    type: 'Assessment Schedule',
    category: 'Monthly Assessment',
    scheduledDate: '05 Sep 2026',
    scheduledTime: '11:00 AM',
    status: 'Expired',
    recipients: 98,
    delivered: 98,
    failed: 0,
    message: 'Health screening schedule updated for Grades 3 through 5 at Oakridge Academy due to local sports day activities.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '03 Sep 2026, 10:15 AM'
  },
  {
    id: 'notif-6',
    title: 'Health Camp Notification',
    target: 'Cluster C',
    targetType: 'Specific Cluster',
    type: 'Health Campaign',
    category: 'General Information',
    scheduledDate: '01 Sep 2026',
    scheduledTime: '09:00 AM',
    status: 'Expired',
    recipients: 412,
    delivered: 408,
    failed: 4,
    message: 'Pediatric eye and dental screening camp registration has concluded for Cluster C schools.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '28 Aug 2026, 03:00 PM'
  },
  {
    id: 'notif-7',
    title: 'Monthly Assessment Reminder',
    target: 'Riverside International',
    targetType: 'Specific School',
    type: 'Monthly Assessment',
    category: 'Monthly Assessment',
    scheduledDate: '02 Nov 2026',
    scheduledTime: '09:00 AM',
    status: 'Scheduled',
    recipients: 68,
    delivered: 0,
    failed: 0,
    message: 'November monthly biometric and growth measurement tracking will be held on the first Monday.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '29 Sep 2026, 01:10 PM'
  },
  {
    id: 'notif-8',
    title: 'Annual Health Report Release',
    target: 'All Schools',
    targetType: 'All Users',
    type: 'Report',
    category: 'General Information',
    scheduledDate: '25 Aug 2026',
    scheduledTime: '10:00 AM',
    status: 'Sent',
    recipients: 64,
    delivered: 64,
    failed: 0,
    message: 'The consolidated academic year health report cards have been published to the administrator dashboard.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '24 Aug 2026, 05:00 PM'
  },
  {
    id: 'notif-9',
    title: 'Dental Checkup Notification',
    target: 'St. Jude High School',
    targetType: 'Specific School',
    type: 'Health Check',
    category: 'Reminder',
    scheduledDate: '20 Aug 2026',
    scheduledTime: '10:00 AM',
    status: 'Sent',
    recipients: 74,
    delivered: 73,
    failed: 1,
    message: 'Oral health evaluations will begin tomorrow at 10 AM for lower primary classes.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '18 Aug 2026, 11:00 AM'
  },
  {
    id: 'notif-10',
    title: 'New Guidelines Update',
    target: 'All Schools',
    targetType: 'All Users',
    type: 'General Update',
    category: 'General Information',
    scheduledDate: '15 Aug 2026',
    scheduledTime: '09:30 AM',
    status: 'Sent',
    recipients: 64,
    delivered: 64,
    failed: 0,
    message: 'Revised dietary guidance protocols and cafeteria nutrition requirements released for review.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '14 Aug 2026, 02:00 PM'
  },
  {
    id: 'notif-11',
    title: 'Vision Screening Follow-Up',
    target: 'Sunrise Public School',
    targetType: 'Specific School',
    type: 'Health Check',
    category: 'Reminder',
    scheduledDate: '04 Oct 2026',
    scheduledTime: '11:00 AM',
    status: 'Scheduled',
    recipients: 42,
    delivered: 0,
    failed: 0,
    message: 'Follow-up vision check for students with prescribed corrective lenses.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '30 Sep 2026, 09:15 AM'
  },
  {
    id: 'notif-12',
    title: 'Health Portal Mobile App Launch',
    target: 'All Students',
    targetType: 'All Users',
    type: 'Important Update',
    category: 'Important Update',
    scheduledDate: '06 Oct 2026',
    scheduledTime: '08:30 AM',
    status: 'Scheduled',
    recipients: 2486,
    delivered: 0,
    failed: 0,
    message: 'Parents can now track real-time BMI and growth charts on our newly released mobile application.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '30 Sep 2026, 10:00 AM'
  },
  {
    id: 'notif-13',
    title: 'Nutrition Workshop for Parents',
    target: 'Cluster D',
    targetType: 'Specific Cluster',
    type: 'General Update',
    category: 'General Information',
    scheduledDate: '12 Aug 2026',
    scheduledTime: '04:00 PM',
    status: 'Sent',
    recipients: 368,
    delivered: 365,
    failed: 3,
    message: 'Free interactive session with pediatric nutritionists addressing balanced diet options.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '10 Aug 2026, 01:20 PM'
  },
  {
    id: 'notif-14',
    title: 'Physical Fitness Benchmark Drive',
    target: 'Maplewood High School',
    targetType: 'Specific School',
    type: 'Monthly Assessment',
    category: 'Monthly Assessment',
    scheduledDate: '08 Aug 2026',
    scheduledTime: '09:00 AM',
    status: 'Sent',
    recipients: 38,
    delivered: 38,
    failed: 0,
    message: 'Physical education teachers are instructed to record standard fitness metrics into the system.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '05 Aug 2026, 11:45 AM'
  },
  {
    id: 'notif-15',
    title: 'First Aid Readiness Checklist',
    target: 'All Schools',
    targetType: 'All Users',
    type: 'Report',
    category: 'Reminder',
    scheduledDate: '01 Aug 2026',
    scheduledTime: '08:00 AM',
    status: 'Sent',
    recipients: 64,
    delivered: 64,
    failed: 0,
    message: 'Annual school dispensary audit and emergency medicine kit verification.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '30 Jul 2026, 04:30 PM'
  },
  {
    id: 'notif-16',
    title: 'Cluster E Seasonal Flu Alert',
    target: 'Cluster E',
    targetType: 'Specific Cluster',
    type: 'Health Campaign',
    category: 'Important Update',
    scheduledDate: '26 Jul 2026',
    scheduledTime: '09:00 AM',
    status: 'Sent',
    recipients: 298,
    delivered: 295,
    failed: 3,
    message: 'Advisory on hygiene and sanitation practices to mitigate seasonal viral flu transmission.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '25 Jul 2026, 08:15 AM'
  },
  {
    id: 'notif-17',
    title: 'Hillview School Height-Weight Drive',
    target: 'Hillview School',
    targetType: 'Specific School',
    type: 'Monthly Assessment',
    category: 'Monthly Assessment',
    scheduledDate: '22 Jul 2026',
    scheduledTime: '10:00 AM',
    status: 'Sent',
    recipients: 28,
    delivered: 28,
    failed: 0,
    message: 'Mid-term anthropometric evaluations completed for Hillview students.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '20 Jul 2026, 02:00 PM'
  },
  {
    id: 'notif-18',
    title: 'Cluster F Sports Readiness Assessment',
    target: 'Cluster F',
    targetType: 'Specific Cluster',
    type: 'Assessment Schedule',
    category: 'General Information',
    scheduledDate: '18 Jul 2026',
    scheduledTime: '01:00 PM',
    status: 'Sent',
    recipients: 312,
    delivered: 310,
    failed: 2,
    message: 'Pre-tournament cardiopulmonary readiness checkups scheduled across 9 schools.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '15 Jul 2026, 10:30 AM'
  },
  {
    id: 'notif-19',
    title: 'Lakeside Public School Deworming Day',
    target: 'Lakeside Public School',
    targetType: 'Specific School',
    type: 'Health Campaign',
    category: 'Reminder',
    scheduledDate: '10 Jul 2026',
    scheduledTime: '09:30 AM',
    status: 'Sent',
    recipients: 12,
    delivered: 12,
    failed: 0,
    message: 'Government mandated deworming tablets administration report due by end of day.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '08 Jul 2026, 09:00 AM'
  },
  {
    id: 'notif-20',
    title: 'Emergency Contact Verification Reminder',
    target: 'All Students',
    targetType: 'All Users',
    type: 'General Update',
    category: 'General Information',
    scheduledDate: '01 Jul 2026',
    scheduledTime: '10:00 AM',
    status: 'Sent',
    recipients: 2486,
    delivered: 2480,
    failed: 6,
    message: 'Please verify parent telephone numbers and primary contact addresses in the school registry.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '28 Jun 2026, 03:20 PM'
  },
  {
    id: 'notif-21',
    title: 'Medical Record Archival Notice',
    target: 'All Schools',
    targetType: 'All Users',
    type: 'Report',
    category: 'General Information',
    scheduledDate: '20 Jun 2026',
    scheduledTime: '04:00 PM',
    status: 'Sent',
    recipients: 64,
    delivered: 64,
    failed: 0,
    message: 'Previous academic cycle medical and vaccination records successfully backed up.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '19 Jun 2026, 11:00 AM'
  },
  {
    id: 'notif-22',
    title: 'Staff First-Aid Training Session',
    target: 'Greenwood Public School',
    targetType: 'Specific School',
    type: 'General Update',
    category: 'Reminder',
    scheduledDate: '15 Jun 2026',
    scheduledTime: '02:00 PM',
    status: 'Sent',
    recipients: 18,
    delivered: 18,
    failed: 0,
    message: 'CPR and pediatric first-aid certification renewal workshop.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '12 Jun 2026, 09:40 AM'
  },
  {
    id: 'notif-23',
    title: 'Posture and Spine Screening Camp',
    target: 'Oakridge Academy',
    targetType: 'Specific School',
    type: 'Health Check',
    category: 'General Information',
    scheduledDate: '05 Jun 2026',
    scheduledTime: '10:00 AM',
    status: 'Sent',
    recipients: 98,
    delivered: 97,
    failed: 1,
    message: 'Ergonomic backpack weight awareness and spinal postural assessment.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '03 Jun 2026, 04:00 PM'
  },
  {
    id: 'notif-24',
    title: 'Academic Year Health Protocol Kickoff',
    target: 'All Schools',
    targetType: 'All Users',
    type: 'Important Update',
    category: 'Important Update',
    scheduledDate: '01 Jun 2026',
    scheduledTime: '09:00 AM',
    status: 'Sent',
    recipients: 64,
    delivered: 64,
    failed: 0,
    message: 'Standard operating guidelines for student health checkup cadence for 2026-2027.',
    createdBy: 'Karthikeyan (Administrator)',
    createdDate: '28 May 2026, 10:00 AM'
  }
];

export default function NotificationsManagementView() {
  // Navigation Mode: 'list' (Image 1) | 'create' (Image 2) | 'history' (Image 3)
  const [viewMode, setViewMode] = useState('list');

  // Master Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Filters for Main List View
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'scheduled' | 'sent' | 'expired'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Notification for Drawer Details
  const [selectedNotificationId, setSelectedNotificationId] = useState('notif-2');
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  // History Filters
  const [historyDateRange, setHistoryDateRange] = useState('01 Sep 2026 - 30 Sep 2026');
  const [historyTargetFilter, setHistoryTargetFilter] = useState('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');

  // Create Notification Form State
  const [audienceType, setAudienceType] = useState('all_users'); // 'all_users' | 'specific_cluster' | 'specific_school' | 'specific_user'
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [clustersList, setClustersList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  const [notificationType, setNotificationType] = useState('general_info'); // 'general_info' | 'monthly_assessment' | 'reminder' | 'important_update'

  const [formTitle, setFormTitle] = useState('Health Check Notification');
  const [formMessage, setFormMessage] = useState(
    'Dear Parents,\n\nThe monthly health check for all students will be conducted next week. Please ensure your child is present on the scheduled date.'
  );

  const [scheduleMode, setScheduleMode] = useState('schedule'); // 'now' | 'schedule'
  const [scheduledDate, setScheduledDate] = useState('02 Oct 2026');
  const [scheduledTime, setScheduledTime] = useState('09:00 AM');

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Synchronize live data from backend with real-time polling
  const loadNotificationsData = async () => {
    try {
      const [notifsRes, clustersRes, schoolsRes, studentsRes] = await Promise.allSettled([
        api.getNotifications(),
        api.getClusters(),
        api.getSchools(),
        api.getStudents()
      ]);

      const backendNotifs = notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value) ? notifsRes.value : [];
      const cList = clustersRes.status === 'fulfilled' && Array.isArray(clustersRes.value) ? clustersRes.value : [];
      const sList = schoolsRes.status === 'fulfilled' && Array.isArray(schoolsRes.value) ? schoolsRes.value : [];
      const stdList = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value) ? studentsRes.value : [];

      setClustersList(cList);
      setSchoolsList(sList);
      setStudentsList(stdList);

      if (backendNotifs.length > 0) {
        setNotifications(backendNotifs);
      }
      if (cList.length > 0 && !selectedCluster) {
        setSelectedCluster(cList[0].name);
      }
      if (sList.length > 0 && !selectedSchool) {
        setSelectedSchool(sList[0].name);
      }
      if (stdList.length > 0 && !selectedUser) {
        setSelectedUser(`${stdList[0].name} (${stdList[0].class_name})`);
      }
    } catch (err) {
      console.warn('Failed to load notifications data:', err);
    }
  };

  useEffect(() => {
    loadNotificationsData();
    const interval = setInterval(loadNotificationsData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic KPI counts
  const totalCount = notifications.length;
  const scheduledCount = useMemo(() => notifications.filter((n) => n.status === 'Scheduled').length, [notifications]);
  const sentCount = useMemo(() => notifications.filter((n) => n.status === 'Sent').length, [notifications]);
  const expiredCount = useMemo(() => notifications.filter((n) => n.status === 'Expired').length, [notifications]);

  // Main List Filtered Dataset
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : item.status.toLowerCase() === activeTab.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.target.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, searchQuery]);

  // Pagination for Main List
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(start, start + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  // History List Filtered Dataset
  const historyList = useMemo(() => {
    return notifications.filter((item) => {
      const matchesTarget =
        historyTargetFilter === 'ALL' ? true : item.target === historyTargetFilter;
      const matchesType =
        historyTypeFilter === 'ALL' ? true : item.type === historyTypeFilter;
      const matchesStatus =
        historyStatusFilter === 'ALL' ? true : item.status === historyStatusFilter;
      return matchesTarget && matchesType && matchesStatus;
    });
  }, [notifications, historyTargetFilter, historyTypeFilter, historyStatusFilter]);

  // Selected Notification Object
  const selectedNotification = useMemo(() => {
    return (
      notifications.find((n) => n.id === selectedNotificationId) ||
      notifications[0]
    );
  }, [notifications, selectedNotificationId]);

  // Handle Form Submission with Real-Time Backend API Call
  const handleSendOrSchedule = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a notification title.');
      return;
    }

    let targetLabel = 'All Users';
    if (audienceType === 'specific_cluster') targetLabel = selectedCluster || 'All Clusters';
    else if (audienceType === 'specific_school') targetLabel = selectedSchool || 'All Schools';
    else if (audienceType === 'specific_user') targetLabel = selectedUser || 'Specific Student';

    let typeLabel = 'General Information';
    if (notificationType === 'monthly_assessment') typeLabel = 'Monthly Assessment';
    else if (notificationType === 'reminder') typeLabel = 'Reminder';
    else if (notificationType === 'important_update') typeLabel = 'Important Update';

    try {
      const payload = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        target_type:
          audienceType === 'all_users'
            ? 'All Users'
            : audienceType === 'specific_cluster'
            ? 'Specific Cluster'
            : audienceType === 'specific_school'
            ? 'Specific School'
            : 'Specific User',
        target: targetLabel,
        category: typeLabel,
        type: typeLabel,
        scheduled_date: scheduleMode === 'now' ? null : scheduledDate,
        scheduled_time: scheduleMode === 'now' ? null : scheduledTime,
      };

      const created = await api.createNotification(payload);
      setNotifications((prev) => [created, ...prev]);
      setSelectedNotificationId(created.id);
      setToastMessage(
        scheduleMode === 'now'
          ? 'Notification sent successfully in real-time!'
          : 'Notification scheduled successfully in real-time!'
      );
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
      setViewMode('list');
    } catch (err) {
      alert(`Failed to send notification: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
      {/* Toast Notification Alert */}
      {showSuccessToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '13.5px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: NOTIFICATIONS LIST (IMAGE 1)                                       */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Row */}
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
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Notifications
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                Send updates, reminders and assessment schedules
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setViewMode('history')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <CalendarDays size={15} color="#F05A24" />
                <span>Notification History</span>
              </button>

              <button
                onClick={() => setViewMode('create')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F05A24',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(240, 90, 36, 0.35)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04B18')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F05A24')}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Notification</span>
              </button>
            </div>
          </div>

          {/* Top 3 KPI Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px'
            }}
          >
            {/* Card 1: Scheduled */}
            <div
              onClick={() => setActiveTab('scheduled')}
              style={{
                backgroundColor: '#FFFBF8',
                borderRadius: '12px',
                border: '1px solid #FED7AA',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(240, 90, 36, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FFEDD5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={24} color="#EA580C" strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>
                  Scheduled
                </span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  {scheduledCount}
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Notifications scheduled</span>
              </div>
            </div>

            {/* Card 2: Sent */}
            <div
              onClick={() => setActiveTab('sent')}
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: '12px',
                border: '1px solid #BBF7D0',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={22} color="#16A34A" strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Sent</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  {sentCount}
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Notifications sent</span>
              </div>
            </div>

            {/* Card 3: Expired */}
            <div
              onClick={() => setActiveTab('expired')}
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: '12px',
                border: '1px solid #FECACA',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(239, 68, 68, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CalendarDays size={22} color="#DC2626" strokeWidth={2.2} />
              </div>
              <div>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B' }}>Expired</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                  {expiredCount}
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>Notifications expired</span>
              </div>
            </div>
          </div>

          {/* Table Container Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Filter Tabs Bar + Search */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              {/* Left: Tab Pills */}
              <div
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '4px',
                  border: '1px solid #E2E8F0',
                  gap: '4px'
                }}
              >
                {[
                  { key: 'all', label: `All (${totalCount})` },
                  { key: 'scheduled', label: `Scheduled (${scheduledCount})` },
                  { key: 'sent', label: `Sent (${sentCount})` },
                  { key: 'expired', label: `Expired (${expiredCount})` }
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? '#F05A24' : 'transparent',
                        color: isActive ? '#FFFFFF' : '#64748B',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right: Search Input */}
              <div
                style={{
                  position: 'relative',
                  width: '260px',
                  maxWidth: '100%'
                }}
              >
                <Search
                  size={15}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#F05A24')}
                  onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>
            </div>

            {/* Notifications Table */}
            <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  minWidth: '820px'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Title ↕
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Target ↕
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Type ↕
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Scheduled Date ↕
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      Status ↕
                    </th>
                    <th style={{ padding: '11px 16px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '36px',
                          textAlign: 'center',
                          color: '#94A3B8',
                          fontSize: '13px'
                        }}
                      >
                        No notifications found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Title with orange bell icon badge */}
                        <td style={{ padding: '11px 16px', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: '#FFF7ED',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Bell size={14} color="#EA580C" />
                            </div>
                            <span>{item.title}</span>
                          </div>
                        </td>

                        {/* Target */}
                        <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                          {item.target}
                        </td>

                        {/* Type */}
                        <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                          {item.type}
                        </td>

                        {/* Scheduled Date */}
                        <td style={{ padding: '11px 16px', fontSize: '12.5px', color: '#475569' }}>
                          {item.scheduledDate}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '11px 16px' }}>
                          {item.status === 'Scheduled' && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                backgroundColor: '#FFEDD5',
                                color: '#EA580C',
                                padding: '3px 12px',
                                borderRadius: '12px',
                                display: 'inline-block'
                              }}
                            >
                              Scheduled
                            </span>
                          )}
                          {item.status === 'Sent' && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                backgroundColor: '#DCFCE7',
                                color: '#16A34A',
                                padding: '3px 12px',
                                borderRadius: '12px',
                                display: 'inline-block'
                              }}
                            >
                              Sent
                            </span>
                          )}
                          {item.status === 'Expired' && (
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                padding: '3px 12px',
                                borderRadius: '12px',
                                display: 'inline-block'
                              }}
                            >
                              Expired
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setSelectedNotificationId(item.id);
                                setViewMode('history');
                              }}
                              title="View Details"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#475569',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F1F5F9';
                                e.currentTarget.style.color = '#F05A24';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.color = '#475569';
                              }}
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedNotificationId(item.id);
                                setViewMode('history');
                              }}
                              title="More Options"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#FFFFFF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#475569',
                                transition: 'all 0.15s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#F1F5F9';
                                e.currentTarget.style.color = '#F05A24';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.color = '#475569';
                              }}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '6px'
              }}
            >
              <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                Showing{' '}
                {filteredNotifications.length === 0
                  ? 0
                  : (currentPage - 1) * itemsPerPage + 1}
                -
                {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} of{' '}
                {filteredNotifications.length} notifications
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === 1 ? '#CBD5E1' : '#475569'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: currentPage === page ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: currentPage === page ? '#F05A24' : '#FFFFFF',
                      color: currentPage === page ? '#FFFFFF' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages ? '#CBD5E1' : '#475569'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CREATE NOTIFICATION (IMAGE 2)                                      */}
      {/* ========================================================================= */}
      {viewMode === 'create' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              <Home size={15} />
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                padding: 0
              }}
            >
              Notifications
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Create Notification</span>
          </div>

          {/* Title Row */}
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              Create Notification
            </h1>
            <p
              style={{
                fontSize: '13.5px',
                color: '#64748B',
                margin: '4px 0 0 0',
                fontWeight: 400
              }}
            >
              Send updates, reminders and assessment schedules
            </p>
          </div>

          {/* 2-Column Grid: Form (Left) & Mobile Live Preview (Right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
              gap: '24px',
              alignItems: 'start'
            }}
          >
            {/* Left: Stepped Creation Form */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '26px'
              }}
            >
              {/* STEP 1: CHOOSE AUDIENCE */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Choose Audience
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 12px 0' }}>
                    Select who will receive this notification
                  </p>

                  {/* 4 Audience Cards Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    {[
                      {
                        key: 'all_users',
                        icon: Users,
                        title: 'All Users',
                        desc: 'Send to all students, parents and staff'
                      },
                      {
                        key: 'specific_cluster',
                        icon: Network,
                        title: 'Specific Cluster',
                        desc: 'Send to a specific cluster'
                      },
                      {
                        key: 'specific_school',
                        icon: School,
                        title: 'Specific School',
                        desc: 'Send to a specific school'
                      },
                      {
                        key: 'specific_user',
                        icon: User,
                        title: 'Specific User',
                        desc: 'Send to an individual user'
                      }
                    ].map((aud) => {
                      const isSelected = audienceType === aud.key;
                      const IconComp = aud.icon;
                      return (
                        <div
                          key={aud.key}
                          onClick={() => setAudienceType(aud.key)}
                          style={{
                            border: isSelected ? '2px solid #F05A24' : '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '14px 10px',
                            backgroundColor: isSelected ? '#FFFBF8' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Radio indicator */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: isSelected ? '4px solid #F05A24' : '1.5px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              boxSizing: 'border-box'
                            }}
                          />

                          <div style={{ marginBottom: '8px', color: isSelected ? '#F05A24' : '#64748B' }}>
                            <IconComp size={24} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                            {aud.title}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                            {aud.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dynamic sub-select for Specific Cluster/School/User */}
                  {audienceType === 'specific_cluster' && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                        Select Cluster
                      </label>
                      <select
                        value={selectedCluster}
                        onChange={(e) => setSelectedCluster(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          color: '#0F172A'
                        }}
                      >
                        {clustersList.length > 0 ? (
                          clustersList.map((c) => (
                            <option key={c.id || c.name} value={c.name}>
                              {c.name} ({c.schools_count || 0} Schools, {c.students_count || 0} Students)
                            </option>
                          ))
                        ) : (
                          <option value="Cluster A">Cluster A</option>
                        )}
                      </select>
                    </div>
                  )}

                  {audienceType === 'specific_school' && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                        Select School
                      </label>
                      <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          color: '#0F172A'
                        }}
                      >
                        {schoolsList.length > 0 ? (
                          schoolsList.map((s) => (
                            <option key={s.id || s.name} value={s.name}>
                              {s.name} ({s.students_count || 0} Students)
                            </option>
                          ))
                        ) : (
                          <option value="Greenwood Public School">Greenwood Public School</option>
                        )}
                      </select>
                    </div>
                  )}

                  {audienceType === 'specific_user' && (
                    <div style={{ marginTop: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                        Select Student / User
                      </label>
                      <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          fontSize: '13px',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          color: '#0F172A'
                        }}
                      >
                        {studentsList.length > 0 ? (
                          studentsList.map((st) => (
                            <option key={st.id} value={`${st.name} (${st.class_name})`}>
                              {st.name} - {st.class_name} ({st.school_name})
                            </option>
                          ))
                        ) : (
                          <option value="Student User">No students registered yet</option>
                        )}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 2: NOTIFICATION TYPE */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Notification Type
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 12px 0' }}>
                    Select the type of notification
                  </p>

                  {/* 4 Type Cards Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    {[
                      {
                        key: 'general_info',
                        icon: FileText,
                        title: 'General Information',
                        desc: 'General updates and announcements'
                      },
                      {
                        key: 'monthly_assessment',
                        icon: Calendar,
                        title: 'Monthly Assessment',
                        desc: 'Assessment schedules and reminders'
                      },
                      {
                        key: 'reminder',
                        icon: Bell,
                        title: 'Reminder',
                        desc: 'Reminders for important tasks'
                      },
                      {
                        key: 'important_update',
                        icon: AlertCircle,
                        title: 'Important Update',
                        desc: 'Critical information requiring attention'
                      }
                    ].map((typeItem) => {
                      const isSelected = notificationType === typeItem.key;
                      const IconComp = typeItem.icon;
                      return (
                        <div
                          key={typeItem.key}
                          onClick={() => setNotificationType(typeItem.key)}
                          style={{
                            border: isSelected ? '2px solid #F05A24' : '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '14px 10px',
                            backgroundColor: isSelected ? '#FFFBF8' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Radio indicator */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: isSelected ? '4px solid #F05A24' : '1.5px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              boxSizing: 'border-box'
                            }}
                          />

                          <div style={{ marginBottom: '8px', color: isSelected ? '#F05A24' : '#64748B' }}>
                            <IconComp size={24} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                            {typeItem.title}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.3 }}>
                            {typeItem.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* STEP 3: MESSAGE */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  3
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Message
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                        Enter the notification title and message
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {formTitle.length}/100
                    </span>
                  </div>

                  {/* Title Input */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                      Title
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Health Check Notification"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0F172A'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#F05A24')}
                      onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                    />
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Message
                      </label>
                      <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                        {formMessage.length}/500
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Enter detailed message for recipients..."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0F172A',
                        resize: 'vertical',
                        lineHeight: 1.5
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#F05A24')}
                      onBlur={(e) => (e.target.style.borderColor = '#E2E8F0')}
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4: SCHEDULE */}
              <div style={{ display: 'flex', gap: '14px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F05A24',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  4
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Schedule
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 10px 0' }}>
                      Choose when to send this notification
                    </p>
                  </div>

                  {/* 2 Schedule Radio Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {/* Send Now */}
                    <div
                      onClick={() => setScheduleMode('now')}
                      style={{
                        border: scheduleMode === 'now' ? '2px solid #F05A24' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        backgroundColor: scheduleMode === 'now' ? '#FFFBF8' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: scheduleMode === 'now' ? '4px solid #F05A24' : '1.5px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          Send Now
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Send the notification immediately
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div
                      onClick={() => setScheduleMode('schedule')}
                      style={{
                        border: scheduleMode === 'schedule' ? '2px solid #F05A24' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        backgroundColor: scheduleMode === 'schedule' ? '#FFFBF8' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: scheduleMode === 'schedule' ? '4px solid #F05A24' : '1.5px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          Schedule
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Choose a date and time
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Picker Row (when Schedule is active) */}
                  {scheduleMode === 'schedule' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '4px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                          Date
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Calendar
                            size={15}
                            color="#94A3B8"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                          />
                          <input
                            type="text"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 12px 8px 36px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              fontSize: '13px',
                              backgroundColor: '#FFFFFF',
                              outline: 'none',
                              color: '#0F172A'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                          Time
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Clock
                            size={15}
                            color="#94A3B8"
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                          />
                          <input
                            type="text"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            style={{
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '8px 12px 8px 36px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              fontSize: '13px',
                              backgroundColor: '#FFFFFF',
                              outline: 'none',
                              color: '#0F172A'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #F1F5F9'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Draft saved successfully!');
                    setShowSuccessToast(true);
                    setTimeout(() => setShowSuccessToast(false), 3000);
                  }}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Quick alert preview or scroll into view
                    alert(`Preview:\nTitle: ${formTitle}\n\n${formMessage}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                >
                  <Eye size={15} />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendOrSchedule}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 22px',
                    borderRadius: '8px',
                    backgroundColor: '#F05A24',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 3px 12px rgba(240, 90, 36, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04B18')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F05A24')}
                >
                  <Send size={15} />
                  <span>Send / Schedule</span>
                </button>
              </div>
            </div>

            {/* Right: Live Mobile Notification Preview */}
            <div
              style={{
                backgroundColor: '#FFFBF8',
                borderRadius: '16px',
                border: '1px solid #FED7AA',
                padding: '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#F05A24',
                    fontWeight: 700,
                    fontSize: '14.5px'
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#FFEDD5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Eye size={15} color="#EA580C" />
                  </div>
                  <span>Live Notification Preview</span>
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '4px 0 0 0' }}>
                  See how this notification will appear in the mobile application
                </p>
              </div>

              {/* Realistic Mobile Device Frame */}
              <div
                style={{
                  width: '280px',
                  height: '560px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '36px',
                  border: '9px solid #0F172A',
                  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.18)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                {/* Phone Notch / Speaker Island */}
                <div
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '84px',
                    height: '14px',
                    backgroundColor: '#0F172A',
                    borderRadius: '10px',
                    zIndex: 20
                  }}
                />

                {/* Status Bar */}
                <div
                  style={{
                    padding: '8px 16px 4px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    zIndex: 10
                  }}
                >
                  <span>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Signal size={11} />
                    <Wifi size={11} />
                    <Battery size={13} />
                  </div>
                </div>

                {/* App Header */}
                <div
                  style={{
                    padding: '10px 14px 8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid #F1F5F9'
                  }}
                >
                  <ArrowLeft size={16} color="#0F172A" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    Notifications
                  </span>
                </div>

                {/* Screen Scrollable Area */}
                <div
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#F8FAFC',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Live Rendered Notification Card */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid #FED7AA',
                      boxShadow: '0 2px 8px rgba(240, 90, 36, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: '#FFF7ED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Bell size={13} color="#EA580C" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#0F172A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formTitle || 'Health Check Notification'}
                        </div>
                        <span style={{ fontSize: '10px', color: '#94A3B8' }}>Just now</span>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#475569',
                        lineHeight: 1.45,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {formMessage ||
                        'Dear Parents,\n\nThe monthly health check for all students will be conducted next week. Please ensure your child is present on the scheduled date.'}
                    </div>
                  </div>

                  {/* Placeholder past notifications */}
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '12px',
                        border: '1px solid #F1F5F9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        opacity: 0.65
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#F1F5F9'
                          }}
                        />
                        <div
                          style={{
                            height: '10px',
                            width: '90px',
                            backgroundColor: '#E2E8F0',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div
                        style={{
                          height: '8px',
                          width: '100%',
                          backgroundColor: '#F1F5F9',
                          borderRadius: '4px'
                        }}
                      />
                      <div
                        style={{
                          height: '8px',
                          width: '70%',
                          backgroundColor: '#F1F5F9',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Bottom App Navigation Bar */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderTop: '1px solid #E2E8F0',
                    padding: '8px 12px 14px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#94A3B8' }}>
                    <Home size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 500 }}>Home</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#94A3B8' }}>
                    <FileText size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 500 }}>Health</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#F05A24' }}>
                    <Bell size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 700 }}>Notifications</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#94A3B8' }}>
                    <User size={14} />
                    <span style={{ fontSize: '9px', fontWeight: 500 }}>Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: NOTIFICATION HISTORY & DETAILS (IMAGE 3)                           */}
      {/* ========================================================================= */}
      {viewMode === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              <Home size={15} />
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                padding: 0
              }}
            >
              Notifications
            </button>
            <ChevronRight size={14} color="#94A3B8" />
            <span style={{ color: '#0F172A', fontWeight: 600 }}>Notification History</span>
          </div>

          {/* Title Row */}
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
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}
              >
                Notification History
              </h1>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#64748B',
                  margin: '4px 0 0 0',
                  fontWeight: 400
                }}
              >
                View and manage all sent, scheduled and expired notifications
              </p>
            </div>

            <button
              onClick={() => setViewMode('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#F05A24',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 3px 12px rgba(240, 90, 36, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E04B18')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F05A24')}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Notification</span>
            </button>
          </div>

          {/* Filters Row Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              alignItems: 'center'
            }}
          >
            {/* Date filter */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                Date
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar
                  size={14}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  value={historyDateRange}
                  onChange={(e) => setHistoryDateRange(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 10px 7px 32px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    color: '#0F172A'
                  }}
                />
              </div>
            </div>

            {/* Target Filter */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                Target
              </label>
              <select
                value={historyTargetFilter}
                onChange={(e) => setHistoryTargetFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#0F172A'
                }}
              >
                <option value="ALL">All Targets</option>
                <option value="Cluster A">Cluster A</option>
                <option value="Greenwood Public School">Greenwood Public School</option>
                <option value="Cluster B">Cluster B</option>
                <option value="All Students">All Students</option>
                <option value="Oakridge Academy">Oakridge Academy</option>
                <option value="Cluster C">Cluster C</option>
                <option value="Riverside International">Riverside International</option>
                <option value="All Schools">All Schools</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                Type
              </label>
              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#0F172A'
                }}
              >
                <option value="ALL">All Types</option>
                <option value="Monthly Assessment">Monthly Assessment</option>
                <option value="Health Check">Health Check</option>
                <option value="General Update">General Update</option>
                <option value="Health Campaign">Health Campaign</option>
                <option value="Important Update">Important Update</option>
                <option value="Report">Report</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                Status
              </label>
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  color: '#0F172A'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Sent">Sent</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* 2-Column Layout: Table (Left/Center) & Notification Details Panel (Right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(340px, 1fr)',
              gap: '20px',
              alignItems: 'start'
            }}
          >
            {/* History Table Container */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}
            >
              <div style={{ overflowX: 'auto', border: '1px solid #F1F5F9', borderRadius: '8px' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    minWidth: '680px'
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Title ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Target ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Type ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Sent / Scheduled Date ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Recipients ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Status ↕
                      </th>
                      <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: '#475569', textAlign: 'center' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyList.slice(0, 8).map((item) => {
                      const isSelected = selectedNotificationId === item.id;
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedNotificationId(item.id)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: isSelected ? '#FFFBF8' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* Title */}
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', fontWeight: 600, color: '#0F172A' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: '#FFF7ED',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Bell size={13} color="#EA580C" />
                              </div>
                              <span>{item.title}</span>
                            </div>
                          </td>

                          {/* Target */}
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>
                            {item.target}
                          </td>

                          {/* Type */}
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>
                            {item.type}
                          </td>

                          {/* Sent / Scheduled Date */}
                          <td style={{ padding: '10px 14px', fontSize: '12px', color: '#475569' }}>
                            <div>{item.scheduledDate}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{item.scheduledTime}</div>
                          </td>

                          {/* Recipients */}
                          <td style={{ padding: '10px 14px', fontSize: '12.5px', color: '#0F172A', fontWeight: 600 }}>
                            {item.recipients.toLocaleString()}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '10px 14px' }}>
                            {item.status === 'Scheduled' && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#FFEDD5',
                                  color: '#EA580C',
                                  padding: '3px 10px',
                                  borderRadius: '10px'
                                }}
                              >
                                Scheduled
                              </span>
                            )}
                            {item.status === 'Sent' && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#DCFCE7',
                                  color: '#16A34A',
                                  padding: '3px 10px',
                                  borderRadius: '10px'
                                }}
                              >
                                Sent
                              </span>
                            )}
                            {item.status === 'Expired' && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626',
                                  padding: '3px 10px',
                                  borderRadius: '10px'
                                }}
                              >
                                Expired
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNotificationId(item.id);
                                }}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#475569'
                                }}
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNotificationId(item.id);
                                }}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  border: '1px solid #E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  color: '#475569'
                                }}
                              >
                                <MoreHorizontal size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px'
                }}
              >
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Showing 1-{Math.min(6, historyList.length)} of {historyList.length} notifications
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#94A3B8'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: '#F05A24',
                      color: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    1
                  </button>
                  <button
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#94A3B8'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Notification Details Drawer / Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              {/* Header with Title and Close X */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #F1F5F9'
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Notification Details
                </h3>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '6px'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status & Category Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#FFF7ED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bell size={14} color="#EA580C" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {selectedNotification.category || 'General Information'}
                  </span>
                </div>

                {selectedNotification.status === 'Sent' && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      padding: '3px 12px',
                      borderRadius: '12px'
                    }}
                  >
                    Sent
                  </span>
                )}
                {selectedNotification.status === 'Scheduled' && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#FFEDD5',
                      color: '#EA580C',
                      padding: '3px 12px',
                      borderRadius: '12px'
                    }}
                  >
                    Scheduled
                  </span>
                )}
                {selectedNotification.status === 'Expired' && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      padding: '3px 12px',
                      borderRadius: '12px'
                    }}
                  >
                    Expired
                  </span>
                )}
              </div>

              {/* Notification Main Subject & Timestamp */}
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {selectedNotification.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                  Sent on {selectedNotification.scheduledDate} at {selectedNotification.scheduledTime}
                </p>
              </div>

              {/* Section 1: Message */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '12.5px' }}>
                  <FileText size={15} color="#F05A24" />
                  <span>Message</span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedNotification.message}
                </div>
              </div>

              {/* Section 2: Target */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '12.5px' }}>
                  <Users size={15} color="#F05A24" />
                  <span>Target</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Target Type</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.targetType || 'Specific School'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Target</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.target}
                  </span>
                </div>
              </div>

              {/* Section 3: Recipients */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '12.5px' }}>
                  <Users size={15} color="#F05A24" />
                  <span>Recipients</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Total Recipients</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.recipients.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Delivered</span>
                  <span style={{ fontWeight: 600, color: '#16A34A' }}>
                    {selectedNotification.delivered.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Failed</span>
                  <span style={{ fontWeight: 600, color: selectedNotification.failed > 0 ? '#DC2626' : '#64748B' }}>
                    {selectedNotification.failed.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Section 4: Additional Details */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #F1F5F9',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F172A', fontWeight: 700, fontSize: '12.5px' }}>
                  <FileText size={15} color="#F05A24" />
                  <span>Additional Details</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Type</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{selectedNotification.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Created By</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.createdBy || 'Karthikeyan (Administrator)'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Created Date</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.createdDate || '25 Sep 2026, 04:15 PM'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748B' }}>Scheduled Date</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>
                    {selectedNotification.scheduledDate}, {selectedNotification.scheduledTime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#64748B' }}>Status</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor:
                        selectedNotification.status === 'Sent'
                          ? '#DCFCE7'
                          : selectedNotification.status === 'Scheduled'
                          ? '#FFEDD5'
                          : '#FEE2E2',
                      color:
                        selectedNotification.status === 'Sent'
                          ? '#16A34A'
                          : selectedNotification.status === 'Scheduled'
                          ? '#EA580C'
                          : '#DC2626',
                      padding: '2px 10px',
                      borderRadius: '10px'
                    }}
                  >
                    {selectedNotification.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
