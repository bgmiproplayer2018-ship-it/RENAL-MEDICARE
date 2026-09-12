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
  Code
} from 'lucide-react';
import { Appointment, Hospital, ServiceItem, BlogPost, ContactMessage, CompanySettings } from '../../types.ts';
import { RenalLogo } from '../common/RenalLogo.tsx';

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
    companyName: 'Renal Medicity',
    tagline: 'Caring For Kidney Health',
    phone: '9069645840',
    alternatePhone: '7522805397',
    email: 'renalhealthcare01@gmail.com',
    whatsapp: '9069645840',
    primaryColor: '#005BBD',
    secondaryColor: '#4FA9FF',
    accentColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
    address: 'Renal Medicity Kidney Care Hub, Institutional Medical Area, New Delhi - 110049'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

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

  // Fetch appointments & inquiries on load
  useEffect(() => {
    fetchAppointments();
    fetchInquiries();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments', {
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
      const res = await fetch('/api/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(data.contacts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Appointment Status update
  const handleUpdateStatus = async (id: string, newStatus: Appointment['status'], extra?: any) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, ...extra })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a.id === id ? data.appointment : a));
        if (rescheduleModalApp) setRescheduleModalApp(null);
      }
    } catch (e) {
      alert('Error updating appointment status');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment record?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, {
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
      const res = await fetch(url, {
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
      const res = await fetch(`/api/hospitals/${id}`, {
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
      const res = await fetch(url, {
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
      const res = await fetch(`/api/services/${id}`, {
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
      const res = await fetch('/api/settings', {
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
      const res = await fetch(`/api/contact/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.map(i => i.id === id ? data.contact : i));
      }
    } catch {
      alert('Error updating inquiry status');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.filter(i => i.id !== id));
      }
    } catch {
      alert('Error deleting inquiry');
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSearch = 
      a.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.phone.includes(searchFilter) ||
      a.hospitalId.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Admin Header */}
      <div className="bg-[#002B5C] text-white px-4 sm:px-8 py-3.5 border-b border-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-lg shadow-xs">
            <RenalLogo size="sm" showTagline={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Renal Medicity Management Console</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                PROD READY &bull; MONGODB SCHEMA
              </span>
            </div>
            <span className="text-xs text-blue-200">Logged in as {adminUser.name} ({adminUser.role})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchAppointments(); fetchInquiries(); }}
            className="p-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-100 text-xs flex items-center gap-1 cursor-pointer"
            title="Refresh Registry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          {[
            { id: 'appointments', label: `Appointments (${appointments.length})`, icon: <Calendar className="w-4 h-4" /> },
            { id: 'hospitals', label: `Hospitals (${hospitals.length})`, icon: <Building className="w-4 h-4" /> },
            { id: 'services', label: `Services & Pricing (${services.length})`, icon: <Briefcase className="w-4 h-4" /> },
            { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'settings', label: 'Company & Contact Settings', icon: <Settings className="w-4 h-4" /> },
            { id: 'deployment', label: 'Deployment Setup Guides', icon: <Server className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
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
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Search by ID, Name, Phone, Center..."
                    className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 w-64 focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
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
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
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
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {app.status !== 'Accepted' && app.status !== 'Completed' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                                  title="Accept Appointment"
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold cursor-pointer"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}

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

                              {app.status === 'Accepted' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Completed')}
                                  title="Mark as Completed"
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005BBD] font-bold cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}

                              {app.status !== 'Rejected' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                                  title="Reject"
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Network &amp; Dialysis Units</h3>
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
                className="px-4 py-2 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hospital Center</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hospitals.map(h => (
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Services &amp; Pricing Management</h3>
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
                className="px-4 py-2 rounded-xl bg-[#005BBD] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(s => (
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
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No inquiries received yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map(inq => (
                      <tr key={inq.id} className={inq.isRead ? 'bg-white' : 'bg-blue-50/30 font-semibold'}>
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
                          {inq.createdAt.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inq.isRead ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800'}`}>
                            {inq.isRead ? 'Read' : 'New'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!inq.isRead && (
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
                    ))
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
                Renal Medicity is designed with a full-stack architecture (Vite + React 19 Frontend with Express Node.js Backend and MongoDB Atlas Mongoose database models). Follow the guides below for seamless one-click hosting:
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
                <span className="px-2.5 py-1 rounded bg-teal-600 text-white text-[11px] font-bold">Netlify SPA</span>
                <h4 className="font-bold text-slate-900 text-base">Static Frontend &amp; Redirects</h4>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>Connect Git repo to Netlify.</li>
                  <li>Publish directory: <code>dist</code></li>
                  <li>Build command: <code>npm run build</code></li>
                  <li>Vite SPA fallback configured for clean route history.</li>
                </ol>
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
    </div>
  );
};
