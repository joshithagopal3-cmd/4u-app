const mongoose = require('mongoose');

// ─── Notification Model ───────────────────────────────────────────────────────
const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['event_new', 'event_reminder', 'registration_approved', 'registration_rejected',
           'attendance_marked', 'points_earned', 'badge_earned', 'system'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },   // Frontend route to navigate to
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ─── Achievement / Badge Catalog ──────────────────────────────────────────────
const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  category: { type: String, enum: ['events', 'coding', 'academic', 'social'] },
  criteria: {
    type: { type: String, enum: ['points_threshold', 'events_attended', 'problems_solved', 'contest_count'] },
    value: { type: Number },
  },
  pointsReward: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = {
  Notification: mongoose.model('Notification', NotificationSchema),
  Achievement: mongoose.model('Achievement', AchievementSchema),
};
