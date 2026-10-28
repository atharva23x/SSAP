const mongoose = require('mongoose');
const { localizedSchema } = require('./Scheme');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ['deadline', 'newScheme', 'hackathon', 'exam', 'system', 'document'],
      default: 'system',
      index: true,
    },
    title: { type: String, required: true },
    titleLocalized: localizedSchema,
    body: String,
    link: String,
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
