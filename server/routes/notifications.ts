import express from 'express';
import { notificationService } from '../services/notificationService.ts';

export const notificationRouter = express.Router();

// GET /api/notifications/status
notificationRouter.get('/status', async (req, res) => {
  try {
    const status = await notificationService.getStatus();
    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch status' });
  }
});

// POST /api/notifications/run-reminders (Automated trigger or manual admin scan)
notificationRouter.post('/run-reminders', async (req, res) => {
  try {
    const results = await notificationService.scanAndDispatchAutomatedReminders();
    res.json({
      success: true,
      message: `Scanned ${results.scannedCount} appointments. Dispatched ${results.dispatchedCount} automated reminders.`,
      results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error processing automated reminders' });
  }
});

// POST /api/notifications/send/:id (Dispatch reminder for a specific appointment)
notificationRouter.post('/send/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { channel = 'both', triggerType = 'manual_admin' } = req.body || {};

    const result = await notificationService.sendSingleReminder(id, channel, triggerType);
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      appointment: result.appointment,
      content: result.content
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to send notification' });
  }
});

// GET /api/notifications/preview/:id (Preview formatted WhatsApp and Email message)
notificationRouter.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const preview = await notificationService.previewReminder(id);

    if (!preview) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, preview });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to preview reminder' });
  }
});

// GET /api/notifications/logs (Audit logs of sent reminders)
notificationRouter.get('/logs', async (req, res) => {
  try {
    const logs = await notificationService.getRecentLogs();
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch reminder logs' });
  }
});
