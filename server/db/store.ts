import fs from 'fs';
import path from 'path';
import { 
  Appointment, 
  ServiceItem, 
  Hospital, 
  BlogPost, 
  FAQItem, 
  Testimonial, 
  ContactMessage, 
  CompanySettings 
} from '../../src/types.ts';
import { 
  connectToMongoDB, 
  getDb, 
  logCollectionUpdated, 
  logSaveFailed,
  isMongoConnected 
} from './connection.ts';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial seed data
const initialServices: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'Hemodialysis',
    slug: 'hemodialysis',
    description: 'Gold-standard blood filtration using advanced high-flux biocompatible dialyzers and ultra-pure RO water systems. Monitored continuously by licensed dialysis nurses and senior nephrologists.',
    shortDescription: 'High-flux hemodialysis in state-of-the-art sterile suites with online clearance monitoring.',
    image: '/images/patient-dialysis-hospital-room.jpg',
    price: '₹2,200',
    priceNote: 'Per session (includes consumable dialyzer tubing & medication)',
    benefits: [
      'Advanced high-flux biocompatible dialyzers',
      'Ultra-pure double-pass RO water filtration meeting AAMI standards',
      'Continuous hemodynamic and real-time Kt/V clearance monitoring',
      'In-chair physiological vitals monitoring and emergency backup',
      'Individual entertainment screens & ergonomic motorized therapy recliners'
    ],
    features: ['4-hour session', 'Dietitian consultation', 'Free Wi-Fi', 'Vascular access check'],
    category: 'dialysis',
    isPopular: true
  },
  {
    id: 'srv-3',
    title: 'Home Dialysis',
    slug: 'home-dialysis',
    description: 'Hospital-grade dialysis in the comfort, safety, and dignity of your own bedroom. Includes a dedicated certified dialysis technician at every single session, RO installation, and emergency protocols.',
    shortDescription: 'Complete hospital-grade hemodialysis delivered at your home with certified personal technician.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    price: '₹3,800',
    priceNote: 'Per home session with certified technician & machine setup',
    benefits: [
      'Zero travel fatigue and exposure to hospital infections',
      'Certified senior dialysis technician remains with you throughout the session',
      'Custom compact water purification system installed at your home',
      'Direct video supervision by Chief Nephrologist during treatment',
      'Flexible scheduling suited to your work and family routine'
    ],
    features: ['Home visit technician', 'Mobile RO unit', 'Emergency kit included', 'Nephrologist on-call'],
    category: 'dialysis',
    isPopular: true
  },
  {
    id: 'srv-4',
    title: 'Emergency Dialysis',
    slug: 'emergency-dialysis',
    description: 'Immediate 24/7 emergency hemodialysis and continuous renal replacement therapy (CRRT) for acute kidney injury, severe hyperkalemia, fluid overload, and toxic metabolic states.',
    shortDescription: '24/7 emergency response with ICU bedside dialysis and acute vascular access intervention.',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    price: '₹4,500',
    priceNote: 'Acute care session with emergency vascular catheter placement',
    benefits: [
      'Immediate mobilization within 30 minutes of clinical triage',
      'Bedside Continuous Renal Replacement Therapy (CRRT / SLED)',
      'Emergency temporary double-lumen femoral/jugular catheter insertion',
      'Multidisciplinary ICU intensivist & nephrologist team on standby',
      'Critical blood gas, electrolyte, and cardiac monitoring'
    ],
    features: ['24x7 availability', 'ICU mobilization', 'Rapid catheter placement', 'Cardiac monitoring'],
    category: 'specialized'
  },
  {
    id: 'srv-5',
    title: 'Kidney Consultation',
    slug: 'kidney-consultation',
    description: 'Comprehensive assessment for early stage CKD, protein leak (proteinuria), recurrent kidney stones, refractory hypertension, and renal cysts with preventive management plans.',
    shortDescription: 'Thorough screening and personalized medical management to slow progression of kidney disease.',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    price: '₹1,200',
    priceNote: 'First consultation with complete renal panel review',
    benefits: [
      'Detailed review of eGFR, creatinine clearance, and microalbuminuria',
      'Personalized renal nutrition and low-sodium/low-potassium diet chart',
      'Blood pressure optimization with renoprotective medications',
      'Screening for diabetic kidney disease and hypertensive nephrosclerosis',
      'Clear roadmap to protect remaining kidney function'
    ],
    features: ['Detailed medical report', 'Diet chart included', 'Follow-up query support', 'Lab test guidance'],
    category: 'consultation'
  },
  {
    id: 'srv-6',
    title: 'Nephrologist Consultation',
    slug: 'nephrologist-consultation',
    description: 'In-depth clinical consultation with board-certified super-specialist Nephrologists. Specialized in AV fistula management, kidney transplant workup, glomerulonephritis, and second opinions.',
    shortDescription: 'Super-specialist nephrology expertise for advanced kidney conditions and transplant advice.',
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
    price: '₹1,800',
    priceNote: 'Senior Nephrologist Consultation (In-clinic or Tele-health)',
    benefits: [
      'Consultation with DM/DNB certified senior kidney specialists',
      'Comprehensive kidney transplant eligibility and donor evaluation',
      'AV Fistula / Vascular access patency ultrasound assessment',
      'Expert second opinions on biopsy reports and renal histopathology',
      'Preparation for pre-emptive dialysis or transplant listing'
    ],
    features: ['Senior DM Nephrologist', 'AV fistula assessment', 'Second opinion review', 'Digital prescription'],
    category: 'consultation',
    isPopular: true
  }
];

