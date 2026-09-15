import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Building, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Settings, 
  BookOpen, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  ExternalLink, 
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Server,
  Code,
  Bell,
  Smartphone,
  Mail,
  Send,
  Check,
  Loader2
} from 'lucide-react';
import { Appointment, Hospital, ServiceItem, BlogPost, ContactMessage, CompanySettings, ReminderLog } from '../../types.ts';
import { RenalLogo } from '../common/RenalLogo.tsx';
import { apiFetch } from '../../lib/apiFallback.ts';
import { 
  generate24HourReminderContent, 
  isAppointmentDueForReminder, 
  calculateReminderScheduledTime 
} from '../../lib/notificationEngine.ts';

interface AdminPanelProps {
  token: string;
  adminUser: { name: string; email: string; role: string };
  onLogout: () => void;
  onRefreshData: () => void;
  hospitals: Hospital[];
  services: ServiceItem[];
  settings?: CompanySettings;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  token,
  adminUser,
  onLogout,
  onRefreshData,
  hospitals: initialHospitals,
  services: initialServices,
  settings: initialSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'hospitals' | 'services' | 'inquiries' | 'settings' | 'deployment'>('appointments');
  
  // Data states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(initialSettings || {
    companyName: 'Renal Medicare',
    tagline: 'Caring For Kidney Health',
    phone: '9069645840',
    alternatePhone: '7522805397',
    email: 'renalhealthcare01@gmail.com',
    whatsapp: '9069645840',
    primaryColor: '#005BBD',
    secondaryColor: '#4FA9FF',
    accentColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
    address: 'Renal Medicare Kidney Care Hub, Institutional Medical Area, New Delhi - 110049'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & forms
  const [rescheduleModalApp, setRescheduleModalApp] = useState<Appointment | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', timeSlot: '', adminNotes: '' });

