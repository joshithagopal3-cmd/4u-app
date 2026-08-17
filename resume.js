const express = require('express');
const router = express.Router();
const { getResumeData } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/data', protect, authorize('student'), getResumeData);

module.exports = router;
