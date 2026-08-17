const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Eligibility
  isEligible: { type: Boolean, default: true },

  // "Attend Anyway" flow
  attendAnyway: { type: Boolean, default: false },
  attendAnywayReason: { type: String },
  overrideStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  overrideReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  overrideReviewedAt: { type: Date },
  overrideRejectionNote: { type: String },

  // Attendance
  attended: { type: Boolean, default: false },
  attendedAt: { type: Date },
  attendanceMarkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Result (for competitions)
  position: { type: String },   // '1st', '2nd', 'Participant', etc.
  pointsEarned: { type: Number, default: 0 },
  certificateUrl: { type: String },

  // Team
  teamName: { type: String },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Registration status
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'waitlisted', 'cancelled'],
    default: 'registered',
  },

  notes: { type: String },

}, { timestamps: true });

// A student can only register once per event
RegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
