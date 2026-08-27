const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Helper: Check student eligibility for event ──────────────────────────────
const checkEligibility = (event, student) => {
  const reasons = [];

  if (!event.eligibility.allDepartments && event.eligibility.departments.length > 0) {
    if (!event.eligibility.departments.includes(student.department)) {
      reasons.push(`Open to: ${event.eligibility.departments.join(', ')} only`);
    }
  }

  if (!event.eligibility.allYears && event.eligibility.years.length > 0) {
    if (!event.eligibility.years.includes(student.year)) {
      reasons.push(`Open to Year ${event.eligibility.years.join(', ')} only`);
    }
  }

  return { isEligible: reasons.length === 0, reasons };
};

// @desc    Get all events (with filters)
// @route   GET /api/events
// @access  Private
exports.getEvents = asyncHandler(async (req, res) => {
  const { category, eventType, status, search, upcoming, department, year, page = 1, limit = 12 } = req.query;

  const query = {};
  if (category) query.category = category;
  if (eventType) query.eventType = eventType;
  if (status) query.status = status;
  else query.status = { $in: ['published', 'ongoing'] };
  if (upcoming === 'true') query.date = { $gte: new Date() };
  if (search) query.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate('createdBy', 'name department')
    .sort({ date: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Attach eligibility info if student
  let enrichedEvents = events;
  if (req.user && req.user.role === 'student') {
    const registrations = await Registration.find({ student: req.user.id }).select('event');
    const registeredEventIds = new Set(registrations.map(r => r.event.toString()));

    enrichedEvents = events.map(event => {
      const { isEligible, reasons } = checkEligibility(event, req.user);
      return {
        ...event.toObject(),
        isEligible,
        eligibilityReasons: reasons,
        isRegistered: registeredEventIds.has(event._id.toString()),
      };
    });
  }

  res.json({
    success: true,
    count: enrichedEvents.length,
    total,
    pages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    events: enrichedEvents,
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('createdBy', 'name email department')
    .populate('coordinators', 'name email');

  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  let response = event.toObject();

  if (req.user && req.user.role === 'student') {
    const { isEligible, reasons } = checkEligibility(event, req.user);
    const registration = await Registration.findOne({ event: event._id, student: req.user.id });
    response = { ...response, isEligible, eligibilityReasons: reasons, registration };
  }

  res.json({ success: true, event: response });
});

// @desc    Create event
// @route   POST /api/events
// @access  Private (teacher/admin)
exports.createEvent = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const event = await Event.create(req.body);
  res.status(201).json({ success: true, event });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (teacher/admin)
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  // Only creator or admin can update
  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, event });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (teacher/admin)
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
  }

  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

// @desc    Get event registrations (for coordinators/teachers)
// @route   GET /api/events/:id/registrations
// @access  Private (teacher/admin)
exports.getEventRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ event: req.params.id })
    .populate('student', 'name email department year rollNumber');

  res.json({ success: true, count: registrations.length, registrations });
});

// @desc    Mark attendance
// @route   PUT /api/events/:id/attendance/:studentId
// @access  Private (teacher/admin)
exports.markAttendance = asyncHandler(async (req, res) => {
  const registration = await Registration.findOneAndUpdate(
    { event: req.params.id, student: req.params.studentId },
    { attended: true, attendedAt: new Date(), attendanceMarkedBy: req.user.id },
    { new: true }
  );

  if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

  // Award points
  const event = await Event.findById(req.params.id);
  if (event) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.studentId, {
      $inc: { points: event.pointsForAttending },
      $addToSet: { eventsAttended: registration._id },
    });
    await Event.findByIdAndUpdate(req.params.id, { $inc: { attendanceCount: 1 } });
  }

  res.json({ success: true, registration });
});