const initialHospitals: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Renal medicare (kidney care & dialysis centre)',
    address: '63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089',
    city: 'Delhi',
    state: 'Delhi',
    contactNumber: '9069645840',
    facilities: ['24/7 Dialysis Wing', 'ICU CRRT Bedside', 'Modular RO Unit', 'Emergency Ambulance', 'Dialysis Recliners with TV'],
    googleMap: 'https://maps.google.com/?q=63+64+65+Pocket+4+Sector+16A+Rohini+Delhi+110089',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 32,
    emergencyAvailable: true
  },
  {
    id: 'hosp-2',
    name: 'Renal Medicare Dialysis & Critical Care Center',
    address: 'Sector 51, Golf Course Extension Road, Opposite Artemis Hospital',
    city: 'Gurugram',
    state: 'Haryana',
    contactNumber: '7522805397',
    facilities: ['Negative Pressure Isolation Room', 'High-Flux Hemodiafiltration', 'Home Dialysis Command Center', 'In-house Nephro Lab'],
    googleMap: 'https://maps.google.com/?q=Sector+51+Gurugram',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 24,
    emergencyAvailable: true
  },
  {
    id: 'hosp-3',
    name: 'Renal Medicare Nephro Care Hub',
    address: 'Express Trade Towers, Sector 132, Expressway Corridor',
    city: 'Noida',
    state: 'Uttar Pradesh',
    contactNumber: '9069645840',
    facilities: ['Kidney Preventive Care Clinic', 'Vascular Access Center (Fistula Care)', '24x7 Emergency Helpdesk', 'Cafeteria & Patient Lounge'],
    googleMap: 'https://maps.google.com/?q=Sector+132+Noida',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 20,
    emergencyAvailable: true
  },
  {
    id: 'hosp-4',
    name: 'Renal Medicare Regional Kidney Institute',
    address: 'S.V. Road, Near Bandra Medical Enclave, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    contactNumber: '9069645840',
    facilities: ['Kidney Transplant Evaluation', 'Pediatric Nephrology Unit', 'Ultrapure Water Dialysis', 'Private Executive Dialysis Suites'],
    googleMap: 'https://maps.google.com/?q=Bandra+West+Mumbai',
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 28,
    emergencyAvailable: true
  },
  {
    id: 'hosp-5',
    name: 'Renal Medicare Advanced Dialysis Wing',
    address: '100 Feet Road, Indiranagar, Near Metro Pillar 84',
    city: 'Bengaluru',
    state: 'Karnataka',
    contactNumber: '7522805397',
    facilities: ['Specialized Hemodiafiltration Unit', 'Online HDF Blood Purification', 'Home Visit Dispatch Unit'],
    googleMap: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
    image: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 22,
    emergencyAvailable: true
  },
  {
    id: 'hosp-6',
    name: 'Renal Medicare Kidney & Dialysis Center',
    address: 'Madhya Marg, Sector 7-C, Near PGI Medical Corridor',
    city: 'Chandigarh',
    state: 'Punjab',
    contactNumber: '9069645840',
    facilities: ['24-Hour Emergency Triage', 'Dialysis Consumable Pharmacy', 'Patient Pick-up Assistance', 'Sterile Isolation Beds'],
    googleMap: 'https://maps.google.com/?q=Sector+7+Chandigarh',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: 18,
    emergencyAvailable: true
  }
];

