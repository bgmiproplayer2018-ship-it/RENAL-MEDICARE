import express from 'express';
import { authRouter } from './routes/auth.ts';
import { appointmentRouter } from './routes/appointments.ts';
import { serviceRouter } from './routes/services.ts';
import { hospitalRouter } from './routes/hospitals.ts';
import { inquiryRouter } from './routes/inquiries.ts';
import { contactRouter } from './routes/contact.ts';
import { blogRouter } from './routes/blogs.ts';
import { faqRouter } from './routes/faqs.ts';
import { testimonialRouter } from './routes/testimonials.ts';
import { settingsRouter } from './routes/settings.ts';
import { notificationRouter } from './routes/notifications.ts';
import { db } from './db/store.ts';
import { isMongoConnected, DB_NAME, getAtlasState } from './db/connection.ts';

export function createApp() {
  const app = express();

  // JSON & URL-encoded parsing with safety limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic security and CORS headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Netlify functions path normalizer (handles /.netlify/functions/api or /api)
  app.use((req, _res, next) => {
    if (req.url.startsWith('/.netlify/functions/api')) {
      req.url = req.url.replace('/.netlify/functions/api', '/api') || '/';
    }
    next();
  });

  // Health check with MongoDB Atlas connection status
  app.get(['/api/health', '/health'], (req, res) => {
    const connected = isMongoConnected();
    const atlasState = getAtlasState();
    res.json({
      status: 'ok',
      service: 'Renal Medicare Healthcare API (MongoDB Atlas Enabled)',
      mongoConnected: connected,
      atlasState,
      database: DB_NAME,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      note: connected
        ? 'Connected directly to MongoDB Atlas cluster'
        : atlasState === 'awaiting_credentials'
        ? 'Cluster reachable. In MongoDB Atlas (Security -> Database Access), verify Database User credentials match MONGODB_URI. Operating with server-side persistent store.'
        : 'Operating with server-side persistent store.',
    });
  });

  // API Routes mounted on both /api/... and root /... for flexible path resolution
  const routers: [string, express.Router][] = [
    ['/auth', authRouter],
    ['/appointments', appointmentRouter],
    ['/services', serviceRouter],
    ['/hospitals', hospitalRouter],
    ['/inquiries', inquiryRouter],
    ['/contact', contactRouter],
    ['/settings', settingsRouter],
    ['/blogs', blogRouter],
    ['/faqs', faqRouter],
    ['/testimonials', testimonialRouter],
    ['/notifications', notificationRouter],
  ];

  for (const [prefix, router] of routers) {
    app.use(`/api${prefix}`, router);
    app.use(prefix, router);
  }

  // Quick stats endpoint for administrative summary
  const getStatsHandler = async (req: express.Request, res: express.Response) => {
    try {
      const [apps, hospitals, services, blogs, inquiries] = await Promise.all([
        db.getAppointments(),
        db.getHospitals(),
        db.getServices(),
        db.getBlogs(),
        db.getInquiries()
      ]);

      res.json({
        success: true,
        stats: {
          totalAppointments: apps.length,
          pendingAppointments: apps.filter(a => a.status === 'Pending').length,
          acceptedAppointments: apps.filter(a => a.status === 'Accepted').length,
          completedAppointments: apps.filter(a => a.status === 'Completed').length,
          rescheduledAppointments: apps.filter(a => a.status === 'Rescheduled').length,
          hospitalsCount: hospitals.length,
          servicesCount: services.length,
          blogsCount: blogs.length,
          unreadMessagesCount: inquiries.filter(c => !c.isRead).length,
          databaseStatus: isMongoConnected() ? 'MongoDB Atlas Connected' : 'Local Fallback'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message || 'Failed to fetch stats' });
    }
  };

  app.get('/api/stats', getStatsHandler);
  app.get('/stats', getStatsHandler);

  return app;
}
