export type AppointmentStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Rescheduled' | 'Completed';

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
