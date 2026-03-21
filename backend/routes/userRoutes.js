const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User'); // User model import karna zaroori hai
const Message = require('../models/Message'); // Unread messages check karne ke liye
const Session = require('../models/Session'); // Real-time sessions database map karne ke liye
const Rating = require('../models/Rating'); // Rating model for session feedbacks

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-avatar-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

router.get('/profile', userController.getProfile);
router.post('/updateProfile', userController.updateProfile);
router.get('/messages', userController.getMessages);

// Request Swap & Schedule Session
router.post('/swapRequests', async (req, res) => {
    try {
        const { email, skillName, date, time, mentorEmail, mentorName } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.credits < 1) return res.status(400).json({ message: 'Insufficient credits! You need at least 1 credit.' });

        user.credits -= 1;
        await user.save();

        // Create Session in Database
        if (mentorEmail && date && time) {
            await Session.create({
                learnerEmail: email,
                learnerName: user.name,
                mentorEmail: mentorEmail,
                mentorName: mentorName || 'Community Mentor',
                skill: skillName,
                date: date,
                time: time
            });
        }
        res.json({ user, message: 'Swap scheduled successfully' });
    } catch (error) {
        console.error('Swap request error:', error);
        res.status(500).json({ message: 'Server error scheduling swap' });
    }
});

// Approve Session Route
router.put('/approve-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findByIdAndUpdate(sessionId, { status: 'Scheduled' }, { new: true });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Auto-send a message/notification to the learner
        await Message.create({
            senderEmail: session.mentorEmail,
            senderName: session.mentorName,
            receiverEmail: session.learnerEmail,
            message: `✅ Great news! I've approved your request for **${session.skill}**. The class is set for **${session.date} at ${session.time}**. Be ready to join the video from your dashboard! 🚀`
        });

        res.json({ message: 'Session approved successfully' });
    } catch (error) {
        console.error('Approve session error:', error);
        res.status(500).json({ message: 'Server error approving session' });
    }
});

// Learner Joins Session Route
router.put('/join-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findByIdAndUpdate(sessionId, { status: 'Active' }, { new: true });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ message: 'Session is now active', session });
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ message: 'Server error joining session' });
    }
});

// End Session (Awards credit to teacher instantly)
router.put('/end-session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.status === 'Active') {
            session.status = 'Completed';
            await session.save();
            // Award 1 credit to the mentor instantly
            const teacher = await User.findOne({ email: session.mentorEmail });
            if (teacher) {
                teacher.credits = (teacher.credits !== undefined ? teacher.credits : 5) + 1;
                await teacher.save();
            }
        }
        res.json({ message: 'Session ended successfully' });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ message: 'Server error ending session' });
    }
});

// Fetch Live Session Chat
router.get('/session-chat/:sessionId', async (req, res) => {
    try {
        const session = await Session.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session.chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching chat' });
    }
});

// Send Message to Live Session Chat
router.post('/session-chat', async (req, res) => {
    try {
        const { sessionId, sender, text } = req.body;
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { $push: { chat: { sender, text } } },
            { new: true }
        );
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json(session.chat);
    } catch (error) {
        console.error('Session chat error:', error);
        res.status(500).json({ message: 'Server error saving chat' });
    }
});

// Session Feedback & Completion
router.post('/session-feedback', async (req, res) => {
    try {
        const { submittedByEmail, teacherName, teacherEmail, skillTaught, rating, complaint } = req.body;
        
        // Save the rating to database
        const newRating = new Rating({ submittedByEmail, teacherName, teacherEmail, skillTaught, rating, complaint });
        await newRating.save();

        // Update session status to Completed
        if (teacherEmail) {
            await Session.findOneAndUpdate(
                { learnerEmail: submittedByEmail, mentorEmail: teacherEmail, skill: skillTaught, status: { $in: ['Scheduled', 'Active'] } },
                { status: 'Completed' }
            );
        }

        // Update Teacher's average rating
        const teacher = await User.findOne({ email: teacherEmail });
        if (teacher) {
            teacher.ratingCount = (teacher.ratingCount || 0) + 1;
            teacher.rating = ((teacher.rating || 0) * (teacher.ratingCount - 1) + rating) / teacher.ratingCount;
            await teacher.save();
        }

        res.json({ message: 'Rating submitted successfully', teacher });
    } catch (error) {
        console.error('Session feedback error:', error);
        res.status(500).json({ message: 'Server error saving feedback' });
    }
});

// Add the PUT /profile route to handle frontend profile updates
router.put('/profile', async (req, res) => {
    try {
        const { email, name, bio, skillsWanted } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { name, bio, skillsWanted },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: updatedUser, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// Add avatar upload route
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        const { email } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const avatarUrl = 'uploads/' + req.file.filename;
        const updatedUser = await User.findOneAndUpdate({ email }, { avatar: avatarUrl }, { new: true });

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ user: updatedUser, message: 'Avatar updated successfully' });
    } catch (error) {
        console.error('Avatar update error:', error);
        res.status(500).json({ message: 'Server error updating avatar' });
    }
});

