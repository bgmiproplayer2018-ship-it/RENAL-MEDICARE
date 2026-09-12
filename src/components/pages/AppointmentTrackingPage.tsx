import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle, 
  ShieldCheck, 
  XCircle, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Appointment, CompanySettings } from '../../types.ts';
import { apiFetch } from '../../lib/apiFallback.ts';

interface AppointmentTrackingPageProps {
  initialTrackingId?: string;
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const AppointmentTrackingPage: React.FC<AppointmentTrackingPageProps> = ({
  initialTrackingId = '',
  onNavigate,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialTrackingId);
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phone = settings?.phone || '9069645840';

  useEffect(() => {
    if (initialTrackingId) {
      handleSearch(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleSearch = async (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim();
    if (!q) {
      setErrorMessage('Please enter an Appointment ID or 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSearched(true);

    try {
      const res = await apiFetch(`/api/appointments/track/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
        setErrorMessage(data.error || 'No appointments found with provided details');
      }
    } catch {
      setAppointments([]);
      setErrorMessage('Network error while looking up appointment records');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Accepted &amp; Confirmed</span>;
      case 'Rescheduled':
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Rescheduled</span>;
      case 'Completed':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'Rejected':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
      case 'Pending':
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" /> Pending Review</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
          Patient Live Portal
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Dialysis Appointment
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
          Look up live confirmation status, scheduled times, clinical notes, and nephrologist assignments.
        </p>
      </div>

      {/* Search Bar Box */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3 sm:top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Appointment ID (e.g. RM-2026-0001) or Mobile..."
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-2xl bg-[#005BBD] hover:bg-[#004A99] text-white text-xs sm:text-sm font-bold shadow transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {isLoading ? 'Checking...' : 'Track Appointment'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <span>Example queries: <button type="button" onClick={() => { setSearchQuery('RM-2026-0001'); handleSearch('RM-2026-0001'); }} className="text-[#005BBD] font-bold hover:underline">RM-2026-0001</button> or <button type="button" onClick={() => { setSearchQuery('9811002233'); handleSearch('9811002233'); }} className="text-[#005BBD] font-bold hover:underline">9811002233</button></span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Patient Portal
            </span>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results List */}
      {appointments && appointments.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between">
            <span>Found {appointments.length} Appointment Record(s)</span>
            <button
              onClick={() => handleSearch()}
              className="text-xs text-[#005BBD] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Refresh Status
            </button>
          </h3>

          {appointments.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-lg p-4 sm:p-8 space-y-6"
            >
              {/* Top Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Appointment Reference
                  </span>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-xl font-black text-[#005BBD]">{app.id}</span>
                    <span className="text-xs text-slate-400">&bull; Booked on {app.createdAt.slice(0, 10)}</span>
                  </div>
                </div>

                <div>{getStatusBadge(app.status)}</div>
              </div>

              {/* Progress Stepper */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center relative">
                  <div className="space-y-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold">
                      1
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">Submitted</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        app.status !== 'Pending' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white animate-pulse'
                      }`}
                    >
                      2
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">Review</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        app.status === 'Accepted' || app.status === 'Completed' || app.status === 'Rescheduled'
                          ? 'bg-emerald-500 text-white'
                          : app.status === 'Rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      3
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">Confirmed</span>
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                        app.status === 'Completed' ? 'bg-[#005BBD] text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      4
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 block">Completed</span>
                  </div>
                </div>
              </div>

              {/* Rescheduled Alert Notice */}
              {app.status === 'Rescheduled' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Notice: Appointment Schedule Updated by Hospital Desk
                  </div>
                  <p>
                    Please note your revised session time. Our coordinator has confirmed this slot for you.
                  </p>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Patient Name</span>
                  <span className="font-bold text-slate-800 text-sm">{app.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Mobile</span>
                  <span className="font-bold text-slate-800">{app.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Service Requested</span>
                  <span className="font-bold text-[#005BBD]">{app.serviceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Center / Facility</span>
                  <span className="font-bold text-slate-800">{app.hospitalId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Scheduled Date</span>
                  <span className="font-bold text-slate-800">{app.preferredDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Time Slot</span>
                  <span className="font-bold text-slate-800">{app.timeSlot}</span>
                </div>
              </div>

              {/* Admin / Doctor Notes */}
              {app.adminNotes && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs space-y-1">
                  <span className="font-bold text-[#005BBD] block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Hospital Clinical Desk Instructions:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{app.adminNotes}</p>
                </div>
              )}

              {/* Help & Reception Contact */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Questions regarding this session? Contact our Patient Helpdesk:
                </span>
                <a
                  href={`tel:${phone}`}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call {phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State when searched and no results */}
      {searched && appointments && appointments.length === 0 && !errorMessage && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-800">No appointment records found</h4>
          <p className="text-xs text-slate-500">
            Please check the spelling or verify the phone number used during booking.
          </p>
          <button
            onClick={() => onNavigate('appointment')}
            className="px-5 py-2.5 rounded-xl bg-[#005BBD] text-white text-xs font-bold"
          >
            Book New Appointment
          </button>
        </div>
      )}
    </div>
  );
};
