const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ✅ Yeh 'role' field hona zaroori hai admin login ke liye
  role: {
    type: String,
    default: 'User',
    enum: ['User', 'Teacher Admin', 'Main Admin', 'Super Admin']
  },

  credits: { type: Number, default: 5 },
  skillsOffered: { type: [String], default: [] },
  skillsWanted: { type: [String], default: [] },
  bio: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
