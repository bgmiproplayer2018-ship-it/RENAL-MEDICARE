import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const appointmentRouter = express.Router();

const formatApp = (a: any) => ({
  ...a,
  id: a.id,
  patientName: a.fullName || a.patientName,
  fullName: a.fullName || a.patientName,
  phone: a.mobileNumber || a.phone,
  mobileNumber: a.mobileNumber || a.phone,
  email: a.email || '',
  age: a.age,
  gender: a.gender,
  hospitalId: a.hospitalLocation || a.hospitalId,
  hospitalLocation: a.hospitalLocation || a.hospitalId,
  serviceType: a.serviceType,
  preferredDate: a.preferredDate,
  timeSlot: a.preferredTime || a.timeSlot,
  preferredTime: a.preferredTime || a.timeSlot,
  address: a.address,
  notes: a.additionalNotes || a.notes || '',
  additionalNotes: a.additionalNotes || a.notes || '',
  status: a.status,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt
});

// GET /api/appointments (Admin can filter by status or search text)
appointmentRouter.get('/', (req, res) => {
  const { status, search } = req.query;
  let list = db.getAppointments();

  if (status && status !== 'All') {
    list = list.filter(a => a.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search) {
    const s = (search as string).toLowerCase().trim();
    list = list.filter(a => 
      a.id.toLowerCase().includes(s) ||
      (a.fullName && a.fullName.toLowerCase().includes(s)) ||
      (a.mobileNumber && a.mobileNumber.includes(s)) ||
      (a.email && a.email.toLowerCase().includes(s)) ||
      (a.serviceType && a.serviceType.toLowerCase().includes(s)) ||
      (a.hospitalLocation && a.hospitalLocation.toLowerCase().includes(s))
    );
  }

  res.json({ success: true, count: list.length, appointments: list.map(formatApp) });
});

// GET /api/appointments/track/:query (Public patient tracking)
appointmentRouter.get('/track/:query', (req, res) => {
  const query = req.params.query;
  if (!query) {
    return res.status(400).json({ error: 'Tracking ID or Phone Number is required' });
  }

  const clean = query.trim().toLowerCase();
  const all = db.getAppointments();
  const matched = all.filter(a => 
    a.id.toLowerCase() === clean || 
    a.mobileNumber.replace(/\D/g, '') === clean.replace(/\D/g, '') ||
    (a.email && a.email.toLowerCase() === clean)
  );

  if (!matched || matched.length === 0) {
    return res.status(404).json({ error: 'No appointment found matching your Reference ID or Mobile Number.' });
  }

  const formattedList = matched.map(formatApp);
  res.json({ success: true, appointments: formattedList, appointment: formattedList[0] });
});

// POST /api/appointments (Public patient booking)
appointmentRouter.post('/', (req, res) => {
  const fullName = req.body.fullName || req.body.patientName;
  const mobileNumber = req.body.mobileNumber || req.body.phone;
  const email = req.body.email || '';
  const age = req.body.age ? Number(req.body.age) : 45;
  const gender = req.body.gender || 'Not Specified';
  const hospitalLocation = req.body.hospitalLocation || req.body.hospitalId || 'Renal Medicity Main Hub';
  const serviceType = req.body.serviceType || 'Hemodialysis';
  const preferredDate = req.body.preferredDate;
  const preferredTime = req.body.preferredTime || req.body.timeSlot || 'Morning (07:00 AM - 11:00 AM)';
  const address = req.body.address || 'Address provided during intake';
  const additionalNotes = req.body.additionalNotes || req.body.notes || '';

  // Validation
  if (!fullName || !mobileNumber || !preferredDate) {
    return res.status(400).json({ error: 'Please provide Patient Name, Mobile Number, and Preferred Date.' });
  }

  // Basic phone validation
  const cleanPhone = String(mobileNumber).replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
  }

  const newApp = db.createAppointment({
    fullName: fullName.trim(),
    mobileNumber: mobileNumber.trim(),
    email: email ? email.trim().toLowerCase() : `${cleanPhone}@patient.renalmedicity.com`,
    age: Number(age) || 45,
    gender,
    hospitalLocation,
    serviceType,
    preferredDate,
    preferredTime,
    address: address.trim(),
    additionalNotes: additionalNotes ? additionalNotes.trim() : '',
    status: 'Pending'
  });

  const formatted = formatApp(newApp);

  res.status(201).json({
    success: true,
    message: 'Appointment scheduled successfully! Please save your unique Appointment ID for tracking.',
    appointment: formatted
  });
});

// PATCH /api/appointments/:id (Admin update status, reschedule, or notes)
appointmentRouter.patch('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = db.updateAppointment(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  res.json({ success: true, message: 'Appointment updated successfully', appointment: updated });
});

// DELETE /api/appointments/:id (Admin delete)
appointmentRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteAppointment(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  res.json({ success: true, message: 'Appointment deleted successfully' });
});

// GET /api/appointments/export/csv (Admin CSV export)
appointmentRouter.get('/export/csv', requireAuth, (req, res) => {
  const list = db.getAppointments();
  
  const headers = [
    'Appointment ID',
    'Patient Name',
    'Mobile Number',
    'Email',
    'Age',
    'Gender',
    'Service',
    'Hospital Location',
    'Date',
    'Time Slot',
    'Status',
    'Reschedule Date',
    'Address',
    'Notes',
    'Created At'
  ];

  const rows = list.map(a => [
    `"${a.id}"`,
    `"${a.fullName.replace(/"/g, '""')}"`,
    `"${a.mobileNumber}"`,
    `"${a.email}"`,
    a.age,
    `"${a.gender}"`,
    `"${a.serviceType}"`,
    `"${a.hospitalLocation.replace(/"/g, '""')}"`,
    `"${a.preferredDate}"`,
    `"${a.preferredTime}"`,
    `"${a.status}"`,
    `"${a.rescheduleDate || ''}"`,
    `"${(a.address || '').replace(/"/g, '""')}"`,
    `"${(a.adminNotes || a.additionalNotes || '').replace(/"/g, '""')}"`,
    `"${a.createdAt}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="renal-medicity-appointments.csv"');
  res.send(csvContent);
});
