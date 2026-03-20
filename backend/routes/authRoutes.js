const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password });
    await user.save();
    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.json({ message: 'Login successful', user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/register-super-admin', async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (secretKey !== 'Skillswap_SUPER_SECRET') {
    return res.status(403).json({ message: 'Invalid Secret Key! Authorization failed.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: 'Main Admin',
      credits: 9999,
    });

    await newAdmin.save();
    return res.status(201).json({ message: 'Main Admin registered successfully!', user: newAdmin });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
