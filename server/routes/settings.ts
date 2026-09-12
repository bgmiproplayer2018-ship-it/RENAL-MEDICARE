import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const settingsRouter = express.Router();

// GET /api/settings
settingsRouter.get('/', (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// PUT /api/settings (Admin update contact & branding details)
settingsRouter.put('/', requireAuth, (req, res) => {
  const updates = req.body;
  const updated = db.updateSettings(updates);
  res.json({ success: true, message: 'Settings updated successfully', settings: updated });
});
