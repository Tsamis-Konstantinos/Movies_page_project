const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render the sign-up page
exports.renderSignUpPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'sign_up', 'sign_up.html'));
};

// Handle sign-up form submission
exports.handleSignUp = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send("Username or email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user data.");
  }
};

// Render the login page
exports.renderLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'login', 'login.html'));
};

// Process login form submission
exports.handleLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid credentials');
    }

    req.session.userId = user._id;
    req.session.username = user.username;
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Handle logout
exports.handleLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out");
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
