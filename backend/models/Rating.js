const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    submittedByEmail: { type: String, required: true },
    teacherName: { type: String, required: true },
    teacherEmail: { type: String, required: true },
    skillTaught: { type: String, required: true },
    rating: { type: Number, required: true },
    complaint: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', ratingSchema);