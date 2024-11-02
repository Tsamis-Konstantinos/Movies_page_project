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
  friends_requested: {
    type: [String],
    default: [],
  },
  friends: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);
