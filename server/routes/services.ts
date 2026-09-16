import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const serviceRouter = express.Router();

// GET /api/services
serviceRouter.get('/', async (req, res) => {
  try {
    const services = await db.getServices();
    res.json({ success: true, count: services.length, services });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch services' });
  }
});

// POST /api/services (Admin add service directly to MongoDB Atlas)
serviceRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, shortDescription, image, price, priceNote, benefits, features, category, isPopular } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({ error: 'Title, description, and price are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newService = await db.addService({
      title,
      slug,
      description,
      shortDescription: shortDescription || description.slice(0, 100),
      image: image || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      price,
      priceNote: priceNote || '',
      benefits: Array.isArray(benefits) ? benefits : (typeof benefits === 'string' ? benefits.split('\n').filter(Boolean) : []),
      features: Array.isArray(features) ? features : (typeof features === 'string' ? features.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      category: category || 'dialysis',
      isPopular: !!isPopular
    });

    res.status(201).json({ success: true, message: 'Service created successfully in MongoDB', service: newService });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create service' });
  }
});

// PUT /api/services/:id (Admin edit service & pricing directly in MongoDB Atlas)
serviceRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.benefits && typeof updates.benefits === 'string') {
      updates.benefits = updates.benefits.split('\n').filter(Boolean);
    }
    if (updates.features && typeof updates.features === 'string') {
      updates.features = updates.features.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const updated = await db.updateService(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ success: true, message: 'Service updated successfully in MongoDB', service: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update service' });
  }
});

// DELETE /api/services/:id (Admin delete service from MongoDB Atlas)
serviceRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteService(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted successfully from MongoDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete service' });
  }
});
