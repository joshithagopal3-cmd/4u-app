const User = require('../models/User');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get resume data for a student
// @route   GET /api/resume/data
// @access  Private (student)
exports.getResumeData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  const participations = await Registration.find({ student: req.user.id, attended: true })
    .populate('event', 'title date category location isOnline')
    .sort({ createdAt: -1 });

  const resumeData = {
    personalInfo: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      year: user.year,
      rollNumber: user.rollNumber,
      linkedIn: user.linkedIn,
      github: user.github,
      portfolio: user.portfolio,
    },
    skills: user.skills,
    bio: user.bio,
    codingStats: {
      leetcode: user.codingStats?.leetcode || null,
      codechef: user.codingStats?.codechef || null,
    },
    codingProfiles: user.codingProfiles,
    participations: participations.map(p => ({
      eventTitle: p.event?.title,
      date: p.event?.date,
      category: p.event?.category,
      position: p.position,
      pointsEarned: p.pointsEarned,
    })),
    totalPoints: user.points,
    badges: user.badges,
  };

  res.json({ success: true, resumeData });
});
