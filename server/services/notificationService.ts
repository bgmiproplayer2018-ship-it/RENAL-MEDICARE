import { db } from '../db/store.ts';
import { 
  calculateReminderScheduledTime, 
  isAppointmentDueForReminder, 
  processAppointmentReminder, 
  generate24HourReminderContent 
} from '../../src/lib/notificationEngine.ts';
import { Appointment, ReminderChannel, ReminderLog } from '../../src/types.ts';

class NotificationService {
  private isScanRunning: boolean = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private lastRunAt: string | null = null;
  private totalAutomatedSent: number = 0;

  constructor() {
    // Start automated background scheduler checking every 30 seconds
    this.startAutomatedScheduler(30000);
  }

  public startAutomatedScheduler(intervalMs: number = 30000) {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    // Run first check after 3 seconds of server boot
    setTimeout(() => {
      this.scanAndDispatchAutomatedReminders().catch(err => {
        console.error('[NotificationService] Initial scan error:', err);
      });
    }, 3000);

    this.intervalTimer = setInterval(() => {
      this.scanAndDispatchAutomatedReminders().catch(err => {
        console.error('[NotificationService] Periodic reminder scan error:', err);
      });
    }, intervalMs);

    console.log(`[NotificationService] Automated 24-hour reminder background scheduler initialized (interval: ${intervalMs}ms)`);
  }

  public stopAutomatedScheduler() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  /**
   * Scans the database for any appointments within the 24-hour window
   * and automatically dispatches WhatsApp / Email reminders.
   */
  public async scanAndDispatchAutomatedReminders(): Promise<{
    scannedCount: number;
    dispatchedCount: number;
    alreadySentCount: number;
    pendingCount: number;
    dispatchedAppointments: Array<{ id: string; patientName: string; channels: string[] }>;
    timestamp: string;
  }> {
    if (this.isScanRunning) {
      return {
        scannedCount: 0,
        dispatchedCount: 0,
        alreadySentCount: 0,
        pendingCount: 0,
        dispatchedAppointments: [],
        timestamp: new Date().toISOString()
      };
    }

    this.isScanRunning = true;
    this.lastRunAt = new Date().toISOString();

    const dispatchedAppointments: Array<{ id: string; patientName: string; channels: string[] }> = [];
    let alreadySentCount = 0;
    let pendingCount = 0;

    try {
      const appointments = db.getAppointments();
      const settings = db.getSettings();
      const supportPhone = settings?.phone || '9069645840';

      for (const app of appointments) {
        // Skip cancelled or completed
        if (app.status === 'Rejected' || app.status === 'Completed') {
          continue;
        }

        if (app.reminderStatus === 'sent') {
          alreadySentCount++;
          continue;
        }

        const dueCheck = isAppointmentDueForReminder(app, 24);

        if (dueCheck.isDue) {
          // Determine channels
          const channelPref = app.reminderPreference || 'both';
          const targetChannel: ReminderChannel = channelPref === 'none' ? 'both' : (channelPref as ReminderChannel);

          const { updatedAppointment, logs } = processAppointmentReminder(
            app,
            targetChannel,
            'automated_24h',
            supportPhone
          );

          // Update database
          db.updateAppointment(app.id, updatedAppointment);
          this.totalAutomatedSent++;

          dispatchedAppointments.push({
            id: app.id,
            patientName: app.fullName || (app as any).patientName || 'Patient',
            channels: updatedAppointment.reminderChannels || []
          });

          console.log(`[NotificationService] Auto 24h reminder dispatched to appointment ${app.id} (${app.fullName}) via ${targetChannel}.`);
        } else {
          pendingCount++;
        }
      }
    } finally {
      this.isScanRunning = false;
    }

    return {
      scannedCount: db.getAppointments().length,
      dispatchedCount: dispatchedAppointments.length,
      alreadySentCount,
      pendingCount,
      dispatchedAppointments,
      timestamp: this.lastRunAt
    };
  }

  /**
   * Manually trigger or re-send reminder for a single appointment
   */
  public sendSingleReminder(
    appointmentId: string,
    channel: ReminderChannel = 'both',
    triggerType: 'manual_admin' | 'patient_test' = 'manual_admin'
  ): { success: boolean; appointment?: Appointment; message?: string; content?: any } {
    const app = db.getAppointments().find(a => a.id.toLowerCase() === appointmentId.toLowerCase());
    if (!app) {
      return { success: false, message: 'Appointment not found' };
    }

    const settings = db.getSettings();
    const supportPhone = settings?.phone || '9069645840';

    const { updatedAppointment, content } = processAppointmentReminder(
      app,
      channel,
      triggerType,
      supportPhone
    );

    db.updateAppointment(app.id, updatedAppointment);

    return {
      success: true,
      appointment: updatedAppointment,
      content,
      message: `24-Hour Dialysis Reminder sent successfully via ${channel === 'both' ? 'WhatsApp & Email' : channel}.`
    };
  }

  /**
   * Get service status and live metrics
   */
  public getStatus() {
    const all = db.getAppointments();
    const active = all.filter(a => a.status !== 'Rejected' && a.status !== 'Completed');
    const sent = all.filter(a => a.reminderStatus === 'sent');
    const dueNow = active.filter(a => isAppointmentDueForReminder(a, 24).isDue);

    return {
      isSchedulerActive: this.intervalTimer !== null,
      lastRunAt: this.lastRunAt,
      totalAppointments: all.length,
      activeDialysisSessions: active.length,
      remindersSentCount: sent.length,
      remindersDueNowCount: dueNow.length,
      totalAutomatedSentSession: this.totalAutomatedSent,
      reminderWindowHours: 24,
      serverTime: new Date().toISOString()
    };
  }

  /**
   * Get all reminder logs across appointments
   */
  public getRecentLogs(): ReminderLog[] {
    const all = db.getAppointments();
    const logs: ReminderLog[] = [];

    for (const a of all) {
      if (a.reminderLogs && Array.isArray(a.reminderLogs)) {
        logs.push(...a.reminderLogs);
      }
    }

    // Sort by timestamp desc
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Preview reminder text and email for an appointment
   */
  public previewReminder(appointmentId: string) {
    const app = db.getAppointments().find(a => a.id.toLowerCase() === appointmentId.toLowerCase());
    if (!app) return null;

    const settings = db.getSettings();
    const supportPhone = settings?.phone || '9069645840';

    return generate24HourReminderContent(app, supportPhone);
  }
}

export const notificationService = new NotificationService();
