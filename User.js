const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Core Identity
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },

  // Academic Info
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSD', 'OTHER'],
    required: function () { return this.role === 'student'; },
  },
  year: { type: Number, enum: [1, 2, 3, 4], required: function () { return this.role === 'student'; } },
  rollNumber: { type: String, trim: true },
  section: { type: String, trim: true },

  // Profile
  bio: { type: String, maxlength: 500 },
  avatar: { type: String, default: '' },
  skills: [{ type: String, trim: true }],
  linkedIn: { type: String },
  github: { type: String },
  portfolio: { type: String },
  phone: { type: String },

  // Privacy
  profileVisibility: { type: String, enum: ['public', 'private', 'college'], default: 'college' },

  // Coding Platform Handles
  codingProfiles: {
    leetcode: { type: String, trim: true, default: '' },
    codechef: { type: String, trim: true, default: '' },
    codeforces: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
  },

  // Cached Coding Stats (refreshed periodically)
  codingStats: {
    leetcode: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      contestRating: { type: Number, default: 0 },
      contestsAttended: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      lastUpdated: { type: Date },
    },
    codechef: {
      rating: { type: Number, default: 0 },
      stars: { type: String, default: '' },
      problemsSolved: { type: Number, default: 0 },
      contestsParticipated: { type: Number, default: 0 },
      highestRating: { type: Number, default: 0 },
      lastUpdated: { type: Date },
    },
  },

  // Gamification
  points: { type: Number, default: 0 },
  badges: [{ name: String, earnedAt: Date, icon: String }],

  // Event participation history (refs to registrations)
  eventsAttended: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }],

  // Account Status
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },

  // For teachers: classes they manage
  managedDepartments: [{ type: String }],

}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return safe user object (no password)
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Virtual: full profile completeness score
UserSchema.virtual('profileCompleteness').get(function () {
  const fields = ['bio', 'skills', 'linkedIn', 'github', 'phone', 'rollNumber'];
  const filled = fields.filter(f => this[f] && (Array.isArray(this[f]) ? this[f].length > 0 : true));
  return Math.round((filled.length / fields.length) * 100);
});

module.exports = mongoose.model('User', UserSchema);
