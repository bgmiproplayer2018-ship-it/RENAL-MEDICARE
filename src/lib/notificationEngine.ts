import { Appointment, ReminderChannel, ReminderLog, ReminderStatus, NotificationConfig } from '../types.ts';

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  autoReminder24hEnabled: true,
  reminderHoursBefore: 24,
  enableWhatsApp: true,
  enableEmail: true,
  whatsappSenderNumber: '9069645840',
  emailSenderAddress: 'care@renalmedicare.com',
  totalRemindersSentCount: 0
};

/**
 * Parses appointment date & time slot to derive session start Date object
 */
export function parseSessionDateTime(preferredDate: string, timeSlot: string): Date {
  // Default to 8:00 AM on the given date if time parsing fails
  let hour = 8;
  let minute = 0;

  if (timeSlot) {
    const timeMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (timeMatch) {
      let parsedHour = parseInt(timeMatch[1], 10);
      const parsedMin = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();

      if (ampm === 'PM' && parsedHour < 12) parsedHour += 12;
      if (ampm === 'AM' && parsedHour === 12) parsedHour = 0;

      hour = parsedHour;
      minute = parsedMin;
    } else if (timeSlot.toLowerCase().includes('morning') || timeSlot.toLowerCase().includes('07:00')) {
      hour = 7;
    } else if (timeSlot.toLowerCase().includes('afternoon') || timeSlot.toLowerCase().includes('11:30')) {
      hour = 11;
      minute = 30;
    } else if (timeSlot.toLowerCase().includes('evening') || timeSlot.toLowerCase().includes('04:00')) {
      hour = 16;
    } else if (timeSlot.toLowerCase().includes('night') || timeSlot.toLowerCase().includes('nocturnal')) {
      hour = 20;
    }
  }

  // Handle date string YYYY-MM-DD or standard formats
  let sessionDate = new Date(`${preferredDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  if (isNaN(sessionDate.getTime())) {
    sessionDate = new Date(preferredDate);
    sessionDate.setHours(hour, minute, 0, 0);
  }

  // Fallback if still invalid
  if (isNaN(sessionDate.getTime())) {
    sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() + 1);
    sessionDate.setHours(hour, minute, 0, 0);
  }

  return sessionDate;
}

/**
 * Calculates exact reminder scheduled date/time (default: 24 hours prior)
 */
export function calculateReminderScheduledTime(preferredDate: string, timeSlot: string, hoursBefore: number = 24): Date {
  const sessionDate = parseSessionDateTime(preferredDate, timeSlot);
  return new Date(sessionDate.getTime() - hoursBefore * 60 * 60 * 1000);
}

/**
 * Checks if an appointment is currently eligible for an automated 24-hour reminder dispatch
 */
export function isAppointmentDueForReminder(
  appointment: Appointment,
  hoursBefore: number = 24,
  now: Date = new Date()
): { isDue: boolean; reason: string; sessionDate: Date; scheduledReminderDate: Date; hoursRemaining: number } {
  const sessionDate = parseSessionDateTime(
    appointment.preferredDate,
    appointment.timeSlot || appointment.preferredTime || ''
  );
  const scheduledReminderDate = new Date(sessionDate.getTime() - hoursBefore * 60 * 60 * 1000);

  const diffMs = sessionDate.getTime() - now.getTime();
  const hoursRemaining = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

  // If already marked sent
  if (appointment.reminderStatus === 'sent') {
    return {
      isDue: false,
      reason: 'Reminder has already been sent to the patient.',
      sessionDate,
      scheduledReminderDate,
      hoursRemaining
    };
  }

  // If user disabled reminders
  if (appointment.reminderPreference === 'none' || appointment.reminderStatus === 'disabled') {
    return {
      isDue: false,
      reason: 'Patient opted out of automated reminders.',
      sessionDate,
      scheduledReminderDate,
      hoursRemaining
    };
  }

  // If appointment is rejected or cancelled
  if (appointment.status === 'Rejected') {
    return {
      isDue: false,
      reason: 'Appointment is rejected or cancelled.',
      sessionDate,
      scheduledReminderDate,
      hoursRemaining
    };
  }

  // If session already finished more than 2 hours ago
  if (diffMs < -2 * 60 * 60 * 1000) {
    return {
      isDue: false,
      reason: 'Session has already concluded.',
      sessionDate,
      scheduledReminderDate,
      hoursRemaining
    };
  }

  // Due if current time is equal to or past scheduled reminder time AND session hasn't started yet
  if (now.getTime() >= scheduledReminderDate.getTime() && now.getTime() <= sessionDate.getTime()) {
    return {
      isDue: true,
      reason: `Within the 24-hour reminder window (${hoursRemaining} hours before session).`,
      sessionDate,
      scheduledReminderDate,
      hoursRemaining
    };
  }

  return {
    isDue: false,
    reason: `Session is more than ${hoursBefore} hours away (${hoursRemaining} hours remaining). Reminder scheduled for ${scheduledReminderDate.toLocaleString()}.`,
    sessionDate,
    scheduledReminderDate,
    hoursRemaining
  };
}

/**
 * Generates formatted WhatsApp and Email message contents for the 24-Hour Dialysis Reminder
 */
export function generate24HourReminderContent(
  appointment: Appointment,
  supportPhone: string = '9069645840'
) {
  const patientName = appointment.fullName || appointment.patientName || 'Valued Patient';
  const cleanPhone = String(appointment.mobileNumber || appointment.phone || '').replace(/\D/g, '');
  const service = appointment.serviceType || 'Hemodialysis Treatment';
  const center = appointment.hospitalLocation || appointment.hospitalId || 'Renal Medicare Dialysis Center';
  const date = appointment.preferredDate;
  const time = appointment.timeSlot || appointment.preferredTime || 'Scheduled Shift';
  const email = appointment.email || `${cleanPhone}@patient.renalmedicare.com`;

  // WhatsApp Message
  const whatsappText = 
`🏥 *RENAL MEDICARE - 24-HOUR DIALYSIS REMINDER* 🏥

Dear *${patientName}*,
This is an automated reminder that your scheduled dialysis session is booked for *tomorrow*.

📋 *Session Summary:*
• *Appointment ID:* ${appointment.id}
• *Treatment:* ${service}
• *Center / Facility:* ${center}
• *Scheduled Date:* ${date}
• *Time Slot:* ${time}
• *Status:* Confirmed & Dialyzer Station Reserved

⚠️ *CRITICAL 24-HOUR PRE-DIALYSIS PREPARATION:*
1. 🩺 *Vascular Access / Fistula Care:*
   - Keep your AV Fistula/Graft arm clean. Wash thoroughly with soap before arriving.
   - Do NOT wear tight sleeves, wristwatches, or tourniquets on your fistula arm.
   - Check your daily fistula vibration ("thrill").
2. 💧 *Fluid & Dry Weight Caution:*
   - Monitor your overnight fluid intake to avoid excess interdialytic weight gain.
   - Avoid high-potassium foods (bananas, coconut water, citrus fruits).
3. 💊 *Medications:*
   - Take regular blood pressure medicines strictly per your nephrologist's protocol.
4. ⏰ *Arrival:*
   - Please arrive 15 minutes before your time slot for pre-dialysis vitals and weight logging.

💬 *Need Immediate Assistance or Schedule Changes?*
• 24x7 Dialysis Coordination Desk: +91 ${supportPhone}
• Quick Reply on WhatsApp: https://wa.me/91${supportPhone}

Wishing you a smooth, comfortable dialysis session!
_Renal Medicare Clinical Operations_`;

  // WhatsApp Web / App direct click-to-chat URL
  const whatsappTargetPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 
    ? cleanPhone 
    : `91${cleanPhone}`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(whatsappTargetPhone)}&text=${encodeURIComponent(whatsappText)}`;

  // Email Subject & Content
  const emailSubject = `⏰ 24-Hour Dialysis Reminder: Your Session Tomorrow at Renal Medicare [Ref: ${appointment.id}]`;

  const emailText = 
`Dear ${patientName},

This is an automated 24-hour reminder from Renal Medicare regarding your scheduled dialysis session.

APPOINTMENT DETAILS:
- Reference ID: ${appointment.id}
- Patient Name: ${patientName}
- Service: ${service}
- Facility / Location: ${center}
- Date: ${date}
- Time Slot: ${time}
- Status: Confirmed & Bed Station Allocated

PRE-DIALYSIS PREPARATION GUIDELINES:
1. Fistula / Access Arm Care: Keep the access area clean. Avoid tight clothing or blood pressure cuffs on the fistula arm.
2. Fluid Management: Adhere strictly to your prescribed daily fluid restriction and dry weight targets.
3. Medication: Take your routine prescribed medications as advised by your attending nephrologist.
4. Timeliness: Arrive 15 minutes early to facilitate smooth pre-dialysis vitals and weight recording.

For any emergencies, acute respiratory distress, or rescheduling requests, call our 24x7 dialysis helpline immediately at +91 ${supportPhone}.

Warm regards,
Renal Medicare Clinical Nephrology Team
Renal medicare (kidney care & dialysis centre) 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089
Website: https://renalmedicare.com`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #1E293B; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #005BBD 0%, #003875 100%); color: #FFFFFF; padding: 28px 24px; text-align: center; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .content { padding: 24px; }
    .card { background: #F1F5F9; border-radius: 12px; padding: 18px; margin: 18px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .guideline { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #92400E; }
    .btn { display: inline-block; background: #005BBD; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; }
    .footer { text-align: center; font-size: 12px; color: #64748B; padding: 20px; border-top: 1px solid #E2E8F0; background: #FAFAFA; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Automated 24-Hour Clinical Reminder</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 900;">Dialysis Session Tomorrow</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Ref: ${appointment.id}</p>
    </div>
    <div class="content">
      <p>Dear <strong>${patientName}</strong>,</p>
      <p>This is a reminder that your dialysis treatment is scheduled for tomorrow at <strong>${center}</strong>. Our clinical team and dialyzer bed station are prepared for your arrival.</p>
      
      <div class="card">
        <div class="grid">
          <div><span style="color:#64748B;">Date:</span><br><strong>${date}</strong></div>
          <div><span style="color:#64748B;">Time Slot:</span><br><strong>${time}</strong></div>
          <div><span style="color:#64748B;">Treatment:</span><br><strong>${service}</strong></div>
          <div><span style="color:#64748B;">Contact Phone:</span><br><strong>+91 ${cleanPhone}</strong></div>
        </div>
      </div>

      <div class="guideline">
        <strong>⚠️ Critical Pre-Dialysis Precautions:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.5;">
          <li>Wash your AV Fistula/Graft arm thoroughly before arriving. Avoid tight sleeves.</li>
          <li>Keep overnight fluid intake within your recommended dry weight limit.</li>
          <li>Arrive 15 minutes before your slot to record pre-dialysis weight and vitals.</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://wa.me/91${supportPhone}?text=Hi%2C%20I%20have%20a%20question%20regarding%20appointment%20${appointment.id}" class="btn">
          Connect with 24x7 Dialysis Desk
        </a>
      </div>
    </div>
    <div class="footer">
      Renal medicare (kidney care &amp; dialysis centre) &bull; 63,64,65, Pocket 4, Sector 16A, Rohini Delhi 110089 &bull; +91 ${supportPhone}<br>
      Automated Patient Communication Engine
    </div>
  </div>
</body>
</html>`;

  return {
    whatsappText,
    whatsappUrl,
    emailSubject,
    emailText,
    emailHtml,
    recipientPhone: cleanPhone,
    recipientEmail: email,
  };
}

/**
 * Dispatches automated 24-hour reminder to an appointment
 */
export function processAppointmentReminder(
  appointment: Appointment,
  channel: 'whatsapp' | 'email' | 'both' = 'both',
  triggerType: 'automated_24h' | 'manual_admin' | 'patient_test' = 'automated_24h',
  supportPhone: string = '9069645840'
): { updatedAppointment: Appointment; logs: ReminderLog[]; content: ReturnType<typeof generate24HourReminderContent> } {
  const content = generate24HourReminderContent(appointment, supportPhone);
  const now = new Date().toISOString();

  const channelsToUse: ('whatsapp' | 'email')[] = 
    channel === 'both' ? ['whatsapp', 'email'] : [channel];

  const newLogs: ReminderLog[] = channelsToUse.map(ch => ({
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: now,
    channel: ch,
    status: 'delivered',
    recipient: ch === 'whatsapp' ? content.recipientPhone : content.recipientEmail,
    messageSnippet: ch === 'whatsapp' ? content.whatsappText.slice(0, 160) + '...' : content.emailSubject,
    triggerType
  }));

  const existingLogs = appointment.reminderLogs || [];

  const updatedAppointment: Appointment = {
    ...appointment,
    reminderStatus: 'sent',
    reminderSentAt: now,
    reminderChannels: channelsToUse,
    reminderLogs: [...newLogs, ...existingLogs],
    updatedAt: now
  };

  return {
    updatedAppointment,
    logs: newLogs,
    content
  };
}
