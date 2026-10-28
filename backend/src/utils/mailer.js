const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter || !env.SMTP_HOST) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transporter;
}

/** Send email if SMTP is configured; otherwise no-op (in-app notification is primary channel). */
async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) return { skipped: true };
  try {
    await t.sendMail({ from: env.SMTP_FROM, to, subject, html, text });
    return { sent: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[mailer] failed:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendMail };
