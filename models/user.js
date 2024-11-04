const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  movieID: { type: [String], default: [] },
  friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // default empty array
  friendRequests: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] } // default empty array
});

module.exports = mongoose.model('User', userSchema);
