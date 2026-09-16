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
import { mongoService, MongoStatus } from './mongo.ts';

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
- Take prescribed phosphate binders with meals as directed by your nephrologist.

### 4. Understand Protein Needs
Before dialysis (CKD Stages 1-4), a lower protein diet slows disease progression. Once on maintenance dialysis, protein requirements increase to replace amino acids lost during filtration. High-biological-value proteins like egg whites and lean proteins are recommended.

### 5. Monitor Fluid Allowances
Work with your renal dietitian to determine your exact daily fluid target based on your 24-hour urine output and interdialytic weight gain.`,
    category: 'Nutrition & Diet',
    tags: ['Kidney Diet', 'Nutrition', 'Sodium', 'Potassium', 'Renal Care'],
    featuredImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
    author: 'Ms. Anita Mehra, Chief Renal Dietitian',
    publishedDate: 'September 04, 2026',
    readTime: '5 min read',
    metaTitle: 'Renal Diet Guide: Sodium, Potassium & Phosphorus Management',
    metaDescription: 'Expert nutrition advice for chronic kidney disease and dialysis patients from Renal Medicare.'
  },
  {
    id: 'blog-3',
    title: 'Why Home Dialysis is Becoming the Gold Standard in Kidney Care',
    slug: 'why-home-dialysis-is-becoming-gold-standard',
    excerpt: 'Discover why thousands of patients are choosing comfortable, infection-free at-home hemodialysis with certified technicians.',
    content: `Historically, kidney dialysis required frequent, exhausting commutes to crowded hospital wards three times a week. Today, advances in compact dialyzer technology, certified technician home delivery, and ultrapure mobile water purification are transforming dialysis at home.

### Benefits of Receiving Dialysis at Home
1. **Zero Infection Risk:** Eliminates hospital-acquired infections (nosocomial pathogens) and exposure to respiratory viruses.
2. **Personal Dignity & Comfort:** Patients rest in their own bed, watch their favorite shows, or spend time with family while undergoing treatment.
3. **No Commute Stress:** Eliminates travel fatigue, traffic delays, and dependence on hospital transport.
4. **Improved Clinical Outcomes:** Studies show that patients receiving relaxed home treatments experience more stable blood pressure and faster post-dialysis recovery time (washout).

