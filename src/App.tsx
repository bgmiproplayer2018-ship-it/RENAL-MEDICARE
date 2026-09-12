import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header.tsx';
import { Footer } from './components/common/Footer.tsx';
import { WhatsAppButton } from './components/common/WhatsAppButton.tsx';
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
import { apiFetch } from './lib/apiFallback.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [navParam, setNavParam] = useState<string | undefined>(undefined);

  // Dynamic Data States
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: 'Renal Medicity',
    tagline: 'Caring For Kidney Health',
    phone: '9069645840',
    alternatePhone: '7522805397',
    email: 'renalhealthcare01@gmail.com',
    whatsapp: '9069645840',
    primaryColor: '#005BBD',
    secondaryColor: '#4FA9FF',
    accentColor: '#0EA5E9',
    backgroundColor: '#FFFFFF',
    address: 'Renal Medicity Kidney Care Hub, Institutional Medical Area, New Delhi - 110049'
  });

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('rm_admin_token'));
  const [adminUser, setAdminUser] = useState<any>(() => {
    const saved = localStorage.getItem('rm_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loadAllData = async () => {
    try {
      const [srvRes, hospRes, blogRes, faqRes, testRes, setRes] = await Promise.all([
        apiFetch('/api/services').then(r => r.json()),
        apiFetch('/api/hospitals').then(r => r.json()),
        apiFetch('/api/blogs').then(r => r.json()),
        apiFetch('/api/faqs').then(r => r.json()),
        apiFetch('/api/testimonials').then(r => r.json()),
        apiFetch('/api/settings').then(r => r.json()),
      ]);

      if (srvRes.success) setServices(srvRes.services);
      if (hospRes.success) setHospitals(hospRes.hospitals);
      if (blogRes.success) setBlogs(blogRes.blogs);
      if (faqRes.success) setFaqs(faqRes.faqs);
      if (testRes.success) setTestimonials(testRes.testimonials);
      if (setRes.success) setSettings(setRes.settings);
    } catch (err) {
      console.warn('Initial fetch using fallback or local default states:', err);
    }
  };

  useEffect(() => {
    loadAllData();
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
      <main className="flex-1">
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
    </div>
  );
}
