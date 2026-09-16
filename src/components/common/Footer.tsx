import React from 'react';
import { RenalLogo } from './RenalLogo.tsx';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  Calendar, 
  ArrowUpRight, 
  HeartHandshake, 
  Clock,
  Sparkles
} from 'lucide-react';
import { CompanySettings } from '../../types.ts';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const phone = settings?.phone || '9069645840';
  const altPhone = settings?.alternatePhone || '7522805397';
  const email = settings?.email || 'renalhealthcare01@gmail.com';
  const whatsapp = settings?.whatsapp || '9069645840';
  const address = settings?.address || 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089';

  return (
    <footer className="bg-[#00224A] text-slate-300 border-t border-blue-900/60 relative overflow-hidden">
      {/* Subtle background ambient graphic */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Emergency Assistance Ribbon */}
      <div className="border-b border-blue-800/60 bg-[#001B3B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Immediate Emergency Dialysis &amp; ICU Transfer</h4>
                <p className="text-xs text-blue-200">24 Hours bedside hemodialysis, CRRT and urgent catheter placement across all centers</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              <a
                href={`tel:${phone}`}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call Emergency: {phone}</span>
              </a>
              <button
                onClick={() => onNavigate('appointment')}
                className="px-4 py-2.5 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Book Priority Slot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-2.5 rounded-xl inline-block shadow-sm">
              <RenalLogo size="md" />
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Renal Medicare is a dedicated Center of Excellence in Nephrology &amp; Dialysis. 
              We bring clinical precision, ultrapure high-flux dialysis, infection-free home dialysis, and 
              compassionate renal care to thousands of patients across India.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>24/7 Dialysis Operations &bull; Day Care &amp; Nocturnal Sessions</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider text-blue-300 border-b border-blue-800/80 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About Us' },
                { id: 'services', label: 'Dialysis Services' },
                { id: 'home-dialysis', label: 'Home Dialysis' },
                { id: 'hospitals', label: 'Hospital Network' },
                { id: 'tracking', label: 'Track Appointment' },
                { id: 'blog', label: 'Kidney Health Blog' },
                { id: 'contact', label: 'Contact Us' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white hover:translate-x-1 transition-all text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Dialysis Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider text-blue-300 border-b border-blue-800/80 pb-2">
              Our Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              {[
                'Hemodialysis (High-Flux)',
                'Personalized Home Dialysis',
                'Emergency 24x7 Dialysis',
                'Nephrologist Consultation',
                'AV Fistula & Catheter Care',
                'Renal Diet & Nutrition',
                'Kidney Transplant Workup'
              ].map((srv, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => {
                      onNavigate('services');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{srv}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider text-blue-300 border-b border-blue-800/80 pb-2">
              Reach Out
            </h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-[11px] font-semibold text-blue-300 block">Primary Helpline</span>
                <a href={`tel:${phone}`} className="text-white font-bold text-base hover:text-emerald-400 transition-colors block">
                  +91 {phone}
                </a>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-blue-300 block">Alternate Contact</span>
                <a href={`tel:${altPhone}`} className="text-slate-200 font-semibold hover:text-white transition-colors block">
                  +91 {altPhone}
                </a>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-blue-300 block">Email Support</span>
                <a href={`mailto:${email}`} className="text-slate-200 hover:text-white text-xs transition-colors break-all block">
                  {email}
                </a>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-blue-300 block">Official WhatsApp</span>
                <a 
                  href={`https://wa.me/91${whatsapp}?text=${encodeURIComponent('Hello Renal Healthcare, I would like to know more about dialysis services.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 font-semibold text-xs hover:underline flex items-center gap-1 mt-0.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chat on +91 {whatsapp}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quality accreditations banner */}
        <div className="mt-12 pt-8 border-t border-blue-900/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs text-blue-200">
          <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-900/60">
            <span className="font-bold text-white block">AAMI / ISO 23500</span>
            <span>Ultrapure Dialysis Water Standards</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-900/60">
            <span className="font-bold text-white block">Zero Cross-Infection</span>
            <span>Dedicated Single-Use/Sterile Consumables</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-900/60">
            <span className="font-bold text-white block">Board Certified</span>
            <span>DM/DNB Senior Nephrologist Supervision</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/50 border border-blue-900/60">
            <span className="font-bold text-white block">Cashless TPA Accepted</span>
            <span>All Major Health Insurance Panels</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-blue-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>© Renal Healthcare. All Rights Reserved.</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <button onClick={() => onNavigate('about')} className="hover:text-white cursor-pointer">
              Clinical Quality Policy
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white cursor-pointer">
              Privacy &amp; Patient Rights
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white cursor-pointer">
              Help &amp; Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
