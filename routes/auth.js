const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ email, password: await bcrypt.hash(password, 10) });
    await user.save();

    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ msg: 'Logged in' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ msg: 'Logged out' });
});

// Get secrets
router.get('/secrets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ secrets: user.secrets });
  } catch {
    res.status(500).send('Server error');
  }
});

// Add secret
router.post('/secrets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.secrets.push(req.body.secret);
    await user.save();
    res.json({ secrets: user.secrets });
  } catch {
    res.status(500).send('Server error');
  }
});

module.exports = router;