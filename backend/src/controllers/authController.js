const authService = require('../services/authService');
const validators = require('../utils/validators');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    if (!validators.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const data = await authService.login({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Authentication failed.'
    });
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, year, rollNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required registration fields.'
      });
    }

    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'University Roll Number is mandatory to register.'
      });
    }

    if (!validators.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const data = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed.'
    });
  }
};

module.exports = {
  login,
  register
};
