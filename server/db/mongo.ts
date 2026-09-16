import { MongoClient, Db } from 'mongodb';
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

export interface MongoStatus {
  isConnected: boolean;
  uriConfigured: boolean;
  maskedUri: string | null;
  dbName: string;
  message: string;
  pingMs: number | null;
  lastChecked: string;
  isIpBlocked?: boolean;
  containerIp?: string | null;
  counts: {
    appointments: number;
    hospitals: number;
    services: number;
    settings: number;
    contacts: number;
    blogs: number;
    faqs: number;
    testimonials: number;
  };
}

class MongoService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting: boolean = false;
  private isConnected: boolean = false;
  private lastPingMs: number | null = null;
  private connectionError: string | null = null;
  private isIpBlocked: boolean = false;
  private lastConnectAttemptTime: number = 0;
  private containerIp: string | null = '34.34.254.132';

  public getDbName(): string {
    return process.env.MONGODB_DB_NAME || 'renal_medicare';
  }

  public isConfigured(): boolean {
    const uri = process.env.MONGODB_URI?.trim();
    return Boolean(uri && uri.length > 8);
  }

  public getMaskedUri(): string | null {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) return null;
    try {
      // Mask password in mongodb:// or mongodb+srv://
      return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');
    } catch {
      return 'mongodb://******';
    }
  }

  public async getClient(): Promise<{ client: MongoClient | null; db: Db | null }> {
    if (this.db && this.isConnected) {
      return { client: this.client, db: this.db };
    }

    if (!this.isConfigured()) {
      return { client: null, db: null };
    }

    // If connection previously failed, backoff for 45s so we don't stall operations with 6-second timeouts
    if (!this.isConnected && (Date.now() - this.lastConnectAttemptTime < 45000)) {
      return { client: null, db: null };
    }

    if (this.isConnecting) {
      // Wait briefly for in-progress connection
      let attempts = 0;
      while (this.isConnecting && attempts < 10) {
        await new Promise(res => setTimeout(res, 300));
        attempts++;
      }
      if (this.db && this.isConnected) {
        return { client: this.client, db: this.db };
      }
    }

    return this.connect();
  }

  public async connect(force: boolean = false): Promise<{ client: MongoClient | null; db: Db | null }> {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      this.isConnected = false;
      this.connectionError = 'MONGODB_URI environment variable is not defined.';
      return { client: null, db: null };
    }

    // If not forced and recently failed, avoid blocking
    if (!force && !this.isConnected && (Date.now() - this.lastConnectAttemptTime < 45000)) {
      return { client: null, db: null };
    }

    this.isConnecting = true;
    this.lastConnectAttemptTime = Date.now();

    try {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10
      });

      const start = Date.now();
      await client.connect();
      const targetDb = client.db(this.getDbName());
      
      // Ping check
      await targetDb.command({ ping: 1 });
      this.lastPingMs = Date.now() - start;

      this.client = client;
      this.db = targetDb;
      this.isConnected = true;
      this.isIpBlocked = false;
      this.connectionError = null;
      console.log(`[MongoDB] Connected to database: "${this.getDbName()}" (${this.lastPingMs}ms ping)`);

      // Set up indexes safely
      this.initIndexes(targetDb).catch(() => {});

      return { client: this.client, db: this.db };
    } catch (err: any) {
      this.isConnected = false;
      const rawMsg = err?.message || '';

      // Detect Atlas IP Access restriction / SSL Alert 80
      if (
        rawMsg.includes('SSL alert number 80') || 
        rawMsg.includes('tlsv1 alert internal error') ||
        rawMsg.includes('0A000438')
      ) {
        this.isIpBlocked = true;
        this.connectionError = 'MongoDB Atlas IP Whitelist required: Atlas firewall rejected incoming connection (SSL Alert 80). Please add 0.0.0.0/0 to Atlas Network Access.';
        console.log('[MongoDB] Running with local store: Atlas IP whitelist required (add 0.0.0.0/0 in Atlas Network Access).');
      } else {
        this.isIpBlocked = false;
        this.connectionError = rawMsg || 'Failed to connect to MongoDB cluster';
        console.log('[MongoDB] Notice: Cluster connection unavailable. Running in persistent local store mode.');
      }

      return { client: null, db: null };
    } finally {
      this.isConnecting = false;
    }
  }

  private async initIndexes(db: Db) {
    try {
      await db.collection('appointments').createIndex({ id: 1 }, { unique: true });
      await db.collection('appointments').createIndex({ mobileNumber: 1 });
      await db.collection('appointments').createIndex({ status: 1 });
      await db.collection('hospitals').createIndex({ id: 1 }, { unique: true });
      await db.collection('services').createIndex({ id: 1 }, { unique: true });
      await db.collection('services').createIndex({ slug: 1 }, { unique: true });
      await db.collection('settings').createIndex({ _key: 1 }, { unique: true });
      await db.collection('contacts').createIndex({ id: 1 }, { unique: true });
    } catch (e) {
      // index warnings are safe to ignore
    }
  }

  public async getStatus(): Promise<MongoStatus> {
    const isConfigured = this.isConfigured();
    let pingMs = this.lastPingMs;
    let counts = {
      appointments: 0,
      hospitals: 0,
      services: 0,
      settings: 0,
      contacts: 0,
      blogs: 0,
      faqs: 0,
      testimonials: 0
    };

    if (isConfigured) {
      try {
        const { db } = await this.getClient();
        if (db) {
          const start = Date.now();
          await db.command({ ping: 1 });
          pingMs = Date.now() - start;
          this.lastPingMs = pingMs;
          this.isConnected = true;

          const [appC, hospC, srvC, setC, cntC, blogC, faqC, testC] = await Promise.all([
            db.collection('appointments').countDocuments().catch(() => 0),
            db.collection('hospitals').countDocuments().catch(() => 0),
            db.collection('services').countDocuments().catch(() => 0),
            db.collection('settings').countDocuments().catch(() => 0),
            db.collection('contacts').countDocuments().catch(() => 0),
            db.collection('blogs').countDocuments().catch(() => 0),
            db.collection('faqs').countDocuments().catch(() => 0),
            db.collection('testimonials').countDocuments().catch(() => 0),
          ]);

          counts = {
            appointments: appC,
            hospitals: hospC,
            services: srvC,
            settings: setC,
            contacts: cntC,
            blogs: blogC,
            faqs: faqC,
            testimonials: testC
          };
        }
      } catch (err: any) {
        this.isConnected = false;
        this.connectionError = err?.message || 'Failed to ping MongoDB';
      }
    }

    return {
      isConnected: this.isConnected,
      uriConfigured: isConfigured,
      maskedUri: this.getMaskedUri(),
      dbName: this.getDbName(),
      message: this.isConnected 
        ? `Connected to MongoDB database "${this.getDbName()}"`
        : (isConfigured 
            ? `Configured but unreachable: ${this.connectionError || 'Connection error'}`
            : 'MONGODB_URI not configured. Operating in local persistent store mode.'),
      pingMs,
      lastChecked: new Date().toISOString(),
      isIpBlocked: this.isIpBlocked,
      containerIp: this.containerIp,
      counts
    };
  }

  // Hydrate store from MongoDB if available
  public async loadFromMongo(): Promise<{
    services?: ServiceItem[];
    hospitals?: Hospital[];
    appointments?: Appointment[];
    settings?: CompanySettings;
    contacts?: ContactMessage[];
    blogs?: BlogPost[];
    faqs?: FAQItem[];
    testimonials?: Testimonial[];
  } | null> {
    try {
      const { db } = await this.getClient();
      if (!db) return null;

      const [services, hospitals, appointments, settingsDoc, contacts, blogs, faqs, testimonials] = await Promise.all([
        db.collection('services').find({}, { projection: { _id: 0 } }).toArray(),
        db.collection('hospitals').find({}, { projection: { _id: 0 } }).toArray(),
        db.collection('appointments').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
        db.collection('settings').findOne({ _key: 'company_settings' }, { projection: { _id: 0, _key: 0 } }),
        db.collection('contacts').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray(),
        db.collection('blogs').find({}, { projection: { _id: 0 } }).toArray(),
        db.collection('faqs').find({}, { projection: { _id: 0 } }).toArray(),
        db.collection('testimonials').find({}, { projection: { _id: 0 } }).toArray(),
      ]);

      const result: any = {};
      if (Array.isArray(services) && services.length > 0) result.services = services;
      if (Array.isArray(hospitals) && hospitals.length > 0) result.hospitals = hospitals;
      if (Array.isArray(appointments) && appointments.length > 0) result.appointments = appointments;
      if (settingsDoc && Object.keys(settingsDoc).length > 0) result.settings = settingsDoc;
      if (Array.isArray(contacts) && contacts.length > 0) result.contacts = contacts;
      if (Array.isArray(blogs) && blogs.length > 0) result.blogs = blogs;
      if (Array.isArray(faqs) && faqs.length > 0) result.faqs = faqs;
      if (Array.isArray(testimonials) && testimonials.length > 0) result.testimonials = testimonials;

      return Object.keys(result).length > 0 ? result : null;
    } catch (err) {
      console.warn('[MongoDB] Error loading state from MongoDB:', err);
      return null;
    }
  }

  // Sync entire local state into MongoDB
  public async syncAllToMongo(data: {
    services: ServiceItem[];
    hospitals: Hospital[];
    appointments: Appointment[];
    settings: CompanySettings;
    contacts: ContactMessage[];
    blogs: BlogPost[];
    faqs: FAQItem[];
    testimonials: Testimonial[];
  }): Promise<{ success: boolean; message: string; counts?: any }> {
    try {
      const { db } = await this.getClient();
      if (!db) {
        return { success: false, message: 'MongoDB is not connected. Check MONGODB_URI.' };
      }

      // 1. Services
      for (const s of data.services) {
        await db.collection('services').updateOne({ id: s.id }, { $set: s }, { upsert: true });
      }

      // 2. Hospitals
      for (const h of data.hospitals) {
        await db.collection('hospitals').updateOne({ id: h.id }, { $set: h }, { upsert: true });
      }

      // 3. Appointments
      for (const a of data.appointments) {
        await db.collection('appointments').updateOne({ id: a.id }, { $set: a }, { upsert: true });
      }

      // 4. Settings
      await db.collection('settings').updateOne(
        { _key: 'company_settings' },
        { $set: { _key: 'company_settings', ...data.settings } },
        { upsert: true }
      );

      // 5. Contacts
      for (const c of data.contacts) {
        await db.collection('contacts').updateOne({ id: c.id }, { $set: c }, { upsert: true });
      }

      // 6. Blogs
      for (const b of data.blogs) {
        await db.collection('blogs').updateOne({ id: b.id }, { $set: b }, { upsert: true });
      }

      // 7. Faqs
      for (const f of data.faqs) {
        await db.collection('faqs').updateOne({ id: f.id }, { $set: f }, { upsert: true });
      }

      // 8. Testimonials
      for (const t of data.testimonials) {
        await db.collection('testimonials').updateOne({ id: t.id }, { $set: t }, { upsert: true });
      }

      const status = await this.getStatus();
      return { 
        success: true, 
        message: `Successfully synchronized all data to MongoDB (${this.getDbName()})`,
        counts: status.counts
      };
    } catch (err: any) {
      console.error('[MongoDB] Error syncing to MongoDB:', err);
      return { success: false, message: err?.message || 'Sync failed' };
    }
  }

  // Individual persistent operations (safe & non-blocking)
  public async upsertAppointment(appointment: Appointment): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('appointments').updateOne(
        { id: appointment.id },
        { $set: appointment },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertAppointment error:', err);
    }
  }

  public async deleteAppointment(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('appointments').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteAppointment error:', err);
    }
  }

  public async upsertHospital(hospital: Hospital): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('hospitals').updateOne(
        { id: hospital.id },
        { $set: hospital },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertHospital error:', err);
    }
  }

  public async deleteHospital(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('hospitals').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteHospital error:', err);
    }
  }

  public async upsertService(service: ServiceItem): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('services').updateOne(
        { id: service.id },
        { $set: service },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertService error:', err);
    }
  }

  public async deleteService(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('services').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteService error:', err);
    }
  }

  public async upsertSettings(settings: CompanySettings): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('settings').updateOne(
        { _key: 'company_settings' },
        { $set: { _key: 'company_settings', ...settings } },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertSettings error:', err);
    }
  }

  public async upsertContact(contact: ContactMessage): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('contacts').updateOne(
        { id: contact.id },
        { $set: contact },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertContact error:', err);
    }
  }

  public async deleteContact(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('contacts').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteContact error:', err);
    }
  }

  public async upsertBlog(blog: BlogPost): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('blogs').updateOne(
        { id: blog.id },
        { $set: blog },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertBlog error:', err);
    }
  }

  public async deleteBlog(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('blogs').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteBlog error:', err);
    }
  }

  public async upsertFaq(faq: FAQItem): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('faqs').updateOne(
        { id: faq.id },
        { $set: faq },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertFaq error:', err);
    }
  }

  public async deleteFaq(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('faqs').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteFaq error:', err);
    }
  }

  public async upsertTestimonial(testimonial: Testimonial): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('testimonials').updateOne(
        { id: testimonial.id },
        { $set: testimonial },
        { upsert: true }
      );
    } catch (err) {
      console.warn('[MongoDB] upsertTestimonial error:', err);
    }
  }

  public async deleteTestimonial(id: string): Promise<void> {
    try {
      const { db } = await this.getClient();
      if (!db) return;
      await db.collection('testimonials').deleteOne({ id });
    } catch (err) {
      console.warn('[MongoDB] deleteTestimonial error:', err);
    }
  }
}

export const mongoService = new MongoService();
