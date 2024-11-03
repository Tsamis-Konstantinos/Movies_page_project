const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  movieID: {
    type: [String],
    default: [],
  },
  friends_requested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Always use ObjectId references
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Reference to User IDs
});

module.exports = mongoose.model('User', userSchema);
