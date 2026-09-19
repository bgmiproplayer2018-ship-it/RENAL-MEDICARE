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

// In-memory and localStorage client-side cache for instant zero-latency rendering
// Allows the frontend to load instantly even if the backend is cold-starting or sleeping.

const CACHE_PREFIX = 'rm_fast_cache_';
const CACHE_KEYS = {
  SERVICES: `${CACHE_PREFIX}services_v3`,
  HOSPITALS: `${CACHE_PREFIX}hospitals_v3`,
  BLOGS: `${CACHE_PREFIX}blogs_v3`,
  FAQS: `${CACHE_PREFIX}faqs_v3`,
  TESTIMONIALS: `${CACHE_PREFIX}testimonials_v3`,
  SETTINGS: `${CACHE_PREFIX}settings_v3`,
  SYNC_TIMESTAMP: `${CACHE_PREFIX}last_sync`,
};

// Safe localStorage accessor
function readLocalCache<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.debug('[Cache] Failed reading key:', key, err);
    return fallback;
  }
}

function writeLocalCache<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.debug('[Cache] Failed writing key:', key, err);
  }
}

// Initial fallback values derived from static catalog
const fallbackServices: ServiceItem[] = (initialData.services as unknown as ServiceItem[]).filter(
  s => s && s.id !== 'srv-2' && s.slug !== 'peritoneal-dialysis'
);
const fallbackHospitals: Hospital[] = initialData.hospitals as unknown as Hospital[];
const fallbackBlogs: BlogPost[] = initialData.blogs as unknown as BlogPost[];
const fallbackFaqs: FAQItem[] = initialData.faqs as unknown as FAQItem[];
const fallbackTestimonials: Testimonial[] = initialData.testimonials as unknown as Testimonial[];
const fallbackSettings: CompanySettings = {
  companyName: 'Renal Medicare',
  tagline: 'Caring For Kidney Health',
  phone: '9069645840',
  alternatePhone: '7522805397',
  email: 'renalhealthcare01@gmail.com',
  whatsapp: '9069645840',
  address: 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089',
  workingHours: '24 Hours Emergency Dialysis | OPD: 8:00 AM - 8:00 PM',
  emergencyLine: '+91-9069645840',
  socialLinks: {
    facebook: 'https://facebook.com/renalmedicare',
    twitter: 'https://twitter.com/renalmedicare',
    instagram: 'https://instagram.com/renalmedicare',
    linkedin: 'https://linkedin.com/company/renalmedicare',
    youtube: 'https://youtube.com/@renalmedicare'
  },
  primaryColor: '#005BBD',
  secondaryColor: '#4FA9FF',
  accentColor: '#0EA5E9'
};

// Seed memory cache synchronously on module load from localStorage or fallback
let memoryServices: ServiceItem[] = readLocalCache<ServiceItem[]>(CACHE_KEYS.SERVICES, fallbackServices);
let memoryHospitals: Hospital[] = readLocalCache<Hospital[]>(CACHE_KEYS.HOSPITALS, fallbackHospitals);
let memoryBlogs: BlogPost[] = readLocalCache<BlogPost[]>(CACHE_KEYS.BLOGS, fallbackBlogs);
let memoryFaqs: FAQItem[] = readLocalCache<FAQItem[]>(CACHE_KEYS.FAQS, fallbackFaqs);
let memoryTestimonials: Testimonial[] = readLocalCache<Testimonial[]>(CACHE_KEYS.TESTIMONIALS, fallbackTestimonials);
let memoryAppointments: Appointment[] = [];
let memorySettings: CompanySettings = readLocalCache<CompanySettings>(CACHE_KEYS.SETTINGS, fallbackSettings);
let memoryContacts: ContactMessage[] = [];

/**
 * ClientDataStore - Instant synchronous data provider with Stale-While-Revalidate caching.
 * Ensures initial page renders with 0ms delay while fresh server data arrives in the background.
 */
export class ClientDataStore {
  static getServices(): ServiceItem[] {
    return memoryServices && memoryServices.length > 0 ? memoryServices : fallbackServices;
  }

  static saveServices(services: ServiceItem[]): void {
    if (Array.isArray(services) && services.length > 0) {
      memoryServices = services;
      writeLocalCache(CACHE_KEYS.SERVICES, services);
      writeLocalCache(CACHE_KEYS.SYNC_TIMESTAMP, Date.now());
    }
  }

  static getHospitals(): Hospital[] {
    return memoryHospitals && memoryHospitals.length > 0 ? memoryHospitals : fallbackHospitals;
  }

  static saveHospitals(hospitals: Hospital[]): void {
    if (Array.isArray(hospitals) && hospitals.length > 0) {
      memoryHospitals = hospitals;
      writeLocalCache(CACHE_KEYS.HOSPITALS, hospitals);
      writeLocalCache(CACHE_KEYS.SYNC_TIMESTAMP, Date.now());
    }
  }

  static getBlogs(): BlogPost[] {
    return memoryBlogs && memoryBlogs.length > 0 ? memoryBlogs : fallbackBlogs;
  }

  static saveBlogs(blogs: BlogPost[]): void {
    if (Array.isArray(blogs) && blogs.length > 0) {
      memoryBlogs = blogs;
      writeLocalCache(CACHE_KEYS.BLOGS, blogs);
    }
  }

