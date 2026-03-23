const mongoose = require('mongoose');

const signalPayloadSchema = new mongoose.Schema({
    fromEmail: { type: String, default: '' },
    toEmail: { type: String, default: '' },
    payload: { type: mongoose.Schema.Types.Mixed, default: null },
    updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const iceCandidateSchema = new mongoose.Schema({
    fromEmail: { type: String, default: '' },
    toEmail: { type: String, default: '' },
    candidate: { type: mongoose.Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now }
});

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
    call: {
        offer: { type: signalPayloadSchema, default: null },
        answer: { type: signalPayloadSchema, default: null },
        iceCandidates: { type: [iceCandidateSchema], default: [] },
        startedAt: { type: Date, default: null },
        endedAt: { type: Date, default: null }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
