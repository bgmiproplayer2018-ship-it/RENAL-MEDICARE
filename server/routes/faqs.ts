import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const faqRouter = express.Router();

// GET /api/faqs
faqRouter.get('/', async (req, res) => {
  try {
    const faqs = await db.getFaqs();
    res.json({ success: true, faqs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch FAQs' });
  }
});

// POST /api/faqs (Admin add FAQ)
faqRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const newFaq = await db.addFaq({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'general'
    });

    res.status(201).json({ success: true, message: 'FAQ created successfully', faq: newFaq });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create FAQ' });
  }
});

// PUT /api/faqs/:id (Admin edit FAQ)
faqRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateFaq(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ success: true, message: 'FAQ updated successfully', faq: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update FAQ' });
  }
});

// DELETE /api/faqs/:id (Admin delete FAQ)
faqRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteFaq(id);
    if (!deleted) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete FAQ' });
  }
});
