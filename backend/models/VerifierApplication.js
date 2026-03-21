const mongoose = require('mongoose');

const verifierAppSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  password: { type: String },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  summary: { type: String, required: true },
  skillsToModerate: { type: [String], required: true },
  resumeUrl: { type: String, required: true }, // Cloudinary ya Multer ke baad save hua URL
  linkedinUrl: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerifierApplication', verifierAppSchema);