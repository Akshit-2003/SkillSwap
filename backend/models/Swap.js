const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    requestedSkill: { type: String, required: true },
    matchedProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    matchedProviderName: { type: String, default: 'Pending Match' },
    matchedProviderEmail: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Requested', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Requested'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Swap', swapSchema);
