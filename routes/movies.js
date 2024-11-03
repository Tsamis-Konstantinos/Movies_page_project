const express = require('express');
const User = require('../models/User');

const router = express.Router();

// Save a movie to the user's favorites
router.post('/save-movie', async (req, res) => {
  if (!req.session.username) return res.status(401).send({ message: "Unauthorized" });

  const { movieId } = req.body;
  try {
    const user = await User.findOne({ username: req.session.username });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (!user.movieID.includes(movieId)) {
      user.movieID.push(movieId);
      await user.save();
      return res.status(200).send({ message: "Movie saved successfully" });
    }
    res.status(200).send({ message: "Movie already in library" });
  } catch (error) {
    console.error("Error saving movie:", error);
    res.status(500).send({ message: "Error saving movie" });
  }
});

// Get user's saved movies for main page
router.get('/get-user-movies', async (req, res) => {
  if (!req.session.username) return res.status(401).send({ message: "Unauthorized" });

  try {
    const user = await User.findOne({ username: req.session.username });
    res.status(200).send({ movies: user.movieID });
  } catch (error) {
    console.error("Error fetching user movies:", error);
    res.status(500).send({ message: "Error fetching movies" });
  }
});

// Remove a movie from the user's saved list
router.post('/remove-movie', async (req, res) => {
  if (!req.session.userId) return res.status(401).send({ message: "Unauthorized" });

  const { movieId } = req.body;
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    user.movieID = user.movieID.filter(id => id !== movieId);
    await user.save();
    res.send({ message: "Movie removed successfully" });
  } catch (error) {
    console.error("Error removing movie:", error);
    res.status(500).send({ message: "Error removing movie" });
  }
});

module.exports = router;
