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
  secret: '0123456789',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'pages'))); // Serve static files from pages

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/movies'));
app.use('/', require('./routes/user'));

// Serve common-movies.html for /friends/:username routes
app.get('/friends/:username', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'friends', 'common-movies.html'));
});

app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
