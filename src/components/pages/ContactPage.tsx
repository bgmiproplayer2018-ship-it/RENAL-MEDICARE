import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { CompanySettings } from '../../types.ts';
import { apiFetch } from '../../lib/apiFallback.ts';

interface ContactPageProps {
  settings?: CompanySettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const phone = settings?.phone || '9069645840';
  const altPhone = settings?.alternatePhone || '7522805397';
  const email = settings?.email || 'renalhealthcare01@gmail.com';
  const whatsapp = settings?.whatsapp || '9069645840';
  const address = settings?.address || (() => {
    try {
      const raw = localStorage.getItem('rm_settings');
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.address) return p.address;
      }
    } catch {}
    return 'Renal Medicare Kidney Care Hub, Institutional Medical Area, New Delhi - 110049';
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim(),
          subject: formData.subject.trim() || 'General Inquiry',
          message: formData.message.trim(),
          type: 'general',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitStatus({
          success: true,
          message: 'Thank you for reaching out. Your message has been safely recorded in our care system. We will contact you shortly.',
          refId: data.contact?.id,
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || 'Failed to submit inquiry. Please try again or call us.',
        });
      }
    } catch {
      setSubmitStatus({
        success: false,
        message: 'Network error connecting to server. Please call our 24/7 hotline directly.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-8">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50/50 p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-blue-100/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#005BBD]/10 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
            24x7 Patient Support
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Contact <span className="text-[#005BBD]">Renal Medicare</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-2xl">
            Whether you need urgent dialysis admission, second opinion on kidney transplant, or scheduling an at-home dialysis evaluation—our dedicated clinical coordination team is ready 24 hours a day.
          </p>
        </div>
      </section>

      {/* Main Grid: Info Cards + Contact Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          
          {/* Left Column: Direct Helplines & Location */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            {/* 24x7 Emergency Card */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-red-600 text-white shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-200">
                <ShieldAlert className="w-4 h-4 text-white animate-pulse shrink-0" />
                <span>24x7 Emergency Dialysis SOS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">Urgent Dialysis or ICU Admission</h3>
              <p className="text-xs text-red-100 leading-relaxed">
                For acute kidney failure, pulmonary fluid overload, hyperkalemia, or catheter emergency.
              </p>
              <a
                href={`tel:${phone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-red-700 font-black text-xs sm:text-sm shadow hover:bg-red-50 transition-colors text-center"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call Emergency: +91 {phone}</span>
              </a>
            </div>

            {/* General Contact Info Cards */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-5 sm:space-y-6">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg border-b border-slate-100 pb-3">
                Official Contact Information
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005BBD] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Primary Phone</span>
                    <a href={`tel:${phone}`} className="font-bold text-slate-900 hover:text-[#005BBD]">
                      +91 {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005BBD] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Alternate Phone</span>
                    <a href={`tel:${altPhone}`} className="font-bold text-slate-900 hover:text-[#005BBD]">
                      +91 {altPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Official WhatsApp</span>
                    <a 
                      href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent('Hello Renal Healthcare, I would like to know more about dialysis services.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-600 hover:underline block"
                    >
                      +91 {whatsapp} (Instant Chat)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#005BBD] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Email Address</span>
                    <a href={`mailto:${email}`} className="font-semibold text-slate-700 hover:text-[#005BBD] break-all">
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Center Address</span>
                    <span className="text-slate-700 text-xs leading-relaxed block">{address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Working Hours</span>
                    <span className="text-slate-700 text-xs">24 Hours / 7 Days a Week (All Dialysis Shifts)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl space-y-5 sm:space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Send an Inquiry or Message</h3>
                <p className="text-xs text-slate-500">
                  Fill out your details below. Our healthcare coordinator will get back to you promptly.
                </p>
              </div>

              {submitStatus && (
                <div
                  className={`p-4 rounded-2xl border text-xs ${
                    submitStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <p className="font-bold">{submitStatus.message}</p>
                  {submitStatus.refId && (
                    <p className="mt-1 font-semibold text-emerald-900">
                      Inquiry Reference ID: {submitStatus.refId}
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anjali Sharma"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9069645840"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. anjali@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Subject / Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Home Dialysis Pricing Inquiry"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Your Message or Medical Query *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about the patient's current dialysis needs, hospital preference, or questions..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Location Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Find Our Main Center</h3>
              <p className="text-xs text-slate-500">Renal Medicare Institutional Hub &bull; New Delhi</p>
            </div>
            <a
              href="https://maps.google.com/?q=New+Delhi+India"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-[#005BBD] font-bold text-xs hover:bg-blue-100 transition-colors text-center"
            >
              <span>Open in Google Maps App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 relative">
            <iframe
              title="Renal Medicare Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src="https://maps.google.com/maps?q=New%20Delhi&t=&z=12&ie=UTF8&iwloc=&output=embed"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};
