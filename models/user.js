const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  movieID: { type: [String], default: [] },
  friends: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  friendRequests: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  friendsUsernames: { type: [String], default: [] }
});

// Pre-save hook to populate friendsUsernames
userSchema.pre('save', async function (next) {
  // Only update friendsUsernames if friends field has changed
  if (this.isModified('friends')) {
    try {
      // Fetch the usernames of all users in the friends array
      const friendsData = await mongoose.model('User').find({ _id: { $in: this.friends } }, 'username');
      this.friendsUsernames = friendsData.map(friend => friend.username);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
