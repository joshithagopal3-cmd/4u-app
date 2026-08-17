const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get student dashboard summary
// @route   GET /api/users/dashboard
// @access  Private (student)
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, registrations, upcomingEvents] = await Promise.all([
    User.findById(userId),
    Registration.find({ student: userId })
      .populate('event', 'title date category status banner pointsForAttending')
      .sort({ createdAt: -1 })
      .limit(10),
    Event.find({
      date: { $gte: new Date() },
      status: { $in: ['published', 'ongoing'] },
    }).sort({ date: 1 }).limit(5),
  ]);

  const stats = {
    totalPoints: user.points,
    eventsRegistered: await Registration.countDocuments({ student: userId }),
    eventsAttended: await Registration.countDocuments({ student: userId, attended: true }),
    pendingRequests: await Registration.countDocuments({ student: userId, overrideStatus: 'pending' }),
    leetcodeSolved: user.codingStats?.leetcode?.totalSolved || 0,
    codechefRating: user.codingStats?.codechef?.rating || 0,
  };

  res.json({ success: true, user, stats, recentRegistrations: registrations, upcomingEvents });
});

// @desc    Get teacher dashboard
// @route   GET /api/users/teacher-dashboard
// @access  Private (teacher/admin)
exports.getTeacherDashboard = asyncHandler(async (req, res) => {
  const { department, year } = req.query;

  const studentQuery = { role: 'student' };
  if (department) studentQuery.department = department;
  if (year) studentQuery.year = parseInt(year);

  const [students, totalEvents, pendingOverrides, recentActivity] = await Promise.all([
    User.find(studentQuery).select('name email department year points codingStats rollNumber section'),
    Event.countDocuments({ createdBy: req.user.id }),
    Registration.countDocuments({ attendAnyway: true, overrideStatus: 'pending' }),
    Registration.find({})
      .populate('student', 'name department year')
      .populate('event', 'title date category')
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  const topStudents = [...students].sort((a, b) => b.points - a.points).slice(0, 10);

  res.json({
    success: true,
    stats: {
      totalStudents: students.length,
      totalEvents,
      pendingOverrides,
      avgPoints: students.length > 0 ? Math.round(students.reduce((s, u) => s + u.points, 0) / students.length) : 0,
    },
    students,
    topStudents,
    recentActivity,
  });
});

// @desc    Get all students (for teacher view)
// @route   GET /api/users/students
// @access  Private (teacher/admin)
exports.getStudents = asyncHandler(async (req, res) => {
  const { department, year, search, page = 1, limit = 20 } = req.query;
  const query = { role: 'student', isActive: true };
  if (department) query.department = department;
  if (year) query.year = parseInt(year);
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { rollNumber: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);
  const students = await User.find(query)
    .select('name email department year rollNumber section points codingStats skills createdAt')
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({ success: true, students, total, pages: Math.ceil(total / parseInt(limit)) });
});

// @desc    Get public student profile
// @route   GET /api/users/:id/profile
// @access  Private
exports.getStudentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -managedDepartments');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Privacy check
  if (user.profileVisibility === 'private' && req.user.role === 'student' && user._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'This profile is private' });
  }

  const registrations = await Registration.find({ student: user._id, attended: true })
    .populate('event', 'title date category')
    .limit(10);

  res.json({ success: true, user, participationHistory: registrations });
});

// @desc    Get overall leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const { department, year } = req.query;
  const query = { role: 'student', isActive: true };
  if (department) query.department = department;
  if (year) query.year = parseInt(year);

  const users = await User.find(query)
    .select('name department year points badges codingStats')
    .sort({ points: -1 })
    .limit(50);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    _id: u._id,
    name: u.name,
    department: u.department,
    year: u.year,
    points: u.points,
    badges: u.badges.length,
    leetcodeSolved: u.codingStats?.leetcode?.totalSolved || 0,
    codechefRating: u.codingStats?.codechef?.rating || 0,
  }));

  res.json({ success: true, leaderboard });
});