// Dashboard Real-Time Data Aggregation Route
router.get('/dashboard-data', async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });

        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#bc13fe', '#ff6b6b'];
        const getRandColor = () => colors[Math.floor(Math.random() * colors.length)];

        // 1. Top Mentors (Real users from DB with good ratings)
        const topMentorsDocs = await User.find({ rating: { $gte: 0 }, email: { $ne: email } })
            .sort({ rating: -1, ratingCount: -1 })
            .limit(3);

        const topMentors = topMentorsDocs.map(m => ({
            name: m.name,
            expertIn: m.skillsOffered && m.skillsOffered.length > 0 ? m.skillsOffered[0] : 'Community Mentor',
            initials: m.name.substring(0, 2).toUpperCase(),
            avatarBg: getRandColor()
        }));

        // 2. Recommended Matches (Real users wanting what you offer)
        let matchQuery = { email: { $ne: email } };
        if (user && user.skillsOffered && user.skillsOffered.length > 0) {
            matchQuery.skillsWanted = { $in: user.skillsOffered };
        }
        const matchDocs = await User.find(matchQuery).limit(3);
        const recommendedMatches = matchDocs.map(m => ({
            name: m.name,
            wantsToLearn: m.skillsWanted && m.skillsWanted.length > 0 ? m.skillsWanted[0] : 'Anything',
            initials: m.name.substring(0, 2).toUpperCase(),
            avatarBg: getRandColor()
        }));

        // 3. Learning Journey (Mapped dynamically based on user's wanted skills)
        const learningJourney = (user && user.skillsWanted && user.skillsWanted.length > 0) ? user.skillsWanted.map((skill, index) => ({
            skill: skill,
            progress: 25 + ((index + 1) * 15) % 60, // Generating a dynamic mock progress percentage
            color: colors[index % colors.length]
        })) : [];

        // 4. Certificates (Derived from verified skills offered)
        const certificates = (user && user.skillsOffered && user.skillsOffered.length > 0) ? user.skillsOffered.map(skill => ({
            title: skill,
            issuer: 'SkillSwap Verification',
            date: new Date().toLocaleString('default', { month: 'short', year: 'numeric' })
        })) : [];

        // 5. Scheduled Sessions (Learner & Teaching)
        const learnerSessionsDocs = await Session.find({ learnerEmail: email, status: { $in: ['Pending', 'Scheduled', 'Active'] } }).sort({ date: 1 });
        const mentorSessionsDocs = await Session.find({ mentorEmail: email, status: { $in: ['Pending', 'Scheduled', 'Active'] } }).sort({ date: 1 });

        const upcomingSessions = learnerSessionsDocs.map(s => {
            const d = new Date(s.date);
            return {
                id: s._id,
                day: d.getDate().toString(),
                month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                title: s.skill,
                mentorName: s.mentorName,
                mentorEmail: s.mentorEmail,
                time: s.time,
                status: s.status
            };
        });

        const teachingSchedule = mentorSessionsDocs.map(s => {
            const d = new Date(s.date);
            return {
                id: s._id,
                day: d.getDate().toString(),
                month: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                title: s.skill,
                studentName: s.learnerName,
                studentEmail: s.learnerEmail,
                time: s.time,
                status: s.status
            };
        });

        res.json({
            upcomingSessions,
            topMentors,
            learningJourney,
            certificates,
            dailyChallenges: [
                { title: 'Update your profile bio', difficulty: 'Easy', colorClass: '#10b981', bgClass: 'rgba(16, 185, 129, 0.2)' },
                { title: 'Request a Skill Swap', difficulty: 'Medium', colorClass: '#f59e0b', bgClass: 'rgba(245, 158, 11, 0.2)' },
                { title: 'Earn a 5-star rating', difficulty: 'Hard', colorClass: '#ef4444', bgClass: 'rgba(239, 68, 68, 0.2)' }
            ],
            recentActivities: [
                { icon: '✅', title: 'System Active', desc: 'Real-time dashboard connected successfully.' }
            ],
            recommendedMatches,
            studentReviews: [],
            teachingSchedule
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

// Real-Time Notifications Route
router.get('/notifications', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.json([]);

        const user = await User.findOne({ email });
        if (!user) return res.json([]);

        const unreadMsgs = await Message.countDocuments({ receiverEmail: email, isRead: false });
        const notifications = [];

        if (unreadMsgs > 0) {
            notifications.push({ title: 'New Messages 💬', desc: `You have ${unreadMsgs} unread message(s) waiting.` });
        }

        if (!user.avatar) {
            notifications.push({ title: 'Profile Tip 📸', desc: 'Upload an avatar picture to stand out!' });
        }

        if (!user.skillsWanted || user.skillsWanted.length === 0) {
            notifications.push({ title: 'Action Needed 🎯', desc: 'Add skills you want to learn to get matches.' });
        }

        if (!user.skillsOffered || user.skillsOffered.length === 0) {
            notifications.push({ title: 'Become a Mentor 👨‍🏫', desc: 'Add a skill you can teach others.' });
        }

        // Agar sab kuch badhiya hai
        if (notifications.length === 0) {
            notifications.push({ title: 'All caught up! ✨', desc: 'No new alerts at the moment.' });
        }

        res.json(notifications);
    } catch (error) {
        console.error('Notifications fetch error:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

module.exports = router;