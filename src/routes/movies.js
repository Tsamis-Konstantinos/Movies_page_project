const express = require('express');
const { 
  saveMovie, 
  getUserMovies, 
  removeMovie 
} = require('../controllers/moviesController');

const router = express.Router();

// Save a movie to the user's favorites
router.post('/save-movie', saveMovie);

// Get user's saved movies for main page
router.get('/get-user-movies', getUserMovies);

// Remove a movie from the user's saved list
router.post('/remove-movie', removeMovie);

module.exports = router;
