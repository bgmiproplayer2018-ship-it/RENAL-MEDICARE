import express from 'express';
import { authRouter } from './routes/auth.ts';
import { appointmentRouter } from './routes/appointments.ts';
import { serviceRouter } from './routes/services.ts';
import { hospitalRouter } from './routes/hospitals.ts';
import { blogRouter } from './routes/blogs.ts';
import { contactRouter } from './routes/contact.ts';
import { faqRouter } from './routes/faqs.ts';
import { testimonialRouter } from './routes/testimonials.ts';
import { settingsRouter } from './routes/settings.ts';
import { db } from './db/store.ts';

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

  // Health check
  app.get(['/api/health', '/health'], (req, res) => {
    res.json({
      status: 'ok',
      service: 'Renal Medicity Healthcare API (Netlify & Container Ready)',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
    });
  });

  // API Routes mounted on both /api/... and root /... for flexible serverless path resolution
  const routers: [string, express.Router][] = [
    ['/auth', authRouter],
    ['/appointments', appointmentRouter],
    ['/services', serviceRouter],
    ['/hospitals', hospitalRouter],
    ['/blogs', blogRouter],
    ['/contact', contactRouter],
    ['/faqs', faqRouter],
    ['/testimonials', testimonialRouter],
    ['/settings', settingsRouter],
  ];

  for (const [prefix, router] of routers) {
    app.use(`/api${prefix}`, router);
    app.use(prefix, router);
  }

  // Quick stats endpoint for administrative summary
  const getStatsHandler = (req: express.Request, res: express.Response) => {
    const apps = db.getAppointments();
    res.json({
      success: true,
      stats: {
        totalAppointments: apps.length,
        pendingAppointments: apps.filter(a => a.status === 'Pending').length,
        acceptedAppointments: apps.filter(a => a.status === 'Accepted').length,
        completedAppointments: apps.filter(a => a.status === 'Completed').length,
        rescheduledAppointments: apps.filter(a => a.status === 'Rescheduled').length,
        hospitalsCount: db.getHospitals().length,
        servicesCount: db.getServices().length,
        blogsCount: db.getBlogs().length,
        unreadMessagesCount: db.getContacts().filter(c => !c.isRead).length
      }
    });
  };

  app.get('/api/stats', getStatsHandler);
  app.get('/stats', getStatsHandler);

  return app;
}
