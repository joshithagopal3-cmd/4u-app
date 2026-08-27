const express = require('express');
const router = express.Router();
const {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  getEventRegistrations, markAttendance
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getEvents);
router.get('/:id', protect, getEvent);
router.post('/', protect, authorize('teacher', 'admin'), createEvent);
router.put('/:id', protect, authorize('teacher', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteEvent);
router.get('/:id/registrations', protect, authorize('teacher', 'admin'), getEventRegistrations);
router.put('/:id/attendance/:studentId', protect, authorize('teacher', 'admin'), markAttendance);

module.exports = router;
