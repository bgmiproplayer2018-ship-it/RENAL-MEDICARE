import React from 'react';
import { Home, Briefcase, Building, Calendar, Search, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  isAdminLoggedIn?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
  isAdminLoggedIn
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'appointment', label: 'Book Now', icon: Calendar, isCenter: true },
    { id: 'hospitals', label: 'Centers', icon: Building },
    { id: 'tracking', label: 'Track', icon: Search },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate('appointment')}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
                id="mobile-nav-book-center-btn"
                aria-label="Book Dialysis Appointment"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-active:scale-95 transition-transform">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold text-[#005BBD] mt-0.5">
                  Book Slot
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-150 relative min-w-[56px] ${
                isActive ? 'text-[#005BBD]' : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
              id={`mobile-nav-${item.id}`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#005BBD]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
