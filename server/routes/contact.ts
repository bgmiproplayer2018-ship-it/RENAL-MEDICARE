import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const contactRouter = express.Router();

// POST /api/contact (Public submit contact or home visit request)
contactRouter.post('/', (req, res) => {
  const { name, email, phone, subject, message, type, address, preferredDate } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, mobile phone, and message are required' });
  }

  const newContact = db.addContact({
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
      ? 'Thank you! Your Home Dialysis visit request has been recorded. Our clinical coordinator will call you within 30 minutes.'
      : 'Thank you! Your message has been received. Our nephrology team will reach out promptly.',
    contact: newContact
  });
});

// POST /api/contact/sync (Bidirectional synchronization for permanent storage)
contactRouter.post('/sync', (req, res) => {
  const incoming = req.body.contacts;
  if (Array.isArray(incoming) && incoming.length > 0) {
    db.syncContacts(incoming);
  }
  const contacts = db.getContacts();
  res.json({ success: true, count: contacts.length, contacts });
});

// GET /api/contact (Admin list messages)
contactRouter.get('/', requireAuth, (req, res) => {
  const contacts = db.getContacts();
  res.json({ success: true, count: contacts.length, contacts });
});

// PATCH /api/contact/:id/read (Admin mark as read)
contactRouter.patch('/:id/read', requireAuth, (req, res) => {
  const { id } = req.params;
  const ok = db.markContactRead(id);
  if (!ok) {
    return res.status(404).json({ error: 'Message not found' });
  }
  const contact = db.getContacts().find(c => c.id === id);
  res.json({ success: true, message: 'Message marked as read', contact });
});

// DELETE /api/contact/:id (Admin delete message)
contactRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteContact(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Message not found' });
  }
  res.json({ success: true, message: 'Message deleted' });
});
