const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Fetch all conversations for a specific user
router.get('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const messages = await Message.find({
            $or: [{ senderEmail: email }, { receiverEmail: email }]
        }).sort({ createdAt: -1 });

        // Group messages by the "other" person in the chat
        const conversationsMap = new Map();

        messages.forEach(msg => {
            const isSentByMe = msg.senderEmail === email;
            const partnerEmail = isSentByMe ? msg.receiverEmail : msg.senderEmail;
            const partnerName = isSentByMe ? msg.receiverName || partnerEmail.split('@')[0] : msg.senderName;

            if (!conversationsMap.has(partnerEmail)) {
                conversationsMap.set(partnerEmail, {
                    id: msg._id,
                    email: partnerEmail,
                    name: partnerName,
                    lastMessage: msg.message,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    unread: !msg.isRead && !isSentByMe,
                    avatar: partnerName.charAt(0).toUpperCase(),
                    color: '#646cff',
                    messages: []
                });
            }

            conversationsMap.get(partnerEmail).messages.unshift({
                _id: msg._id,
                senderEmail: msg.senderEmail,
                receiverEmail: msg.receiverEmail,
                message: msg.message,
                createdAt: msg.createdAt,
                isRead: msg.isRead
            });
        });

        await Message.updateMany(
            { receiverEmail: email, isRead: false },
            { $set: { isRead: true } }
        );

        res.json(Array.from(conversationsMap.values()));
    } catch (error) {
        console.error("Fetch messages error:", error);
        res.status(500).json({ message: "Server error fetching messages." });
    }
});

// Send a new message
router.post('/', async (req, res) => {
    try {
        const { senderEmail, senderName, receiverEmail, message } = req.body;
        const newMessage = new Message({ senderEmail, senderName, receiverEmail, message });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Server error sending message." });
    }
});

module.exports = router;
