const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Review = require('../models/Review');
const Student = require('../models/Student');

// Add review
router.post('/', auth, async (req, res) => {
  const { mentorId, rating, comment } = req.body;
  try {
    const student = await Student.findOne({ user: req.user._id });
    const review = new Review({ mentor: mentorId, student: student._id, rating, comment });
    await review.save();
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get reviews for mentor
router.get('/:mentorId', async (req, res) => {
  try {
    const reviews = await Review.find({ mentor: req.params.mentorId }).populate('student', 'user');
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
