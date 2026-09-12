import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Phone, 
  Search, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { Hospital, CompanySettings } from '../../types.ts';

interface HospitalNetworkPageProps {
  hospitals: Hospital[];
  onNavigate: (tab: string, param?: string) => void;
  settings?: CompanySettings;
}

export const HospitalNetworkPage: React.FC<HospitalNetworkPageProps> = ({
  hospitals,
  onNavigate,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');

  const phone = settings?.phone || '9069645840';

  // Extract unique cities
  const cities = ['All', ...Array.from(new Set(hospitals.map(h => h.city)))];

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = 
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === 'All' || h.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-12 sm:space-y-16 py-8">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-50 via-white to-emerald-50/50 p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-blue-100/80 shadow-xs space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#005BBD]/10 text-[#005BBD] text-xs font-bold uppercase tracking-wider">
            Nationwide Presence
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Our Hospital Network &amp; <span className="text-[#005BBD]">Dialysis Centers</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-3xl">
            Locate premier dialysis centers in your city equipped with high-flux hemodialyzers, isolated hepatitis suites, motorized recliners, and board-certified nephrologists.
          </p>

          {/* Search & Filter Controls */}
          <div className="pt-2 sm:pt-4 grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="sm:col-span-8 relative">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 absolute left-3.5 sm:left-4 top-3 sm:top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search hospital, locality, or city..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#005BBD] focus:outline-none shadow-xs"
              />
            </div>

            {/* City Selector */}
            <div className="sm:col-span-4">
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-[#005BBD] focus:outline-none shadow-xs"
              >
                {cities.map(c => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Cities' : `City: ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick city filter buttons */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pt-1 pb-1">
            {cities.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCity === c
                    ? 'bg-[#005BBD] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hospital Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-3 sm:pb-4">
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Showing <strong className="text-slate-800">{filteredHospitals.length}</strong> Centers across India
          </p>
        </div>

        {filteredHospitals.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-slate-200 text-center space-y-3">
            <Building className="w-10 sm:w-12 h-10 sm:h-12 text-slate-400 mx-auto" />
            <h4 className="text-sm sm:text-base font-bold text-slate-800">No centers match your search query</h4>
            <p className="text-xs text-slate-500">Try changing city or search keywords.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCity('All'); }}
              className="px-4 py-2 bg-[#005BBD] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredHospitals.map(hosp => (
              <div
                key={hosp.id}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 sm:h-48 relative bg-slate-100 overflow-hidden">
                    <img
                      src={hosp.image}
                      alt={hosp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold text-slate-800 shadow-xs">
                      {hosp.city}, {hosp.state}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#005BBD] text-white px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs">
                      {hosp.bedsCount} Stations
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#005BBD] transition-colors leading-snug">
                        {hosp.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed pt-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{hosp.address}</span>
                      </p>
                    </div>

                    {/* Facilities Tag List */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Station Facilities
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {hosp.facilities.map((fac, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-blue-50 text-[#005BBD] text-[10px] sm:text-[11px] font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A] shrink-0" />
                            <span>{fac}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 sm:p-6 pt-0 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={hosp.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-2 sm:px-3 rounded-xl border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-[#005BBD] font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-colors text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Google Map</span>
                    </a>
                    <a
                      href={`tel:${hosp.contactNumber}`}
                      className="py-2.5 px-2 sm:px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-colors text-center"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Call Center</span>
                    </a>
                  </div>

                  <button
                    onClick={() => onNavigate('appointment', `Hospital: ${hosp.name}`)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book At This Center</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