  static getFaqs(): FAQItem[] {
    return memoryFaqs && memoryFaqs.length > 0 ? memoryFaqs : fallbackFaqs;
  }

  static saveFaqs(faqs: FAQItem[]): void {
    if (Array.isArray(faqs) && faqs.length > 0) {
      memoryFaqs = faqs;
      writeLocalCache(CACHE_KEYS.FAQS, faqs);
    }
  }

  static getTestimonials(): Testimonial[] {
    return memoryTestimonials && memoryTestimonials.length > 0 ? memoryTestimonials : fallbackTestimonials;
  }

  static saveTestimonials(testimonials: Testimonial[]): void {
    if (Array.isArray(testimonials) && testimonials.length > 0) {
      memoryTestimonials = testimonials;
      writeLocalCache(CACHE_KEYS.TESTIMONIALS, testimonials);
    }
  }

  static getAppointments(): Appointment[] {
    return memoryAppointments;
  }

  static saveAppointments(appointments: Appointment[]): void {
    memoryAppointments = appointments;
  }

  static getSettings(): CompanySettings {
    return memorySettings;
  }

  static saveSettings(settings: CompanySettings): void {
    if (settings) {
      memorySettings = settings;
      writeLocalCache(CACHE_KEYS.SETTINGS, settings);
      writeLocalCache(CACHE_KEYS.SYNC_TIMESTAMP, Date.now());
    }
  }

  static getContacts(): ContactMessage[] {
    return memoryContacts;
  }

  static saveContacts(contacts: ContactMessage[]): void {
    memoryContacts = contacts;
  }
}

/**
 * Enhanced apiFetch with cold-start resilient background retries.
 * When the serverless/container backend is sleeping, incoming requests might take 5-15s
 * or return 502/503/504 gateway errors.
 * This wrapper transparently retries with exponential backoff so frontend pages
 * never freeze or crash while the backend wakes up.
 */

export interface ApiFetchOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  silent?: boolean;
}

export type BackendStatus = 'online' | 'waking' | 'offline';
let currentBackendStatus: BackendStatus = 'online';
const statusListeners = new Set<(status: BackendStatus) => void>();

export function getBackendStatus(): BackendStatus {
  return currentBackendStatus;
}

function setBackendStatus(status: BackendStatus) {
  if (currentBackendStatus !== status) {
    currentBackendStatus = status;
    statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (e) {
        console.debug('Status listener error:', e);
      }
    });
  }
}

export function subscribeBackendStatus(callback: (status: BackendStatus) => void): () => void {
  statusListeners.add(callback);
  callback(currentBackendStatus);
  return () => {
    statusListeners.delete(callback);
  };
}

// Background wake-up ping
let isWakingBackend = false;
export async function wakeBackendQuietly(): Promise<boolean> {
  if (isWakingBackend) return false;
  isWakingBackend = true;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await window.fetch('/api/health', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      setBackendStatus('online');
      isWakingBackend = false;
      return true;
    }
  } catch {
    // Backend may still be spinning up
  }
  isWakingBackend = false;
  return false;
}

export async function apiFetch(
  input: RequestInfo | URL, 
  init?: RequestInit,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const isRead = method === 'GET' || method === 'HEAD';

  // Sane defaults: read requests get 3 retries with shorter timeout; write requests get 2 retries with generous timeout
  const maxRetries = options.retries ?? (isRead ? 3 : 2);
  const baseDelay = options.retryDelay ?? 1200;
  const timeoutMs = options.timeout ?? (isRead ? 9000 : 18000);

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    // Merge abort signals
    const userSignal = init?.signal;
    if (userSignal) {
      userSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const res = await window.fetch(input, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Status 502, 503, 504 indicate a cold container / proxy waking up
      const isSleepingGateway = res.status === 502 || res.status === 503 || res.status === 504;

      if (isSleepingGateway && attempt < maxRetries) {
        setBackendStatus('waking');
        const delay = Math.min(baseDelay * Math.pow(1.6, attempt), 6000) + Math.random() * 300;
        console.debug(`[apiFetch] Server cold starting (status ${res.status}). Retrying attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (res.ok) {
        setBackendStatus('online');
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      const isAbortedByUser = userSignal && userSignal.aborted;
      if (isAbortedByUser) {
        throw err;
      }

      if (attempt < maxRetries) {
        setBackendStatus('waking');
        const delay = Math.min(baseDelay * Math.pow(1.6, attempt), 6000) + Math.random() * 300;
        console.debug(`[apiFetch] Connection issue or timeout (${err.name || 'NetworkError'}). Retrying attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  // If all retries failed and it's a GET request, construct a safe fallback response rather than unhandled crash
  if (isRead) {
    setBackendStatus('offline');
    console.warn(`[apiFetch] All background retries exhausted for ${String(input)}. Backend may be offline or unreachable. Returning fallback.`);
    return new Response(JSON.stringify({ success: false, error: 'Backend unreachable after retries', cached: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  throw lastError || new Error('Network request failed after retries');
}

/**
 * Compatibility stub - no-op since MongoDB Atlas is our single source of truth.
 */
export function initApiFallback(): void {
  // No monkey-patching of window.fetch needed. Standard fetch directly queries Express + MongoDB Atlas.
}
