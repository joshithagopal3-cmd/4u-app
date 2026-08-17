const express = require('express');
const router = express.Router();
const {
  getStudentDashboard, getTeacherDashboard, getStudents,
  getStudentProfile, getLeaderboard
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('student'), getStudentDashboard);
router.get('/teacher-dashboard', protect, authorize('teacher', 'admin'), getTeacherDashboard);
router.get('/students', protect, authorize('teacher', 'admin'), getStudents);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id/profile', protect, getStudentProfile);

module.exports = router;
