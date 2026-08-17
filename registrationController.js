const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { asyncHandler } = require('../middleware/errorHandler');

// Helper: check eligibility
const checkEligibility = (event, student) => {
  if (!event.eligibility.allDepartments && event.eligibility.departments.length > 0) {
    if (!event.eligibility.departments.includes(student.department)) return false;
  }
  if (!event.eligibility.allYears && event.eligibility.years.length > 0) {
    if (!event.eligibility.years.includes(student.year)) return false;
  }
  return true;
};

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (student)
exports.registerForEvent = asyncHandler(async (req, res) => {
  const { eventId, attendAnyway, attendAnywayReason, teamName, teamMembers } = req.body;

  const event = await Event.findById(eventId);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  if (event.status === 'cancelled' || event.status === 'completed') {
    return res.status(400).json({ success: false, message: 'Registration closed for this event' });
  }

  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
  }

  // Check max participants
  if (event.eligibility.maxParticipants > 0 && event.registrationCount >= event.eligibility.maxParticipants) {
    return res.status(400).json({ success: false, message: 'Event is full' });
  }

  const isEligible = checkEligibility(event, req.user);

  // If not eligible and not requesting "attend anyway", block
  if (!isEligible && !attendAnyway) {
    return res.status(403).json({
      success: false,
      message: 'You are not eligible for this event. Use "Attend Anyway" to request access.',
      canAttendAnyway: true,
    });
  }

  const registrationData = {
    event: eventId,
    student: req.user.id,
    isEligible,
    teamName,
    teamMembers,
  };

  if (!isEligible && attendAnyway) {
    if (!attendAnywayReason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for attending anyway' });
    }
    registrationData.attendAnyway = true;
    registrationData.attendAnywayReason = attendAnywayReason;
    registrationData.overrideStatus = 'pending';
    registrationData.status = 'registered'; // Shows as pending approval
  }

  const registration = await Registration.create(registrationData);

  // Update event registration count
  await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

  res.status(201).json({
    success: true,
    registration,
    message: !isEligible
      ? 'Your request has been sent to the coordinator for approval.'
      : 'Successfully registered for the event!',
  });
});

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (student - own registration)
exports.cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

  if (registration.student.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await registration.deleteOne();
  await Event.findByIdAndUpdate(registration.event, { $inc: { registrationCount: -1 } });

  res.json({ success: true, message: 'Registration cancelled' });
});

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private (student)
exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user.id })
    .populate('event', 'title date category status location isOnline banner pointsForAttending')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: registrations.length, registrations });
});

// @desc    Get pending override requests (for coordinator/teacher)
// @route   GET /api/registrations/pending-overrides
// @access  Private (teacher/admin)
exports.getPendingOverrides = asyncHandler(async (req, res) => {
  const query = { attendAnyway: true, overrideStatus: 'pending' };

  // Teachers can only see events they coordinate
  if (req.user.role === 'teacher') {
    const events = await Event.find({ coordinators: req.user.id }).select('_id');
    query.event = { $in: events.map(e => e._id) };
  }

  const registrations = await Registration.find(query)
    .populate('student', 'name email department year rollNumber')
    .populate('event', 'title date category');

  res.json({ success: true, count: registrations.length, registrations });
});

// @desc    Approve / Reject override request
// @route   PUT /api/registrations/:id/override
// @access  Private (teacher/admin)
exports.reviewOverride = asyncHandler(async (req, res) => {
  const { decision, note } = req.body; // decision: 'approved' | 'rejected'

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
  }

  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    {
      overrideStatus: decision,
      overrideReviewedBy: req.user.id,
      overrideReviewedAt: new Date(),
      overrideRejectionNote: decision === 'rejected' ? note : undefined,
      status: decision === 'rejected' ? 'cancelled' : 'confirmed',
    },
    { new: true }
  ).populate('student', 'name email').populate('event', 'title');

  if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

  res.json({ success: true, registration, message: `Request ${decision}` });
});
