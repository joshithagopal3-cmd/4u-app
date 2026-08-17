const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, year, rollNumber, section } = req.body;

  const user = await User.create({ name, email, password, role, department, year, rollNumber, section });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'bio', 'skills', 'linkedIn', 'github', 'portfolio',
                          'phone', 'profileVisibility', 'codingProfiles', 'section', 'rollNumber'];
  const updateData = {};
  allowedFields.forEach(field => { if (req.body[field] !== undefined) updateData[field] = req.body[field]; });

  const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
  res.json({ success: true, user });
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});
