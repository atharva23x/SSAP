const cron = require('node-cron');
const Scheme = require('../models/Scheme');
const Exam = require('../models/Exam');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendMail } = require('../utils/mailer');

const REMIND_DAYS = [7, 3, 1];

function daysUntil(date) {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

async function createNotifications() {
  const now = new Date();
  const horizon = new Date(now.getTime() + 7 * 86400000);
  const users = await User.find({ 'notificationPrefs.deadline': true }).lean();
  if (!users.length) return 0;

  const [schemes, exams, competitions] = await Promise.all([
    Scheme.find({ isActive: true, deadline: { $gte: now, $lte: horizon } }).lean(),
    Exam.find({ isActive: true, registrationDeadline: { $gte: now, $lte: horizon } }).lean(),
    Competition.find({ isActive: true, registrationDeadline: { $gte: now, $lte: horizon } }).lean(),
  ]);

  const created = [];

  const push = async (user, type, title, titleLocalized, body, link) => {
    const exists = await Notification.findOne({ userId: user._id, title, read: false });
    if (exists) return;
    created.push({
      userId: user._id,
      type,
      title,
      titleLocalized,
      body,
      link,
      read: false,
    });
    if (user.notificationPrefs?.email && user.email) {
      await sendMail({ to: user.email, subject: title, text: body });
    }
  };

  for (const user of users) {
    for (const s of schemes) {
      const d = daysUntil(s.deadline);
      if (REMIND_DAYS.includes(d)) {
        await push(
          user,
          'deadline',
          `⏳ ${d} day${d > 1 ? 's' : ''} left: ${s.name}`,
          s.nameLocalized,
          `The application deadline for "${s.name}" is in ${d} day(s). Complete your documents and apply.`,
          `/schemes/${s._id}`
        );
      }
    }
    for (const e of exams) {
      const d = daysUntil(e.registrationDeadline);
      if (REMIND_DAYS.includes(d)) {
        await push(
          user,
          'exam',
          `📝 ${e.name} registration closes in ${d} day(s)`,
          e.nameLocalized,
          `Register for ${e.name} before the deadline.`,
          `/exams`
        );
      }
    }
    for (const c of competitions) {
      const d = daysUntil(c.registrationDeadline);
      if (REMIND_DAYS.includes(d)) {
        await push(
          user,
          'hackathon',
          `🏆 ${c.name} registration closes in ${d} day(s)`,
          c.nameLocalized,
          `Don't miss ${c.organizer || c.name} — register before the deadline.`,
          `/competitions`
        );
      }
    }
  }

  if (created.length) await Notification.insertMany(created);
  return created.length;
}

function startCron() {
  // Run every day at 08:00 server time
  cron.schedule('0 8 * * *', () => {
    createNotifications()
      .then((n) => console.log(`[cron] generated ${n} deadline notifications`))
      .catch((err) => console.error('[cron] error:', err.message));
  });
  console.log('[cron] deadline reminder job scheduled (daily 08:00)');
}

module.exports = { startCron, createNotifications, REMIND_DAYS };