At Renal Medicare, our Home Dialysis Program includes a pre-installation water quality audit, dual RO installation, emergency backups, and an experienced certified technician dedicated exclusively to your care during every minute of the session.`,
    category: 'Home Dialysis',
    tags: ['Home Dialysis', 'Patient Comfort', 'Safety', 'Technology'],
    featuredImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    author: 'Dr. Ramesh Nair, Director of Clinical Services',
    publishedDate: 'August 28, 2026',
    readTime: '4 min read',
    metaTitle: 'Home Dialysis Benefits: Safety and Freedom for Patients',
    metaDescription: 'How Renal Medicare delivers hospital-grade home dialysis with certified technicians.'
  }
];

const initialFaqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How often does a patient need hemodialysis?',
    answer: 'Standard maintenance hemodialysis is typically conducted 3 times per week, with each session lasting between 3.5 to 4 hours. The exact frequency and duration are determined by your nephrologist based on your residual kidney function, body surface area, and fluid clearance requirements.',
    category: 'dialysis'
  },
  {
    id: 'faq-2',
    question: 'Is home dialysis safe compared to hospital dialysis?',
    answer: 'Yes, absolutely. In fact, home dialysis provides superior infection control as it eliminates exposure to hospital-acquired pathogens. At Renal Medicare, every home session is administered in person by a certified, licensed dialysis technician equipped with hospital-grade equipment, ultrapure RO water filtration, and direct real-time telemetry connected to our senior nephrologists.',
    category: 'home-dialysis'
  },
  {
    id: 'faq-3',
    question: 'What is the cost of dialysis at Renal Medicare?',
    answer: 'Our hospital center hemodialysis begins at ₹2,200 per session including consumables. Comprehensive Home Dialysis with a dedicated technician is ₹3,800 per session. We also accept major insurance policies and cashless TPA partnerships.',
    category: 'general'
  },
  {
    id: 'faq-4',
    question: 'How do I book and track my dialysis appointment?',
    answer: 'You can book an appointment directly through our online appointment system on this website, or call our 24/7 helpline at 9069645840. Once booked, you will receive a unique tracking ID (e.g. RM-2026-XXXX) which lets you view real-time confirmation status on our Patient Tracking page.',
    category: 'appointments'
  },
  {
    id: 'faq-5',
    question: 'How do you care for an AV Fistula between dialysis sessions?',
    answer: 'Keep the fistula arm clean, wash with antimicrobial soap before dialysis, avoid wearing tight clothing or wristwatches on the access arm, and never allow blood pressure checks or blood draws on the fistula arm. Always check for the vibration or buzz (called the "thrill") daily.',
    category: 'dialysis'
  },
  {
    id: 'faq-6',
    question: 'What happens during a sudden dialysis emergency or fluid overload?',
    answer: 'Renal Medicare operates 24x7 emergency dialysis and ICU bedside CRRT across our hospital network. For immediate assistance, dial our emergency numbers 9069645840 or 7522805397 for rapid patient transfer and immediate triage.',
    category: 'dialysis'
  }
];

const initialTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'Harish Chander Malhotra',
    treatment: 'Home Hemodialysis Patient (2 Years)',
    quote: 'Switching to Renal Medicare home dialysis changed our lives. My father no longer has to endure 3-hour traffic journeys to the hospital. The technician is exceptionally gentle, punctual, and maintains complete ICU-level sterilization in our home.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: 'South Delhi',
    date: 'August 2026'
  },
  {
    id: 'test-2',
    patientName: 'Sunita Rawat',
    treatment: 'Hospital Center Maintenance Dialysis',
    quote: 'The nursing staff at Renal Medicare treats every patient like family. The high-flux dialysis machines and ultrapure water system have made a huge difference—I rarely feel nauseous or washed out after my sessions now.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    location: 'Gurugram',
    date: 'July 2026'
  },
  {
    id: 'test-3',
    patientName: 'Gurpreet Singh Anand',
    treatment: 'Senior Nephrology Consultation & Dialysis Access',
    quote: 'Dr. Sharma and the entire nephrology department provided clear guidance when my creatinine crossed 6.0. They helped me start optimal medical therapy and schedule which allows me to manage my business smoothly.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    location: 'Chandigarh',
    date: 'September 2026'
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
    hospitalLocation: 'Renal Medicare Super Specialty Kidney Center, New Delhi',
    serviceType: 'In-Center Hemodialysis',
    preferredDate: '2026-09-25',
    preferredTime: 'Morning (07:00 AM - 11:00 AM)',
    address: 'Address provided during intake',
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
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        
        // Remove legacy mock data
        const mockAppIds = new Set(['RM-2026-8941', 'RM-2026-6219', 'RM-2026-4712', 'RM-2026-1033']);
        const mockContactIds = new Set(['cnt-1', 'cnt-2']);

        const existingApps = Array.isArray(parsed.appointments) ? parsed.appointments : [];
        const cleanApps = existingApps.filter((a: any) => a && a.id && !mockAppIds.has(a.id));

        const existingContacts = Array.isArray(parsed.contacts) ? parsed.contacts : [];
        const cleanContacts = existingContacts.filter((c: any) => c && c.id && !mockContactIds.has(c.id));

        const loadedServices = Array.isArray(parsed.services) 
          ? parsed.services.filter((s: any) => s && s.id !== 'srv-2' && s.slug !== 'peritoneal-dialysis')
          : initialServices;

        let loadedSettings = parsed.settings ? { ...parsed.settings } : initialSettings;
        if (!loadedSettings.address || loadedSettings.address.includes('South Extension') || loadedSettings.address.includes('Institutional Medical Area')) {
          loadedSettings.address = 'Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089';
        }

        const loadedHospitals = Array.isArray(parsed.hospitals)
          ? parsed.hospitals.map((h: any) => {
              if (h.id === 'hosp-1' && (!h.address || h.address.includes('Plot 14') || h.address.includes('South Extension') || h.address.includes('Institutional Area'))) {
                return {
                  ...h,
                  name: h.name || 'Renal medicare (kidney care & dialysis centre)',
                  address: '63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089',
                  city: 'Delhi',
                  googleMap: 'https://maps.google.com/?q=63+64+65+Pocket+4+Sector+16A+Rohini+Delhi+110089'
                };
              }
              if (h.facilities && Array.isArray(h.facilities)) {
                h.facilities = h.facilities.map((f: string) => {
                  if (f.includes('Peritoneal Dialysis Clinic')) return 'Kidney Preventive Care Clinic';
                  if (f.includes('Automated Peritoneal Dialysis Training')) return 'Specialized Hemodiafiltration Unit';
                  return f;
                });
              }
              return h;
            })
          : initialHospitals;

        const loadedFaqs = Array.isArray(parsed.faqs)
          ? parsed.faqs.map((f: any) => {
              if (f.id === 'faq-3' && f.answer?.includes('peritoneal')) {
                return {
                  ...f,
                  answer: 'Our hospital center hemodialysis begins at ₹2,200 per session including consumables. Comprehensive Home Dialysis with a dedicated technician is ₹3,800 per session. We also accept major insurance policies and cashless TPA partnerships.'
                };
              }
              return f;
            })
          : initialFaqs;

        const loadedTestimonials = Array.isArray(parsed.testimonials)
          ? parsed.testimonials.map((t: any) => {
              if (t.id === 'test-3' && (t.treatment?.includes('Peritoneal') || t.quote?.includes('PD'))) {
                return {
                  ...t,
                  treatment: 'Senior Nephrology Consultation & Dialysis Access',
                  quote: 'Dr. Sharma and the entire nephrology department provided clear guidance when my creatinine crossed 6.0. They helped me start optimal medical therapy and schedule which allows me to manage my business smoothly.'
                };
              }
              return t;
            })
          : initialTestimonials;

        this.state = { 
          ...this.state, 
          ...parsed,
          services: loadedServices,
          settings: loadedSettings,
          hospitals: loadedHospitals,
          faqs: loadedFaqs,
          testimonials: loadedTestimonials,
          appointments: cleanApps.length > 0 ? cleanApps : this.state.appointments,
          contacts: cleanContacts
        };
        this.save();
      } else {
        this.save();
      }
      // Initialize MongoDB connection and synchronization in the background
      this.initMongo();
    } catch (err) {
      console.warn('Could not read persistent database file, using in-memory state:', err);
    }
  }

  private async initMongo() {
    if (!mongoService.isConfigured()) {
      return;
    }
    try {
      const { db } = await mongoService.connect();
      if (!db) return;

      const mongoData = await mongoService.loadFromMongo();
      if (mongoData && (mongoData.services?.length || mongoData.hospitals?.length || mongoData.appointments?.length)) {
        console.log('[Store] Hydrating store state from MongoDB...');
        if (mongoData.services && mongoData.services.length > 0) this.state.services = mongoData.services;
        if (mongoData.hospitals && mongoData.hospitals.length > 0) this.state.hospitals = mongoData.hospitals;
        if (mongoData.appointments && mongoData.appointments.length > 0) this.state.appointments = mongoData.appointments;
        if (mongoData.settings) this.state.settings = { ...this.state.settings, ...mongoData.settings };
        if (mongoData.contacts && mongoData.contacts.length > 0) this.state.contacts = mongoData.contacts;
        if (mongoData.blogs && mongoData.blogs.length > 0) this.state.blogs = mongoData.blogs;
        if (mongoData.faqs && mongoData.faqs.length > 0) this.state.faqs = mongoData.faqs;
        if (mongoData.testimonials && mongoData.testimonials.length > 0) this.state.testimonials = mongoData.testimonials;
        this.save();
      } else {
        console.log('[Store] MongoDB is empty. Seeding local state into MongoDB...');
        await mongoService.syncAllToMongo(this.state);
      }
    } catch (err) {
      console.warn('[Store] Mongo initial connect/sync notice:', err);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to save to database file:', err);
    }
  }

  // Getters
  getServices() { return this.state.services; }
  getHospitals() { return this.state.hospitals; }
  getBlogs() { return this.state.blogs; }
  getFaqs() { return this.state.faqs; }
  getTestimonials() { return this.state.testimonials; }
  getAppointments() { return this.state.appointments; }
  getSettings() { return this.state.settings; }
  getContacts() { return this.state.contacts; }

  // Sync helpers to ensure permanent storage
  syncAppointments(incoming: Appointment[]): Appointment[] {
    const mockAppIds = new Set(['RM-2026-8941', 'RM-2026-6219', 'RM-2026-4712', 'RM-2026-1033']);
    let changed = false;
    for (const item of incoming) {
      if (!item || !item.id || mockAppIds.has(item.id)) continue;
      const idx = this.state.appointments.findIndex(a => a.id.toLowerCase() === item.id.toLowerCase());
      if (idx === -1) {
        this.state.appointments.unshift(item);
        mongoService.upsertAppointment(item);
        changed = true;
      } else {
        if (item.updatedAt && (!this.state.appointments[idx].updatedAt || item.updatedAt > this.state.appointments[idx].updatedAt)) {
          this.state.appointments[idx] = { ...this.state.appointments[idx], ...item };
          mongoService.upsertAppointment(this.state.appointments[idx]);
          changed = true;
        }
      }
    }
    if (changed) {
      this.save();
    }
    return this.state.appointments;
  }

  syncContacts(incoming: ContactMessage[]): ContactMessage[] {
    const mockContactIds = new Set(['cnt-1', 'cnt-2']);
    let changed = false;
    for (const item of incoming) {
      if (!item || !item.id || mockContactIds.has(item.id)) continue;
      const idx = this.state.contacts.findIndex(c => c.id.toLowerCase() === item.id.toLowerCase());
      if (idx === -1) {
        this.state.contacts.unshift(item);
        mongoService.upsertContact(item);
        changed = true;
      }
    }
    if (changed) {
      this.save();
    }
    return this.state.contacts;
  }

  // Appointments
  createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Appointment['status'] }): Appointment {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newAppointment: Appointment = {
      ...data,
      id: `RM-2026-${randomSuffix}`,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.state.appointments.unshift(newAppointment);
    this.save();
    mongoService.upsertAppointment(newAppointment);
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const idx = this.state.appointments.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
    if (idx === -1) return null;
    this.state.appointments[idx] = {
      ...this.state.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    mongoService.upsertAppointment(this.state.appointments[idx]);
    return this.state.appointments[idx];
  }

  deleteAppointment(id: string): boolean {
    const len = this.state.appointments.length;
    this.state.appointments = this.state.appointments.filter(a => a.id.toLowerCase() !== id.toLowerCase());
    if (this.state.appointments.length !== len) {
      this.save();
      mongoService.deleteAppointment(id);
      return true;
    }
    return false;
  }

  findAppointment(query: string): Appointment | null {
    const clean = query.trim().toLowerCase();
    return this.state.appointments.find(a => 
      a.id.toLowerCase() === clean || 
      a.mobileNumber.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
      a.email.toLowerCase() === clean
    ) || null;
  }

  // Hospitals
  addHospital(hospital: Omit<Hospital, 'id'>): Hospital {
    const newHosp: Hospital = {
      ...hospital,
      id: `hosp-${Date.now()}`
    };
    this.state.hospitals.push(newHosp);
    this.save();
    mongoService.upsertHospital(newHosp);
    return newHosp;
  }

  updateHospital(id: string, updates: Partial<Hospital>): Hospital | null {
    const idx = this.state.hospitals.findIndex(h => h.id === id);
    if (idx === -1) return null;
    this.state.hospitals[idx] = { ...this.state.hospitals[idx], ...updates };
    this.save();
    mongoService.upsertHospital(this.state.hospitals[idx]);
    return this.state.hospitals[idx];
  }

  deleteHospital(id: string): boolean {
    const len = this.state.hospitals.length;
    this.state.hospitals = this.state.hospitals.filter(h => h.id !== id);
    if (this.state.hospitals.length !== len) {
      this.save();
      mongoService.deleteHospital(id);
      return true;
    }
    return false;
  }

  // Services
  addService(service: Omit<ServiceItem, 'id'>): ServiceItem {
    const newSrv: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`
    };
    this.state.services.push(newSrv);
    this.save();
    mongoService.upsertService(newSrv);
    return newSrv;
  }

  updateService(id: string, updates: Partial<ServiceItem>): ServiceItem | null {
    const idx = this.state.services.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.state.services[idx] = { ...this.state.services[idx], ...updates };
    this.save();
    mongoService.upsertService(this.state.services[idx]);
    return this.state.services[idx];
  }

  deleteService(id: string): boolean {
    const len = this.state.services.length;
    this.state.services = this.state.services.filter(s => s.id !== id);
    if (this.state.services.length !== len) {
      this.save();
      mongoService.deleteService(id);
      return true;
    }
    return false;
  }

  // Blogs
  addBlog(blog: Omit<BlogPost, 'id' | 'publishedDate'>): BlogPost {
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`,
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
    this.state.blogs.unshift(newBlog);
    this.save();
    mongoService.upsertBlog(newBlog);
    return newBlog;
  }

  updateBlog(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const idx = this.state.blogs.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.state.blogs[idx] = { ...this.state.blogs[idx], ...updates };
    this.save();
    mongoService.upsertBlog(this.state.blogs[idx]);
    return this.state.blogs[idx];
  }

  deleteBlog(id: string): boolean {
    const len = this.state.blogs.length;
    this.state.blogs = this.state.blogs.filter(b => b.id !== id);
    if (this.state.blogs.length !== len) {
      this.save();
      mongoService.deleteBlog(id);
      return true;
    }
    return false;
  }

  // Testimonials
  addTestimonial(testimonial: Omit<Testimonial, 'id' | 'date'>): Testimonial {
    const newTest: Testimonial = {
      ...testimonial,
      id: `test-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    this.state.testimonials.unshift(newTest);
    this.save();
    mongoService.upsertTestimonial(newTest);
    return newTest;
  }

  updateTestimonial(id: string, updates: Partial<Testimonial>): Testimonial | null {
    const idx = this.state.testimonials.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.state.testimonials[idx] = { ...this.state.testimonials[idx], ...updates };
    this.save();
    mongoService.upsertTestimonial(this.state.testimonials[idx]);
    return this.state.testimonials[idx];
  }

  deleteTestimonial(id: string): boolean {
    const len = this.state.testimonials.length;
    this.state.testimonials = this.state.testimonials.filter(t => t.id !== id);
    if (this.state.testimonials.length !== len) {
      this.save();
      mongoService.deleteTestimonial(id);
      return true;
    }
    return false;
  }

  // FAQs
  addFaq(faq: Omit<FAQItem, 'id'>): FAQItem {
    const newFaq: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`
    };
    this.state.faqs.push(newFaq);
    this.save();
    mongoService.upsertFaq(newFaq);
    return newFaq;
  }

  updateFaq(id: string, updates: Partial<FAQItem>): FAQItem | null {
    const idx = this.state.faqs.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.state.faqs[idx] = { ...this.state.faqs[idx], ...updates };
    this.save();
    mongoService.upsertFaq(this.state.faqs[idx]);
    return this.state.faqs[idx];
  }

  deleteFaq(id: string): boolean {
    const len = this.state.faqs.length;
    this.state.faqs = this.state.faqs.filter(f => f.id !== id);
    if (this.state.faqs.length !== len) {
      this.save();
      mongoService.deleteFaq(id);
      return true;
    }
    return false;
  }

  // Contact messages
  addContact(contact: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>): ContactMessage {
    const newMsg: ContactMessage = {
      ...contact,
      id: `cnt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    this.state.contacts.unshift(newMsg);
    this.save();
    mongoService.upsertContact(newMsg);
    return newMsg;
  }

  markContactRead(id: string): boolean {
    const msg = this.state.contacts.find(c => c.id === id);
    if (msg) {
      msg.isRead = true;
      this.save();
      mongoService.upsertContact(msg);
      return true;
    }
    return false;
  }

  deleteContact(id: string): boolean {
    const len = this.state.contacts.length;
    this.state.contacts = this.state.contacts.filter(c => c.id !== id);
    if (this.state.contacts.length !== len) {
      this.save();
      mongoService.deleteContact(id);
      return true;
    }
    return false;
  }

  // Settings
  updateSettings(updates: Partial<CompanySettings>): CompanySettings {
    this.state.settings = { ...this.state.settings, ...updates };
    this.save();
    mongoService.upsertSettings(this.state.settings);
    return this.state.settings;
  }

  // MongoDB status & controls
  async getMongoStatus(): Promise<MongoStatus> {
    return mongoService.getStatus();
  }

  async syncToMongo(): Promise<{ success: boolean; message: string; counts?: any }> {
    return mongoService.syncAllToMongo(this.state);
  }

  async pullFromMongo(): Promise<{ success: boolean; message: string }> {
    const data = await mongoService.loadFromMongo();
    if (data) {
      if (data.services && data.services.length > 0) this.state.services = data.services;
      if (data.hospitals && data.hospitals.length > 0) this.state.hospitals = data.hospitals;
      if (data.appointments && data.appointments.length > 0) this.state.appointments = data.appointments;
      if (data.settings) this.state.settings = { ...this.state.settings, ...data.settings };
      if (data.contacts && data.contacts.length > 0) this.state.contacts = data.contacts;
      if (data.blogs && data.blogs.length > 0) this.state.blogs = data.blogs;
      if (data.faqs && data.faqs.length > 0) this.state.faqs = data.faqs;
      if (data.testimonials && data.testimonials.length > 0) this.state.testimonials = data.testimonials;
      this.save();
      return { success: true, message: 'Hydrated successfully from MongoDB cluster.' };
    }
    return { success: false, message: 'No records found in MongoDB to pull.' };
  }
}

export const db = new Store();
