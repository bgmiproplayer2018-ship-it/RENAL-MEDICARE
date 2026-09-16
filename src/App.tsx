import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { WhatsAppButton } from './components/common/WhatsAppButton.tsx';
import { MobileBottomNav } from './components/common/MobileBottomNav.tsx';
import { HomePage } from './components/pages/HomePage.tsx';
import { AboutPage } from './components/pages/AboutPage.tsx';
import { ServicesPage } from './components/pages/ServicesPage.tsx';
import { HomeDialysisPage } from './components/pages/HomeDialysisPage.tsx';
import { HospitalNetworkPage } from './components/pages/HospitalNetworkPage.tsx';
import { AppointmentBookingPage } from './components/pages/AppointmentBookingPage.tsx';
import { AppointmentTrackingPage } from './components/pages/AppointmentTrackingPage.tsx';
import { BlogPage } from './components/pages/BlogPage.tsx';
import { ContactPage } from './components/pages/ContactPage.tsx';
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';

import { ServiceItem, Hospital, BlogPost, FAQItem, Testimonial, CompanySettings } from './types.ts';
import { apiFetch, ClientDataStore } from './lib/apiFallback.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navParam, setNavParam] = useState<string | undefined>(undefined);

  // Dynamic Data States initialized from ClientDataStore for instant zero-flash render
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      return ClientDataStore.getServices();
    } catch {
      return [];
    }
  });
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      return ClientDataStore.getHospitals();
    } catch {
      return [];
    }
  });
  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      return ClientDataStore.getBlogs();
    } catch {
      return [];
    }
  });
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      return ClientDataStore.getFaqs();
    } catch {
      return [];
    }
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      return ClientDataStore.getTestimonials();
    } catch {
      return [];
    }
  });
  const [settings, setSettings] = useState<CompanySettings>(() => ({
    companyName: 'Renal Medicare',
    tagline: 'Caring For Kidney Health',
    phone: '9069645840',
    alternatePhone: '7522805397',
    email: 'renalhealthcare01@gmail.com',
    whatsapp: '9069645840',
    primaryColor: '#005BBD',
    secondaryColor: '#4FA9FF',
    accentColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
    address: 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089'
  }));

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('rm_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('rm_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadAllData = async () => {
    try {
      const [srvRes, hospRes, blogRes, faqRes, testRes, setRes] = await Promise.all([
        apiFetch('/api/services').then(r => r.json()).catch(() => ({})),
        apiFetch('/api/hospitals').then(r => r.json()).catch(() => ({})),
        apiFetch('/api/blogs').then(r => r.json()).catch(() => ({})),
        apiFetch('/api/faqs').then(r => r.json()).catch(() => ({})),
        apiFetch('/api/testimonials').then(r => r.json()).catch(() => ({})),
        apiFetch('/api/settings').then(r => r.json()).catch(() => ({})),
      ]);

      if (srvRes.success && Array.isArray(srvRes.services)) {
        const clean = srvRes.services.filter((s: any) => s && s.id !== 'srv-2' && s.slug !== 'peritoneal-dialysis');
        setServices(clean);
        ClientDataStore.saveServices(clean);
      }
      if (hospRes.success && Array.isArray(hospRes.hospitals)) {
        setHospitals(hospRes.hospitals);
        ClientDataStore.saveHospitals(hospRes.hospitals);
      }
      if (blogRes.success && Array.isArray(blogRes.blogs)) {
        setBlogs(blogRes.blogs);
        ClientDataStore.saveBlogs(blogRes.blogs);
      }
      if (faqRes.success && Array.isArray(faqRes.faqs)) {
        setFaqs(faqRes.faqs);
        ClientDataStore.saveFaqs(faqRes.faqs);
      }
      if (testRes.success && Array.isArray(testRes.testimonials)) {
        setTestimonials(testRes.testimonials);
        ClientDataStore.saveTestimonials(testRes.testimonials);
      }
      if (setRes.success && setRes.settings) {
        const fetchedSettings = { ...setRes.settings };
        if (fetchedSettings.address && (fetchedSettings.address.includes('South Extension') || fetchedSettings.address.includes('Institutional Medical Area'))) {
          fetchedSettings.address = 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089';
        }
        setSettings(fetchedSettings);
        ClientDataStore.saveSettings(fetchedSettings);
      }
    } catch (err) {
      console.warn('Initial fetch using fallback or local default states:', err);
    }
  };

  useEffect(() => {
    loadAllData();

    // Direct staff access via URL hash (#admin) or query parameter (?admin=true)
    const checkAdminRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      if (hash === '#admin' || params.get('admin') === 'true' || params.get('tab') === 'admin') {
        setCurrentTab('admin');
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);

    // Discreet staff shortcut: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentTab((prev) => (prev === 'admin' ? 'home' : 'admin'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setNavParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = (token: string, user: any) => {
    setAdminToken(token);
    setAdminUser(user);
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('rm_admin_token');
    localStorage.removeItem('rm_admin_user');
    setAdminToken(null);
    setAdminUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-[#005BBD]">
      {/* Global Navigation Header */}
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        isAdminLoggedIn={Boolean(adminToken)}
        onAdminLogout={handleAdminLogout}
        settings={settings}
      />

      {/* Main Content Pages */}
      <main className={`flex-1 ${currentTab !== 'admin' ? 'pb-16 md:pb-0' : ''}`}>
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            services={services}
            hospitals={hospitals}
            blogs={blogs}
            faqs={faqs}
            testimonials={testimonials}
            settings={settings}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onNavigate={handleNavigate}
            phone={settings.phone}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage
            services={services}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'home-dialysis' && (
          <HomeDialysisPage
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'hospitals' && (
          <HospitalNetworkPage
            hospitals={hospitals}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'appointment' && (
          <AppointmentBookingPage
            hospitals={hospitals}
            services={services}
            preselectedService={navParam}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'tracking' && (
          <AppointmentTrackingPage
            initialTrackingId={navParam}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'blog' && (
          <BlogPage
            blogs={blogs}
            initialArticleId={navParam}
            onNavigate={handleNavigate}
            settings={settings}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage
            settings={settings}
          />
        )}

        {currentTab === 'admin' && (
          adminToken && adminUser ? (
            <AdminPanel
              token={adminToken}
              adminUser={adminUser}
              onLogout={handleAdminLogout}
              onRefreshData={loadAllData}
              hospitals={hospitals}
              services={services}
              settings={settings}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={handleAdminLogin}
              onCancel={() => setCurrentTab('home')}
            />
          )
        )}
      </main>

      {/* Floating WhatsApp Action Button */}
      <WhatsAppButton
        phone={settings.whatsapp || '9069645840'}
        defaultMessage="Hello Renal Healthcare, I would like to know more about dialysis services."
      />

      {/* Global Clinical Footer */}
      <Footer
        onNavigate={handleNavigate}
        settings={settings}
      />

      {/* Mobile Sticky Bottom Navigation */}
      {currentTab !== 'admin' && (
        <MobileBottomNav
          currentTab={currentTab}
          onNavigate={handleNavigate}
          isAdminLoggedIn={Boolean(adminToken)}
        />
      )}
    </div>
  );
}
