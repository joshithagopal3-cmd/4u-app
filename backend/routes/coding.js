const express = require('express');
const router = express.Router();
const { getMyCodingStats, getUserCodingStats, getCodingLeaderboard } = require('../controllers/codingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, getMyCodingStats);
router.get('/stats/:userId', protect, authorize('teacher', 'admin'), getUserCodingStats);
router.get('/leaderboard', protect, getCodingLeaderboard);

module.exports = router;
