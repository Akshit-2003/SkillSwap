const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Rating = require('../models/Rating');
const Message = require('../models/Message');
const Announcement = require('../models/Announcement');
const Ticket = require('../models/Ticket');
const Log = require('../models/Log');

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalTeacherAdmins = await User.countDocuments({ role: 'Teacher Admin' });
        const totalSkills = await Session.distinct('skill').then(skills => skills.length);
        const activeSwaps = await Session.countDocuments({ status: 'Active' });
        res.json({ totalUsers, totalTeacherAdmins, totalSkills, activeSwaps });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

router.get('/users', async (req, res) => {
    const users = await User.find().sort({ _id: -1 });
    res.json(users);
});

router.get('/teachers', async (req, res) => {
    const teachers = await User.find({ role: 'Teacher Admin' }).sort({ _id: -1 });
    res.json(teachers);
});

router.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    await Log.create({ level: 'WARN', message: `Admin deleted user ID: ${req.params.id}` });
    res.json({ message: 'User removed successfully' });
});

router.get('/sessions', async (req, res) => {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
});

router.get('/ratings', async (req, res) => {
    const ratings = await Rating.find().sort({ createdAt: -1 });
    res.json(ratings);
});

router.get('/tickets', async (req, res) => {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
});

router.get('/logs', async (req, res) => {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
});

// Add New Announcement & Broadcast to all Users
router.post('/announcements', async (req, res) => {
    try {
        const { title, message } = req.body;
        
        const announcement = await Announcement.create({ title, message });
        
        // Fetch all active users
        const users = await User.find();
        
        // Prepare a message object for every single user
        const messagesToInsert = users.map(user => ({
            senderEmail: 'admin@skillswap.com',
            senderName: 'SkillSwap Admin',
            receiverEmail: user.email,
            message: `📢 **${title}**\n\n${message}`
        }));

        // Bulk insert messages so it's super fast!
        if (messagesToInsert.length > 0) {
            await Message.insertMany(messagesToInsert);
        }
        await Log.create({ level: 'INFO', message: `Broadcast sent: "${title}" to ${users.length} users.` });

        res.status(201).json({ message: 'Announcement sent successfully', announcement });
    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: 'Failed to send broadcast' });
    }
});

router.get('/announcements', async (req, res) => {
    const announcements = await Announcement.find().sort({ date: -1 }).limit(10);
    res.json(announcements);
});

module.exports = router;