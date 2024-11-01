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
    // Check if a user with the same username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
        return res.status(400).send("Username or email already exists.");
    }

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

    // Store user ID and username in session
    req.session.userId = user._id;
    req.session.username = user.username;

    // Redirect to main page after successful login
    res.redirect('/main_page');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Add a route for logging out
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});

// Route to get username
app.get('/get-username', (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.json({ username: null });
  }
});

// Logout route to clear the session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error("Error logging out:", err);
          return res.status(500).send("Error logging out");
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.sendStatus(200); // Indicate success
  });
});

// Route to save a movie to the user's list of favorites
app.post('/save-movie', async (req, res) => {
  if (!req.session.username) {
    // If the user is not authenticated, send an unauthorized status
    return res.status(401).send({ message: "Unauthorized" });
  }

  const { movieId } = req.body;

  try {
    // Find the user by the session username
    const user = await User.findOne({ username: req.session.username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Add the movie ID to the user's movieID array if it's not already there
    if (!user.movieID.includes(movieId)) {
      user.movieID.push(movieId);
      await user.save();
      return res.status(200).send({ message: "Movie saved successfully" });
    } else {
      return res.status(200).send({ message: "Movie already in library" });
    }
  } catch (error) {
    console.error("Error saving movie:", error);
    res.status(500).send({ message: "Error saving movie" });
  }
});

// Route to get user's saved movies for main page
app.get('/get-user-movies', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ username: req.session.username });
    res.status(200).send({ movies: user.movieID });
  } catch (error) {
    console.error("Error fetching user movies:", error);
    res.status(500).send({ message: "Error fetching movies" });
  }
});

// Route to get user's saved movies for library
app.get('/saved-movies', async (req, res) => {
  if (!req.session.userId) {
      return res.status(401).send({ message: "Unauthorized" });
  }

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).send({ message: "User not found" });
      }

      // Assuming movieID stores the IMDb IDs of the saved movies
      res.json({ movies: user.movieID });
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Server error" });
  }
});

// Route to remove a movie from the user's saved list
app.post('/remove-movie', async (req, res) => {
  if (!req.session.userId) {
      return res.status(401).send({ message: "Unauthorized" });
  }

  const { movieId } = req.body; // Get movieId from request body

  try {
      const user = await User.findById(req.session.userId);
      if (!user) {
          return res.status(404).send({ message: "User not found" });
      }

      // Remove the movieId from user's saved movies
      user.movieID.pull(movieId); // Use mongoose's pull method
      await user.save();

      res.send({ message: "Movie removed successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Server error" });
  }
});

// Route to remove a movie from user's favorites
app.post('/remove-movie', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const { movieId } = req.body;

  try {
    const user = await User.findOne({ username: req.session.username });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Remove the movie ID if it exists in the user's list
    user.movieID = user.movieID.filter(id => id !== movieId);
    await user.save();
    res.status(200).send({ message: "Movie removed successfully" });
  } catch (error) {
    console.error("Error removing movie:", error);
    res.status(500).send({ message: "Error removing movie" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
