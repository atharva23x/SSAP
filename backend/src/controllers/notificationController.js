const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { localizeDocs } = require('../utils/localize');

// GET /api/notifications?type=&unreadOnly=&page=
const list = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const unreadOnly = req.query.unreadOnly === 'true';
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, parseInt(req.query.limit || '30', 10));

  const filter = { userId: req.user._id };
  if (type) filter.type = type;
  if (unreadOnly) filter.read = false;

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);

  res.json({
    success: true,
    data: localizeDocs(items, req.lang, ['title']),
    meta: { page, limit, total, unread, pages: Math.ceil(total / limit) },
  });
});

// PATCH /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } }
  );
  res.json({ success: true });
});

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ success: true });
});

// DELETE /api/notifications/clear
const clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.json({ success: true });
});

module.exports = { list, markRead, markAllRead, clearAll };
