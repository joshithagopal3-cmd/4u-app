const axios = require('axios');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// ─── Mock data generator for when APIs are unavailable ────────────────────────
const generateMockLeetCodeStats = (username) => ({
  username,
  totalSolved: Math.floor(Math.random() * 400) + 50,
  easySolved: Math.floor(Math.random() * 150) + 20,
  mediumSolved: Math.floor(Math.random() * 180) + 20,
  hardSolved: Math.floor(Math.random() * 70) + 5,
  contestRating: Math.floor(Math.random() * 800) + 1400,
  contestsAttended: Math.floor(Math.random() * 30) + 5,
  ranking: Math.floor(Math.random() * 200000) + 10000,
  acceptanceRate: (Math.random() * 30 + 50).toFixed(1),
  isMock: true,
});

const generateMockCodeChefStats = (username) => ({
  username,
  rating: Math.floor(Math.random() * 1000) + 1200,
  stars: ['1★', '2★', '3★', '4★'][Math.floor(Math.random() * 4)],
  problemsSolved: Math.floor(Math.random() * 200) + 30,
  contestsParticipated: Math.floor(Math.random() * 25) + 3,
  highestRating: Math.floor(Math.random() * 1000) + 1400,
  isMock: true,
});

// ─── Fetch LeetCode stats ─────────────────────────────────────────────────────
const fetchLeetCodeStats = async (username) => {
  try {
    const response = await axios.get(`${process.env.LEETCODE_API_URL}/${username}`, { timeout: 5000 });
    const data = response.data;
    if (data.status === 'error') throw new Error(data.message);
    return {
      username,
      totalSolved: data.totalSolved || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      contestRating: data.contestRating || 0,
      contestsAttended: data.contestsAttended || 0,
      ranking: data.ranking || 0,
      acceptanceRate: data.acceptanceRate || '0',
      isMock: false,
    };
  } catch {
    return generateMockLeetCodeStats(username);
  }
};

// ─── Fetch CodeChef stats ─────────────────────────────────────────────────────
const fetchCodeChefStats = async (username) => {
  try {
    const response = await axios.get(`${process.env.CODECHEF_API_URL}/user/${username}`, { timeout: 5000 });
    const data = response.data;
    if (!data.success) throw new Error('Profile not found');
    return {
      username,
      rating: data.currentRating || 0,
      stars: data.stars || '',
      problemsSolved: data.totalSolved || 0,
      contestsParticipated: data.totalContestsParticipated || 0,
      highestRating: data.highestRating || 0,
      isMock: false,
    };
  } catch {
    return generateMockCodeChefStats(username);
  }
};

// @desc    Refresh & get my coding stats
// @route   GET /api/coding/stats
// @access  Private
exports.getMyCodingStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const stats = { leetcode: null, codechef: null };

  // Refresh LeetCode
  if (user.codingProfiles.leetcode) {
    stats.leetcode = await fetchLeetCodeStats(user.codingProfiles.leetcode);
    user.codingStats.leetcode = { ...stats.leetcode, lastUpdated: new Date() };
  }

  // Refresh CodeChef
  if (user.codingProfiles.codechef) {
    stats.codechef = await fetchCodeChefStats(user.codingProfiles.codechef);
    user.codingStats.codechef = { ...stats.codechef, lastUpdated: new Date() };
  }

  await user.save({ validateBeforeSave: false });

  // Update points from coding activity
  const newPoints = (stats.leetcode?.totalSolved || 0) * parseInt(process.env.POINTS_CODING_PROBLEM || 10);
  // (In production, compute delta and add incrementally)

  res.json({ success: true, stats, user: user.codingStats });
});

// @desc    Get coding stats for a specific user (for teacher dashboard)
// @route   GET /api/coding/stats/:userId
// @access  Private (teacher/admin)
exports.getUserCodingStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('codingStats codingProfiles name department year');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, user });
});

// @desc    Get class-wide coding leaderboard
// @route   GET /api/coding/leaderboard
// @access  Private
exports.getCodingLeaderboard = asyncHandler(async (req, res) => {
  const { department, year } = req.query;
  const query = { role: 'student' };
  if (department) query.department = department;
  if (year) query.year = parseInt(year);

  const students = await User.find(query)
    .select('name department year codingStats points')
    .sort({ points: -1 })
    .limit(50);

  const leaderboard = students.map((s, idx) => ({
    rank: idx + 1,
    name: s.name,
    department: s.department,
    year: s.year,
    points: s.points,
    leetcodeSolved: s.codingStats?.leetcode?.totalSolved || 0,
    leetcodeRating: s.codingStats?.leetcode?.contestRating || 0,
    codechefRating: s.codingStats?.codechef?.rating || 0,
  }));

  res.json({ success: true, leaderboard });
});
