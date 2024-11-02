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

// Route for logging out
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
    return res.status(401).send({ message: "Unauthorized" });
  }

  const { movieId } = req.body;

  try {
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

  const { movieId } = req.body;

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Remove the movieId from user's saved movies
    user.movieID = user.movieID.filter(id => id !== movieId);
    await user.save();

    res.send({ message: "Movie removed successfully" });
  } catch (error) {
    console.error("Error removing movie:", error);
    res.status(500).send({ message: "Error removing movie" });
  }
});

// Route to search for friends
app.get('/search-friends', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  const searchQuery = req.query.username;

  try {
    const currentUser = await User.findById(req.session.userId);
    if (!currentUser) {
      return res.status(404).send({ message: "User not found" });
    }

    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' },
      _id: { $ne: currentUser._id }
    }).select('username');

    res.json(users);
  } catch (error) {
    console.error("Error searching friends:", error);
    res.status(500).send({ message: "Error searching friends" });
  }
});

// Route to add a friend to the logged-in user's friends list
app.post('/add-friend', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ redirect: '/login' });
  }

  const { friendUsername } = req.body;

  try {
    const userB = await User.findById(req.session.userId);
    if (!userB) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if user is already in friends
    if (userB.friends.includes(friendUsername)) {
      // If already friends, remove from friends_requested if exists
      userB.friends_requested = userB.friends_requested.filter(requestedUser => requestedUser !== friendUsername);
      await userB.save();
      return res.json({ success: false, message: `User ${friendUsername} is already your friend.` });
    }

    // Check if user has already requested the friend
    const existingRequest = await User.findOne({ 
      username: friendUsername, 
      friends_requested: userB.username 
    });

    if (existingRequest) {
      return res.json({ success: false, message: `User ${friendUsername} has already sent you a friend request.` });
    }

    // Proceed to add the friend request
    if (!userB.friends_requested.includes(friendUsername)) {
      userB.friends_requested.push(friendUsername);
      await userB.save();
      return res.json({ success: true, message: `Friend request sent to ${friendUsername}.` });
    } else {
      return res.json({ success: false, message: "Friend request already sent." });
    }
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).send({ message: "Error adding friend" });
  }
});

// Route to get sent and received friend requests
app.get('/friend-requests', async (req, res) => {
  if (!req.session.userId) {}
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetching friends requested and received by the user
    const sentRequests = user.friends_requested; // Friends requested by the user
    const receivedRequests = await User.find({
      friends_requested: user.username // Users who have requested the logged-in user
    }).select('username'); // Get only the username

    res.json({
      sentRequests,
      receivedRequests: receivedRequests.map(r => r.username) // Extract usernames
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to remove a friend request from sent requests
app.post('/remove-sent-request', async (req, res) => {
  const { username } = req.body;

  if (!req.session.userId) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.friends_requested = user.friends_requested.filter(requestedUser => requestedUser !== username);
    await user.save();
    res.send({ message: "Friend request removed from sent requests." });
  } catch (error) {
    console.error("Error removing sent request:", error);
    res.status(500).send({ message: "Error removing sent request." });
  }
});

// Route to remove a friend request from received requests
app.post('/remove-received-request', async (req, res) => {
  const { username } = req.body;

  if (!req.session.userId) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // You may want to fetch the user who sent the request and remove them from their friends_requested
    const sender = await User.findOne({ username });
    if (!sender) {
      return res.status(404).send({ message: "User not found." });
    }

    sender.friends_requested = sender.friends_requested.filter(requestedUser => requestedUser !== user.username);
    await sender.save();

    res.send({ message: "Friend request removed from received requests." });
  } catch (error) {
    console.error("Error removing received request:", error);
    res.status(500).send({ message: "Error removing received request." });
  }
});

// Route to accept a friend request
app.post('/accept-friend-request', async (req, res) => {
  const { username } = req.body; // The username of the requester
  const currentUser = req.session.username; // Get the logged-in user's username

  // Ensure the user is logged in
  if (!currentUser) {
      return res.status(401).send({ message: "Unauthorized" });
  }

  try {
      const currentUserDoc = await User.findOne({ username: currentUser });
      const friendUserDoc = await User.findOne({ username });

      // Check if both users exist
      if (!currentUserDoc || !friendUserDoc) {
          return res.status(404).json({ message: "User not found." });
      }

      // Remove the incoming request from currentUser's friends_requested
      currentUserDoc.friends_requested = currentUserDoc.friends_requested.filter(user => user !== username);
      
      // Add to currentUser's friends if not already there
      if (!currentUserDoc.friends.includes(username)) {
        currentUserDoc.friends.push(username);
      }

      // Add currentUser to the friend's friends list if not already there
      if (!friendUserDoc.friends.includes(currentUser)) {
        friendUserDoc.friends.push(currentUser);
      }

      await currentUserDoc.save();
      await friendUserDoc.save();

      res.json({ message: `You and ${username} are now friends!` });
  } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ message: "Internal server error." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at port: ${port}`);
});
