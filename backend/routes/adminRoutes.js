const express = require('express');
const AdminReport = require('../models/AdminReport');
const Swap = require('../models/Swap');
const User = require('../models/User');

const router = express.Router();

router.get('/teachers', async (_req, res) => {
  try {
    const admins = await User.find({ role: 'Teacher Admin' });
    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.find({ role: 'User' });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'User' });
    const totalAdmins = await User.countDocuments({
      role: { $in: ['Teacher Admin', 'Main Admin', 'Super Admin'] },
    });
    const totalTeacherAdmins = await User.countDocuments({ role: 'Teacher Admin' });
    const usersWithSkills = await User.find({ 'skillsOffered.0': { $exists: true } });
    const totalSkills = usersWithSkills.reduce((acc, user) => acc + user.skillsOffered.length, 0);
    const totalSwaps = await Swap.countDocuments();
    const totalReports = await AdminReport.countDocuments();

    return res.json({
      totalUsers,
      totalAdmins,
      totalTeacherAdmins,
      totalSkills,
      totalSwaps,
      totalReports,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/skills', async (req, res) => {
  try {
    const { skillName, providerName } = req.body;

    if (!skillName) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const providerEmail = `${(providerName || 'system')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '.') || 'system'}@skillswapp.local`;

    const provider = await User.findOneAndUpdate(
      { email: providerEmail },
      {
        $setOnInsert: {
          name: providerName || 'System',
          password: 'system-generated',
          role: 'Teacher Admin',
          credits: 9999,
        },
        $addToSet: { skillsOffered: skillName },
      },
      { new: true, upsert: true },
    );

    return res.status(201).json({
      message: 'Global skill added successfully',
      skill: {
        skillId: `${provider._id}-${skillName.replace(/\s+/g, '-')}`,
        skillName,
        skill: skillName,
        providerName: provider.name,
        name: provider.name,
        providerEmail: provider.email,
        email: provider.email,
        providerId: provider._id,
        status: 'Verified',
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Admin removed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: 'User removed successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