const initialBlogs: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Understanding Dialysis: Hemodialysis vs. Peritoneal Dialysis Explained',
    slug: 'hemodialysis-vs-peritoneal-dialysis-explained',
    excerpt: 'Explore the key differences, lifestyle impacts, dietary freedoms, and clinical suitability of Hemodialysis versus Peritoneal Dialysis.',
    content: `Kidney failure requires renal replacement therapy to remove metabolic toxins, excess fluid, and balance electrolytes. The two primary modalities available today are Hemodialysis (HD) and Peritoneal Dialysis (PD).

### What is Hemodialysis?
In hemodialysis, blood is drawn from a vascular access (usually an Arteriovenous Fistula, Graft, or central catheter) into an external artificial kidney known as a dialyzer. Inside the dialyzer, microscopic semi-permeable capillary fibers filter toxins and fluid across an ultrapure dialysate fluid gradient.
- **Frequency:** Typically performed 3 times weekly, lasting 4 hours per session.
- **Environment:** Conducted in dedicated hospital dialysis suites or at home under technician supervision.
- **Benefits:** Fast fluid removal, supervised by clinical team, high clearance rates.

### What is Peritoneal Dialysis?
Peritoneal dialysis utilizes the patient's own natural abdominal lining (the peritoneum) as a biological filter. A sterile dialysate fluid is infused into the peritoneal cavity via a soft silicone catheter. After several hours (dwell time), the fluid absorbs waste and is drained out.
- **Types:** Continuous Ambulatory (CAPD) with manual bag exchanges, or Automated Peritoneal Dialysis (APD) performed at night with a gentle cycler machine.
- **Benefits:** Can be performed anywhere, preserves residual urine output longer, and requires fewer dietary restrictions.

At Renal Medicare, our nephrologists help you choose the best modality tailored to your cardiovascular status, lifestyle, and clinical parameters.`,
    category: 'Dialysis Guide',
    tags: ['Dialysis', 'Kidney Health', 'Hemodialysis', 'Peritoneal Dialysis'],
    featuredImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    author: 'Dr. Vivek Sharma, Senior Nephrologist',
    publishedDate: 'September 10, 2026',
    readTime: '6 min read',
    metaTitle: 'Hemodialysis vs Peritoneal Dialysis: Which Is Right For You?',
    metaDescription: 'A clinical guide comparing Hemodialysis and Peritoneal Dialysis by Renal Medicare nephrologists.'
  },
  {
    id: 'blog-2',
    title: '5 Crucial Dietary Guidelines Every Kidney Patient Must Follow',
    slug: '5-crucial-dietary-guidelines-kidney-patient',
    excerpt: 'Learn how to manage sodium, potassium, phosphorus, fluid balance, and protein intake to protect kidney function and feel energetic.',
    content: `A renal-friendly diet is one of the most effective non-pharmacological tools to preserve kidney function and manage dialysis therapy comfortably.

### 1. Master Your Sodium (Salt) Intake
Excess sodium causes fluid retention, spikes blood pressure, and strains the heart. 
- Avoid canned soups, pickles, papads, processed cheese, and packaged snack foods.
- Enhance flavor naturally using fresh lemon juice, garlic, ginger, mint, cumin, and fresh herbs instead of table salt.

### 2. Balance Potassium Levels
Kidneys normally excrete potassium. When kidney function declines, high potassium can trigger life-threatening cardiac arrhythmias.
- Choose lower potassium fruits like apples, berries, pineapples, and papayas.
- Leach high-potassium vegetables like potatoes by slicing and soaking in warm water before cooking.

### 3. Keep Phosphorus Under Control
High phosphorus pulls calcium out of bones, making them brittle and causing severe itching and vascular calcification.
- Avoid dark colas, processed meats, and condensed milk.
- Take prescribed phosphate binders with meals as directed by your nephrologist.`,
    category: 'Nutrition & Diet',
    tags: ['Renal Diet', 'Nutrition', 'Potassium', 'Phosphorus'],
    featuredImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    author: 'Pooja Kashyap, Lead Clinical Renal Dietitian',
    publishedDate: 'September 05, 2026',
    readTime: '5 min read',
    metaTitle: 'Renal Nutrition: 5 Crucial Dietary Rules for Kidney Health',
    metaDescription: 'Expert clinical diet guidelines for patients with Chronic Kidney Disease and those on Hemodialysis.'
  }
];

const initialFaqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How often do I need to undergo Hemodialysis?',
    answer: 'Standard in-center hemodialysis is typically prescribed 3 times per week, with each clinical session lasting approximately 4 hours. The exact frequency is determined by your nephrologist based on your residual renal function, fluid retention, serum urea/creatinine, and Kt/V clearance metrics.',
    category: 'dialysis'
  },
  {
    id: 'faq-2',
    question: 'What is Home Hemodialysis and is it safe?',
    answer: 'Yes, Home Hemodialysis is exceptionally safe when administered through Renal Medicare. We install a dedicated hospital-grade compact reverse-osmosis (RO) water purification system and deploy a licensed, certified dialysis technician who stays by your bedside for the entire duration of the procedure under remote nephrologist supervision.',
    category: 'home-dialysis'
  }
];

