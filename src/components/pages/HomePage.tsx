import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Phone, 
  Home, 
  Hospital as HospitalIcon, 
  ShieldCheck, 
  HeartHandshake, 
  Activity, 
  ArrowRight, 
  Award, 
  Clock, 
  Sparkles, 
  Users, 
  Star, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Send,
  Droplets,
  Microscope,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { ServiceItem, Hospital, BlogPost, FAQItem, Testimonial, CompanySettings } from '../../types.ts';
import { RenalLogo } from '../common/RenalLogo.tsx';
import { apiFetch } from '../../lib/apiFallback.ts';
import { ScrollAnimatedImage } from '../common/ScrollAnimatedImage.tsx';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
  services: ServiceItem[];
  hospitals: Hospital[];
  blogs: BlogPost[];
  faqs: FAQItem[];
  testimonials: Testimonial[];
  settings?: CompanySettings;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  services,
  hospitals,
  blogs,
  faqs,
  testimonials,
  settings,
}) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);
  const [quickContactStatus, setQuickContactStatus] = useState<string | null>(null);
  const [quickContactForm, setQuickContactForm] = useState({
    name: '',
    phone: '',
    service: 'Hemodialysis',
    message: ''
  });

  const phone = settings?.phone || '9069645840';
  const altPhone = settings?.alternatePhone || '7522805397';

  const handleQuickContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quickContactForm.name,
          phone: quickContactForm.phone,
          subject: `Consultation request for ${quickContactForm.service}`,
          message: quickContactForm.message || `Patient requested consultation for ${quickContactForm.service}.`,
          type: 'general'
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickContactStatus('success');
        setQuickContactForm({ name: '', phone: '', service: 'Hemodialysis', message: '' });
      } else {
        setQuickContactStatus('error');
      }
    } catch {
      setQuickContactStatus('error');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-10 pb-20 sm:pt-16 sm:pb-28 border-b border-blue-100/60">
        {/* Soft geometric accent circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-[#005BBD]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines, CTAs, Hero Features */}
            <div className="lg:col-span-7 space-y-7">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-[#005BBD] text-xs font-bold tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
                <span>CENTERS OF EXCELLENCE IN KIDNEY CARE &amp; DIALYSIS</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.2]">
                Advanced <span className="text-[#005BBD]">Dialysis</span> &amp;{' '}
                <span className="text-[#16A34A]">Kidney Care</span> Services
              </h1>

              {/* Exact Requested Subheadline */}
              <p className="text-sm sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl">
                Providing quality dialysis treatment across multiple hospitals and at-home dialysis services.
              </p>

              {/* Hero Features (Exact from prompt: Patient Focused, Quality Care, Compassion & Trust, Better Health Better Life) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1">
                {[
                  { title: 'Patient Focused', desc: 'Customized dialysis prescriptions & dietary care' },
                  { title: 'Quality Care', desc: 'AAMI ultrapure water & high-flux filtration' },
                  { title: 'Compassion & Trust', desc: 'Dedicated senior nephrologists & trained nurses' },
                  { title: 'Better Health Better Life', desc: 'Infection-free home & hospital suites' },
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl bg-white/80 border border-blue-100/90 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm block">{feat.title}</span>
                      <span className="text-slate-500 text-[11px] sm:text-xs">{feat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons: Book Appointment, Home Dialysis Enquiry, Call Now */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('appointment')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  id="hero-book-appointment-btn"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200" />
                  <span>Book Appointment</span>
                </button>

                <button
                  onClick={() => onNavigate('home-dialysis')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-emerald-500/80 hover:border-emerald-600 font-bold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  id="hero-home-dialysis-btn"
                >
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 text-[#16A34A]" />
                  <span>Home Dialysis Enquiry</span>
                </button>

                <a
                  href={`tel:${phone}`}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-xs transition-all flex items-center justify-center gap-2"
                  id="hero-call-now-btn"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic + Instant Appointment Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <ScrollAnimatedImage
                  src="/images/dialysis-hero-suite.jpg"
                  alt="Renal Medicare Advanced Hemodialysis Suite & Clinical Station"
                  className="w-full h-80 sm:h-96 object-cover object-center brightness-[0.98] contrast-[1.03] transition-transform duration-700 hover:scale-105"
                  animation="scale-in"
                  priority={true}
                  duration={0.85}
                  hoverZoom={true}
                >
                  {/* Dialysis Facility Badge */}
                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-white/20 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Modern Hemodialysis Station</span>
                  </div>
                </ScrollAnimatedImage>
                
                {/* Floating Brand Stamp */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                  <RenalLogo size="sm" showTagline={false} />
                </div>

                {/* Instant Quick Booking Card */}
                <div className="p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Quick Dialysis Assistance</h3>
                      <p className="text-xs text-slate-500">Immediate response within 15 minutes</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                      24x7 Active
                    </span>
                  </div>

                  {quickContactStatus === 'success' ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                      <p className="font-bold">Thank you for reaching out!</p>
                      <p>Our clinical coordinator will contact your mobile number shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleQuickContactSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name *"
                          value={quickContactForm.name}
                          onChange={e => setQuickContactForm({ ...quickContactForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number *"
                          value={quickContactForm.phone}
                          onChange={e => setQuickContactForm({ ...quickContactForm, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#005BBD] focus:outline-none"
                        />
                      </div>

                      <select
                        value={quickContactForm.service}
                        onChange={e => setQuickContactForm({ ...quickContactForm, service: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-[#005BBD] focus:outline-none text-slate-700"
                      >
                        <option value="Hemodialysis">Hemodialysis (Center-Based)</option>
                        <option value="Home Dialysis">At-Home Dialysis (Personal Technician)</option>
                        <option value="Nephrologist Consultation">Nephrologist Consultation</option>
                        <option value="Emergency Dialysis">Emergency Acute Dialysis</option>
                      </select>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Callback / Schedule Visit</span>
                      </button>
                    </form>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                      Strict Confidentiality
                    </span>
                    <a href={`tel:${phone}`} className="text-[#005BBD] font-bold hover:underline">
                      Call {phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SUCCESS STATISTICS COUNTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#003875] via-[#005BBD] to-[#0EA5E9] rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div className="space-y-1 p-2 bg-white/5 rounded-xl sm:bg-transparent">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight block">7,000+</span>
              <span className="text-[11px] sm:text-sm font-semibold text-blue-100 uppercase tracking-wider block">Dialysis Sessions</span>
              <span className="text-[10px] sm:text-xs text-blue-200">Zero cross-infection</span>
            </div>
            <div className="space-y-1 p-2 bg-white/5 rounded-xl sm:bg-transparent">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight block">99.4%</span>
              <span className="text-[11px] sm:text-sm font-semibold text-blue-100 uppercase tracking-wider block">Safety Score</span>
              <span className="text-[10px] sm:text-xs text-blue-200">AAMI &amp; ISO ultrapure</span>
            </div>
            <div className="space-y-1 p-2 bg-white/5 rounded-xl sm:bg-transparent">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight block">2+</span>
              <span className="text-[11px] sm:text-sm font-semibold text-blue-100 uppercase tracking-wider block">Partner Hospitals</span>
              <span className="text-[10px] sm:text-xs text-blue-200">Metro healthcare network</span>
            </div>
            <div className="space-y-1 p-2 bg-white/5 rounded-xl sm:bg-transparent">
              <span className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight block">15+</span>
              <span className="text-[11px] sm:text-sm font-semibold text-blue-100 uppercase tracking-wider block">Specialists</span>
              <span className="text-[10px] sm:text-xs text-blue-200">DM/DNB Nephrologists</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT RENAL HEALTHCARE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
              About Renal Medicare
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Dedicated to Transforming <br />
              <span className="text-[#005BBD]">Kidney Health</span> &amp; <span className="text-[#16A34A]">Dialysis Quality</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Renal Medicare was founded with a singular conviction: every kidney patient deserves world-class, 
              dignified, and technologically superior dialysis care without agonizing travel or fear of infection. 
              We operate state-of-the-art dialysis suites embedded in leading hospitals alongside our pioneering, 
              NABH-compliant At-Home Hemodialysis service.
            </p>

            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16A34A] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Our Vision</h4>
                <p className="text-xs text-slate-600 leading-normal">
                  To be India’s most trusted kidney care ecosystem, setting global benchmarks in infection control, clinical outcomes, and patient satisfaction.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-[#005BBD] font-bold text-sm hover:underline cursor-pointer"
              >
                <span>Read Full Company Story &amp; Leadership</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md h-52 relative group">
                <ScrollAnimatedImage
                  src="/images/hemodialysis-center.jpg"
                  alt="Renal Medicare Advanced Hemodialysis Center & Care Suite"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                  animation="slide-right"
                  delay={0.1}
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 text-white flex items-center justify-between opacity-90 transition-opacity duration-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Dialysis Care Suite</span>
                  </div>
                  <span className="text-[9px] text-emerald-300 font-medium">Hospital Embedded</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                <span className="font-black text-[#005BBD] text-2xl">100%</span>
                <h5 className="font-bold text-slate-900 text-xs">Ultrapure Dialysis Water</h5>
                <p className="text-[11px] text-slate-600">Double-pass Reverse Osmosis with continuous endotoxin testing for peak vitality.</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                <span className="font-black text-[#16A34A] text-2xl">24/7</span>
                <h5 className="font-bold text-slate-900 text-xs">Nephrologist On-Call</h5>
                <p className="text-[11px] text-slate-600">Immediate clinical escalation for vascular access issues, fluid overload, or arrhythmias.</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md h-52 relative group">
                <ScrollAnimatedImage
                  src="/images/dialysis-ro-water-machine.jpg"
                  alt="DIALYSIS (R.O) Ultra Pure Water Machine - Clinical Grade Water Treatment Plant"
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                  animation="slide-left"
                  delay={0.2}
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 text-white flex items-center justify-between opacity-90 transition-opacity duration-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] font-bold tracking-wide uppercase">Dialysis R.O Plant</span>
                  </div>
                  <span className="text-[9px] text-blue-200 font-medium">Ultrapure Water System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES SECTION */}
      <section className="bg-slate-50/80 py-20 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
                Comprehensive Care
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Our Dialysis &amp; Kidney Care Services
              </h2>
              <p className="text-slate-600 text-sm">
                Each treatment plan is engineered around clinical safety, patient comfort, and transparent pricing.
              </p>
            </div>

            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-xs hover:border-[#005BBD] hover:text-[#005BBD] transition-all cursor-pointer"
            >
              <span>View All {services.length} Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((srv, idx) => {
              const serviceImg = srv.id === 'srv-1' && (srv.image.includes('1579684385127') || !srv.image || srv.image === '/images/dialysis-hero-suite.jpg')
                ? '/images/patient-dialysis-hospital-room.jpg'
                : srv.image;

              return (
              <div 
                key={srv.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <ScrollAnimatedImage
                    src={serviceImg}
                    alt={srv.title}
                    className="w-full h-full object-cover object-center brightness-[0.99] contrast-[1.03] transition-transform duration-700 ease-out group-hover:scale-108"
                    containerClassName="w-full h-full"
                    animation="fade-up"
                    delay={(idx % 3) * 0.09}
                    hoverZoom={true}
                  >
                    {srv.id === 'srv-1' && (
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/75 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs border border-white/15 pointer-events-none z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Clinical Dialysis Unit &amp; Bed</span>
                      </div>
                    )}
                  </ScrollAnimatedImage>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#005BBD] shadow-xs z-10">
                    {srv.price}
                  </div>
                  {srv.isPopular && (
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-0.5 rounded-full text-[11px] font-bold shadow-xs z-10">
                      Most In Demand
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#005BBD] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {srv.shortDescription || srv.description}
                    </p>
                  </div>

                  {/* Top Benefits snippet */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Key Advantages</span>
                    {srv.benefits.slice(0, 2).map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="truncate">{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onNavigate('services')}
                      className="text-xs font-bold text-[#005BBD] hover:underline cursor-pointer"
                    >
                      Read Details
                    </button>
                    <button
                      onClick={() => onNavigate('appointment')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. HOME DIALYSIS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-[#064E3B] to-slate-900 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Home className="w-3.5 h-3.5" />
                <span>Zero Commute &bull; Pure Comfort</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Hospital-Grade Dialysis in the Comfort of Your Own Home
              </h2>

              <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
                Experience hospital-standard hemodialysis delivered directly to your bedside. Every session 
                includes an on-site licensed certified dialysis technician, compact mobile RO water purification, 
                and remote live nephrologist telemetry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {[
                  'Licensed technician stays entire 4 hours',
                  'Portable clinical Reverse Osmosis system',
                  'Direct video telemetry with Senior Doctor',
                  'Zero exposure to hospital pathogens',
                  'Flexible morning or evening time slots',
                  'Emergency medication kit on standby'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigate('home-dialysis')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition-all transform active:scale-95 cursor-pointer text-center"
                >
                  Request Home Visit Assessment
                </button>
                <a
                  href={`tel:${phone}`}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-300" />
                  <span>Call Home Care: {phone}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl">
                <ScrollAnimatedImage
                  src="/images/patient-hemodialysis-session.jpg"
                  alt="Hospital-Grade At-Home Hemodialysis Patient Care"
                  className="w-full h-80 sm:h-96 object-cover"
                  containerClassName="w-full h-full"
                  animation="scale-in"
                  duration={0.8}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 z-10 pointer-events-none">
                  <span className="text-emerald-400 font-bold text-xs uppercase">Certified Quality</span>
                  <p className="text-white font-bold text-sm">
                    "My father has had 120+ home dialysis sessions with Renal Medicare. His health and happiness are better than ever."
                  </p>
                  <span className="text-xs text-slate-300 mt-1">&mdash; Malhotra Family, South Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOSPITAL NETWORK PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
              Nationwide Centers
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Hospital Network
            </h2>
            <p className="text-slate-600 text-sm">
              Equipped with state-of-the-art dialysis suites, 24x7 emergency backup, and comfortable motorized recliners.
            </p>
          </div>

          <button
            onClick={() => onNavigate('hospitals')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#005BBD] font-bold text-sm shadow-xs hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <span>Explore All Locations &amp; Maps</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hospitals.slice(0, 3).map((hosp, idx) => (
            <div
              key={hosp.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="h-44 relative bg-slate-100 overflow-hidden">
                <ScrollAnimatedImage
                  src={hosp.image}
                  alt={hosp.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  containerClassName="w-full h-full"
                  animation="fade-up"
                  delay={(idx % 3) * 0.1}
                />
                <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs z-10">
                  {hosp.city}, {hosp.state}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-base leading-snug">
                    {hosp.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {hosp.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {hosp.facilities.slice(0, 3).map((fac, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 text-[#005BBD] text-[10px] font-semibold">
                      {fac}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${hosp.contactNumber}`}
                    className="text-xs font-bold text-slate-700 hover:text-[#005BBD] flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{hosp.contactNumber}</span>
                  </a>
                  <button
                    onClick={() => onNavigate('appointment')}
                    className="px-3 py-1.5 rounded-lg bg-[#005BBD] text-white text-xs font-bold hover:bg-[#004A99] transition-colors cursor-pointer"
                  >
                    Select Center
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY CHOOSE US */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
              Clinical Excellence
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Patients &amp; Families Choose Renal Medicare
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Engineered from the ground up to reduce patient washout fatigue, eradicate infection risks, and provide continuous doctor oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Droplets className="w-6 h-6 text-[#005BBD]" />,
                title: 'AAMI Ultrapure RO Water',
                desc: 'Double-pass RO filtration eliminates pyrogens and endotoxins, significantly preventing post-dialysis chills and fatigue.'
              },
              {
                icon: <Microscope className="w-6 h-6 text-[#16A34A]" />,
                title: 'High-Flux Biocompatible',
                desc: 'Premium dialyzer membranes optimize beta-2 microglobulin clearance, preserving cardiovascular health and longevity.'
              },
              {
                icon: <Stethoscope className="w-6 h-6 text-[#0EA5E9]" />,
                title: 'Senior Nephrologist Care',
                desc: 'Every prescription is personalized by DM/DNB kidney doctors with ongoing dry-weight and electrolyte tracking.'
              },
              {
                icon: <HeartPulse className="w-6 h-6 text-red-500" />,
                title: '24x7 Emergency Readiness',
                desc: 'Round-the-clock emergency dialysis, ICU bedside CRRT, and rapid temporary catheter insertions.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. PATIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
            Patient Voices
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Real Stories, Real Healing
          </h2>
          <p className="text-slate-600 text-sm">
            Read how our compassionate clinical teams make weekly dialysis manageable, dignified, and safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <ScrollAnimatedImage
                  src={t.image}
                  alt={t.patientName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-100"
                  containerClassName="w-11 h-11 rounded-full shrink-0"
                  animation="pop"
                  delay={0.1}
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.patientName}</h4>
                  <span className="text-[11px] text-[#005BBD] font-semibold block">{t.treatment}</span>
                  <span className="text-[10px] text-slate-400">{t.location} &bull; {t.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="bg-slate-50/80 py-20 border-y border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
              Answers &amp; Guidance
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm">
              Clear clinical facts to help patients and caregivers make confident healthcare decisions.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-[#005BBD] transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#005BBD] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-slate-500">
              Have another question not listed here?{' '}
              <button
                onClick={() => onNavigate('contact')}
                className="text-[#005BBD] font-bold hover:underline cursor-pointer"
              >
                Contact our clinical coordinators directly
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* 10. LATEST BLOGS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
              Educational Insights
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Latest Kidney Health &amp; Dialysis Articles
            </h2>
            <p className="text-slate-600 text-sm">
              Guidance written by senior nephrologists on diet, vascular access maintenance, and home dialysis lifestyle.
            </p>
          </div>

          <button
            onClick={() => onNavigate('blog')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-[#005BBD] font-bold text-sm shadow-xs hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((b, idx) => {
            const blogImg = b.id === 'blog-1' && (b.featuredImage.includes('1579684385127') || !b.featuredImage || b.featuredImage === '/images/ckd-dialysis-unit.jpg')
              ? '/images/ckd-dialysis-unit.jpg'
              : b.id === 'blog-3' && (b.featuredImage.includes('1516549655169') || !b.featuredImage || b.featuredImage === '/images/patient-dialysis-hospital-room.jpg')
              ? '/images/patient-dialysis-hospital-room.jpg'
              : b.featuredImage;

            return (
              <article
                key={b.id}
                onClick={() => onNavigate('blog', b.id)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col group"
              >
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <ScrollAnimatedImage
                    src={blogImg}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                    animation="scale-in"
                    delay={(idx % 3) * 0.1}
                  />
                </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#005BBD]">
                    <span>{b.category}</span>
                    <span>&bull;</span>
                    <span className="text-slate-400">{b.readTime}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#005BBD] transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {b.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{b.author}</span>
                  <span className="font-semibold text-[#005BBD] flex items-center gap-1">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 11. BOTTOM CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] text-white p-6 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2.5 text-center md:text-left max-w-xl">
            <h3 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              Ready to Experience Better Kidney Health?
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Book a center visit, schedule an at-home dialysis evaluation, or speak directly with our Senior Nephrology Coordinator.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('appointment')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-[#005BBD] hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
            >
              Book Appointment Now
            </button>
            <a
              href={`tel:${phone}`}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#003B77] hover:bg-[#002F5E] text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
