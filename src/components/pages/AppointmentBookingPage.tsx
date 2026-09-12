import React, { useState } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Building, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Hospital, ServiceItem, Appointment, CompanySettings } from '../../types.ts';

interface AppointmentBookingPageProps {
  hospitals: Hospital[];
  services: ServiceItem[];
  preselectedService?: string;
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const AppointmentBookingPage: React.FC<AppointmentBookingPageProps> = ({
  hospitals,
  services,
  preselectedService,
  onNavigate,
  settings,
}) => {
  const initialHospital = preselectedService?.startsWith('Hospital: ')
    ? preselectedService.replace('Hospital: ', '')
    : hospitals[0]?.name || 'Renal Medicity Care Suite - Apollo Spectra';

  const initialService = preselectedService && !preselectedService.startsWith('Hospital: ')
    ? preselectedService
    : services[0]?.title || 'Hemodialysis';

  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    hospitalId: initialHospital,
    serviceType: initialService,
    preferredDate: '',
    timeSlot: 'Morning (07:00 AM - 11:00 AM)',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const phone = settings?.phone || '9069645840';

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.patientName.trim()) err.patientName = 'Patient full name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) err.phone = 'Valid 10-digit mobile number is required';
    if (!formData.preferredDate) err.preferredDate = 'Please select a preferred date';
    if (!formData.timeSlot) err.timeSlot = 'Please select a time slot';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: formData.patientName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          age: formData.age ? Number(formData.age) : undefined,
          gender: formData.gender,
          hospitalId: formData.hospitalId,
          serviceType: formData.serviceType,
          preferredDate: formData.preferredDate,
          timeSlot: formData.timeSlot,
          address: formData.address.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmedAppointment(data.appointment);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrors({ submit: data.error || 'Failed to submit appointment. Please try again.' });
      }
    } catch {
      setErrors({ submit: 'Network error connecting to server. Please try again or call our hotline.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedAppointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-[#16A34A] rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] bg-emerald-50 px-3 py-1 rounded-full">
              Appointment Successfully Confirmed
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
              Booking Received!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your appointment request has been logged into Renal Medicity's clinical registry. Our patient coordinator will contact you shortly to confirm room preparation.
            </p>
          </div>

          {/* Appointment Ticket Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-left space-y-4 max-w-lg mx-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Appointment ID</span>
                <span className="text-lg font-black text-[#005BBD]">{confirmedAppointment.id}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {confirmedAppointment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Patient Name:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Contact Mobile:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Service Selected:</span>
                <span className="font-bold text-[#005BBD]">{confirmedAppointment.serviceType}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Center / Facility:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.hospitalId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Scheduled Date:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.preferredDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Time Slot:</span>
                <span className="font-bold text-slate-800">{confirmedAppointment.timeSlot}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('tracking', confirmedAppointment.id)}
              className="px-6 py-3 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setConfirmedAppointment(null);
                setFormData({
                  patientName: '',
                  phone: '',
                  email: '',
                  age: '',
                  gender: 'Male',
                  hospitalId: hospitals[0]?.name || '',
                  serviceType: services[0]?.title || '',
                  preferredDate: '',
                  timeSlot: 'Morning (07:00 AM - 11:00 AM)',
                  address: '',
                  notes: '',
                });
              }}
              className="px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
            >
              Book Another Appointment
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Need immediate changes? Call Dialysis Reception at{' '}
            <a href={`tel:${phone}`} className="text-[#005BBD] font-bold hover:underline">
              +91 {phone}
            </a>
          </p>
        </div>
      </div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
          Direct Hospital &amp; Home Booking
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Book Your Dialysis &amp; Consultation Session
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Fast, transparent booking with instant database registration and tracking ID generation.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
        {errors.submit && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Patient Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#005BBD]" />
              <span>1. Patient Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumanth Verma"
                  value={formData.patientName}
                  onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    errors.patientName ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-[#005BBD]'
                  }`}
                />
                {errors.patientName && <span className="text-[11px] text-red-500">{errors.patientName}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9069645840"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    errors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-[#005BBD]'
                  }`}
                />
                {errors.phone && <span className="text-[11px] text-red-500">{errors.phone}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 58"
                  value={formData.age}
                  onChange={e => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Service & Center Selection */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#005BBD]" />
              <span>2. Service &amp; Hospital Center</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Select Service Type *</label>
                <select
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none font-semibold text-slate-800"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.price})
                    </option>
                  ))}
                  <option value="General Kidney Checkup">General Kidney Checkup</option>
                  <option value="AV Fistula Ultrasound Assessment">AV Fistula Ultrasound Assessment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hospital Center or Home *</label>
                <select
                  value={formData.hospitalId}
                  onChange={e => setFormData({ ...formData, hospitalId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none font-semibold text-slate-800"
                >
                  <option value="At-Home Dialysis Service (Doorstep Delivery)">
                    🏡 At-Home Dialysis Service (Doorstep Delivery)
                  </option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.name}>
                      🏥 {h.name} - {h.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Date & Time Slot */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#005BBD]" />
              <span>3. Schedule Preference</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Date *</label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    errors.preferredDate ? 'border-red-400 bg-red-50/50' : 'border-slate-200 focus:ring-2 focus:ring-[#005BBD]'
                  }`}
                />
                {errors.preferredDate && <span className="text-[11px] text-red-500">{errors.preferredDate}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Time Slot *</label>
                <select
                  value={formData.timeSlot}
                  onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                >
                  <option value="Morning (07:00 AM - 11:00 AM)">Morning Slot (07:00 AM - 11:00 AM)</option>
                  <option value="Afternoon (11:30 AM - 03:30 PM)">Afternoon Slot (11:30 AM - 03:30 PM)</option>
                  <option value="Evening (04:00 PM - 08:00 PM)">Evening Slot (04:00 PM - 08:00 PM)</option>
                  <option value="Nocturnal / Night Dialysis">Nocturnal / Night Dialysis (Overnight)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Address / City Locality</label>
              <input
                type="text"
                placeholder="Required for Home Dialysis or Ambulance coordination"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Medical Notes / Dialysis History</label>
              <textarea
                rows={3}
                placeholder="Mention primary diagnosis, dry weight, allergies, or previous dialysis history..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            id="submit-appointment-form-btn"
          >
            <Calendar className="w-5 h-5 text-cyan-200" />
            <span>{isSubmitting ? 'Registering Appointment in Database...' : 'Confirm & Save Appointment'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            Encrypted &amp; Stored in Database
          </span>
          <a href={`tel:${phone}`} className="text-[#005BBD] font-bold hover:underline">
            Need urgent assistance? Call {phone}
          </a>
        </div>
      </div>
    </div>
  );
};
