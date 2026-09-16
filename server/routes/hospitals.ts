import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const hospitalRouter = express.Router();

// GET /api/hospitals
hospitalRouter.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    let list = await db.getHospitals();

    if (city && city !== 'All') {
      list = list.filter(h => h.city.toLowerCase() === (city as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.state.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: list.length, hospitals: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch hospitals' });
  }
});

// POST /api/hospitals (Admin add hospital directly to MongoDB Atlas)
hospitalRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { name, address, city, state, contactNumber, facilities, googleMap, mapLink, image, dialysisUnits, bedsCount, emergencyAvailable } = req.body;

    if (!name || !address || !city || !state || !contactNumber) {
      return res.status(400).json({ error: 'Name, address, city, state, and contact number are required.' });
    }

    const newHospital = await db.addHospital({
      name,
      address,
      city,
      state,
      contactNumber,
      facilities: Array.isArray(facilities) ? facilities : (typeof facilities === 'string' ? facilities.split(',').map(s => s.trim()).filter(Boolean) : []),
      googleMap: googleMap || mapLink || '',
      image: image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
      dialysisUnits: Number(dialysisUnits ?? bedsCount) || 12,
      emergencyAvailable: emergencyAvailable !== undefined ? Boolean(emergencyAvailable) : true
    });

    res.status(201).json({ success: true, message: 'Hospital added successfully to MongoDB', hospital: newHospital });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create hospital' });
  }
});

// PUT /api/hospitals/:id (Admin update hospital directly in MongoDB Atlas)
hospitalRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.facilities && typeof updates.facilities === 'string') {
      updates.facilities = updates.facilities.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (updates.dialysisUnits === undefined && updates.bedsCount !== undefined) {
      updates.dialysisUnits = Number(updates.bedsCount) || 12;
    }
    if (!updates.googleMap && updates.mapLink) {
      updates.googleMap = updates.mapLink;
    }

    const updated = await db.updateHospital(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital updated successfully in MongoDB', hospital: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update hospital' });
  }
});

// DELETE /api/hospitals/:id (Admin delete hospital from MongoDB Atlas)
hospitalRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteHospital(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital removed successfully from MongoDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete hospital' });
  }
});
