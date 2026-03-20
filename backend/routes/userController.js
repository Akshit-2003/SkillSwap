const User = require('../models/User'); // Make sure you have a User model at this path

exports.getProfile = async (req, res) => {
    try {
        const { email } = req.query;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, name, bio } = req.body;
        const user = await User.findOneAndUpdate(
            { email },
            { name, bio },
            { new: true } // Returns the updated document
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user, message: 'Profile updated successfully' });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

exports.requestSwap = async (req, res) => {
    try {
        const { email, skillName } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Deduct 1 credit for a swap request
        if (user.credits == null || user.credits < 1) {
            return res.status(400).json({ message: 'Insufficient credits! You need at least 1 credit to learn a new skill.' });
        }

        user.credits -= 1;
        await user.save();

        res.json({ user, message: `Swap requested for ${skillName}` });
    } catch (error) {
        console.error("Request Swap Error:", error);
        res.status(500).json({ message: 'Server error requesting swap' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { email } = req.query;
        // Returning mock messages as an example. Replace with actual DB logic later.
        res.json([
            { id: 1, name: 'Sarah Jenkins', lastMessage: 'Hey, are we still on for tomorrow?', time: '10:30 AM', unread: true, avatar: 'SJ', color: '#ff6b6b' },
            { id: 2, name: 'Mike Taylor', lastMessage: 'Thanks for the resources!', time: 'Yesterday', unread: false, avatar: 'MT', color: '#f9cb28' },
        ]);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: 'Server error retrieving messages' });
    }
};