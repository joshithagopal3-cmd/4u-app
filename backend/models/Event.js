const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  // Core Details
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: 200 },

  // Timing
  date: { type: Date, required: [true, 'Event date is required'] },
  endDate: { type: Date },
  registrationDeadline: { type: Date },

  // Location
  isOnline: { type: Boolean, default: false },
  location: { type: String },          // Physical venue
  meetLink: { type: String },           // For online events
  externalLink: { type: String },       // Registration link for external events

  // Categorization
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'workshop', 'hackathon', 'seminar', 'placement', 'other'],
    required: true,
  },
  eventType: {
    type: String,
    enum: ['internal', 'external'],
    default: 'internal',
  },
  tags: [{ type: String }],

  // Eligibility
  eligibility: {
    allDepartments: { type: Boolean, default: true },
    departments: [{ type: String }],    // ['CSE', 'IT'] if not all
    allYears: { type: Boolean, default: true },
    years: [{ type: Number }],           // [2, 3] if not all
    minCGPA: { type: Number, default: 0 },
    maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
    teamEvent: { type: Boolean, default: false },
    teamSize: { type: Number, default: 1 },
  },

  // Media
  banner: { type: String },
  attachments: [{ name: String, url: String }],

  // Organizer Info
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coordinators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  club: { type: String },
  department: { type: String },

  // Status
  status: { type: String, enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'], default: 'published' },

  // Points awarded for participation
  pointsForAttending: { type: Number, default: 50 },
  pointsForWinning: { type: Number, default: 150 },

  // Stats (denormalized for performance)
  registrationCount: { type: Number, default: 0 },
  attendanceCount: { type: Number, default: 0 },

}, { timestamps: true });

// Index for filtering
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ 'eligibility.departments': 1 });

module.exports = mongoose.model('Event', EventSchema);