const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'Rameshwar Nath Gupta',
    treatment: 'In-Center High-Flux Hemodialysis (2 Years)',
    quote: 'The dialysis suite at Renal Medicare Rohini is immaculate. The nurses are gentle with fistula cannulation, and the Kt/V clearance reports are always shared transparently with my son every month.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'Rohini, New Delhi',
    date: 'August 2026'
  },
  {
    id: 'test-2',
    patientName: 'Sunita Mehra',
    treatment: 'Home Hemodialysis Program',
    quote: 'Having dialysis at home has completely transformed our routine. My mother no longer has to endure grueling ambulance rides across Delhi traffic thrice a week. The technician is punctual, professional, and compassionate.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    location: 'Gurugram',
    date: 'July 2026'
  }
];

const initialAppointments: Appointment[] = [
  {
    id: 'RM-2026-4413',
    fullName: 'Rajesh Verma',
    mobileNumber: '9069645840',
    email: '9069645840@patient.renalmedicare.com',
    age: 45,
    gender: 'Male',
    hospitalLocation: 'Renal medicare (kidney care & dialysis centre)',
    serviceType: 'Hemodialysis',
    preferredDate: '2026-09-25',
    preferredTime: 'Morning (07:00 AM - 11:00 AM)',
    address: 'Rohini Sector 16A, Delhi',
    additionalNotes: '',
    status: 'Pending',
    createdAt: '2026-09-12T13:34:07.332Z',
    updatedAt: '2026-09-12T13:34:07.333Z'
  }
];

