const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');

// Update model import path
const User = require('./src/models/User');

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
  secret: '0123456789',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from 'src/public' for assets
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Serve static HTML files from 'src/views'
app.use('/views', express.static(path.join(__dirname, 'src', 'views')));

// Redirect root URL to home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'home_page', 'home_page.html'));
});

// Routes
app.use('/', require('./src/routes/auth'));
app.use('/', require('./src/routes/movies'));
app.use('/', require('./src/routes/user'));

// Serve common-movies.html for /friends/:username routes
app.get('/friends/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'friends', 'common-movies.html'));
});

// Serve library.html for /library route
app.get('/library', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'library', 'library.html'));
});

// Serve friends.html for /friends route
app.get('/friends', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'friends', 'friends.html'));
});

app.get('/sign_up/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'sign_up', 'sign_up.html'));
});

// 404 Page for undefined routes
app.all('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'src', 'views', '404', '404.html'));
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
