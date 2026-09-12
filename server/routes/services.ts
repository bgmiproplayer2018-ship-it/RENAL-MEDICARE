import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const serviceRouter = express.Router();

// GET /api/services
serviceRouter.get('/', (req, res) => {
  const services = db.getServices();
  res.json({ success: true, services });
});

// POST /api/services (Admin add service)
serviceRouter.post('/', requireAuth, (req, res) => {
  const { title, description, shortDescription, image, price, priceNote, benefits, features, category, isPopular } = req.body;

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Title, description, and price are required' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newService = db.addService({
    title,
    slug,
    description,
    shortDescription: shortDescription || description.slice(0, 100),
    image: image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    price,
    priceNote: priceNote || '',
    benefits: Array.isArray(benefits) ? benefits : (typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : []),
    features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map(s => s.trim()).filter(Boolean) : []),
    category: category || 'dialysis',
    isPopular: !!isPopular
  });

  res.status(201).json({ success: true, message: 'Service created successfully', service: newService });
});

// PUT /api/services/:id (Admin edit service & pricing)
serviceRouter.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.benefits && typeof updates.benefits === 'string') {
    updates.benefits = updates.benefits.split('\n').filter(Boolean);
  }
  if (updates.features && typeof updates.features === 'string') {
    updates.features = updates.features.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const updated = db.updateService(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ success: true, message: 'Service updated successfully', service: updated });
});

// DELETE /api/services/:id (Admin delete service)
serviceRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteService(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({ success: true, message: 'Service deleted successfully' });
});