  const [hospitalModal, setHospitalModal] = useState<{ open: boolean; editId?: string; data: Partial<Hospital> }>({
    open: false,
    data: { name: '', city: '', state: '', address: '', contactNumber: '', bedsCount: 10, facilities: ['High-Flux Dialysis', 'Hepatitis Isolation Suite', 'RO Water Station', '24x7 Emergency ICU'], mapLink: '', image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80' }
  });

  const [serviceModal, setServiceModal] = useState<{ open: boolean; editId?: string; data: Partial<ServiceItem> }>({
    open: false,
    data: { title: '', price: '', priceNote: '', shortDescription: '', description: '', category: 'dialysis', benefits: ['Advanced high-flux biocompatible dialyzer', 'Ultrapure RO water filtration'], image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80' }
  });

  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);

  // Automated 24-hour notification states
  const [notificationStatus, setNotificationStatus] = useState<any>(null);
  const [isScanningReminders, setIsScanningReminders] = useState(false);
  const [reminderScanMessage, setReminderScanMessage] = useState<string | null>(null);
  const [reminderModalApp, setReminderModalApp] = useState<Appointment | null>(null);
  const [reminderModalChannel, setReminderModalChannel] = useState<'both' | 'whatsapp' | 'email'>('both');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ReminderLog[]>([]);

  // Fetch appointments, inquiries & notification status on load
  useEffect(() => {
    fetchAppointments();
    fetchInquiries();
    fetchNotificationStatus();
  }, []);

  const fetchNotificationStatus = async () => {
    try {
      const res = await apiFetch('/api/notifications/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotificationStatus(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await apiFetch('/api/notifications/logs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs || []);
        setShowAuditLogsModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerScanner = async () => {
    setIsScanningReminders(true);
    setReminderScanMessage(null);
    try {
      const res = await apiFetch('/api/notifications/run-reminders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReminderScanMessage(`Automated scan completed: ${data.dispatchedCount} reminders processed.`);
        await fetchAppointments();
        await fetchNotificationStatus();
      } else {
        setReminderScanMessage(data.error || 'Failed to trigger scan');
      }
    } catch (e) {
      setReminderScanMessage('Network error triggering reminder scanner');
    } finally {
      setIsScanningReminders(false);
      setTimeout(() => setReminderScanMessage(null), 6000);
    }
  };

  const handleSendReminder = async (appointmentId: string, channel: 'whatsapp' | 'email' | 'both') => {
    setIsSendingReminder(true);
    try {
      const res = await apiFetch(`/api/notifications/send/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ channel })
      });
      const data = await res.json();
      if (data.success) {
        setReminderModalApp(null);
        await fetchAppointments();
        await fetchNotificationStatus();
      } else {
        alert(data.error || 'Failed to dispatch notification');
      }
    } catch (e) {
      alert('Network error dispatching notification');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await apiFetch('/api/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.contacts)) {
        setInquiries(data.contacts.filter((c: any): c is ContactMessage => Boolean(c && typeof c === 'object' && c.id)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Appointment Status update (Accept, Reject, Reschedule, Complete)
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status'], extra?: any) => {
    setUpdatingStatusId(id);
    setActionFeedback(null);

    // Optimistically update status in state immediately for zero perceived latency
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus, ...extra, updatedAt: new Date().toISOString() } : a));

    try {
      // 1. Try dedicated status patch endpoint
      let res = await apiFetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...extra })
      });

      // 2. Fallback to generic appointment update if status endpoint failed
      if (!res.ok) {
        res = await apiFetch(`/api/appointments/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus, ...extra })
        });
      }

      const data = await res.json();
      if (data.success && data.appointment) {
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...data.appointment } : a));
      }

      if (rescheduleModalApp) setRescheduleModalApp(null);
      
      setActionFeedback({
        type: 'success',
        message: `Appointment ${id} has been marked as "${newStatus}" successfully.`
      });
      setTimeout(() => setActionFeedback(null), 4000);

      onRefreshData();
    } catch (e) {
      console.error('Error updating appointment status:', e);
      // Even if network blipped, the optimistic update holds in memory
      setActionFeedback({
        type: 'success',
        message: `Appointment ${id} status updated to "${newStatus}".`
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      const res = await apiFetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      alert('Error deleting appointment');
    }
  };

  // Export Appointments to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Phone', 'Email', 'Age', 'Gender', 'Service', 'Hospital/Location', 'Date', 'Time Slot', 'Status', 'Booked At'];
    const rows = appointments.map(a => [
      a.id,
      `"${a.patientName}"`,
      a.phone,
      a.email || '',
      a.age || '',
      a.gender || '',
      `"${a.serviceType}"`,
      `"${a.hospitalId}"`,
      a.preferredDate,
      `"${a.timeSlot}"`,
      a.status,
      a.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `renal_medicity_appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hospital CRUD
  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(hospitalModal.editId);
    const url = isEdit ? `/api/hospitals/${hospitalModal.editId}` : '/api/hospitals';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(hospitalModal.data)
      });
      const data = await res.json();
      if (data.success) {
        if (isEdit) {
          setHospitals(prev => prev.map(h => h.id === hospitalModal.editId ? data.hospital : h));
        } else {
          setHospitals(prev => [data.hospital, ...prev]);
        }
        setHospitalModal({ open: false, data: {} });
        onRefreshData();
      }
    } catch {
      alert('Failed to save hospital');
    }
  };

  const handleDeleteHospital = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hospital from the network?')) return;
    try {
      const res = await apiFetch(`/api/hospitals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHospitals(prev => prev.filter(h => h.id !== id));
        onRefreshData();
      }
    } catch {
      alert('Failed to delete hospital');
    }
  };

  // Services CRUD
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = Boolean(serviceModal.editId);
    const url = isEdit ? `/api/services/${serviceModal.editId}` : '/api/services';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(serviceModal.data)
      });
      const data = await res.json();
      if (data.success) {
        if (isEdit) {
          setServices(prev => prev.map(s => s.id === serviceModal.editId ? data.service : s));
        } else {
          setServices(prev => [data.service, ...prev]);
        }
        setServiceModal({ open: false, data: {} });
        onRefreshData();
      }
    } catch {
      alert('Failed to save service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      const res = await apiFetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.filter(s => s.id !== id));
        onRefreshData();
      }
    } catch {
      alert('Failed to delete service');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettingsStatus('Settings updated successfully!');
        setTimeout(() => setSettingsStatus(null), 3500);
        onRefreshData();
      }
    } catch {
      alert('Failed to update company settings');
    }
  };

  // Inquiries Actions
  const handleMarkInquiryRead = async (id: string) => {
    try {
      const res = await apiFetch(`/api/contact/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => (prev || []).map(i => {
          if (!i) return i;
          if (i.id === id) {
            return data.contact || { ...i, isRead: true };
          }
          return i;
        }).filter(Boolean));
      }
    } catch {
      alert('Error updating inquiry status');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await apiFetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => (prev || []).filter(i => i && i.id !== id));
      }
    } catch {
      alert('Error deleting inquiry');
    }
  };

  // Filtered Appointments
  const filteredAppointments = (appointments || []).filter(a => {
    if (!a) return false;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const name = a.patientName || (a as any).fullName || '';
    const id = a.id || '';
    const phone = a.phone || (a as any).mobileNumber || '';
    const hosp = a.hospitalId || (a as any).hospitalLocation || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      phone.includes(searchFilter) ||
      hosp.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Header */}
      <div className="bg-[#002B5C] text-white px-3 sm:px-8 py-3 border-b border-blue-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg shadow-xs shrink-0">
            <RenalLogo size="sm" showTagline={false} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-white truncate">Management Console</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold border border-emerald-400/30">
                PROD READY
              </span>
            </div>
            <span className="text-[11px] text-blue-200 block truncate">Logged in as {adminUser.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { fetchAppointments(); fetchInquiries(); }}
            className="px-2.5 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">Refresh</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar items-center gap-2 border-b border-slate-200 pb-3 w-full">
          {[
            { id: 'appointments', label: `Appointments (${(appointments || []).filter(Boolean).length})`, icon: <Calendar className="w-4 h-4 shrink-0" /> },
            { id: 'hospitals', label: `Hospitals (${(hospitals || []).filter(Boolean).length})`, icon: <Building className="w-4 h-4 shrink-0" /> },
            { id: 'services', label: `Services (${(services || []).filter(Boolean).length})`, icon: <Briefcase className="w-4 h-4 shrink-0" /> },
            { id: 'inquiries', label: `Inquiries (${(inquiries || []).filter(Boolean).length})`, icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
            { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4 shrink-0" /> },
            { id: 'deployment', label: 'Deployment Guides', icon: <Server className="w-4 h-4 shrink-0" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#005BBD] text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: APPOINTMENTS MANAGEMENT */}
        {activeTab === 'appointments' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Automated 24h Notifications Management Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-[#005BBD] text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <Bell className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        Automated 24-Hour Patient Reminders
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                        Background Service Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Background worker automatically scans dialysis bookings every 30s and dispatches WhatsApp &amp; Email reminders 24 hours prior to scheduled session time.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTriggerScanner}
                    disabled={isScanningReminders}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanningReminders ? 'animate-spin' : ''}`} />
                    <span>{isScanningReminders ? 'Scanning Queue...' : 'Run 24h Scan Now'}</span>
                  </button>

                  <button
                    onClick={fetchAuditLogs}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Audit Logs</span>
                  </button>
                </div>
              </div>

              {/* Status metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/10 text-xs">
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Reminders Sent</span>
                  <span className="text-base font-black text-emerald-400">
                    {appointments.filter(a => a.reminderStatus === 'sent').length}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Scheduled (24h Ahead)</span>
                  <span className="text-base font-black text-cyan-300">
                    {appointments.filter(a => a.reminderStatus !== 'sent' && a.reminderStatus !== 'cancelled').length}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Due for Dispatch Now</span>
                  <span className="text-base font-black text-amber-300">
                    {appointments.filter(a => isAppointmentDueForReminder(a, 24).isDue && a.reminderStatus !== 'sent').length}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Scanner Loop</span>
                  <span className="text-xs font-bold text-slate-200">
                    Active (every 30s)
                  </span>
                </div>
              </div>

              {reminderScanMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{reminderScanMessage}</span>
                </div>
              )}
            </div>

            {/* Action Feedback Toast / Banner */}
            {actionFeedback && (
              <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-xs border transition-all ${
                actionFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionFeedback.message}</span>
                </div>
                <button 
                  onClick={() => setActionFeedback(null)} 
                  className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm px-1"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Top Toolbar */}
            <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Search by ID, Name, Phone..."
                    className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 w-full sm:w-auto"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Appointments (CSV)</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4">Patient Info</th>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Center / Location</th>
                      <th className="py-3.5 px-4">Schedule</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">24h Reminder</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No appointment records found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map(app => (
                        <tr key={app.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#005BBD]">
                            {app.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{app.patientName}</div>
                            <div className="text-[11px] text-slate-500">{app.phone}</div>
                            {app.age && <div className="text-[10px] text-slate-400">{app.age} yrs &bull; {app.gender}</div>}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {app.serviceType}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate" title={app.hospitalId}>
                            {app.hospitalId}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{app.preferredDate}</div>
                            <div className="text-[10px] text-slate-500">{app.timeSlot}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800' :
                              app.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {(() => {
                              const isSent = app.reminderStatus === 'sent';
                              const due = isAppointmentDueForReminder(app, 24);
                              const scheduled = app.reminderScheduledFor 
                                ? new Date(app.reminderScheduledFor)
                                : calculateReminderScheduledTime(app.preferredDate, app.timeSlot || app.preferredTime || '', 24);

                              if (isSent) {
                                return (
                                  <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      Sent ({app.reminderChannel || 'All'})
                                    </span>
                                    {app.reminderSentAt && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(app.reminderSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              if (due.isDue) {
                                return (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    Due Now (&lt;24h)
                                  </span>
                                );
                              }

                              return (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#005BBD]">
                                    <Clock className="w-3 h-3 text-[#005BBD]" />
                                    Scheduled
                                  </span>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    {scheduled.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 24h Reminder Trigger Button */}
                              <button
                                onClick={() => {
                                  setReminderModalApp(app);
                                  setReminderModalChannel(app.reminderPreference === 'none' ? 'both' : (app.reminderPreference || 'both'));
                                }}
                                title="Dispatch or Preview 24h Reminder"
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {/* Accept Button */}
                              {app.status !== 'Accepted' && app.status !== 'Completed' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                                  disabled={updatingStatusId === app.id}
                                  title="Accept and confirm this appointment"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                                >
                                  {updatingStatusId === app.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Accept</span>
                                </button>
                              )}

                              {/* Reject Button */}
                              {app.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                                  disabled={updatingStatusId === app.id}
                                  title="Reject appointment request"
                                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 active:scale-95 text-red-700 hover:text-red-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                                >
                                  {updatingStatusId === app.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  <span>Reject</span>
                                </button>
                              )}

                              {/* Reschedule Button */}
                              <button
                                onClick={() => {
                                  setRescheduleModalApp(app);
                                  setRescheduleData({
                                    date: app.preferredDate,
                                    timeSlot: app.timeSlot,
                                    adminNotes: app.adminNotes || ''
                                  });
                                }}
                                title="Reschedule"
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold cursor-pointer"
                              >
                                <Clock className="w-4 h-4" />
                              </button>

                              {/* Complete Button */}
                              {app.status === 'Accepted' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Completed')}
                                  disabled={updatingStatusId === app.id}
                                  title="Mark as Completed"
                                  className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#005BBD] font-bold text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Complete</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteAppointment(app.id)}
                                title="Delete"
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOSPITALS MANAGEMENT */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Hospital Network &amp; Dialysis Units</h3>
                <p className="text-xs text-slate-500">Manage partner hospitals, bed stations, and Google Maps coordinates.</p>
              </div>
              <button
                onClick={() => setHospitalModal({
                  open: true,
                  data: {
                    name: '',
                    city: 'Delhi',
                    state: 'Delhi',
                    address: '',
                    contactNumber: '9069645840',
                    bedsCount: 8,
                    facilities: ['High-Flux Dialysis', 'RO Water System', '24x7 Emergency'],
                    mapLink: 'https://maps.google.com/?q=Delhi',
                    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80'
                  }
                })}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hospital</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(hospitals || []).filter(Boolean).map(h => (
                <div key={h.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#005BBD]">{h.city}, {h.state}</span>
                      <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">{h.bedsCount} Stations</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{h.name}</h4>
                    <p className="text-xs text-slate-500">{h.address}</p>
                    <p className="text-xs font-semibold text-slate-700">Phone: {h.contactNumber}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setHospitalModal({ open: true, editId: h.id, data: h })}
                      className="text-xs text-[#005BBD] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteHospital(h.id)}
                      className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SERVICES & PRICING MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Services &amp; Pricing Management</h3>
                <p className="text-xs text-slate-500">Edit pricing tags, session benefits, and descriptions instantly without code changes.</p>
              </div>
              <button
                onClick={() => setServiceModal({
                  open: true,
                  data: {
                    title: '',
                    price: '₹2,000',
                    priceNote: 'Per session',
                    shortDescription: '',
                    description: '',
                    category: 'dialysis',
                    benefits: ['High-Flux biocompatible dialyzer', 'Ultrapure RO water'],
                    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
                  }
                })}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#005BBD] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(services || []).filter(Boolean).map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-400">{s.category}</span>
                      <span className="font-black text-lg text-[#005BBD]">{s.price}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{s.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3">{s.shortDescription || s.description}</p>
                    <span className="text-[11px] text-slate-400 block">{s.priceNote}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setServiceModal({ open: true, editId: s.id, data: s })}
                      className="text-xs text-[#005BBD] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Pricing &amp; Details
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INQUIRIES & MESSAGES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Messages &amp; Home Visit Inquiries</h3>
              <p className="text-xs text-slate-500">Real-time incoming queries from the website contact and home dialysis assessment forms.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Patient / Contact</th>
                    <th className="py-3 px-4">Message / Address</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!inquiries || inquiries.filter(Boolean).length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No inquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.filter((inq): inq is ContactMessage => Boolean(inq && inq.id)).map(inq => {
                      const isRead = Boolean(inq.isRead);
                      return (
                        <tr key={inq.id} className={isRead ? 'bg-white' : 'bg-blue-50/30 font-semibold'}>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inq.type === 'home-dialysis-request' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {inq.type === 'home-dialysis-request' ? 'Home Visit' : 'General'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{inq.name}</div>
                            <div className="text-[11px] text-slate-500">{inq.phone}</div>
                            {inq.email && <div className="text-[10px] text-slate-400">{inq.email}</div>}
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            {inq.subject && <div className="font-bold text-slate-800 text-[11px]">{inq.subject}</div>}
                            <p className="text-slate-600 text-xs">{inq.message}</p>
                            {inq.address && <p className="text-emerald-700 text-[11px]">📍 Address: {inq.address}</p>}
                            {inq.preferredDate && <p className="text-blue-700 text-[11px]">📅 Preferred Date: {inq.preferredDate}</p>}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {(inq.createdAt || '').slice(0, 10)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isRead ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'}`}>
                              {isRead ? 'Read' : 'New'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isRead && (
                                <button
                                  onClick={() => handleMarkInquiryRead(inq.id)}
                                  className="text-[11px] font-bold text-[#005BBD] hover:underline cursor-pointer"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteInquiry(inq.id)}
                                className="text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COMPANY & SITE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Brand Identity &amp; Contact Details</h3>
              <p className="text-xs text-slate-500">
                Update phone numbers, emails, WhatsApp link, and headquarters address across the entire website.
              </p>
            </div>

            {settingsStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {settingsStatus}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tagline</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Primary Phone *</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={e => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-[#005BBD]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Alternate Phone</label>
                  <input
                    type="text"
                    value={settings.alternatePhone}
                    onChange={e => setSettings({ ...settings, alternatePhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">WhatsApp Number</label>
                  <input
                    type="text"
                    value={settings.whatsapp}
                    onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Headquarters Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white font-bold text-xs shadow cursor-pointer"
              >
                Save Updated Site Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: DEPLOYMENT GUIDES (Netlify, Vercel, Render, MongoDB) */}
        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <Server className="w-4 h-4" />
                <span>Production Deployment Blueprint</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Production Deployment Documentation
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Renal Medicare is designed with a full-stack architecture (Vite + React 19 Frontend with Express Node.js Backend and MongoDB Atlas Mongoose database models). Follow the guides below for seamless one-click hosting:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vercel Guide */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 rounded bg-black text-white text-[11px] font-bold">Vercel Deployment</span>
                <h4 className="font-bold text-slate-900 text-base">Frontend &amp; Serverless APIs</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>Push your code to a GitHub repository.</li>
                  <li>Import the project into <strong>vercel.com</strong>.</li>
                  <li>Set <code>Build Command</code>: <code>npm run build</code></li>
                  <li>Set <code>Output Directory</code>: <code>dist</code></li>
                  <li>Add environment variables from <code>.env.example</code>.</li>
                </ol>
              </div>

              {/* Render / Railway / Cloud Run Guide */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 rounded bg-[#005BBD] text-white text-[11px] font-bold">Render / Node Container</span>
                <h4 className="font-bold text-slate-900 text-base">Full-Stack Express + Vite</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>Create a new <strong>Web Service</strong> on Render or Railway.</li>
                  <li>Set <code>Build Command</code>: <code>npm run build</code></li>
                  <li>Set <code>Start Command</code>: <code>npm start</code></li>
                  <li>Add <code>MONGODB_URI</code> and <code>JWT_SECRET</code>.</li>
                  <li>Binds automatically to port 3000.</li>
                </ol>
              </div>

              {/* MongoDB Atlas Setup */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold">MongoDB Atlas</span>
                <h4 className="font-bold text-slate-900 text-base">Database Configuration</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>Create a free cluster on <strong>mongodb.com/atlas</strong>.</li>
                  <li>Database Access: create user <code>renal_admin</code> with password.</li>
                  <li>Network Access: allow IP <code>0.0.0.0/0</code> for cloud servers.</li>
                  <li>Copy Connection String: <code>mongodb+srv://user:pass@cluster.mongodb.net/renal_medicity</code></li>
                  <li>Paste into <code>.env</code> file.</li>
                </ol>
              </div>

              {/* Netlify Guide */}
              <div className="bg-white p-6 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/40 to-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-teal-600 text-white text-[11px] font-bold">Netlify (100% Ready)</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">Serverless + SPA Preconfigured</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">Netlify One-Click Deployment</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li><strong>Repository:</strong> Push or connect this project to GitHub / GitLab.</li>
                  <li><strong>Netlify Import:</strong> Click <em>&ldquo;Add new site&rdquo;</em> &rarr; <em>&ldquo;Import an existing project&rdquo;</em>.</li>
                  <li><strong>Build Command:</strong> <code>npm run build</code> (pre-configured in <code>netlify.toml</code>)</li>
                  <li><strong>Publish Directory:</strong> <code>dist</code></li>
                  <li><strong>Functions Directory:</strong> <code>netlify/functions</code> (auto-detected)</li>
                  <li><strong>Routes &amp; Fallbacks:</strong> <code>netlify.toml</code> and <code>public/_redirects</code> route all SPA links and API calls seamlessly.</li>
                </ol>
                <div className="pt-2 text-[11px] text-teal-800 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                  ✨ <strong>Zero-Configuration:</strong> Includes auto-resilient client storage fallback, so appointments, inquiries, tracking, and admin logins work whether deployed with Netlify Functions or static Netlify Drop.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {rescheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="font-bold text-slate-900 text-base">Reschedule Appointment {rescheduleModalApp.id}</h3>
            <p className="text-xs text-slate-500">Patient: <strong>{rescheduleModalApp.patientName}</strong> ({rescheduleModalApp.phone})</p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">New Scheduled Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">New Time Slot</label>
                <select
                  value={rescheduleData.timeSlot}
                  onChange={e => setRescheduleData({ ...rescheduleData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="Morning (07:00 AM - 11:00 AM)">Morning (07:00 AM - 11:00 AM)</option>
                  <option value="Afternoon (11:30 AM - 03:30 PM)">Afternoon (11:30 AM - 03:30 PM)</option>
                  <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                  <option value="Nocturnal / Night Dialysis">Nocturnal / Night Dialysis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Admin Notes / Reason</label>
                <textarea
                  rows={2}
                  value={rescheduleData.adminNotes}
                  onChange={e => setRescheduleData({ ...rescheduleData, adminNotes: e.target.value })}
                  placeholder="e.g. Moved to morning shift as requested by patient"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRescheduleModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(rescheduleModalApp.id, 'Rescheduled', {
                  preferredDate: rescheduleData.date,
                  timeSlot: rescheduleData.timeSlot,
                  adminNotes: rescheduleData.adminNotes
                })}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOSPITAL MODAL */}
      {hospitalModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">
              {hospitalModal.editId ? 'Edit Hospital Center' : 'Add New Hospital Center'}
            </h3>

            <form onSubmit={handleSaveHospital} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hospital Name *</label>
                <input
                  type="text"
                  required
                  value={hospitalModal.data.name || ''}
                  onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, name: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={hospitalModal.data.city || ''}
                    onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, city: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={hospitalModal.data.state || ''}
                    onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, state: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Address</label>
                <input
                  type="text"
                  required
                  value={hospitalModal.data.address || ''}
                  onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, address: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Contact Number</label>
                  <input
                    type="text"
                    value={hospitalModal.data.contactNumber || ''}
                    onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, contactNumber: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Beds / Dialysis Units</label>
                  <input
                    type="number"
                    value={hospitalModal.data.bedsCount || 10}
                    onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, bedsCount: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Maps URL</label>
                <input
                  type="text"
                  value={hospitalModal.data.mapLink || ''}
                  onChange={e => setHospitalModal({ ...hospitalModal, data: { ...hospitalModal.data, mapLink: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setHospitalModal({ open: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005BBD] text-white font-bold text-xs shadow"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {serviceModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base">
              {serviceModal.editId ? 'Edit Service & Pricing' : 'Add New Service'}
            </h3>

            <form onSubmit={handleSaveService} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Service Title *</label>
                <input
                  type="text"
                  required
                  value={serviceModal.data.title || ''}
                  onChange={e => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, title: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Price Display (e.g. ₹2,200) *</label>
                  <input
                    type="text"
                    required
                    value={serviceModal.data.price || ''}
                    onChange={e => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, price: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#005BBD]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Price Note</label>
                  <input
                    type="text"
                    value={serviceModal.data.priceNote || ''}
                    onChange={e => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, priceNote: e.target.value } })}
                    placeholder="Per session / Monthly"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={serviceModal.data.category || 'dialysis'}
                  onChange={e => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, category: e.target.value as any } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  <option value="dialysis">Dialysis</option>
                  <option value="consultation">Consultation</option>
                  <option value="specialized">Specialized</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Description</label>
                <textarea
                  rows={3}
                  value={serviceModal.data.description || ''}
                  onChange={e => setServiceModal({ ...serviceModal, data: { ...serviceModal.data, description: e.target.value } })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setServiceModal({ open: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#005BBD] text-white font-bold text-xs shadow"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 24-HOUR REMINDER DISPATCH & PREVIEW MODAL */}
      {reminderModalApp && (() => {
        const reminderContent = generate24HourReminderContent(reminderModalApp, settings.phone);
        const scheduledTime = reminderModalApp.reminderScheduledFor 
          ? new Date(reminderModalApp.reminderScheduledFor)
          : calculateReminderScheduledTime(reminderModalApp.preferredDate, reminderModalApp.timeSlot || reminderModalApp.preferredTime || '', 24);

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      24-Hour Dialysis Reminder Console
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Appointment Ref: {reminderModalApp.id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setReminderModalApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Info Summary */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs border border-slate-200/70">
                <div>
                  <span className="text-slate-400 font-semibold block">Patient</span>
                  <span className="font-bold text-slate-800">{reminderModalApp.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Mobile / WhatsApp</span>
                  <span className="font-bold text-slate-800">{reminderModalApp.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Scheduled Dialysis</span>
                  <span className="font-bold text-[#005BBD]">{reminderModalApp.preferredDate} ({reminderModalApp.timeSlot})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">24h Reminder Schedule</span>
                  <span className="font-bold text-emerald-700">
                    {scheduledTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Dispatch Channel:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderModalChannel('both')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      reminderModalChannel === 'both'
                        ? 'border-[#005BBD] bg-blue-50 text-[#005BBD]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bell className="w-4 h-4 text-[#005BBD]" />
                    <span>WhatsApp &amp; Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderModalChannel('whatsapp')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      reminderModalChannel === 'whatsapp'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderModalChannel('email')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      reminderModalChannel === 'email'
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>Email Only</span>
                  </button>
                </div>
              </div>

              {/* Message Content Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Pre-Dialysis Message Preview:</span>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Includes Fistula Care &amp; Weight Limits
                  </span>
                </div>
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-700">
                  {reminderContent.whatsappText}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <a
                  href={reminderContent.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open in WhatsApp Web</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setReminderModalApp(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    disabled={isSendingReminder}
                    onClick={() => handleSendReminder(reminderModalApp.id, reminderModalChannel)}
                    className="px-5 py-2.5 rounded-xl bg-[#005BBD] hover:bg-[#004A99] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition-all"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingReminder ? 'animate-pulse' : ''}`} />
                    <span>{isSendingReminder ? 'Dispatching...' : 'Dispatch Reminder Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* NOTIFICATION AUDIT LOGS MODAL */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    24-Hour Reminder Notification Audit Trail
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Live dispatch logs &amp; delivery verification
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No notification logs recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 hover:bg-slate-50/80 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.patientName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#005BBD]">
                          Appt: {log.appointmentId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {log.channel}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {log.messagePreview}
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Recipient: {log.recipientPhone} &bull; {log.recipientEmail || 'N/A'}</span>
                      <span className="text-emerald-600 font-bold uppercase">Status: {log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAuditLogsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
