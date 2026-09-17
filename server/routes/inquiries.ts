import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const inquiryRouter = express.Router();

// GET /api/inquiries (Fetch directly from MongoDB Atlas collection 'inquiries')
inquiryRouter.get('/', async (req, res) => {
  try {
    const list = await db.getInquiries();
    res.json({
      success: true,
      count: list.length,
      inquiries: list,
      contacts: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch inquiries' });
  }
});

// POST /api/inquiries (Public submit inquiry saved directly into MongoDB Atlas)
inquiryRouter.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, type, address, preferredDate } = req.body;

    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Name, mobile phone, and message are required' });
    }

    const newInquiry = await db.addInquiry({
      name: name.trim(),
      email: (email || 'not-provided@renalmedicare.com').trim(),
      phone: phone.trim(),
      subject: subject || (type === 'home-dialysis-request' ? 'Home Dialysis Visit Request' : 'General Inquiry'),
      message: message.trim(),
      type: type || 'general',
      address: address ? address.trim() : '',
      preferredDate: preferredDate || ''
    });

    res.status(201).json({
      success: true,
      message: type === 'home-dialysis-request'
        ? 'Thank you! Your Home Dialysis visit request has been recorded in MongoDB Atlas. Our clinical coordinator will call you within 30 minutes.'
        : 'Thank you! Your inquiry has been saved to MongoDB Atlas. Our nephrology team will reach out promptly.',
      inquiry: newInquiry,
      contact: newInquiry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to submit inquiry' });
  }
});

// PUT /api/inquiries/:id (Update inquiry in MongoDB Atlas)
inquiryRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateInquiry(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry updated successfully in MongoDB', inquiry: updated, contact: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update inquiry' });
  }
});

// PATCH /api/inquiries/:id/read (Mark inquiry as read)
inquiryRouter.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await db.markContactRead(id);
    if (!ok) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    const all = await db.getInquiries();
    const inquiry = all.find(c => c.id === id);
    res.json({ success: true, message: 'Inquiry marked as read in MongoDB', inquiry, contact: inquiry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to mark inquiry as read' });
  }
});

// DELETE /api/inquiries/:id (Admin delete inquiry from MongoDB Atlas)
inquiryRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteInquiry(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    res.json({ success: true, message: 'Inquiry deleted successfully from MongoDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete inquiry' });
  }
});

// POST /api/inquiries/delete-batch (Admin batch delete inquiries)
inquiryRouter.post('/delete-batch', requireAuth, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'ids array required' });
    }
    const count = await db.deleteMultipleInquiries(ids);
    res.json({ success: true, count, message: `${count} inquiries deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete inquiries' });
  }
});

// POST /api/inquiries/sync (Batch sync if needed)
inquiryRouter.post('/sync', async (req, res) => {
  try {
    const incoming = req.body.inquiries || req.body.contacts;
    if (Array.isArray(incoming) && incoming.length > 0) {
      await db.syncContacts(incoming);
    }
    const list = await db.getInquiries();
    res.json({ success: true, count: list.length, inquiries: list, contacts: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to sync inquiries' });
  }
});
