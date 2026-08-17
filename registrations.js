const express = require('express');
const router = express.Router();
const {
  registerForEvent, cancelRegistration, getMyRegistrations,
  getPendingOverrides, reviewOverride
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student'), registerForEvent);
router.get('/my', protect, getMyRegistrations);
router.delete('/:id', protect, authorize('student'), cancelRegistration);
router.get('/pending-overrides', protect, authorize('teacher', 'admin'), getPendingOverrides);
router.put('/:id/override', protect, authorize('teacher', 'admin'), reviewOverride);

module.exports = router;
