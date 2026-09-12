import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { authRouter } from './server/routes/auth.ts';
import { appointmentRouter } from './server/routes/appointments.ts';
import { serviceRouter } from './server/routes/services.ts';
import { hospitalRouter } from './server/routes/hospitals.ts';
import { blogRouter } from './server/routes/blogs.ts';
import { contactRouter } from './server/routes/contact.ts';
import { faqRouter } from './server/routes/faqs.ts';
import { testimonialRouter } from './server/routes/testimonials.ts';
import { settingsRouter } from './server/routes/settings.ts';
import { db } from './server/db/store.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Renal Medicity Healthcare Core API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/appointments', appointmentRouter);
  app.use('/api/services', serviceRouter);
  app.use('/api/hospitals', hospitalRouter);
  app.use('/api/blogs', blogRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/faqs', faqRouter);
  app.use('/api/testimonials', testimonialRouter);
  app.use('/api/settings', settingsRouter);

  // Quick stats endpoint for administrative summary
  app.get('/api/stats', (req, res) => {
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
  });

  // Vite middleware for development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Renal Medicity server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
