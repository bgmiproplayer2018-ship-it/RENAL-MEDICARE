import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const faqRouter = express.Router();

// GET /api/faqs
faqRouter.get('/', (req, res) => {
  const faqs = db.getFaqs();
  res.json({ success: true, faqs });
});

// POST /api/faqs (Admin add FAQ)
faqRouter.post('/', requireAuth, (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const newFaq = db.addFaq({
    question: question.trim(),
    answer: answer.trim(),
    category: category || 'general'
  });

  res.status(201).json({ success: true, message: 'FAQ created successfully', faq: newFaq });
});

// PUT /api/faqs/:id (Admin edit FAQ)
faqRouter.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateFaq(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'FAQ not found' });
  }

  res.json({ success: true, message: 'FAQ updated successfully', faq: updated });
});

// DELETE /api/faqs/:id (Admin delete FAQ)
faqRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteFaq(id);
  if (!deleted) {
    return res.status(404).json({ error: 'FAQ not found' });
  }

  res.json({ success: true, message: 'FAQ deleted successfully' });
});
