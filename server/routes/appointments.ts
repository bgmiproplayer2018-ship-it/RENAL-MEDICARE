import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';
import { 
  calculateReminderScheduledTime, 
  isAppointmentDueForReminder, 
  processAppointmentReminder 
} from '../../src/lib/notificationEngine.ts';

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
  updatedAt: a.updatedAt,
  reminderPreference: a.reminderPreference || 'both',
  reminderConsent: a.reminderConsent !== false,
  reminderStatus: a.reminderStatus || 'scheduled',
  reminderScheduledFor: a.reminderScheduledFor || calculateReminderScheduledTime(a.preferredDate, a.preferredTime || a.timeSlot || '').toISOString(),
  reminderSentAt: a.reminderSentAt,
  reminderChannels: a.reminderChannels || (a.reminderPreference === 'whatsapp' ? ['whatsapp'] : a.reminderPreference === 'email' ? ['email'] : ['whatsapp', 'email']),
  reminderLogs: a.reminderLogs || []
});

// GET /api/appointments (Fetch directly from MongoDB Atlas)
appointmentRouter.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = await db.getAppointments();

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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch appointments' });
  }
});

// POST /api/appointments/sync (Bidirectional synchronization for permanent storage in MongoDB)
appointmentRouter.post('/sync', async (req, res) => {
  try {
    const incoming = req.body.appointments;
    if (Array.isArray(incoming) && incoming.length > 0) {
      await db.syncAppointments(incoming);
    }
    const all = await db.getAppointments();
    res.json({ success: true, count: all.length, appointments: all.map(formatApp) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to sync appointments' });
  }
});

// GET /api/appointments/track/:query (Public patient tracking)
appointmentRouter.get('/track/:query', async (req, res) => {
  try {
    const query = req.params.query;
    if (!query) {
      return res.status(400).json({ error: 'Tracking ID or Phone Number is required' });
    }

    const clean = query.trim().toLowerCase();
    const all = await db.getAppointments();
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to track appointment' });
  }
});

// POST /api/appointments (Public patient booking saved directly into MongoDB Atlas)
appointmentRouter.post('/', async (req, res) => {
  try {
    const fullName = req.body.fullName || req.body.patientName;
    const mobileNumber = req.body.mobileNumber || req.body.phone;
    const email = req.body.email || '';
    const age = req.body.age ? Number(req.body.age) : 45;
    const gender = req.body.gender || 'Not Specified';
    const hospitalLocation = req.body.hospitalLocation || req.body.hospitalId || 'Renal medicare (kidney care & dialysis centre)';
    const serviceType = req.body.serviceType || 'Hemodialysis';
    const preferredDate = req.body.preferredDate;
    const preferredTime = req.body.preferredTime || req.body.timeSlot || 'Morning (07:00 AM - 11:00 AM)';
    const address = req.body.address || 'Address provided during intake';
    const additionalNotes = req.body.additionalNotes || req.body.notes || '';
    const reminderPreference = req.body.reminderPreference || 'both';
    const reminderConsent = req.body.reminderConsent !== false;

    // Validation
    if (!fullName || !mobileNumber || !preferredDate) {
      return res.status(400).json({ error: 'Please provide Patient Name, Mobile Number, and Preferred Date.' });
    }

    const cleanPhone = String(mobileNumber).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
    }

    const reminderScheduledFor = calculateReminderScheduledTime(preferredDate, preferredTime, 24).toISOString();
    const reminderChannels = reminderPreference === 'whatsapp' ? ['whatsapp'] : reminderPreference === 'email' ? ['email'] : ['whatsapp', 'email'];

    let newApp = await db.createAppointment({
      fullName: fullName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email ? email.trim().toLowerCase() : `${cleanPhone}@patient.renalmedicare.com`,
      age: Number(age) || 45,
      gender,
      hospitalLocation,
      serviceType,
      preferredDate,
      preferredTime,
      address: address.trim(),
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      status: 'Pending',
      reminderPreference,
      reminderConsent,
      reminderStatus: 'scheduled',
      reminderScheduledFor,
      reminderChannels: reminderChannels as any,
      reminderLogs: []
    });

    // Check if session is already within 24 hours
    const dueCheck = isAppointmentDueForReminder(newApp, 24);
    let immediateReminderSent = false;
    if (dueCheck.isDue && reminderPreference !== 'none') {
      const settings = await db.getSettings();
      const phone = settings?.phone || '9069645840';
      const { updatedAppointment } = processAppointmentReminder(
        newApp,
        reminderPreference,
        'automated_24h',
        phone
      );
      await db.updateAppointment(newApp.id, updatedAppointment);
      newApp = updatedAppointment;
      immediateReminderSent = true;
    }

    const formatted = formatApp(newApp);

    res.status(201).json({
      success: true,
      message: immediateReminderSent
        ? 'Appointment scheduled in MongoDB Atlas and automated 24-hour reminder sent to your WhatsApp / Email!'
        : 'Appointment scheduled successfully in MongoDB Atlas! Your automated 24-hour reminder has been scheduled.',
      appointment: formatted,
      reminderInfo: {
        scheduledFor: reminderScheduledFor,
        channels: reminderChannels,
        immediateReminderSent
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to schedule appointment' });
  }
});

// PUT /api/appointments/:id (Admin update appointment in MongoDB Atlas)
appointmentRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateAppointment(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment updated successfully in MongoDB', appointment: formatApp(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update appointment' });
  }
});

// PATCH /api/appointments/:id (Alias for PUT)
appointmentRouter.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateAppointment(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment updated successfully in MongoDB', appointment: formatApp(updated) });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update appointment' });
  }
});

// PATCH / PUT / POST /api/appointments/:id/status (Explicit status update for Accept, Reject, Reschedule)
appointmentRouter.all('/:id/status', requireAuth, async (req, res) => {
  if (req.method !== 'PATCH' && req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.params;
    const { status, adminNotes, rescheduleDate, rescheduleTime, timeSlot, preferredDate, preferredTime } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updates: any = { status };
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (rescheduleDate !== undefined) updates.rescheduleDate = rescheduleDate;
    if (rescheduleTime !== undefined) updates.rescheduleTime = rescheduleTime;
    if (timeSlot !== undefined) updates.preferredTime = timeSlot;
    if (preferredTime !== undefined) updates.preferredTime = preferredTime;
    if (preferredDate !== undefined) updates.preferredDate = preferredDate;

    const updated = await db.updateAppointment(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const formatted = formatApp(updated);
    res.json({
      success: true,
      message: `Appointment status updated to ${status} in MongoDB`,
      appointment: formatted
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update appointment status' });
  }
});

// DELETE /api/appointments/:id (Admin delete from MongoDB Atlas)
appointmentRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteAppointment(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment deleted successfully from MongoDB' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete appointment' });
  }
});

// GET /api/appointments/export/csv (Admin CSV export)
appointmentRouter.get('/export/csv', requireAuth, async (req, res) => {
  try {
    const list = await db.getAppointments();
    
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to export appointments' });
  }
});
