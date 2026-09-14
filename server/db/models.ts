/**
 * Mongoose Schemas & Models for Renal Medicare
 * Ready for MongoDB Atlas deployment
 */

export interface MongooseSchemaDefinition {
  name: string;
  fields: Record<string, any>;
}

export const MongoDBSchemas = {
  Admin: {
    name: 'Admin',
    schema: {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, default: 'admin', enum: ['admin', 'superadmin', 'staff'] },
      createdAt: { type: Date, default: Date.now }
    }
  },
  Appointment: {
    name: 'Appointment',
    schema: {
      fullName: { type: String, required: true, trim: true },
      mobileNumber: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      age: { type: Number, required: true },
      gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
      hospitalLocation: { type: String, required: true },
      serviceType: { type: String, required: true },
      preferredDate: { type: String, required: true },
      preferredTime: { type: String, required: true },
      address: { type: String, required: true },
      additionalNotes: { type: String, default: '' },
      status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Accepted', 'Rejected', 'Rescheduled', 'Completed'] 
      },
      rescheduleDate: { type: String },
      rescheduleTime: { type: String },
      adminNotes: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  },
  Hospital: {
    name: 'Hospital',
    schema: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      contactNumber: { type: String, required: true },
      facilities: [{ type: String }],
      googleMap: { type: String, default: '' },
      image: { type: String, default: '' },
      dialysisUnits: { type: Number, default: 10 },
      emergencyAvailable: { type: Boolean, default: true }
    }
  },
  Service: {
    name: 'Service',
    schema: {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String, required: true },
      shortDescription: { type: String, required: true },
      image: { type: String, default: '' },
      price: { type: String, required: true },
      priceNote: { type: String, default: '' },
      benefits: [{ type: String }],
      features: [{ type: String }],
      category: { type: String, enum: ['dialysis', 'consultation', 'specialized'], default: 'dialysis' },
      isPopular: { type: Boolean, default: false }
    }
  },
  Blog: {
    name: 'Blog',
    schema: {
      title: { type: String, required: true },
      slug: { type: String, required: true, unique: true },
      excerpt: { type: String, required: true },
      content: { type: String, required: true },
      category: { type: String, required: true },
      tags: [{ type: String }],
      featuredImage: { type: String, default: '' },
      author: { type: String, default: 'Dr. Nephrology Team' },
      publishedDate: { type: String, required: true },
      readTime: { type: String, default: '5 min read' },
      metaTitle: { type: String },
      metaDescription: { type: String }
    }
  },
  Contact: {
    name: 'Contact',
    schema: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      subject: { type: String, default: '' },
      message: { type: String, required: true },
      type: { type: String, enum: ['general', 'home-dialysis-request'], default: 'general' },
      address: { type: String, default: '' },
      preferredDate: { type: String, default: '' },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  },
  Testimonial: {
    name: 'Testimonial',
    schema: {
      patientName: { type: String, required: true },
      treatment: { type: String, required: true },
      quote: { type: String, required: true },
      rating: { type: Number, default: 5, min: 1, max: 5 },
      image: { type: String, default: '' },
      location: { type: String, default: '' },
      date: { type: String, default: '' }
    }
  },
  FAQ: {
    name: 'FAQ',
    schema: {
      question: { type: String, required: true },
      answer: { type: String, required: true },
      category: { type: String, default: 'general' }
    }
  },
  Settings: {
    name: 'Settings',
    schema: {
      companyName: { type: String, default: 'Renal Medicare' },
      tagline: { type: String, default: 'Caring For Kidney Health' },
      phone: { type: String, default: '9069645840' },
      alternatePhone: { type: String, default: '7522805397' },
      email: { type: String, default: 'renalhealthcare01@gmail.com' },
      whatsapp: { type: String, default: '9069645840' },
      address: { type: String, default: 'Renal Medicare Kidney Care Hub, Institutional Medical Area, New Delhi, India' },
      workingHours: { type: String, default: '24x7 Dialysis & Emergency Care' },
      emergencyLine: { type: String, default: '+91-9069645840' },
      socialLinks: {
        facebook: { type: String, default: 'https://facebook.com/renalmedicare' },
        twitter: { type: String, default: 'https://twitter.com/renalmedicare' },
        instagram: { type: String, default: 'https://instagram.com/renalmedicare' },
        linkedin: { type: String, default: 'https://linkedin.com/company/renalmedicare' }
      }
    }
  }
};
