const express = require('express');
const AdminReport = require('../models/AdminReport');
const Rating = require('../models/Rating');
const Swap = require('../models/Swap');
const User = require('../models/User');
const { normalizeSkillName, pendingSkillPattern } = require('../utils/skillHelpers');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: 'Teacher Admin',
      credits: 100,
    });

    await newAdmin.save();
    return res.status(201).json({ message: 'Teacher Admin registered successfully!', user: newAdmin });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/skill-requests', async (_req, res) => {
  try {
    const usersWithPendingSkills = await User.find({
      skillsOffered: { $elemMatch: { $regex: /\[Pending Approval/i } },
    });

    const pendingRequests = usersWithPendingSkills.flatMap((user) =>
      user.skillsOffered
        .filter((skill) => pendingSkillPattern.test(skill))
        .map((skill, index) => ({
          requestId: `${user._id}-${index}-${normalizeSkillName(skill).replace(/\s+/g, '-')}`,
          providerId: user._id,
          providerName: user.name,
          providerEmail: user.email,
          rawSkill: skill,
          skillName: normalizeSkillName(skill),
        })),
    );

    return res.json(pendingRequests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/approve-skill', async (req, res) => {
  try {
    const { providerId, skillName } = req.body;

    if (!providerId || !skillName) {
      return res.status(400).json({ message: 'providerId and skillName are required' });
    }

    const user = await User.findById(providerId);
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const skillIndex = user.skillsOffered.findIndex(
      (skill) => normalizeSkillName(skill) === normalizeSkillName(skillName),
    );

    if (skillIndex === -1) {
      return res.status(404).json({ message: 'Pending skill request not found' });
    }

    user.skillsOffered[skillIndex] = normalizeSkillName(user.skillsOffered[skillIndex]);
    user.markModified('skillsOffered');
    await user.save();

    return res.json({ message: 'Skill approved successfully' });
  } catch (error) {
    console.error('Backend approve error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/reject-skill', async (req, res) => {
  try {
    const { providerId, skillName } = req.body;

    if (!providerId || !skillName) {
      return res.status(400).json({ message: 'providerId and skillName are required' });
    }

    const user = await User.findById(providerId);
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const originalLength = user.skillsOffered.length;
    user.skillsOffered = user.skillsOffered.filter(
      (skill) => normalizeSkillName(skill) !== normalizeSkillName(skillName),
    );

    if (user.skillsOffered.length === originalLength) {
      return res.status(404).json({ message: 'Pending skill request not found' });
    }

    await user.save();
    return res.json({ message: 'Skill request rejected successfully' });
  } catch (error) {
    console.error('Backend reject error:', error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/swaps', async (_req, res) => {
  try {
    const swaps = await Swap.find().sort({ createdAt: -1 }).limit(100);
    return res.json(swaps);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/ratings', async (_req, res) => {
  try {
    const ratings = await Rating.find().sort({ createdAt: -1 }).limit(100);
    return res.json(ratings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/report-rating', async (req, res) => {
  try {
    const { ratingId } = req.body;

    if (!ratingId) {
      return res.status(400).json({ message: 'ratingId is required' });
    }

    const ratingEntry = await Rating.findById(ratingId);
    if (!ratingEntry) {
      return res.status(404).json({ message: 'Rating entry not found' });
    }

    const existingReport = await AdminReport.findOne({ sourceRatingId: ratingEntry._id });
    if (existingReport) {
      return res.json({ message: 'Report already exists', report: existingReport });
    }

    const report = await AdminReport.create({
      targetUserId: ratingEntry.teacherId || null,
      targetUserName: ratingEntry.teacherName,
      targetUserEmail: ratingEntry.teacherEmail,
      reason: ratingEntry.rating < 3 ? 'Low rating escalation' : 'Moderation review requested',
      complaint: ratingEntry.complaint || '',
      sourceRatingId: ratingEntry._id,
    });

    return res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/reports', async (_req, res) => {
  try {
    const reports = await AdminReport.find().sort({ createdAt: -1 }).limit(100);
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
