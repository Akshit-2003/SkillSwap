const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    teacherName: { type: String, required: true },
    teacherEmail: { type: String, default: '' },
    submittedByName: { type: String, required: true },
    submittedByEmail: { type: String, required: true },
    skillTaught: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    complaint: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Clear', 'Warning', 'Flagged'],
      default: 'Clear'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
