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

// Send a friend request
router.post('/send-friend-request', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  const { recipientId } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    const recipient = await User.findById(recipientId);

    if (!user || !recipient) return res.status(404).send("User not found");

    // Prevent sending duplicate requests
    if (!recipient.friendRequests.includes(user._id) && !recipient.friends.includes(user._id)) {
      recipient.friendRequests.push(user._id);
      await recipient.save();
      res.status(200).send("Friend request sent");
    } else {
      res.status(400).send("Friend request already sent or user already a friend");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending friend request");
  }
});

// Accept a friend request
router.post('/accept-friend-request', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  const { requesterId } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) return res.status(404).send("User not found");

    // Add each other as friends
    user.friends.push(requester._id);
    requester.friends.push(user._id);

    // Remove from friendRequests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    await user.save();
    await requester.save();

    res.status(200).send("Friend request accepted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error accepting friend request");
  }
});

// Reject a friend request
router.post('/reject-friend-request', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  const { requesterId } = req.body;
  try {
    const user = await User.findById(req.session.userId);

    if (!user) return res.status(404).send("User not found");

    // Remove from friendRequests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requesterId
    );

    await user.save();

    res.status(200).send("Friend request rejected");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rejecting friend request");
  }
});

// Get friend requests
router.get('/friend-requests', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  try {
    const user = await User.findById(req.session.userId).populate('friendRequests', 'username');
    res.status(200).json({ friendRequests: user.friendRequests });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching friend requests");
  }
});

// Search for users by username
router.get('/search-users', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  const { query } = req.query;
  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' }, // Case-insensitive search
      _id: { $ne: req.session.userId } 
    }).select('username'); 

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error searching for users");
  }
});

// Get user details including friends' usernames
router.get('/user-details', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  try {
    const user = await User.findById(req.session.userId).select('friendsUsernames');
    if (!user) return res.status(404).send("User not found");

    res.status(200).json({ friendsUsernames: user.friendsUsernames });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user details");
  }
});

// Route to get common movies between logged-in user and a friend
router.get('/friends/:username/common-movies', async (req, res) => {
  if (!req.session.userId) return res.status(401).send("Unauthorized");

  try {
    const currentUser = await User.findById(req.session.userId);
    const friend = await User.findOne({ username: req.params.username });

    if (!currentUser || !friend) return res.status(404).send("User not found");

    // Find common movies between current user and friend
    const commonMovies = currentUser.movieID.filter(movie => friend.movieID.includes(movie));

    res.status(200).json({ commonMovies });
  } catch (err) {
    console.error("Error fetching common movies:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;