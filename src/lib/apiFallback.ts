import { initialData } from '../data/initialData.ts';
import { 
  Appointment, 
  Hospital, 
  ServiceItem, 
  BlogPost, 
  FAQItem, 
  Testimonial, 
  ContactMessage, 
  CompanySettings,
  ReminderLog 
} from '../types.ts';
import {
  calculateReminderScheduledTime,
  isAppointmentDueForReminder,
  processAppointmentReminder,
  generate24HourReminderContent
} from './notificationEngine.ts';

const STORAGE_KEYS = {
  SERVICES: 'rm_services',
  HOSPITALS: 'rm_hospitals',
  BLOGS: 'rm_blogs',
  FAQS: 'rm_faqs',
  TESTIMONIALS: 'rm_testimonials',
  APPOINTMENTS: 'rm_appointments',
  SETTINGS: 'rm_settings',
  CONTACTS: 'rm_contacts',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[LocalStore] Error reading key ${key}:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[LocalStore] Error writing key ${key}:`, e);
  }
}

const MOCK_APPOINTMENT_IDS = new Set(['RM-2026-8941', 'RM-2026-6219', 'RM-2026-4712', 'RM-2026-1033']);
const MOCK_CONTACT_IDS = new Set(['cnt-1', 'cnt-2']);

export class ClientDataStore {
  static getServices(): ServiceItem[] {
    const list = loadFromStorage<ServiceItem[]>(STORAGE_KEYS.SERVICES, (initialData.services as unknown) as ServiceItem[]);
    const withoutSrv2 = (list || []).filter(srv => srv && srv.id !== 'srv-2' && srv.slug !== 'peritoneal-dialysis');
    let updated = withoutSrv2.length !== (list || []).length;
    const fixed = withoutSrv2.map(srv => {
      if (srv.id === 'srv-1' && srv.image.includes('photo-1579684385127-1ef15d508118')) {
        updated = true;
        return { ...srv, image: '/images/patient-dialysis-hospital-room.jpg' };
      }
      return srv;
    });
    if (updated) {
      saveToStorage(STORAGE_KEYS.SERVICES, fixed);
    }
    return fixed;
  }

  static saveServices(services: ServiceItem[]): void {
    const clean = (services || []).filter(srv => srv && srv.id !== 'srv-2' && srv.slug !== 'peritoneal-dialysis');
    saveToStorage(STORAGE_KEYS.SERVICES, clean);
  }

  static getHospitals(): Hospital[] {
    return loadFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, (initialData.hospitals as unknown) as Hospital[]);
  }

  static saveHospitals(hospitals: Hospital[]): void {
    saveToStorage(STORAGE_KEYS.HOSPITALS, hospitals);
  }

  static getBlogs(): BlogPost[] {
    return loadFromStorage<BlogPost[]>(STORAGE_KEYS.BLOGS, (initialData.blogs as unknown) as BlogPost[]);
  }

  static saveBlogs(blogs: BlogPost[]): void {
    saveToStorage(STORAGE_KEYS.BLOGS, blogs);
  }

  static getFaqs(): FAQItem[] {
    return loadFromStorage<FAQItem[]>(STORAGE_KEYS.FAQS, (initialData.faqs as unknown) as FAQItem[]);
  }

  static saveFaqs(faqs: FAQItem[]): void {
    saveToStorage(STORAGE_KEYS.FAQS, faqs);
  }

  static getTestimonials(): Testimonial[] {
    return loadFromStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, (initialData.testimonials as unknown) as Testimonial[]);
  }

  static saveTestimonials(testimonials: Testimonial[]): void {
    saveToStorage(STORAGE_KEYS.TESTIMONIALS, testimonials);
  }

  static getAppointments(): Appointment[] {
    const list = loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, (initialData.appointments as unknown) as Appointment[]);
    const clean = Array.isArray(list) ? list.filter(a => a && a.id && !MOCK_APPOINTMENT_IDS.has(a.id)) : [];
    if (Array.isArray(list) && clean.length !== list.length) {
      saveToStorage(STORAGE_KEYS.APPOINTMENTS, clean);
    }
    return clean;
  }

  static saveAppointments(appointments: Appointment[]): void {
    const clean = Array.isArray(appointments) ? appointments.filter(a => a && a.id && !MOCK_APPOINTMENT_IDS.has(a.id)) : [];
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, clean);
  }

  static getSettings(): CompanySettings {
    const s = loadFromStorage<CompanySettings>(STORAGE_KEYS.SETTINGS, (initialData.settings as unknown) as CompanySettings);
    if (s && (s.address?.includes('South Extension') || s.address?.includes('Institutional Medical Area'))) {
      s.address = 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089';
      saveToStorage(STORAGE_KEYS.SETTINGS, s);
    }
    return s;
  }

  static saveSettings(settings: CompanySettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  static getContacts(): ContactMessage[] {
    const list = loadFromStorage<ContactMessage[]>(STORAGE_KEYS.CONTACTS, (initialData.contacts as unknown) as ContactMessage[]);
    const clean = Array.isArray(list) ? list.filter(c => c && c.id && !MOCK_CONTACT_IDS.has(c.id)) : [];
    if (Array.isArray(list) && clean.length !== list.length) {
      saveToStorage(STORAGE_KEYS.CONTACTS, clean);
    }
    return clean;
  }

  static saveContacts(contacts: ContactMessage[]): void {
    const clean = Array.isArray(contacts) ? contacts.filter(c => c && c.id && !MOCK_CONTACT_IDS.has(c.id)) : [];
    saveToStorage(STORAGE_KEYS.CONTACTS, clean);
  }
}

// Router simulator for client-side / Netlify static execution
async function handleApiRequest(url: string, method: string, body?: any): Promise<{ status: number; data: any }> {
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname.replace(/\/$/, ''); // strip trailing slash

  // Health check
  if (path === '/api/health') {
    return {
      status: 200,
      data: {
        status: 'ok',
        service: 'Renal Medicare (Client Storage & Netlify Ready)',
        timestamp: new Date().toISOString(),
      }
    };
  }

  // Auth: /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    const validEmails = ['admin@renalmedicare.com', 'admin@renalmedicity.com', 'admin'];
    const validPasswords = ['Admin@RenalMedicare2026', 'Admin@RenalMedicity2026', 'admin', 'password'];

    if (email && password && validEmails.includes(email.toLowerCase()) && validPasswords.includes(password)) {
      return {
        status: 200,
        data: {
          success: true,
          token: 'demo-jwt-token-renal-medicare-admin',
          user: {
            email: 'admin@renalmedicare.com',
            role: 'admin',
            name: 'Dr. Medical Director'
          }
        }
      };
    }
    return {
      status: 401,
      data: { error: 'Invalid email or password. Use admin@renalmedicare.com / Admin@RenalMedicare2026' }
    };
  }

  // Stats: /api/stats
  if (path === '/api/stats' && method === 'GET') {
    const apps = ClientDataStore.getAppointments();
    const contacts = ClientDataStore.getContacts();
    return {
      status: 200,
      data: {
        success: true,
        stats: {
          totalAppointments: apps.length,
          pendingAppointments: apps.filter(a => a.status === 'Pending').length,
          acceptedAppointments: apps.filter(a => a.status === 'Accepted').length,
          completedAppointments: apps.filter(a => a.status === 'Completed').length,
          rescheduledAppointments: apps.filter(a => a.status === 'Rescheduled').length,
          hospitalsCount: ClientDataStore.getHospitals().length,
          servicesCount: ClientDataStore.getServices().length,
          blogsCount: ClientDataStore.getBlogs().length,
          unreadMessagesCount: contacts.filter(c => !c.isRead).length
        }
      }
    };
  }

  // Services: /api/services
  if (path === '/api/services') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, services: ClientDataStore.getServices() } };
    }
    if (method === 'POST') {
      const services = ClientDataStore.getServices();
      const newService: ServiceItem = {
        ...body,
        id: `srv-${Date.now()}`,
        slug: (body.title || 'service').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        benefits: Array.isArray(body.benefits) ? body.benefits : [],
        features: Array.isArray(body.features) ? body.features : [],
        category: body.category || 'dialysis'
      };
      services.unshift(newService);
      ClientDataStore.saveServices(services);
      return { status: 201, data: { success: true, message: 'Service created successfully', service: newService } };
    }
  }

  // Single service: /api/services/:id
  const serviceMatch = path.match(/^\/api\/services\/([^/]+)$/);
  if (serviceMatch) {
    const id = serviceMatch[1];
    const services = ClientDataStore.getServices();
    const idx = services.findIndex(s => s.id === id);

    if (method === 'PUT') {
      if (idx === -1) return { status: 404, data: { error: 'Service not found' } };
      const updated = { ...services[idx], ...body };
      services[idx] = updated;
      ClientDataStore.saveServices(services);
      return { status: 200, data: { success: true, message: 'Service updated successfully', service: updated } };
    }

    if (method === 'DELETE') {
      if (idx === -1) return { status: 404, data: { error: 'Service not found' } };
      services.splice(idx, 1);
      ClientDataStore.saveServices(services);
      return { status: 200, data: { success: true, message: 'Service deleted successfully' } };
    }
  }

  // Hospitals: /api/hospitals
  if (path === '/api/hospitals') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, hospitals: ClientDataStore.getHospitals() } };
    }
    if (method === 'POST') {
      const hospitals = ClientDataStore.getHospitals();
      const newHospital: Hospital = {
        ...body,
        id: `hosp-${Date.now()}`,
        facilities: Array.isArray(body.facilities) ? body.facilities : ['Hemodialysis', '24/7 Nephrologist On-Call'],
        dialysisUnits: Number(body.dialysisUnits) || 12,
        emergencyAvailable: Boolean(body.emergencyAvailable)
      };
      hospitals.unshift(newHospital);
      ClientDataStore.saveHospitals(hospitals);
      return { status: 201, data: { success: true, message: 'Hospital added successfully', hospital: newHospital } };
    }
  }

  // Single hospital: /api/hospitals/:id
  const hospMatch = path.match(/^\/api\/hospitals\/([^/]+)$/);
  if (hospMatch) {
    const id = hospMatch[1];
    const hospitals = ClientDataStore.getHospitals();
    const idx = hospitals.findIndex(h => h.id === id);

    if (method === 'PUT') {
      if (idx === -1) return { status: 404, data: { error: 'Hospital not found' } };
      const updated = { ...hospitals[idx], ...body };
      hospitals[idx] = updated;
      ClientDataStore.saveHospitals(hospitals);
      return { status: 200, data: { success: true, message: 'Hospital updated successfully', hospital: updated } };
    }

    if (method === 'DELETE') {
      if (idx === -1) return { status: 404, data: { error: 'Hospital not found' } };
      hospitals.splice(idx, 1);
      ClientDataStore.saveHospitals(hospitals);
      return { status: 200, data: { success: true, message: 'Hospital deleted successfully' } };
    }
  }

  // Appointments: /api/appointments
  if (path === '/api/appointments') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, appointments: ClientDataStore.getAppointments() } };
    }
    if (method === 'POST') {
      const appointments = ClientDataStore.getAppointments();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const preferredDate = body.preferredDate || new Date().toISOString().slice(0, 10);
      const preferredTime = body.preferredTime || body.timeSlot || 'Morning (07:00 AM - 11:00 AM)';
      const reminderPreference = body.reminderPreference || 'both';
      const reminderConsent = body.reminderConsent !== false;
      const scheduledReminderTime = calculateReminderScheduledTime(preferredDate, preferredTime, 24).toISOString();
      const reminderChannels = reminderPreference === 'whatsapp' ? ['whatsapp'] : reminderPreference === 'email' ? ['email'] : ['whatsapp', 'email'];

      let newApp: Appointment = {
        id: `RM-2026-${randomSuffix}`,
        fullName: body.fullName || body.patientName || 'Patient',
        patientName: body.fullName || body.patientName || 'Patient',
        mobileNumber: body.mobileNumber || body.phone || '',
        phone: body.mobileNumber || body.phone || '',
        email: body.email || '',
        age: Number(body.age) || 45,
        gender: body.gender || 'Male',
        hospitalLocation: body.hospitalLocation || body.hospitalId || 'Renal Medicare Main Hub',
        hospitalId: body.hospitalLocation || body.hospitalId || 'Renal Medicare Main Hub',
        serviceType: body.serviceType || body.serviceId || 'Hemodialysis',
        preferredDate,
        preferredTime,
        timeSlot: preferredTime,
        address: body.address || '',
        additionalNotes: body.additionalNotes || body.notes || '',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminderPreference,
        reminderConsent,
        reminderStatus: 'scheduled',
        reminderScheduledFor: scheduledReminderTime,
        reminderChannels: reminderChannels as any,
        reminderLogs: []
      };

      // If scheduled within 24 hours, automatically dispatch 24h reminder
      const dueCheck = isAppointmentDueForReminder(newApp, 24);
      if (dueCheck.isDue && reminderPreference !== 'none') {
        const settings = ClientDataStore.getSettings();
        const supportPhone = settings?.phone || '9069645840';
        const { updatedAppointment } = processAppointmentReminder(newApp, reminderPreference, 'automated_24h', supportPhone);
        newApp = updatedAppointment;
      }

      appointments.unshift(newApp);
      ClientDataStore.saveAppointments(appointments);
      triggerBackgroundServerSync();
      return { 
        status: 201, 
        data: { 
          success: true, 
          message: newApp.reminderStatus === 'sent'
            ? 'Appointment scheduled and automated 24-hour reminder sent to your WhatsApp / Email!'
            : 'Appointment booked successfully! Automated 24-hour reminder has been scheduled.', 
          appointment: newApp 
        } 
      };
    }
  }

  // Appointments Sync: /api/appointments/sync
  if (path === '/api/appointments/sync' && method === 'POST') {
    const incoming = body?.appointments;
    if (Array.isArray(incoming)) {
      const current = ClientDataStore.getAppointments();
      for (const item of incoming) {
        if (!item || !item.id || MOCK_APPOINTMENT_IDS.has(item.id)) continue;
        const idx = current.findIndex(a => a.id.toLowerCase() === item.id.toLowerCase());
        if (idx === -1) {
          current.unshift(item);
        } else {
          current[idx] = { ...current[idx], ...item };
        }
      }
      ClientDataStore.saveAppointments(current);
    }
    return { status: 200, data: { success: true, appointments: ClientDataStore.getAppointments() } };
  }

  // Notifications API
  if (path === '/api/notifications/status' && method === 'GET') {
    const apps = ClientDataStore.getAppointments();
    const active = apps.filter(a => a.status !== 'Rejected' && a.status !== 'Completed');
    const sent = apps.filter(a => a.reminderStatus === 'sent');
    const due = active.filter(a => isAppointmentDueForReminder(a, 24).isDue);
    return {
      status: 200,
      data: {
        success: true,
        status: {
          isSchedulerActive: true,
          totalAppointments: apps.length,
          activeDialysisSessions: active.length,
          remindersSentCount: sent.length,
          remindersDueNowCount: due.length,
          reminderWindowHours: 24,
          serverTime: new Date().toISOString()
        }
      }
    };
  }

  if (path === '/api/notifications/run-reminders' && method === 'POST') {
    const apps = ClientDataStore.getAppointments();
    const settings = ClientDataStore.getSettings();
    const supportPhone = settings?.phone || '9069645840';
    let dispatchedCount = 0;
    const dispatchedApps: any[] = [];

    const updated = apps.map(app => {
      if (app.status === 'Rejected' || app.status === 'Completed' || app.reminderStatus === 'sent') {
        return app;
      }
      const dueCheck = isAppointmentDueForReminder(app, 24);
      if (dueCheck.isDue) {
        const targetChannel = (app.reminderPreference === 'none' ? 'both' : (app.reminderPreference || 'both')) as any;
        const { updatedAppointment } = processAppointmentReminder(app, targetChannel, 'automated_24h', supportPhone);
        dispatchedCount++;
        dispatchedApps.push({ id: app.id, patientName: app.fullName, channels: updatedAppointment.reminderChannels });
        return updatedAppointment;
      }
      return app;
    });

    if (dispatchedCount > 0) {
      ClientDataStore.saveAppointments(updated);
    }

    return {
      status: 200,
      data: {
        success: true,
        message: `Scanned ${apps.length} appointments. Dispatched ${dispatchedCount} automated reminders.`,
        results: {
          scannedCount: apps.length,
          dispatchedCount,
          dispatchedAppointments: dispatchedApps,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  // Single reminder send: /api/notifications/send/:id
  const sendMatch = path.match(/^\/api\/notifications\/send\/([^/]+)$/);
  if (sendMatch && method === 'POST') {
    const id = sendMatch[1];
    const apps = ClientDataStore.getAppointments();
    const idx = apps.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return { status: 404, data: { error: 'Appointment not found' } };

    const { channel = 'both', triggerType = 'manual_admin' } = body || {};
    const settings = ClientDataStore.getSettings();
    const supportPhone = settings?.phone || '9069645840';

    const { updatedAppointment, content } = processAppointmentReminder(
      apps[idx],
      channel,
      triggerType,
      supportPhone
    );

    apps[idx] = updatedAppointment;
    ClientDataStore.saveAppointments(apps);

    return {
      status: 200,
      data: {
        success: true,
        message: `24-Hour Dialysis Reminder sent successfully via ${channel === 'both' ? 'WhatsApp & Email' : channel}.`,
        appointment: updatedAppointment,
        content
      }
    };
  }

  // Preview reminder: /api/notifications/preview/:id
  const previewMatch = path.match(/^\/api\/notifications\/preview\/([^/]+)$/);
  if (previewMatch && method === 'GET') {
    const id = previewMatch[1];
    const apps = ClientDataStore.getAppointments();
    const app = apps.find(a => a.id.toLowerCase() === id.toLowerCase());
    if (!app) return { status: 404, data: { error: 'Appointment not found' } };

    const settings = ClientDataStore.getSettings();
    const supportPhone = settings?.phone || '9069645840';
    const preview = generate24HourReminderContent(app, supportPhone);

    return { status: 200, data: { success: true, preview } };
  }

  // Logs: /api/notifications/logs
  if (path === '/api/notifications/logs' && method === 'GET') {
    const apps = ClientDataStore.getAppointments();
    const logs: ReminderLog[] = [];
    for (const a of apps) {
      if (a.reminderLogs && Array.isArray(a.reminderLogs)) {
        logs.push(...a.reminderLogs);
      }
    }
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return { status: 200, data: { success: true, count: logs.length, logs } };
  }

  // Track appointment: /api/appointments/track/:query
  const trackMatch = path.match(/^\/api\/appointments\/track\/([^/]+)$/);
  if (trackMatch && method === 'GET') {
    const rawQuery = decodeURIComponent(trackMatch[1]).trim().toLowerCase();
    const cleanPhoneQuery = rawQuery.replace(/[^0-9]/g, '');
    const appointments = ClientDataStore.getAppointments();

    const matches = appointments.filter(a => {
      const idMatch = a.id.toLowerCase() === rawQuery;
      const phoneClean = (a.mobileNumber || '').replace(/[^0-9]/g, '');
      const phoneMatch = cleanPhoneQuery.length >= 6 && phoneClean.includes(cleanPhoneQuery);
      return idMatch || phoneMatch;
    });

    return { status: 200, data: { success: true, appointments: matches } };
  }

  // Update appointment status: /api/appointments/:id/status
  const statusMatch = path.match(/^\/api\/appointments\/([^/]+)\/status$/);
  if (statusMatch && (method === 'PATCH' || method === 'PUT' || method === 'POST')) {
    const id = statusMatch[1];
    const appointments = ClientDataStore.getAppointments();
    let app = appointments.find(a => a.id.toLowerCase() === id.toLowerCase());
    
    if (!app) {
      app = {
        id,
        fullName: body.fullName || body.patientName || 'Patient',
        patientName: body.patientName || body.fullName || 'Patient',
        phone: body.phone || body.mobileNumber || '9069645840',
        mobileNumber: body.mobileNumber || body.phone || '9069645840',
        email: body.email || '',
        age: body.age || 45,
        gender: body.gender || 'Not Specified',
        hospitalId: body.hospitalId || body.hospitalLocation || 'Renal Medicare Main Hub',
        hospitalLocation: body.hospitalLocation || body.hospitalId || 'Renal Medicare Main Hub',
        serviceType: body.serviceType || 'Hemodialysis',
        preferredDate: body.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: body.preferredTime || body.timeSlot || 'Morning',
        timeSlot: body.timeSlot || body.preferredTime || 'Morning',
        address: body.address || '',
        notes: body.notes || '',
        status: body.status || 'Accepted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      appointments.unshift(app);
    } else {
      if (body.status) app.status = body.status;
      if (body.adminNotes !== undefined) app.adminNotes = body.adminNotes;
      if (body.rescheduleDate !== undefined) app.rescheduleDate = body.rescheduleDate;
      if (body.rescheduleTime !== undefined) app.rescheduleTime = body.rescheduleTime;
      app.updatedAt = new Date().toISOString();
    }

    ClientDataStore.saveAppointments(appointments);
    return { status: 200, data: { success: true, message: `Appointment status updated to ${app.status}`, appointment: app } };
  }

  // Reschedule / update appointment: /api/appointments/:id
  const appMatch = path.match(/^\/api\/appointments\/([^/]+)$/);
  if (appMatch) {
    const id = appMatch[1];
    const appointments = ClientDataStore.getAppointments();
    const app = appointments.find(a => a.id === id);

    if (method === 'PATCH' || method === 'PUT') {
      if (!app) return { status: 404, data: { error: 'Appointment not found' } };
      Object.assign(app, body, { updatedAt: new Date().toISOString() });
      ClientDataStore.saveAppointments(appointments);
      return { status: 200, data: { success: true, message: 'Appointment updated successfully', appointment: app } };
    }
  }

  // Contact inquiries: /api/contact
  if (path === '/api/contact') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, contacts: ClientDataStore.getContacts() } };
    }
    if (method === 'POST') {
      const contacts = ClientDataStore.getContacts();
      const newContact: ContactMessage = {
        id: `cnt-${Date.now()}`,
        name: body.name || 'Anonymous',
        email: body.email || '',
        phone: body.phone || '',
        subject: body.subject || (body.type === 'home-dialysis-request' ? 'Home Dialysis Request' : 'General Inquiry'),
        message: body.message || '',
        type: body.type || 'general',
        address: body.address,
        preferredDate: body.preferredDate,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      contacts.unshift(newContact);
      ClientDataStore.saveContacts(contacts);
      triggerBackgroundServerSync();
      return { status: 201, data: { success: true, message: 'Thank you! Your message has been received.', contact: newContact, id: newContact.id } };
    }
  }

  // Contact Sync: /api/contact/sync
  if (path === '/api/contact/sync' && method === 'POST') {
    const incoming = body?.contacts;
    if (Array.isArray(incoming)) {
      const current = ClientDataStore.getContacts();
      for (const item of incoming) {
        if (!item || !item.id || MOCK_CONTACT_IDS.has(item.id)) continue;
        const idx = current.findIndex(c => c.id.toLowerCase() === item.id.toLowerCase());
        if (idx === -1) {
          current.unshift(item);
        }
      }
      ClientDataStore.saveContacts(current);
    }
    return { status: 200, data: { success: true, contacts: ClientDataStore.getContacts() } };
  }

  // Mark contact read: /api/contact/:id/read
  const contactReadMatch = path.match(/^\/api\/contact\/([^/]+)\/read$/);
  if (contactReadMatch && method === 'PATCH') {
    const id = contactReadMatch[1];
    const contacts = ClientDataStore.getContacts();
    const c = contacts.find(item => item.id === id);
    if (!c) return { status: 404, data: { error: 'Message not found' } };
    c.isRead = true;
    ClientDataStore.saveContacts(contacts);
    return { status: 200, data: { success: true, message: 'Message marked as read', contact: c } };
  }

  // Delete contact: /api/contact/:id
  const contactDeleteMatch = path.match(/^\/api\/contact\/([^/]+)$/);
  if (contactDeleteMatch && method === 'DELETE') {
    const id = contactDeleteMatch[1];
    const contacts = ClientDataStore.getContacts();
    const idx = contacts.findIndex(item => item.id === id);
    if (idx === -1) return { status: 404, data: { error: 'Message not found' } };
    contacts.splice(idx, 1);
    ClientDataStore.saveContacts(contacts);
    return { status: 200, data: { success: true, message: 'Inquiry deleted successfully' } };
  }

  // Content routes: /api/blogs, /api/faqs, /api/testimonials, /api/settings
  if (path === '/api/blogs' && method === 'GET') {
    return { status: 200, data: { success: true, blogs: ClientDataStore.getBlogs() } };
  }

  if (path === '/api/faqs' && method === 'GET') {
    return { status: 200, data: { success: true, faqs: ClientDataStore.getFaqs() } };
  }

  if (path === '/api/testimonials' && method === 'GET') {
    return { status: 200, data: { success: true, testimonials: ClientDataStore.getTestimonials() } };
  }

  if (path === '/api/settings') {
    if (method === 'GET') {
      return { status: 200, data: { success: true, settings: ClientDataStore.getSettings() } };
    }
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      const current = ClientDataStore.getSettings();
      const updated = { ...current, ...body };
      ClientDataStore.saveSettings(updated);
      triggerBackgroundServerSync();
      return { status: 200, data: { success: true, message: 'Settings saved successfully', settings: updated } };
    }
  }

  return { status: 404, data: { error: `Endpoint not found: ${method} ${path}` } };
}

function syncServerResponseWithClient(urlString: string, method: string, bodyData: any, json: any) {
  if (!json || typeof json !== 'object') return;
  const path = urlString.replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '').replace(/\/$/, '');

  // SETTINGS SYNC
  if (path === '/api/settings' || path === '/settings') {
    if (json.settings && typeof json.settings === 'object') {
      ClientDataStore.saveSettings(json.settings);
      try {
        localStorage.setItem('rm_settings', JSON.stringify(json.settings));
      } catch {}
    }
  }

  // SERVICES SYNC
  if (path === '/api/services' || path === '/services') {
    if (method === 'GET' && Array.isArray(json.services)) {
      const clean = json.services.filter((s: any) => s && s.id !== 'srv-2' && s.slug !== 'peritoneal-dialysis');
      ClientDataStore.saveServices(clean);
    } else if (method === 'POST' && json.service) {
      const list = ClientDataStore.getServices();
      const exists = list.some(s => s.id === json.service.id);
      if (!exists) {
        list.unshift(json.service);
        ClientDataStore.saveServices(list);
      }
    }
  }

  const serviceSingleMatch = path.match(/^\/api\/services\/([^/]+)$/);
  if (serviceSingleMatch) {
    const id = serviceSingleMatch[1];
    if (method === 'DELETE') {
      const list = ClientDataStore.getServices().filter(s => s.id !== id);
      ClientDataStore.saveServices(list);
    } else if ((method === 'PUT' || method === 'PATCH') && json.service) {
      const list = ClientDataStore.getServices();
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...json.service };
        ClientDataStore.saveServices(list);
      } else {
        list.unshift(json.service);
        ClientDataStore.saveServices(list);
      }
    }
  }

  // HOSPITALS SYNC
  if (path === '/api/hospitals' || path === '/hospitals') {
    if (method === 'GET' && Array.isArray(json.hospitals)) {
      ClientDataStore.saveHospitals(json.hospitals);
    } else if (method === 'POST' && json.hospital) {
      const list = ClientDataStore.getHospitals();
      const exists = list.some(h => h.id === json.hospital.id);
      if (!exists) {
        list.unshift(json.hospital);
        ClientDataStore.saveHospitals(list);
      }
    }
  }

  const hospSingleMatch = path.match(/^\/api\/hospitals\/([^/]+)$/);
  if (hospSingleMatch) {
    const id = hospSingleMatch[1];
    if (method === 'DELETE') {
      const list = ClientDataStore.getHospitals().filter(h => h.id !== id);
      ClientDataStore.saveHospitals(list);
    } else if ((method === 'PUT' || method === 'PATCH') && json.hospital) {
      const list = ClientDataStore.getHospitals();
      const idx = list.findIndex(h => h.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...json.hospital };
        ClientDataStore.saveHospitals(list);
      } else {
        list.unshift(json.hospital);
        ClientDataStore.saveHospitals(list);
      }
    }
  }

  // BLOGS SYNC
  if ((path === '/api/blogs' || path === '/blogs') && method === 'GET' && Array.isArray(json.blogs)) {
    ClientDataStore.saveBlogs(json.blogs);
  }

  // FAQS SYNC
  if ((path === '/api/faqs' || path === '/faqs') && method === 'GET' && Array.isArray(json.faqs)) {
    ClientDataStore.saveFaqs(json.faqs);
  }

  // APPOINTMENTS SYNC
  if (path === '/api/appointments' || path === '/appointments') {
    if (method === 'GET' && Array.isArray(json.appointments)) {
      const clean = json.appointments.filter((a: any) => a && a.id && !MOCK_APPOINTMENT_IDS.has(a.id));
      ClientDataStore.saveAppointments(clean);
    } else if (method === 'POST' && json.appointment) {
      const list = ClientDataStore.getAppointments();
      const exists = list.some(a => a.id.toLowerCase() === json.appointment.id.toLowerCase());
      if (!exists) {
        list.unshift(json.appointment);
        ClientDataStore.saveAppointments(list);
      }
    }
  }

  // APPOINTMENT STATUS OR UPDATE
  const statusMatch = path.match(/^\/api\/appointments\/([^/]+)\/status$/);
  if (statusMatch && method === 'PATCH' && json.appointment) {
    const list = ClientDataStore.getAppointments();
    const idx = list.findIndex(a => a.id.toLowerCase() === statusMatch[1].toLowerCase());
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...json.appointment };
      ClientDataStore.saveAppointments(list);
    }
  }

  const appSingleMatch = path.match(/^\/api\/appointments\/([^/]+)$/);
  if (appSingleMatch) {
    const id = appSingleMatch[1];
    if (method === 'DELETE') {
      const list = ClientDataStore.getAppointments().filter(a => a.id.toLowerCase() !== id.toLowerCase());
      ClientDataStore.saveAppointments(list);
    } else if ((method === 'PUT' || method === 'PATCH') && json.appointment) {
      const list = ClientDataStore.getAppointments();
      const idx = list.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...json.appointment };
        ClientDataStore.saveAppointments(list);
      }
    }
  }

  // CONTACTS / INQUIRIES SYNC
  if (path === '/api/contact' || path === '/contact') {
    if (method === 'GET' && Array.isArray(json.contacts)) {
      const clean = json.contacts.filter((c: any) => c && c.id && !MOCK_CONTACT_IDS.has(c.id));
      ClientDataStore.saveContacts(clean);
    } else if (method === 'POST' && json.contact) {
      const list = ClientDataStore.getContacts();
      const exists = list.some(c => c.id.toLowerCase() === json.contact.id.toLowerCase());
      if (!exists) {
        list.unshift(json.contact);
        ClientDataStore.saveContacts(list);
      }
    }
  }

  const contactReadMatch = path.match(/^\/api\/contact\/([^/]+)\/read$/);
  if (contactReadMatch && method === 'PATCH') {
    const list = ClientDataStore.getContacts();
    const c = list.find(item => item.id === contactReadMatch[1]);
    if (c) {
      c.isRead = true;
      ClientDataStore.saveContacts(list);
    }
  }

  const contactDeleteMatch = path.match(/^\/api\/contact\/([^/]+)$/);
  if (contactDeleteMatch && method === 'DELETE') {
    const list = ClientDataStore.getContacts().filter(item => item.id !== contactDeleteMatch[1]);
    ClientDataStore.saveContacts(list);
  }
}

let syncTimeout: any = null;
export function triggerBackgroundServerSync(): void {
  if (typeof window === 'undefined') return;
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(async () => {
    try {
      const nativeFetch = window.fetch ? window.fetch.bind(window) : fetch;
      const apps = ClientDataStore.getAppointments();
      if (apps.length > 0) {
        await nativeFetch('/api/appointments/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointments: apps })
        }).catch(() => {});
      }
      const contacts = ClientDataStore.getContacts();
      if (contacts.length > 0) {
        await nativeFetch('/api/contact/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts })
        }).catch(() => {});
      }
    } catch {
      // Background sync fail-safe
    }
  }, 300);
}

/**
 * Unified API fetch function with automatic fallback to client-side store
 * when running in pure static mode or offline.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const originalFetch = typeof window !== 'undefined' && window.fetch ? window.fetch.bind(window) : fetch;
  const urlString = typeof input === 'string' 
    ? input 
    : (input instanceof URL ? input.toString() : (input as Request).url);

  const isApiRequest = urlString.startsWith('/api/') || 
    urlString.includes('/api/') || 
    urlString.startsWith('/.netlify/functions/api');

  if (!isApiRequest) {
    return originalFetch(input, init);
  }

  const method = (init?.method || 'GET').toUpperCase();
  let bodyData: any = null;
  if (init?.body && typeof init.body === 'string') {
    try {
      bodyData = JSON.parse(init.body);
    } catch {
      bodyData = init.body;
    }
  }

  try {
    const response = await originalFetch(input, init);
    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      try {
        const cloned = response.clone();
        cloned.json().then(jsonData => {
          syncServerResponseWithClient(urlString, method, bodyData, jsonData);
        }).catch(() => {});
      } catch {}
      return response;
    }

    if (contentType.includes('text/html') || response.status === 404 || response.status >= 500) {
      const { status, data } = await handleApiRequest(urlString, method, bodyData);
      return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return response;
  } catch (networkError) {
    const { status, data } = await handleApiRequest(urlString, method, bodyData);
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Initializes the API Interceptor and Fallback engine safely.
 * Handles environments where window.fetch is a read-only getter.
 */
export function initApiFallback(): void {
  if (typeof window === 'undefined' || (window as any).__rm_api_fallback_initialized) return;
  (window as any).__rm_api_fallback_initialized = true;

  // Background sync any local appointments / inquiries to server
  setTimeout(() => {
    triggerBackgroundServerSync();
  }, 1000);

  try {
    // Check if fetch is configurable or has a setter
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (desc && desc.set === undefined && desc.writable === false) {
      // Fetch is strictly read-only in this window environment (e.g. sandboxed iframe)
      return;
    }

    const nativeFetch = window.fetch.bind(window);

    const interceptedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const urlString = typeof input === 'string' 
        ? input 
        : (input instanceof URL ? input.toString() : (input as Request).url);

      const isApiRequest = urlString.startsWith('/api/') || 
        urlString.includes('/api/') || 
        urlString.startsWith('/.netlify/functions/api');

      if (!isApiRequest) {
        return nativeFetch(input, init);
      }

      const method = (init?.method || 'GET').toUpperCase();
      let bodyData: any = null;
      if (init?.body && typeof init.body === 'string') {
        try {
          bodyData = JSON.parse(init.body);
        } catch {
          bodyData = init.body;
        }
      }

      try {
        const response = await nativeFetch(input, init);
        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          try {
            const cloned = response.clone();
            cloned.json().then(jsonData => {
              syncServerResponseWithClient(urlString, method, bodyData, jsonData);
            }).catch(() => {});
          } catch {}
          return response;
        }

        if (contentType.includes('text/html') || response.status === 404 || response.status >= 500) {
          const { status, data } = await handleApiRequest(urlString, method, bodyData);
          return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return response;
      } catch (networkError) {
        const { status, data } = await handleApiRequest(urlString, method, bodyData);
        return new Response(JSON.stringify(data), {
          status,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };

    // Attempt assignment
    try {
      window.fetch = interceptedFetch;
    } catch {
      try {
        Object.defineProperty(window, 'fetch', {
          value: interceptedFetch,
          writable: true,
          configurable: true,
        });
      } catch {
        // Read-only getter environment: silently fallback to native fetch
      }
    }
  } catch (err) {
    console.warn('[API Fallback] Global fetch interceptor skipped:', err);
  }
}
