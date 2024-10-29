const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();
const port = 3000;

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/project_1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MONGO CONNECTION OPEN!"))
  .catch(err => console.log("MONGO CONNECTION ERROR!", err));

// Session Configuration
app.use(session({
  secret: 'yourSecretKey', // Replace with a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages'))); // Serve static files from pages

// Route to serve the sign-up page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'sign_up', 'index.html'));
});

// Route to handle sign-up form submission
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.redirect('/login'); // Redirect to login after successful signup
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving user data.");
  }
});

// Route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'login', 'index.html'));
});

// Route to process login form submission
app.post('/login-process', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send('Invalid credentials');
    }

    // Set session for logged-in state
    req.session.userId = user._id; // Storing user ID in session

    // Redirect to main page after successful login
    res.redirect('/main_page');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Route to serve the main page, accessible only if logged in
app.get('/main_page', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }
  res.sendFile(path.join(__dirname, 'pages', 'main_page', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
