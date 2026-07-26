const nodemailer = require('nodemailer');

// --- Mail transport setup ---
// Configure via .env (see backend/.env.example):
//   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
// If these are not set, emails are skipped (logged only) so the rest of the
// app keeps working in local/dev/CI environments without mail credentials.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  const port = Number(EMAIL_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465, // true for 465 (implicit TLS), false for 587 (STARTTLS)
    requireTLS: port === 587, // force the STARTTLS upgrade rather than relying on it happening opportunistically
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-SG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Sends a booking confirmation email to the volunteer.
 * Never throws — logs and resolves so a mail outage never breaks a booking.
 */
async function sendBookingConfirmationEmail(booking) {
  const mailer = getTransporter();

  const subject = 'Your SharePlate volunteer slot is confirmed';
  const text =
    `Hi ${booking.volunteerName},\n\n` +
    `Your volunteer delivery slot has been confirmed:\n\n` +
    `Date: ${formatDate(booking.date)}\n` +
    `Time slot: ${booking.timeSlot}\n` +
    `Delivery address: ${booking.familyAddress}\n\n` +
    `Thank you for helping close the gap between surplus and scarcity.\n\n` +
    `— SharePlate`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; color: #1F2937; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #2E7D32; margin-bottom: 0;">Your slot is confirmed</h2>
      <p>Hi ${booking.volunteerName}, thank you for signing up — this delivery is now locked in.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Date</td>
          <td style="padding: 8px 0; font-weight: 600;">${formatDate(booking.date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Time slot</td>
          <td style="padding: 8px 0; font-weight: 600;">${booking.timeSlot}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6B7280;">Delivery address</td>
          <td style="padding: 8px 0; font-weight: 600;">${booking.familyAddress}</td>
        </tr>
      </table>
      <p style="color: #6B7280; font-size: 0.9rem;">— SharePlate, bridging the gap between surplus and scarcity.</p>
    </div>
  `;

  if (!mailer) {
    console.warn(
      `[mailer] EMAIL_HOST/EMAIL_USER/EMAIL_PASS not set — skipping confirmation email to ${booking.volunteerEmail}.`
    );
    return { sent: false, reason: 'not-configured' };
  }

  try {
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: booking.volunteerEmail,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error('[mailer] Failed to send booking confirmation email:', error.message);
    return { sent: false, reason: error.message };
  }
}

module.exports = { sendBookingConfirmationEmail };
