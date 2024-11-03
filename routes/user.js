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
  const query = req.query.query; // Get the search query from the URL parameters

  try {
    // Find users with usernames that contain the search query (case-insensitive)
    const users = await User.find({ username: new RegExp(query, 'i') }, 'username');
    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// Route to search for users by username, excluding the logged-in user
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

// Route to send a friend request
router.post('/send-friend-request', async (req, res) => {
  const userId = req.session.userId; // ID of the user sending the request
  const { friendUsername } = req.body; // Username of the user receiving the request

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Find the user receiving the friend request
    const friendUser = await User.findOne({ username: friendUsername });
    if (!friendUser) return res.status(404).json({ message: "User not found" });

    // Check if a friend request already exists
    const user = await User.findById(userId);
    if (user.friends_requested.includes(friendUser._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Update only the sender's friends_requested field
    await User.findByIdAndUpdate(userId, { $addToSet: { friends_requested: friendUser._id } });

    res.status(200).json({ message: "Friend request sent!" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get sent friend requests
router.get('/friend-requests/sent', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById(userId).populate('friends_requested', 'username');
    const sentRequests = user.friends_requested.map(friend => friend.username);
    res.json({ sentRequests });
  } catch (error) {
    console.error("Error fetching sent friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get received friend requests
router.get('/friend-requests/received', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const receivedRequests = await User.find({ friends_requested: userId }).select('username');
    res.json({ receivedRequests: receivedRequests.map(user => user.username) });
  } catch (error) {
    console.error("Error fetching received friend requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to accept a friend request
router.post('/accept-friend-request', async (req, res) => {
  const userId = req.session.userId;
  const { friendUsername } = req.body;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const friendUser = await User.findOne({ username: friendUsername });
    if (!friendUser) return res.status(404).json({ message: "User not found" });

    // Update both users' friend lists
    await User.findByIdAndUpdate(userId, { 
      $pull: { friends_requested: friendUser._id }, 
      $push: { friends: friendUser._id } 
    });

    await User.findByIdAndUpdate(friendUser._id, { 
      $push: { friends: userId } 
    });

    res.status(200).json({ message: "Friend request accepted!" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
