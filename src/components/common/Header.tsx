import React, { useState } from 'react';
import { RenalLogo } from './RenalLogo.tsx';
import { 
  Phone, 
  Clock, 
  Calendar, 
  Menu, 
  X, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  LogIn, 
  LogOut,
  ChevronRight,
  HeartPulse
} from 'lucide-react';
import { CompanySettings } from '../../types.ts';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  settings?: CompanySettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  isAdminLoggedIn,
  onAdminLogout,
  settings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = settings?.phone || '9069645840';
  const altPhone = settings?.alternatePhone || '7522805397';
  const email = settings?.email || 'renalhealthcare01@gmail.com';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'home-dialysis', label: 'Home Dialysis' },
    { id: 'hospitals', label: 'Hospital Network' },
    { id: 'tracking', label: 'Track Patient' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-slate-100">
      {/* Top Clinical Notification & Contact Ribbon */}
      <div className="bg-[#003875] text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-blue-100">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-white">24x7 Emergency Dialysis:</span>
              <a href={`tel:${phone}`} className="hover:text-emerald-300 font-bold transition-colors">
                +91 {phone}
              </a>
              <span className="text-blue-300">|</span>
              <a href={`tel:${altPhone}`} className="hover:text-emerald-300 font-bold transition-colors">
                +91 {altPhone}
              </a>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-blue-200">
              <Clock className="w-3.5 h-3.5 text-blue-300" />
              <span>OPD &amp; In-Center Dialysis All 7 Days</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`mailto:${email}`} 
              className="text-blue-200 hover:text-white transition-colors"
            >
              {email}
            </a>
            <span className="text-blue-400">|</span>
            <button
              onClick={() => handleNavClick('tracking')}
              className="flex items-center gap-1 text-blue-100 hover:text-white font-medium hover:underline cursor-pointer"
            >
              <Search className="w-3 h-3 text-cyan-300" />
              <span>Track Appointment</span>
            </button>
            <span className="text-blue-400">|</span>
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  Admin Panel
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Logout"
                  className="text-blue-200 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('admin')}
                className="text-blue-200 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3 h-3" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Left */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center text-left focus:outline-none cursor-pointer"
            id="header-logo-btn"
          >
            <RenalLogo size="md" />
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#005BBD] bg-blue-50 font-bold'
                      : 'text-slate-700 hover:text-[#005BBD] hover:bg-slate-50'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-[#005BBD] font-medium text-xs rounded-lg transition-colors border border-slate-200 hover:border-blue-300"
              title="Quick Emergency Call"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-tight hidden md:block">
                <span className="block text-[10px] text-slate-500 font-semibold uppercase">Dialysis Help</span>
                <span className="font-bold text-slate-900 text-xs">9069645840</span>
              </div>
            </a>

            <button
              onClick={() => handleNavClick('appointment')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] hover:from-[#004A99] hover:to-[#0284C7] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
              id="header-book-appointment-btn"
            >
              <Calendar className="w-4 h-4 text-cyan-200" />
              <span>Book Appointment</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('appointment')}
              className="sm:hidden px-3 py-1.5 rounded-lg bg-[#005BBD] text-white text-xs font-bold"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:text-[#005BBD] hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="py-2 px-3 bg-blue-50 rounded-lg flex items-center justify-between text-xs text-blue-900 mb-3">
            <span className="font-bold flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
              Emergency 24x7 Helpline
            </span>
            <a href={`tel:${phone}`} className="font-bold text-[#005BBD]">
              {phone}
            </a>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                    isActive
                      ? 'text-[#005BBD] bg-blue-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => handleNavClick('appointment')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#005BBD] to-[#0EA5E9] text-white font-bold text-sm text-center shadow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-cyan-200" />
              <span>Book Appointment Now</span>
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>{isAdminLoggedIn ? 'Go to Admin Dashboard' : 'Admin Portal Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
