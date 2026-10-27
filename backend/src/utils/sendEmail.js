const nodemailer = require('nodemailer');
const env = require('../config/env');

/**
 * Creates and returns a Nodemailer transporter using Gmail SMTP.
 * Returns null if EMAIL_USER or EMAIL_PASS are not configured.
 */
const getTransporter = () => {
  const user = env.EMAIL_USER || process.env.EMAIL_USER;
  const pass = env.EMAIL_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('[Email] Skipping email dispatch: EMAIL_USER or EMAIL_PASS not configured in .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  });
};

/**
 * Formats a clean HTML email template for booking notifications.
 */
const buildEmailTemplate = ({ recipientRole, recipientName, otherPartyLabel, otherPartyName, slot }) => {
  const isMentor = recipientRole === 'mentor';
  const heading = isMentor ? 'New Tutoring Session Booked!' : 'Session Booking Confirmed!';
  const messageLead = isMentor
    ? `A student has booked an upcoming tutoring session with you on <strong>CampusConnect</strong>.`
    : `Your tutoring session with your mentor has been successfully scheduled on <strong>CampusConnect</strong>.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .wrapper {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #e0e7ff;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .lead-text {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .details-card {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #cbd5e1;
    }
    .details-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #cbd5e1;
      font-size: 13px;
    }
    .details-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .details-label {
      font-weight: 600;
      color: #64748b;
    }
    .details-val {
      font-weight: 700;
      color: #0f172a;
      text-align: right;
    }
    .cta-container {
      text-align: center;
      margin-top: 28px;
      margin-bottom: 12px;
    }
    .btn {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 14px;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>CampusConnect</h1>
      <p>Academic Peer Mentorship & Tutoring</p>
    </div>

    <div class="content">
      <div class="greeting">Hello ${recipientName || 'there'},</div>
      <p class="lead-text">${messageLead}</p>

      <div class="details-card">
        <div class="details-row">
          <span class="details-label">${otherPartyLabel}</span>
          <span class="details-val">${otherPartyName}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Subject / Topic</span>
          <span class="details-val">${slot.subject || 'General Mentorship'}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Session Date</span>
          <span class="details-val">${slot.date}</span>
        </div>
        <div class="details-row">
          <span class="details-label">Session Time</span>
          <span class="details-val">${slot.startTime} - ${slot.endTime}</span>
        </div>
      </div>

      <p class="lead-text" style="font-weight: 500;">
        Please log in to your dashboard to view your booking schedule, prepare for the session, or launch the live video room when it begins.
      </p>

      <div class="cta-container">
        <a href="${env.CORS_ORIGIN || 'http://localhost:5173'}/dashboard" class="btn">Log In to Your Dashboard</a>
      </div>
    </div>

    <div class="footer">
      This is an automated notification from CampusConnect. If you did not expect this email, please contact platform support.
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Sends booking email to mentor and optionally to student.
 * Basic validation: skips sending if email is missing.
 * Catches all errors and logs via console.error to never break booking creation.
 *
 * @param {Object} mentor - { name, email }
 * @param {Object} student - { name, email }
 * @param {Object} slot - { date, startTime, endTime, subject }
 * @param {Object} [options] - { sendToStudent: boolean }
 */
const sendBookingEmail = async (mentor, student, slot, options = { sendToStudent: true }) => {
  try {
    const transporter = getTransporter();
    if (!transporter) return;

    const emailUser = env.EMAIL_USER || process.env.EMAIL_USER;

    // 1. Send notification to Mentor
    if (mentor && mentor.email && mentor.email.trim()) {
      const mentorMailOptions = {
        from: `"CampusConnect" <${emailUser}>`,
        to: mentor.email.trim(),
        replyTo: emailUser,
        subject: `New Session Booked: ${student?.name || 'A Student'} booked ${slot?.subject || 'Tutoring'} (${slot?.date})`,
        text: `Hello ${mentor.name || 'Mentor'},\n\nA student (${student?.name || 'Student'}) has booked a tutoring session with you on CampusConnect.\n\nSession Details:\n- Subject: ${slot?.subject || 'General Mentorship'}\n- Date: ${slot?.date}\n- Time: ${slot?.startTime || slot?.start_time} - ${slot?.endTime || slot?.end_time}\n- Student: ${student?.name || 'Student'}\n\nPlease check your CampusConnect dashboard for session details.`,
        html: buildEmailTemplate({
          recipientRole: 'mentor',
          recipientName: mentor.name || 'Mentor',
          otherPartyLabel: 'Student Name',
          otherPartyName: student?.name || 'Junior Student',
          slot: {
            date: slot.date,
            startTime: slot.startTime || slot.start_time,
            endTime: slot.endTime || slot.end_time,
            subject: slot.subject
          }
        })
      };

      const mentorInfo = await transporter.sendMail(mentorMailOptions);
      console.log(`[Email] Booking notification sent to mentor: ${mentor.email} (ID: ${mentorInfo.messageId})`);
    } else {
      console.warn('[Email] Skipping mentor email: Mentor email address is missing.');
    }

    // 2. Also send confirmation to Student if requested and email exists
    if (options.sendToStudent !== false) {
      if (student && student.email && student.email.trim()) {
        const studentMailOptions = {
          from: `"CampusConnect" <${emailUser}>`,
          to: student.email.trim(),
          replyTo: emailUser,
          subject: `Session Confirmed with ${mentor?.name || 'Your Teacher / Mentor'} (${slot?.date})`,
          text: `Hello ${student.name || 'Student'},\n\nYour tutoring session with ${mentor?.name || 'Mentor'} on CampusConnect has been successfully scheduled.\n\nSession Details:\n- Subject: ${slot?.subject || 'General Mentorship'}\n- Date: ${slot?.date}\n- Time: ${slot?.startTime || slot?.start_time} - ${slot?.endTime || slot?.end_time}\n- Mentor: ${mentor?.name || 'Senior Mentor'}\n\nPlease check your CampusConnect dashboard to join the live video session when it begins.`,
          html: buildEmailTemplate({
            recipientRole: 'student',
            recipientName: student.name || 'Student',
            otherPartyLabel: 'Teacher / Mentor Name',
            otherPartyName: mentor?.name || 'Senior Mentor',
            slot: {
              date: slot.date,
              startTime: slot.startTime || slot.start_time,
              endTime: slot.endTime || slot.end_time,
              subject: slot.subject
            }
          })
        };

        const studentInfo = await transporter.sendMail(studentMailOptions);
        console.log(`[Email] Booking confirmation sent to student: ${student.email} (ID: ${studentInfo.messageId})`);
      } else {
        console.warn('[Email] Skipping student confirmation email: Student email address is missing.');
      }
    }
  } catch (error) {
    // A failed email must NOT break the booking: catch and log
    console.error('[Email Error] Failed to send booking notification email:', error.message || error);
  }
};

/**
 * Dedicated helper to send confirmation to student.
 */
const sendStudentConfirmationEmail = async (student, mentor, slot) => {
  return sendBookingEmail(mentor, student, slot, { sendToStudent: true });
};

module.exports = {
  sendBookingEmail,
  sendStudentConfirmationEmail
};
