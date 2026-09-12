import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const testimonialRouter = express.Router();

// GET /api/testimonials
testimonialRouter.get('/', (req, res) => {
  const testimonials = db.getTestimonials();
  res.json({ success: true, testimonials });
});

// POST /api/testimonials (Admin add)
testimonialRouter.post('/', requireAuth, (req, res) => {
  const { patientName, treatment, quote, rating, image, location } = req.body;
  if (!patientName || !quote) {
    return res.status(400).json({ error: 'Patient name and testimonial quote are required' });
  }

  const newTest = db.addTestimonial({
    patientName: patientName.trim(),
    treatment: treatment || 'Dialysis Patient',
    quote: quote.trim(),
    rating: Number(rating) || 5,
    image: image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    location: location || 'Delhi NCR'
  });

  res.status(201).json({ success: true, message: 'Testimonial added successfully', testimonial: newTest });
});

// PUT /api/testimonials/:id (Admin edit)
testimonialRouter.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateTestimonial(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Testimonial not found' });
  }

  res.json({ success: true, message: 'Testimonial updated successfully', testimonial: updated });
});

// DELETE /api/testimonials/:id (Admin delete)
testimonialRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteTestimonial(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Testimonial not found' });
  }

  res.json({ success: true, message: 'Testimonial deleted successfully' });
});
