const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const VerifierApplication = require('../models/VerifierApplication');
const User = require('../models/User');

// Ensure the uploads directory exists dynamically
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for handling file uploads locally
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

router.post('/apply', upload.single('proofFile'), async (req, res) => {
    try {
        const { userId, name, email, password, category, experience, summary, linkedinUrl, skills } = req.body;

        // Duplicate check
        const existingApp = await VerifierApplication.findOne({ email, status: 'Pending' });
        if (existingApp) {
            return res.status(400).json({ message: "You already have a pending application." });
        }

        const applicationData = {
            name,
            email,
            password,
            category,
            experience: Number(experience),
            summary,
            skillsToModerate: skills.split(',').map(s => s.trim()),
            linkedinUrl,
            resumeUrl: req.file ? req.file.path : 'No file uploaded',
        };

        if (userId && userId !== 'undefined') applicationData.userId = userId;

        const newApplication = new VerifierApplication(applicationData);
        await newApplication.save();

        res.status(201).json({ message: "Application submitted successfully!" });
    } catch (error) {
        console.error("Submission error:", error);
        res.status(500).json({ message: "Internal server error during submission." });
    }
});

// Fetch all pending applications for Admin
router.get('/applications', async (req, res) => {
    try {
        const apps = await VerifierApplication.find({ status: 'Pending' }).sort({ appliedAt: -1 });
        res.json(apps);
    } catch (error) {
        console.error("Fetch applications error:", error);
        res.status(500).json({ message: "Server error fetching applications." });
    }
});

// Approve or Reject an application
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const app = await VerifierApplication.findByIdAndUpdate(req.params.id, { status }, { new: true });

        if (!app) return res.status(404).json({ message: "Application not found." });

        // Agar Approve hua hai, toh usko as Teacher Admin platform pe create ya update kardo
        if (status === 'Approved') {
            if (app.userId) {
                await User.findByIdAndUpdate(app.userId, {
                    role: 'Teacher Admin',
                    $addToSet: { skillsOffered: { $each: app.skillsToModerate } }
                });
            } else if (app.email) {
                const existingUser = await User.findOne({ email: app.email });
                if (existingUser) {
                    await User.findByIdAndUpdate(existingUser._id, {
                        role: 'Teacher Admin',
                        $addToSet: { skillsOffered: { $each: app.skillsToModerate } }
                    });
                } else {
                    await User.create({
                        name: app.name,
                        email: app.email,
                        password: app.password || 'default123',
                        role: 'Teacher Admin',
                        skillsOffered: app.skillsToModerate
                    });
                }
            }
        }
        res.json({ message: `Application ${status} successfully.` });
    } catch (error) {
        console.error("Status update error:", error);
        res.status(500).json({ message: "Server error updating status." });
    }
});

module.exports = router;