const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/get-username', userController.getUsername);
router.get('/saved-movies', userController.getSavedMovies);
router.post('/send-friend-request', userController.sendFriendRequest);
router.post('/accept-friend-request', userController.acceptFriendRequest);
router.post('/reject-friend-request', userController.rejectFriendRequest);
router.get('/friend-requests', userController.getFriendRequests);
router.get('/search-users', userController.searchUsers);
router.get('/user-details', userController.getUserDetails);
router.get('/friends/:username/common-movies', userController.getCommonMovies);

module.exports = router;
