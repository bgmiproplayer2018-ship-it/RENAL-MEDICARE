import React from 'react';
import { 
  Award, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  Activity, 
  Droplets, 
  CheckCircle2, 
  Users, 
  Calendar,
  Building,
  Target,
  Compass
} from 'lucide-react';
import { RenalLogo } from '../common/RenalLogo.tsx';

interface AboutPageProps {
  onNavigate: (tab: string) => void;
  phone?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, phone = '9069645840' }) => {
  return (
    <div className="space-y-16 sm:space-y-24 py-8">
      {/* Top Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50/50 p-8 sm:p-14 rounded-3xl border border-blue-100/80 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#005BBD]/10 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
              About Renal Medicity
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Pioneering Compassionate, Technologically Advanced <span className="text-[#005BBD]">Kidney Care</span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              At Renal Medicity, our tagline <strong className="text-[#005BBD]">"Caring For Kidney Health"</strong> is not just a motto—it is our daily clinical standard. We combine international-standard high-flux dialyzers, ultrapure water filtration, and certified personalized care to give dialysis patients back their vitality and independence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mission */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005BBD] flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To provide clinical excellence and infection-free dialysis therapy across both partner hospital networks and personalized home environments, ensuring that advanced kidney care is accessible, reliable, and deeply empathetic.
            </p>
          </div>

          {/* Vision */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To be recognized as India’s benchmark kidney care ecosystem—where clinical precision meets heartfelt human touch, zero cross-infections become the standard, and patients thrive with optimal post-dialysis quality of life.
            </p>
          </div>

          {/* Values */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0EA5E9] flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Core Values</h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span><strong>Integrity:</strong> Honest clinical advice always.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span><strong>Safety:</strong> AAMI-compliant sterile protocols.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span><strong>Empathy:</strong> Treating each patient like family.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Clinical Achievements */}
      <section className="bg-slate-50 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
              Proven Track Record
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Milestones &amp; Achievements
            </h2>
            <p className="text-slate-600 text-sm">
              Numbers that reflect thousands of hours of life-saving renal therapy and dedicated care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '15,000+', label: 'Successful Dialysis Sessions', desc: 'Conducted across center and at-home modalities with documented outcomes.' },
              { num: '99.4%', label: 'Infection-Free Record', desc: 'Rigorous microbiological water monitoring and single-use dialyzer tubing.' },
              { num: '24+', label: 'Hospital Network Wings', desc: 'Integrated state-of-the-art dialysis suites across Delhi NCR and major cities.' },
              { num: '100%', label: 'Senior Doctor Supervision', desc: 'Every treatment protocol is verified and managed by board-certified Nephrologists.' }
            ].map((ach, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-3xl sm:text-4xl font-black text-[#005BBD] block">{ach.num}</span>
                <h4 className="font-bold text-slate-900 text-sm">{ach.label}</h4>
                <p className="text-xs text-slate-500 leading-normal">{ach.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership & Clinical Protocols */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-100 text-[#16A34A] text-xs font-bold uppercase tracking-wider">
              The Renal Medicity Standard
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hospital-Grade Sterility, Ultrapure Water, and Zero Fatigue
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Standard dialysis often leaves patients exhausted due to trace endotoxins in the water or inadequate toxin clearance. At Renal Medicity, we install industrial-grade double-pass RO systems that purify water to parts-per-billion standards. Coupled with biocompatible high-flux synthetic membranes, our patients report dramatic reductions in post-dialysis washout.
            </p>

            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <Droplets className="w-5 h-5 text-[#005BBD] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Ultrapure Dialysate Delivery</strong>
                  <span className="text-xs text-slate-600">Meets strict AAMI &amp; European Best Practice Guidelines for renal replacement therapy.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900">Vascular Access &amp; AV Fistula Care</strong>
                  <span className="text-xs text-slate-600">Buttonhole cannulation technique and ultrasound-guided needle placement to preserve access life.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1000&q=80"
                alt="Nephrologist Doctor Team"
                className="w-full h-96 object-cover"
              />
              <div className="p-6 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Board of Senior Nephrologists</h4>
                    <p className="text-xs text-slate-500">DM / DNB Certified Kidney Specialists &amp; Transplant Experts</p>
                  </div>
                  <button
                    onClick={() => onNavigate('appointment')}
                    className="px-4 py-2 rounded-xl bg-[#005BBD] hover:bg-[#004A99] text-white font-bold text-xs shadow-xs"
                  >
                    Consult Doctor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#003875] to-[#005BBD] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black">Experience the Renal Medicity Difference</h3>
            <p className="text-blue-100 text-sm">Schedule a center visit or request an at-home consultation assessment.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('appointment')}
              className="px-6 py-3 rounded-xl bg-white text-[#005BBD] font-black text-sm hover:bg-blue-50 shadow-md"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
