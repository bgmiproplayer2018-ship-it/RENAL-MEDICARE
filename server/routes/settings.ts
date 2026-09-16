import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const settingsRouter = express.Router();

// GET /api/settings (Fetch directly from MongoDB Atlas collection 'settings')
settingsRouter.get('/', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch settings' });
  }
});

// PUT & POST /api/settings (Admin update company & branding details saved directly into MongoDB Atlas)
const handleUpdateSettings = async (req: express.Request, res: express.Response) => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings body' });
    }
    const updated = await db.updateSettings(updates);
    res.json({ success: true, message: 'Settings updated successfully in MongoDB', settings: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update settings' });
  }
};

settingsRouter.put('/', requireAuth, handleUpdateSettings);
settingsRouter.post('/', requireAuth, handleUpdateSettings);
