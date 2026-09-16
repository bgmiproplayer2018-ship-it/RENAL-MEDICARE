import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Droplets, 
  HeartHandshake, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ServiceItem, CompanySettings } from '../../types.ts';
import { ScrollAnimatedImage } from '../common/ScrollAnimatedImage.tsx';

interface ServicesPageProps {
  services: ServiceItem[];
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  services,
  onNavigate,
  settings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);

  const phone = settings?.phone || '9069645840';

  const filtered = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-12 sm:space-y-16 py-8">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50/50 p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-blue-100/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#005BBD]/10 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
            Clinical Services &amp; Pricing
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Specialized <span className="text-[#005BBD]">Dialysis</span> &amp; <span className="text-[#16A34A]">Kidney Care</span> Solutions
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-3xl">
            All dialysis sessions are delivered with biocompatible high-flux membranes, double-pass ultrapure RO water, and continuous nephrologist oversight. Transparent pricing with no hidden consumable charges.
          </p>

          {/* Category Filter Pills */}
          <div className="flex overflow-x-auto no-scrollbar items-center gap-2 pt-2 sm:pt-4 pb-1">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'dialysis', label: 'Dialysis Therapies' },
              { id: 'consultation', label: 'Doctor Consultations' },
              { id: 'specialized', label: 'Emergency & Critical' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`shrink-0 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-[#005BBD] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filtered.map((srv, idx) => {
            const serviceImg = srv.id === 'srv-1' && (srv.image.includes('1579684385127') || !srv.image || srv.image === '/images/dialysis-hero-suite.jpg')
              ? '/images/patient-dialysis-hospital-room.jpg'
              : srv.image;

            return (
            <div
              key={srv.id}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 sm:h-52 bg-slate-100 overflow-hidden">
                  <ScrollAnimatedImage
                    src={serviceImg}
                    alt={srv.title}
                    className="w-full h-full object-cover object-center brightness-[0.99] contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-108"
                    containerClassName="w-full h-full"
                    animation="fade-up"
                    delay={(idx % 3) * 0.08}
                    hoverZoom={true}
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-xs z-10">
                    <span className="font-extrabold text-[#005BBD] text-xs sm:text-sm">{srv.price}</span>
                  </div>
                  {srv.isPopular && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs z-10">
                      Popular Choice
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#005BBD] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {srv.priceNote || 'Includes consumables & standard nurse monitoring'}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Benefits */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Key Clinical Benefits:
                    </h4>
                    <ul className="space-y-1.5">
                      {srv.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 sm:p-6 pt-0 space-y-2">
                <button
                  onClick={() => onNavigate('appointment', srv.title)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id={`book-service-${srv.slug}`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                  <span>Transparent Pricing</span>
                  <a href={`tel:${phone}`} className="text-[#005BBD] font-semibold hover:underline">
                    Inquire: {phone}
                  </a>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Information & TPA Insurance Note */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-blue-50/70 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base">Cashless TPA &amp; Health Insurance Supported</h4>
            <p className="text-xs sm:text-sm text-slate-600">
              We work with major third-party administrators (TPAs) and health insurers for cashless dialysis approvals and claim assistance.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-blue-200 text-[#005BBD] font-bold text-xs shadow-xs hover:bg-blue-50 whitespace-nowrap cursor-pointer text-center"
          >
            Check Insurance Eligibility
          </button>
        </div>
      </section>
    </div>
  );
};