const initialSettings: CompanySettings = {
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

const initialContacts: ContactMessage[] = [];

export interface DatabaseState {
  services: ServiceItem[];
  hospitals: Hospital[];
  blogs: BlogPost[];
  faqs: FAQItem[];
  testimonials: Testimonial[];
  appointments: Appointment[];
  settings: CompanySettings;
  contacts: ContactMessage[];
}

class Store {
  private state: DatabaseState;
  private isSeededMongo: boolean = false;

  constructor() {
    this.state = {
      services: initialServices,
      hospitals: initialHospitals,
      blogs: initialBlogs,
      faqs: initialFaqs,
      testimonials: initialTestimonials,
      appointments: initialAppointments,
      settings: initialSettings,
      contacts: initialContacts,
    };
    this.initLocal();
    // Connect to MongoDB Atlas
    this.initMongo();

    // Periodically re-check MongoDB Atlas connection in background (e.g. once IP is added to Atlas)
    setInterval(() => {
      if (!this.isSeededMongo) {
        this.initMongo();
      }
    }, 30000);
  }

  private initLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.state = { ...this.state, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[Store] Local store initialization note:', e);
    }
  }

  public async initMongo() {
    try {
      const db = await connectToMongoDB();
      if (!db || this.isSeededMongo) return;

      // Ensure MongoDB Atlas collections exist and are seeded if empty
      const servicesCount = await db.collection('services').countDocuments();
      if (servicesCount === 0) {
        await db.collection('services').insertMany(this.state.services);
        logCollectionUpdated('services', 'initial seed');
      }

      const hospitalsCount = await db.collection('hospitals').countDocuments();
      if (hospitalsCount === 0) {
        await db.collection('hospitals').insertMany(this.state.hospitals);
        logCollectionUpdated('hospitals', 'initial seed');
      }

      const settingsCount = await db.collection('settings').countDocuments();
      if (settingsCount === 0) {
        await db.collection('settings').insertOne({ ...this.state.settings });
        logCollectionUpdated('settings', 'initial seed');
      }

      const appointmentsCount = await db.collection('appointments').countDocuments();
      if (appointmentsCount === 0 && this.state.appointments.length > 0) {
        await db.collection('appointments').insertMany(this.state.appointments);
        logCollectionUpdated('appointments', 'initial seed');
      }

      const inquiriesCount = await db.collection('inquiries').countDocuments();
      if (inquiriesCount === 0 && this.state.contacts.length > 0) {
        await db.collection('inquiries').insertMany(this.state.contacts);
        logCollectionUpdated('inquiries', 'initial seed');
      }

      const blogsCount = await db.collection('blogs').countDocuments();
      if (blogsCount === 0 && this.state.blogs.length > 0) {
        await db.collection('blogs').insertMany(this.state.blogs);
      }

      const faqsCount = await db.collection('faqs').countDocuments();
      if (faqsCount === 0 && this.state.faqs.length > 0) {
        await db.collection('faqs').insertMany(this.state.faqs);
      }

      const testimonialsCount = await db.collection('testimonials').countDocuments();
      if (testimonialsCount === 0 && this.state.testimonials.length > 0) {
        await db.collection('testimonials').insertMany(this.state.testimonials);
      }

      this.isSeededMongo = true;
    } catch (err: any) {
      logSaveFailed('initialization', err);
    }
  }

  private saveLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      // Local sync fail-safe
    }
  }

  // --------------------------------------------------------------------------
  // SERVICES (Single Source of Truth: MongoDB Atlas collection 'services')
  // --------------------------------------------------------------------------
  async getServices(): Promise<ServiceItem[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('services').find({}).toArray();
        const mapped = list.map(({ _id, ...doc }) => doc as ServiceItem);
        this.state.services = mapped;
        return mapped;
      } catch (err: any) {
        logSaveFailed('services', err);
      }
    }
    return this.state.services;
  }

  async addService(service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    const newService: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`
    };

    const db = getDb();
    if (db) {
      try {
        await db.collection('services').insertOne({ ...newService });
        logCollectionUpdated('services', `created ${newService.id}`);
      } catch (err: any) {
        logSaveFailed('services', err);
        throw err;
      }
    }

    this.state.services.unshift(newService);
    this.saveLocal();
    return newService;
  }

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safeUpdates } = updates as any;
        const result = await db.collection('services').updateOne({ id }, { $set: safeUpdates });
        if (result.matchedCount > 0) {
          logCollectionUpdated('services', `updated ${id}`);
          const fresh = await db.collection('services').findOne({ id });
          if (fresh) {
            const { _id: _, ...doc } = fresh;
            const idx = this.state.services.findIndex(s => s.id === id);
            if (idx !== -1) this.state.services[idx] = doc as ServiceItem;
            this.saveLocal();
            return doc as ServiceItem;
          }
        }
      } catch (err: any) {
        logSaveFailed('services', err);
        throw err;
      }
    }

    const idx = this.state.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.state.services[idx] = { ...this.state.services[idx], ...updates };
    this.saveLocal();
    return this.state.services[idx];
  }

  async deleteService(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const result = await db.collection('services').deleteOne({ id });
        if (result.deletedCount > 0) {
          logCollectionUpdated('services', `deleted ${id}`);
          this.state.services = this.state.services.filter(s => s.id !== id);
          this.saveLocal();
          return true;
        }
      } catch (err: any) {
        logSaveFailed('services', err);
        throw err;
      }
    }

    const len = this.state.services.length;
    this.state.services = this.state.services.filter(s => s.id !== id);
    if (this.state.services.length !== len) {
      this.saveLocal();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // HOSPITALS (Single Source of Truth: MongoDB Atlas collection 'hospitals')
  // --------------------------------------------------------------------------
  async getHospitals(): Promise<Hospital[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('hospitals').find({}).toArray();
        const mapped = list.map(({ _id, ...doc }) => doc as Hospital);
        this.state.hospitals = mapped;
        return mapped;
      } catch (err: any) {
        logSaveFailed('hospitals', err);
      }
    }
    return this.state.hospitals;
  }

  async addHospital(hospital: Omit<Hospital, 'id'>): Promise<Hospital> {
    const newHosp: Hospital = {
      ...hospital,
      id: `hosp-${Date.now()}`
    };

    const db = getDb();
    if (db) {
      try {
        await db.collection('hospitals').insertOne({ ...newHosp });
        logCollectionUpdated('hospitals', `created ${newHosp.id}`);
      } catch (err: any) {
        logSaveFailed('hospitals', err);
        throw err;
      }
    }

    this.state.hospitals.push(newHosp);
    this.saveLocal();
    return newHosp;
  }

  async updateHospital(id: string, updates: Partial<Hospital>): Promise<Hospital | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safeUpdates } = updates as any;
        const result = await db.collection('hospitals').updateOne({ id }, { $set: safeUpdates });
        if (result.matchedCount > 0) {
          logCollectionUpdated('hospitals', `updated ${id}`);
          const fresh = await db.collection('hospitals').findOne({ id });
          if (fresh) {
            const { _id: _, ...doc } = fresh;
            const idx = this.state.hospitals.findIndex(h => h.id === id);
            if (idx !== -1) this.state.hospitals[idx] = doc as Hospital;
            this.saveLocal();
            return doc as Hospital;
          }
        }
      } catch (err: any) {
        logSaveFailed('hospitals', err);
        throw err;
      }
    }

    const idx = this.state.hospitals.findIndex(h => h.id === id);
    if (idx === -1) return null;
    this.state.hospitals[idx] = { ...this.state.hospitals[idx], ...updates };
    this.saveLocal();
    return this.state.hospitals[idx];
  }

  async deleteHospital(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const result = await db.collection('hospitals').deleteOne({ id });
        if (result.deletedCount > 0) {
          logCollectionUpdated('hospitals', `deleted ${id}`);
          this.state.hospitals = this.state.hospitals.filter(h => h.id !== id);
          this.saveLocal();
          return true;
        }
      } catch (err: any) {
        logSaveFailed('hospitals', err);
        throw err;
      }
    }

    const len = this.state.hospitals.length;
    this.state.hospitals = this.state.hospitals.filter(h => h.id !== id);
    if (this.state.hospitals.length !== len) {
      this.saveLocal();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // APPOINTMENTS (Single Source of Truth: MongoDB Atlas collection 'appointments')
  // --------------------------------------------------------------------------
  async getAppointments(): Promise<Appointment[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('appointments').find({}).sort({ createdAt: -1 }).toArray();
        const mapped = list.map(({ _id, ...doc }) => doc as Appointment);
        this.state.appointments = mapped;
        return mapped;
      } catch (err: any) {
        logSaveFailed('appointments', err);
      }
    }
    return this.state.appointments;
  }

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Appointment['status'] }): Promise<Appointment> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      ...data,
      id: `RM-2026-${randomSuffix}`,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const db = getDb();
    if (db) {
      try {
        await db.collection('appointments').insertOne({ ...newAppointment });
        logCollectionUpdated('appointments', `created ${newAppointment.id}`);
      } catch (err: any) {
        logSaveFailed('appointments', err);
        throw err;
      }
    }

    this.state.appointments.unshift(newAppointment);
    this.saveLocal();
    return newAppointment;
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const db = getDb();
    const updatedPayload = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      try {
        const { _id, ...safeUpdates } = updatedPayload as any;
        const result = await db.collection('appointments').updateOne(
          { $or: [{ id }, { id: id.toUpperCase() }, { id: id.toLowerCase() }] },
          { $set: safeUpdates }
        );
        if (result.matchedCount > 0) {
          logCollectionUpdated('appointments', `updated ${id}`);
          const fresh = await db.collection('appointments').findOne({
            $or: [{ id }, { id: id.toUpperCase() }, { id: id.toLowerCase() }]
          });
          if (fresh) {
            const { _id: _, ...doc } = fresh;
            const idx = this.state.appointments.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
            if (idx !== -1) this.state.appointments[idx] = doc as Appointment;
            this.saveLocal();
            return doc as Appointment;
          }
        }
      } catch (err: any) {
        logSaveFailed('appointments', err);
        throw err;
      }
    }

    const idx = this.state.appointments.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return null;
    this.state.appointments[idx] = {
      ...this.state.appointments[idx],
      ...updatedPayload
    };
    this.saveLocal();
    return this.state.appointments[idx];
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const result = await db.collection('appointments').deleteOne({
          $or: [{ id }, { id: id.toUpperCase() }, { id: id.toLowerCase() }]
        });
        if (result.deletedCount > 0) {
          logCollectionUpdated('appointments', `deleted ${id}`);
          this.state.appointments = this.state.appointments.filter(a => a.id.toLowerCase() !== id.toLowerCase());
          this.saveLocal();
          return true;
        }
      } catch (err: any) {
        logSaveFailed('appointments', err);
        throw err;
      }
    }

    const len = this.state.appointments.length;
    this.state.appointments = this.state.appointments.filter(a => a.id.toLowerCase() !== id.toLowerCase());
    if (this.state.appointments.length !== len) {
      this.saveLocal();
      return true;
    }
    return false;
  }

  async syncAppointments(incoming: Appointment[]): Promise<Appointment[]> {
    const db = getDb();
    for (const item of incoming) {
      if (!item || !item.id) continue;
      if (db) {
        try {
          const { _id, ...safeDoc } = item as any;
          await db.collection('appointments').updateOne(
            { id: item.id },
            { $set: safeDoc },
            { upsert: true }
          );
        } catch {}
      }
    }
    if (db) {
      logCollectionUpdated('appointments', 'batch sync');
    }
    return this.getAppointments();
  }

  // --------------------------------------------------------------------------
  // INQUIRIES / CONTACTS (Single Source of Truth: MongoDB Atlas collection 'inquiries')
  // --------------------------------------------------------------------------
  async getInquiries(): Promise<ContactMessage[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('inquiries').find({}).sort({ createdAt: -1 }).toArray();
        const mapped = list.map(({ _id, ...doc }) => doc as ContactMessage);
        this.state.contacts = mapped;
        return mapped;
      } catch (err: any) {
        logSaveFailed('inquiries', err);
      }
    }
    return this.state.contacts;
  }

  async getContacts(): Promise<ContactMessage[]> {
    return this.getInquiries();
  }

  async addInquiry(contact: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<ContactMessage> {
    const newMsg: ContactMessage = {
      ...contact,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    const db = getDb();
    if (db) {
      try {
        await db.collection('inquiries').insertOne({ ...newMsg });
        logCollectionUpdated('inquiries', `created ${newMsg.id}`);
      } catch (err: any) {
        logSaveFailed('inquiries', err);
        throw err;
      }
    }

    this.state.contacts.unshift(newMsg);
    this.saveLocal();
    return newMsg;
  }

  async addContact(contact: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): Promise<ContactMessage> {
    return this.addInquiry(contact);
  }

  async updateInquiry(id: string, updates: Partial<ContactMessage>): Promise<ContactMessage | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safeUpdates } = updates as any;
        const result = await db.collection('inquiries').updateOne({ id }, { $set: safeUpdates });
        if (result.matchedCount > 0) {
          logCollectionUpdated('inquiries', `updated ${id}`);
          const fresh = await db.collection('inquiries').findOne({ id });
          if (fresh) {
            const { _id: _, ...doc } = fresh;
            const idx = this.state.contacts.findIndex(c => c.id === id);
            if (idx !== -1) this.state.contacts[idx] = doc as ContactMessage;
            this.saveLocal();
            return doc as ContactMessage;
          }
        }
      } catch (err: any) {
        logSaveFailed('inquiries', err);
        throw err;
      }
    }

    const idx = this.state.contacts.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.state.contacts[idx] = { ...this.state.contacts[idx], ...updates };
    this.saveLocal();
    return this.state.contacts[idx];
  }

  async markContactRead(id: string): Promise<boolean> {
    const updated = await this.updateInquiry(id, { isRead: true });
    return !!updated;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        const result = await db.collection('inquiries').deleteOne({ id });
        if (result.deletedCount > 0) {
          logCollectionUpdated('inquiries', `deleted ${id}`);
          this.state.contacts = this.state.contacts.filter(c => c.id !== id);
          this.saveLocal();
          return true;
        }
      } catch (err: any) {
        logSaveFailed('inquiries', err);
        throw err;
      }
    }

    const len = this.state.contacts.length;
    this.state.contacts = this.state.contacts.filter(c => c.id !== id);
    if (this.state.contacts.length !== len) {
      this.saveLocal();
      return true;
    }
    return false;
  }

  async deleteContact(id: string): Promise<boolean> {
    return this.deleteInquiry(id);
  }

  async deleteMultipleInquiries(ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    const db = getDb();
    if (db) {
      try {
        const result = await db.collection('inquiries').deleteMany({ id: { $in: ids } });
        logCollectionUpdated('inquiries', `batch deleted ${result.deletedCount} items`);
        this.state.contacts = this.state.contacts.filter(c => !ids.includes(c.id));
        this.saveLocal();
        return result.deletedCount;
      } catch (err: any) {
        logSaveFailed('inquiries', err);
        throw err;
      }
    }

    const initialLen = this.state.contacts.length;
    this.state.contacts = this.state.contacts.filter(c => !ids.includes(c.id));
    const deleted = initialLen - this.state.contacts.length;
    this.saveLocal();
    return deleted;
  }

  async syncContacts(incoming: ContactMessage[]): Promise<ContactMessage[]> {
    const db = getDb();
    for (const item of incoming) {
      if (!item || !item.id) continue;
      if (db) {
        try {
          const { _id, ...safeDoc } = item as any;
          await db.collection('inquiries').updateOne(
            { id: item.id },
            { $set: safeDoc },
            { upsert: true }
          );
        } catch {}
      }
    }
    if (db) {
      logCollectionUpdated('inquiries', 'batch sync');
    }
    return this.getInquiries();
  }

  // --------------------------------------------------------------------------
  // SETTINGS (Single Source of Truth: MongoDB Atlas collection 'settings')
  // --------------------------------------------------------------------------
  async getSettings(): Promise<CompanySettings> {
    const db = getDb();
    if (db) {
      try {
        const doc = await db.collection('settings').findOne({});
        if (doc) {
          const { _id, ...safe } = doc;
          this.state.settings = safe as CompanySettings;
          return safe as CompanySettings;
        }
      } catch (err: any) {
        logSaveFailed('settings', err);
      }
    }
    return this.state.settings;
  }

  async updateSettings(updates: Partial<CompanySettings>): Promise<CompanySettings> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safeUpdates } = updates as any;
        await db.collection('settings').updateOne({}, { $set: safeUpdates }, { upsert: true });
        logCollectionUpdated('settings', 'updated');
        const fresh = await db.collection('settings').findOne({});
        if (fresh) {
          const { _id: _, ...safe } = fresh;
          this.state.settings = safe as CompanySettings;
          this.saveLocal();
          return safe as CompanySettings;
        }
      } catch (err: any) {
        logSaveFailed('settings', err);
        throw err;
      }
    }

    this.state.settings = { ...this.state.settings, ...updates };
    this.saveLocal();
    return this.state.settings;
  }

  // --------------------------------------------------------------------------
  // BLOGS, FAQS, TESTIMONIALS (MongoDB collection support)
  // --------------------------------------------------------------------------
  async getBlogs(): Promise<BlogPost[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('blogs').find({}).toArray();
        if (list.length > 0) {
          return list.map(({ _id, ...doc }) => doc as BlogPost);
        }
      } catch {}
    }
    return this.state.blogs;
  }

  async addBlog(blog: Omit<BlogPost, 'id' | 'publishedDate'>): Promise<BlogPost> {
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`,
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    const db = getDb();
    if (db) {
      try {
        await db.collection('blogs').insertOne({ ...newBlog });
        logCollectionUpdated('blogs', `created ${newBlog.id}`);
      } catch {}
    }
    this.state.blogs.unshift(newBlog);
    this.saveLocal();
    return newBlog;
  }

  async updateBlog(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safe } = updates as any;
        await db.collection('blogs').updateOne({ id }, { $set: safe });
        logCollectionUpdated('blogs', `updated ${id}`);
      } catch {}
    }
    const idx = this.state.blogs.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.state.blogs[idx] = { ...this.state.blogs[idx], ...updates };
    this.saveLocal();
    return this.state.blogs[idx];
  }

  async deleteBlog(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        await db.collection('blogs').deleteOne({ id });
        logCollectionUpdated('blogs', `deleted ${id}`);
      } catch {}
    }
    const len = this.state.blogs.length;
    this.state.blogs = this.state.blogs.filter(b => b.id !== id);
    this.saveLocal();
    return this.state.blogs.length !== len;
  }

  async getFaqs(): Promise<FAQItem[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('faqs').find({}).toArray();
        if (list.length > 0) {
          return list.map(({ _id, ...doc }) => doc as FAQItem);
        }
      } catch {}
    }
    return this.state.faqs;
  }

  async addFaq(faq: Omit<FAQItem, 'id'>): Promise<FAQItem> {
    const newFaq: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    const db = getDb();
    if (db) {
      try {
        await db.collection('faqs').insertOne({ ...newFaq });
      } catch {}
    }
    this.state.faqs.push(newFaq);
    this.saveLocal();
    return newFaq;
  }

  async updateFaq(id: string, updates: Partial<FAQItem>): Promise<FAQItem | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safe } = updates as any;
        await db.collection('faqs').updateOne({ id }, { $set: safe });
      } catch {}
    }
    const idx = this.state.faqs.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.state.faqs[idx] = { ...this.state.faqs[idx], ...updates };
    this.saveLocal();
    return this.state.faqs[idx];
  }

  async deleteFaq(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        await db.collection('faqs').deleteOne({ id });
      } catch {}
    }
    const len = this.state.faqs.length;
    this.state.faqs = this.state.faqs.filter(f => f.id !== id);
    this.saveLocal();
    return this.state.faqs.length !== len;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    const db = getDb();
    if (db) {
      try {
        const list = await db.collection('testimonials').find({}).toArray();
        if (list.length > 0) {
          return list.map(({ _id, ...doc }) => doc as Testimonial);
        }
      } catch {}
    }
    return this.state.testimonials;
  }

  async addTestimonial(testimonial: Omit<Testimonial, 'id' | 'date'>): Promise<Testimonial> {
    const newTest: Testimonial = {
      ...testimonial,
      id: `test-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    const db = getDb();
    if (db) {
      try {
        await db.collection('testimonials').insertOne({ ...newTest });
      } catch {}
    }
    this.state.testimonials.unshift(newTest);
    this.saveLocal();
    return newTest;
  }

  async updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> {
    const db = getDb();
    if (db) {
      try {
        const { _id, ...safe } = updates as any;
        await db.collection('testimonials').updateOne({ id }, { $set: safe });
      } catch {}
    }
    const idx = this.state.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.state.testimonials[idx] = { ...this.state.testimonials[idx], ...updates };
    this.saveLocal();
    return this.state.testimonials[idx];
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const db = getDb();
    if (db) {
      try {
        await db.collection('testimonials').deleteOne({ id });
      } catch {}
    }
    const len = this.state.testimonials.length;
    this.state.testimonials = this.state.testimonials.filter(t => t.id !== id);
    this.saveLocal();
    return this.state.testimonials.length !== len;
  }
}

export const db = new Store();
