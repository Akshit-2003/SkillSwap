const mongoose = require('mongoose');

const adminReportSchema = new mongoose.Schema(
  {
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    targetUserName: { type: String, required: true },
    targetUserEmail: { type: String, default: '' },
    reason: { type: String, required: true },
    complaint: { type: String, default: '' },
    sourceRatingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating', default: null },
    createdByRole: { type: String, default: 'Teacher Admin' },
    status: {
      type: String,
      enum: ['Pending Review', 'Resolved'],
      default: 'Pending Review'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminReport', adminReportSchema);
