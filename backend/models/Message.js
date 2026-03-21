const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderEmail: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);