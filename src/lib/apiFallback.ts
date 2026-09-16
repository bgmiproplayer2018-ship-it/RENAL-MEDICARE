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

// In-memory runtime cache for quick initial rendering before API responses arrive
let memoryServices: ServiceItem[] = (initialData.services as unknown as ServiceItem[]).filter(
  s => s && s.id !== 'srv-2' && s.slug !== 'peritoneal-dialysis'
);
let memoryHospitals: Hospital[] = initialData.hospitals as unknown as Hospital[];
let memoryBlogs: BlogPost[] = initialData.blogs as unknown as BlogPost[];
let memoryFaqs: FAQItem[] = initialData.faqs as unknown as FAQItem[];
let memoryTestimonials: Testimonial[] = initialData.testimonials as unknown as Testimonial[];
let memoryAppointments: Appointment[] = [];
let memorySettings: CompanySettings = {
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
let memoryContacts: ContactMessage[] = [];

/**
 * ClientDataStore - In-memory data provider.
 * NOTE: All persistence is strictly handled server-side via MongoDB Atlas.
 * No localStorage is used for application data.
 */
export class ClientDataStore {
  static getServices(): ServiceItem[] {
    return memoryServices;
  }

  static saveServices(services: ServiceItem[]): void {
    memoryServices = services;
  }

  static getHospitals(): Hospital[] {
    return memoryHospitals;
  }

  static saveHospitals(hospitals: Hospital[]): void {
    memoryHospitals = hospitals;
  }

  static getBlogs(): BlogPost[] {
    return memoryBlogs;
  }

  static saveBlogs(blogs: BlogPost[]): void {
    memoryBlogs = blogs;
  }

  static getFaqs(): FAQItem[] {
    return memoryFaqs;
  }

  static saveFaqs(faqs: FAQItem[]): void {
    memoryFaqs = faqs;
  }

  static getTestimonials(): Testimonial[] {
    return memoryTestimonials;
  }

  static saveTestimonials(testimonials: Testimonial[]): void {
    memoryTestimonials = testimonials;
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
    memorySettings = settings;
  }

  static getContacts(): ContactMessage[] {
    return memoryContacts;
  }

  static saveContacts(contacts: ContactMessage[]): void {
    memoryContacts = contacts;
  }
}

/**
 * Direct API fetch client.
 * Calls the Express backend directly so MongoDB Atlas serves as the single source of truth.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return window.fetch(input, init);
}

/**
 * Compatibility stub - no-op since MongoDB Atlas is our single source of truth.
 */
export function initApiFallback(): void {
  // No monkey-patching of window.fetch needed. Standard fetch directly queries Express + MongoDB Atlas.
}
