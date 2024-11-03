const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Route to get username
router.get('/get-username', (req, res) => {
  res.json({ username: req.session.username || null });
});

// Route to get user's saved movies for library
router.get('/saved-movies', async (req, res) => {
  if (!req.session.userId) return res.status(401).send({ message: "Unauthorized" });

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    res.json({ movies: user.movieID });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server error" });
  }
});

// Route to search for users by username
router.get('/search-users', async (req, res) => {
  const query = req.query.query;
  const loggedInUserId = req.session.userId; // Get logged-in user's ID from session

  try {
    // Find users with usernames that match the query (case-insensitive), excluding the logged-in user
    const users = await User.find(
      {
        username: new RegExp(query, 'i'),
        _id: { $ne: loggedInUserId } // Exclude the logged-in user
      },
      'username' // Only return the username field
    );

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send({ message: "Server error" });
  }
});

module.exports = router;
