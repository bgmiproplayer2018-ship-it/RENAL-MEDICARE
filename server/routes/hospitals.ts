import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const hospitalRouter = express.Router();

// GET /api/hospitals
hospitalRouter.get('/', (req, res) => {
  const { city, search } = req.query;
  let list = db.getHospitals();

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
});

// POST /api/hospitals (Admin add hospital)
hospitalRouter.post('/', requireAuth, (req, res) => {
  const { name, address, city, state, contactNumber, facilities, googleMap, image, dialysisUnits, emergencyAvailable } = req.body;

  if (!name || !address || !city || !state || !contactNumber) {
    return res.status(400).json({ error: 'Name, address, city, state, and contact number are required.' });
  }

  const newHospital = db.addHospital({
    name,
    address,
    city,
    state,
    contactNumber,
    facilities: Array.isArray(facilities) ? facilities : (typeof facilities === 'string' ? facilities.split(',').map(s => s.trim()).filter(Boolean) : []),
    googleMap: googleMap || '',
    image: image || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80',
    dialysisUnits: Number(dialysisUnits) || 12,
    emergencyAvailable: emergencyAvailable !== undefined ? Boolean(emergencyAvailable) : true
  });

  res.status(201).json({ success: true, message: 'Hospital added successfully', hospital: newHospital });
});

// PUT /api/hospitals/:id (Admin update hospital)
hospitalRouter.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.facilities && typeof updates.facilities === 'string') {
    updates.facilities = updates.facilities.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  const updated = db.updateHospital(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Hospital not found' });
  }

  res.json({ success: true, message: 'Hospital updated successfully', hospital: updated });
});

// DELETE /api/hospitals/:id (Admin delete hospital)
hospitalRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteHospital(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Hospital not found' });
  }

  res.json({ success: true, message: 'Hospital removed successfully' });
});
