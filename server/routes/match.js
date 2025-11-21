const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');

// Simple matching: find mentors with overlapping expertise/interests
router.get('/', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ msg: 'Student profile not found' });

    const mentors = await Mentor.find();
    const matches = mentors.filter(m => 
      m.expertise.some(exp => student.interests.includes(exp))
    );

    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
