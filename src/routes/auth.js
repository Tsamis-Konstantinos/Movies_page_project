const express = require('express');
const path = require('path');
const {
  renderSignUpPage,
  handleSignUp,
  renderLoginPage,
  handleLogin,
  handleLogout
} = require('../controllers/authController');

const router = express.Router();

// Serve the sign-up page
router.get('/signup', renderSignUpPage);

// Handle sign-up form submission
router.post('/signup', handleSignUp);

// Serve the login page
router.get('/login', renderLoginPage);

// Process login form submission
router.post('/login-process', handleLogin);

// Logout route
router.get('/logout', handleLogout);
router.post('/logout', handleLogout);

module.exports = router;
