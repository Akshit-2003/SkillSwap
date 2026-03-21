const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    learnerEmail: { type: String, required: true },
    learnerName: { type: String, required: true },
    mentorEmail: { type: String, required: true },
    mentorName: { type: String, required: true },
    skill: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: 'Pending' },
    chat: [{
        sender: String,
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);