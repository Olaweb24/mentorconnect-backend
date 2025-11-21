const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Message = require('../models/Message');

// Send message
router.post('/', auth, async (req, res) => {
  const { room, text } = req.body;
  try {
    const msg = new Message({ room, sender: req.user._id, text });
    await msg.save();
    const io = req.app.get('io');
    io.to(room).emit('receiveMessage', msg);
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get messages for room
router.get('/:room', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.room }).populate('sender', 'name');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
