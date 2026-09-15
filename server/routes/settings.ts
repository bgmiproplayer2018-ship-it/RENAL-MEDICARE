import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const settingsRouter = express.Router();

// GET /api/settings
settingsRouter.get('/', (req, res) => {
  const settings = db.getSettings();
  res.json({ success: true, settings });
});

// PUT & POST /api/settings (Admin update contact & branding details)
const handleUpdateSettings = (req: express.Request, res: express.Response) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Invalid settings body' });
  }
  const updated = db.updateSettings(updates);
  res.json({ success: true, message: 'Settings updated successfully', settings: updated });
};

settingsRouter.put('/', requireAuth, handleUpdateSettings);
settingsRouter.post('/', requireAuth, handleUpdateSettings);

