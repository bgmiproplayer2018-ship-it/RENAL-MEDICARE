import { initialData } from '../data/initialData.ts';
import { 
  Appointment, 
  Hospital, 
  ServiceItem, 
  BlogPost, 
  FAQItem, 
  Testimonial, 
  ContactMessage, 
  CompanySettings 
} from '../types.ts';

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

export class ClientDataStore {
  static getServices(): ServiceItem[] {
    return loadFromStorage<ServiceItem[]>(STORAGE_KEYS.SERVICES, (initialData.services as unknown) as ServiceItem[]);
  }

  static saveServices(services: ServiceItem[]): void {
    saveToStorage(STORAGE_KEYS.SERVICES, services);
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

  static getFaqs(): FAQItem[] {
    return loadFromStorage<FAQItem[]>(STORAGE_KEYS.FAQS, (initialData.faqs as unknown) as FAQItem[]);
  }

  static getTestimonials(): Testimonial[] {
    return loadFromStorage<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, (initialData.testimonials as unknown) as Testimonial[]);
  }

  static getAppointments(): Appointment[] {
    return loadFromStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, (initialData.appointments as unknown) as Appointment[]);
  }

  static saveAppointments(appointments: Appointment[]): void {
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  static getSettings(): CompanySettings {
    return loadFromStorage<CompanySettings>(STORAGE_KEYS.SETTINGS, (initialData.settings as unknown) as CompanySettings);
  }

  static saveSettings(settings: CompanySettings): void {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }

  static getContacts(): ContactMessage[] {
    return loadFromStorage<ContactMessage[]>(STORAGE_KEYS.CONTACTS, (initialData.contacts as unknown) as ContactMessage[]);
  }

  static saveContacts(contacts: ContactMessage[]): void {
    saveToStorage(STORAGE_KEYS.CONTACTS, contacts);
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
        service: 'Renal Medicity (Client Storage & Netlify Ready)',
        timestamp: new Date().toISOString(),
      }
    };
  }

  // Auth: /api/auth/login
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    const validEmails = ['admin@renalmedicity.com', 'admin'];
    const validPasswords = ['Admin@RenalMedicity2026', 'admin', 'password'];

    if (email && password && validEmails.includes(email.toLowerCase()) && validPasswords.includes(password)) {
      return {
        status: 200,
        data: {
          success: true,
          token: 'demo-jwt-token-renal-medicity-admin',
          user: {
            email: 'admin@renalmedicity.com',
            role: 'admin',
            name: 'Dr. Medical Director'
          }
        }
      };
    }
    return {
      status: 401,
      data: { error: 'Invalid email or password. Use admin@renalmedicity.com / Admin@RenalMedicity2026' }
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
      const newApp: Appointment = {
        id: `RM-2026-${randomSuffix}`,
        fullName: body.fullName || body.patientName || 'Patient',
        mobileNumber: body.mobileNumber || body.phone || '',
        email: body.email || '',
        age: Number(body.age) || 45,
        gender: body.gender || 'Male',
        hospitalLocation: body.hospitalLocation || body.hospitalId || 'Delhi Central Flagship',
        serviceType: body.serviceType || body.serviceId || 'hemodialysis',
        preferredDate: body.preferredDate || new Date().toISOString().slice(0, 10),
        preferredTime: body.preferredTime || '10:00 AM - 02:00 PM (Morning Slot)',
        address: body.address || '',
        additionalNotes: body.additionalNotes || body.medicalHistory || '',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      appointments.unshift(newApp);
      ClientDataStore.saveAppointments(appointments);
      return { status: 201, data: { success: true, message: 'Appointment booked successfully', appointment: newApp } };
    }
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
  if (statusMatch && method === 'PATCH') {
    const id = statusMatch[1];
    const appointments = ClientDataStore.getAppointments();
    const app = appointments.find(a => a.id === id);
    if (!app) return { status: 404, data: { error: 'Appointment not found' } };

    if (body.status) app.status = body.status;
    if (body.adminNotes !== undefined) app.adminNotes = body.adminNotes;
    if (body.rescheduleDate !== undefined) app.rescheduleDate = body.rescheduleDate;
    if (body.rescheduleTime !== undefined) app.rescheduleTime = body.rescheduleTime;
    app.updatedAt = new Date().toISOString();

    ClientDataStore.saveAppointments(appointments);
    return { status: 200, data: { success: true, message: 'Appointment status updated', appointment: app } };
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
      return { status: 201, data: { success: true, message: 'Thank you! Your message has been received.', id: newContact.id } };
    }
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
    if (method === 'POST') {
      const current = ClientDataStore.getSettings();
      const updated = { ...current, ...body };
      ClientDataStore.saveSettings(updated);
      return { status: 200, data: { success: true, message: 'Settings saved successfully', settings: updated } };
    }
  }

  return { status: 404, data: { error: `Endpoint not found: ${method} ${path}` } };
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
