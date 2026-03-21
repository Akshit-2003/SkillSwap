const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    level: { type: String, default: 'INFO' }, // INFO, WARN, ERROR
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);