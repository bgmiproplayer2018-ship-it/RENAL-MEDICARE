import React, { useState } from 'react';
import { 
  Home, 
  ShieldCheck, 
  Droplets, 
  HeartHandshake, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  Send,
  AlertCircle
} from 'lucide-react';
import { CompanySettings } from '../../types.ts';
import { apiFetch } from '../../lib/apiFallback.ts';

interface HomeDialysisPageProps {
  onNavigate: (tab: string) => void;
  settings?: CompanySettings;
}

export const HomeDialysisPage: React.FC<HomeDialysisPageProps> = ({ onNavigate, settings }) => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; refId?: string } | null>(null);

  const phone = settings?.phone || '9069645840';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.mobile,
          address: form.address,
          preferredDate: form.date,
          message: form.message || 'Home Visit Assessment Request',
          type: 'home-dialysis-request'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitResult({
          success: true,
          message: 'Your Home Dialysis visit request has been recorded. Our Senior Home Dialysis Coordinator will contact you within 30 minutes.',
          refId: data.contact?.id
        });
        setForm({ name: '', mobile: '', address: '', date: '', message: '' });
      } else {
        setSubmitResult({
          success: false,
          message: data.error || 'Failed to submit request. Please call us directly.'
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: 'Network error. Please try again or call our 24x7 helpline.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-8">
      {/* 1. Hero Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#003875] text-white p-5 sm:p-14 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <Home className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">Premier At-Home Hemodialysis</span>
              </div>

              <h1 className="text-2xl sm:text-5xl font-black tracking-tight leading-tight">
                Hospital-Grade Kidney Care in the Safety &amp; Dignity of Your Home
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed">
                Say goodbye to strenuous three-times-a-week hospital commutes. Renal Medicity delivers 
                advanced hemodialysis right at your bedside, complete with a dedicated licensed dialysis technician, 
                portable clinical Reverse Osmosis water purification, and real-time nephrologist video telemetry.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#home-visit-form"
                  className="px-6 py-3.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm shadow-md transition-all text-center"
                >
                  Book Free Home Assessment
                </a>
                <a
                  href={`tel:${phone}`}
                  className="px-5 py-3.5 rounded-xl bg-black/30 hover:bg-black/40 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-white/20 text-center"
                >
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Call: {phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                  alt="Home Dialysis Setup"
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
            Patient Advantages
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Choose Home Hemodialysis?
          </h2>
          <p className="text-slate-600 text-sm">
            Clinically documented to improve heart health, emotional well-being, and post-dialysis recovery times.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Zero Nosocomial Infection Risk',
              desc: 'Eliminates waiting in crowded hospital waiting rooms and wards, shielding vulnerable kidney patients from viral and bacterial pathogens.'
            },
            {
              title: 'Personal Licensed Technician',
              desc: 'An experienced senior dialysis technician is dedicated exclusively to you for the entire 4-hour session—no divided nurse attention.'
            },
            {
              title: 'No Travel Fatigue (Washout)',
              desc: 'Patients can rest immediately in their own comfortable bed after treatment without dealing with grueling city traffic and wheelchair transfers.'
            },
            {
              title: 'Flexible Schedules',
              desc: 'Choose morning, afternoon, or evening therapy slots that harmonize with your professional work or family obligations.'
            },
            {
              title: 'Better Blood Pressure Control',
              desc: 'Gentler, calm home conditions significantly reduce white-coat syndrome and blood pressure spikes during fluid removal.'
            },
            {
              title: '24/7 Nephrologist Telemetry',
              desc: 'Live digital link to our senior nephrologists ensures constant medical supervision and instant protocol adjustments.'
            }
          ].map((ben, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">{ben.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{ben.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works - 4 Steps */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
              Step-By-Step Process
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How Renal Medicity Home Dialysis Works
            </h2>
            <p className="text-slate-600 text-sm">
              We handle every detail from water chemistry testing to emergency medication backup.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Clinical Assessment',
                desc: 'Senior Nephrologist reviews your medical records, vascular access (AV Fistula or Permcath), and dialysis prescription.'
              },
              {
                step: '02',
                title: 'Home Water Audit',
                desc: 'Our bio-medical team visits your home to test water TDS, plumbing pressure, and electrical grounding to ensure 100% safety.'
              },
              {
                step: '03',
                title: 'Sterile Station Setup',
                desc: 'We install the compact portable double-pass RO unit, automated dialyzer, and sterile consumable stock.'
              },
              {
                step: '04',
                title: 'Technician-Led Sessions',
                desc: 'Our certified technician arrives with sterilized supplies, conducts vitals check, connects access, and monitors you throughout.'
              }
            ].map((st, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
                <span className="text-2xl font-black text-[#16A34A] block">{st.step}</span>
                <h4 className="font-bold text-slate-900 text-base">{st.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Equipment & Safety Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Equipment Info */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-[#005BBD] text-xs font-bold uppercase">
              <Cpu className="w-4 h-4" />
              <span>Hospital Grade Technology</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Advanced Clinical Equipment
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-[#005BBD] shrink-0 mt-0.5" />
                <span><strong>Portable Dual-Pass RO:</strong> Ultra-clean water output with active carbon, sediment, and endotoxin filtration filters.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong>High-Flux Polysulfone Dialyzers:</strong> Maximum middle-molecule clearance, reducing restless leg syndrome and joint aches.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong>Real-Time Telemetry:</strong> Bluetooth blood pressure, ECG, and oxygen monitors streaming directly to our clinical dashboard.</span>
              </li>
            </ul>
          </div>

          {/* Safety Standards */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-[#16A34A] text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Rigorous Safety Standards</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Infection Control &amp; Protocols
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong>Single-Use Consumables:</strong> Tubing, fistula needles, heparin syringes, and dialyzers are strictly disposed after each use.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong>Monthly Microbial Water Cultures:</strong> Certified laboratory testing of home water output for zero bacterial colony counts.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span><strong>Emergency Backup Protocol:</strong> Technician carries emergency saline, IV medications, and rapid ICU transport assistance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Home Visit Request Form (Required by prompt) */}
      <section id="home-visit-form" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-12 space-y-5 sm:space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
              Request Home Assessment
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Schedule an In-Home Dialysis Visit
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Our clinical coordinator and biomedical engineer will visit your home for a comprehensive feasibility audit.
            </p>
          </div>

          {submitResult && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm ${
                submitResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <p className="font-bold">{submitResult.message}</p>
              {submitResult.refId && (
                <p className="mt-1 text-xs font-semibold text-emerald-900">
                  Request Reference ID: <strong>{submitResult.refId}</strong> (Saved in Database)
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Patient or Caregiver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9811002233"
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Residential Address (City &amp; Locality) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Sector 15, Gurugram"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Visit Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Medical Notes / Vascular Access (Optional)</label>
              <textarea
                rows={3}
                placeholder="Mention current dialysis frequency, vascular access (AV fistula / catheter), or special requirements..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#16A34A] focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#16A34A] to-[#15803D] hover:from-[#15803D] hover:to-[#166534] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Request...' : 'Submit Home Visit Request'}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center">
            Need urgent assistance? Call our direct Home Dialysis hotline:{' '}
            <a href={`tel:${phone}`} className="text-[#005BBD] font-bold hover:underline">
              +91 {phone}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};
