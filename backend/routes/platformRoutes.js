const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/skills', async (_req, res) => {
  try {
    const usersWithSkills = await User.find({ 'skillsOffered.0': { $exists: true } });
    const allSkills = usersWithSkills.flatMap((user) =>
      user.skillsOffered.map((skill) => ({
        skillId: `${user._id}-${skill.replace(/\s+/g, '-')}`,
        skillName: skill,
        skill,
        providerName: user.name,
        name: user.name,
        providerEmail: user.email,
        email: user.email,
        providerId: user._id,
        status: skill.includes('[Pending Approval') ? 'Pending' : 'Verified',
      })),
    );

    return res.json(allSkills);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
