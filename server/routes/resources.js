const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Resource = require('../models/Resource');

// Add resource (admin or mentor)
router.post('/', auth, async (req, res) => {
  const { title, description, link, category } = req.body;
  try {
    const resource = new Resource({ title, description, link, category });
    await resource.save();
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
