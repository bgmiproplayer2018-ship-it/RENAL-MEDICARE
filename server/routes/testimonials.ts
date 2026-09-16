import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const testimonialRouter = express.Router();

// GET /api/testimonials
testimonialRouter.get('/', async (req, res) => {
  try {
    const testimonials = await db.getTestimonials();
    res.json({ success: true, testimonials });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch testimonials' });
  }
});

// POST /api/testimonials (Admin add)
testimonialRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { patientName, treatment, quote, rating, image, location } = req.body;
    if (!patientName || !quote) {
      return res.status(400).json({ error: 'Patient name and testimonial quote are required' });
    }

    const newTest = await db.addTestimonial({
      patientName: patientName.trim(),
      treatment: treatment || 'Dialysis Patient',
      quote: quote.trim(),
      rating: Number(rating) || 5,
      image: image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      location: location || 'Delhi NCR'
    });

    res.status(201).json({ success: true, message: 'Testimonial added successfully', testimonial: newTest });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create testimonial' });
  }
});

// PUT /api/testimonials/:id (Admin edit)
testimonialRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateTestimonial(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ success: true, message: 'Testimonial updated successfully', testimonial: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id (Admin delete)
testimonialRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteTestimonial(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete testimonial' });
  }
});
