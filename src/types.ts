export type AppointmentStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled' | 'Completed';

export type ReminderChannel = 'whatsapp' | 'email' | 'both';
export type ReminderStatus = 'scheduled' | 'due' | 'sent' | 'failed' | 'disabled';

export interface ReminderLog {
  id: string;
  timestamp: string;
  channel: 'whatsapp' | 'email';
  status: 'sent' | 'delivered' | 'failed' | 'simulated';
  recipient: string;
  messageSnippet: string;
  triggerType: 'automated_24h' | 'manual_admin' | 'patient_test';
}

export interface Appointment {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  hospitalLocation: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
  additionalNotes?: string;
  status: AppointmentStatus;
  rescheduleDate?: string;
  rescheduleTime?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Automated 24-Hour Notification & Reminders
  reminderPreference?: 'whatsapp' | 'email' | 'both' | 'none';
  reminderConsent?: boolean;
  reminderStatus?: ReminderStatus;
  reminderScheduledFor?: string; // e.g. calculated 24h prior to session
  reminderSentAt?: string;
  reminderChannels?: ('whatsapp' | 'email')[];
  reminderLogs?: ReminderLog[];

  // Patient / Client aliases
  patientName?: string;
  phone?: string;
  hospitalId?: string;
  timeSlot?: string;
  notes?: string;
}

export interface NotificationConfig {
  autoReminder24hEnabled: boolean;
  reminderHoursBefore: number;
  enableWhatsApp: boolean;
  enableEmail: boolean;
  whatsappSenderNumber: string;
  emailSenderAddress: string;
  lastAutomatedCheckAt?: string;
  totalRemindersSentCount?: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  price: string;
  priceNote?: string;
  benefits: string[];
  features: string[];
  category: 'dialysis' | 'consultation' | 'specialized';
  isPopular?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber: string;
  facilities: string[];
  googleMap: string;
  image: string;
  dialysisUnits: number;
  emergencyAvailable: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  publishedDate: string;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'dialysis' | 'home-dialysis' | 'appointments' | 'general';
}

export interface Testimonial {
  id: string;
  patientName: string;
  treatment: string;
  quote: string;
  rating: number;
  image: string;
  location: string;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  type: 'general' | 'home-dialysis-request';
  address?: string;
  preferredDate?: string;
  createdAt: string;
  isRead: boolean;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phone: string;
  alternatePhone: string;
  email: string;
  whatsapp: string;
  address: string;
  workingHours: string;
  emergencyLine: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}
