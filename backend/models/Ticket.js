const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    user: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Urgent', 'Resolved'] },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);