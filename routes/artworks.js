const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

// GET /api/artworks - Fetch all available artworks from MongoDB
router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: 'available' }).sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/artworks/:id - Fetch single artwork details
router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/artworks - Create new artwork in MongoDB
router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, artistEmail, artistName } = req.body;

    if (!title || !description || !price || !category || !imageUrl || !artistEmail || !artistName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newArtwork = new Artwork({
      title,
      description,
      price: Number(price),
      category,
      imageUrl,
      artistEmail,
      artistName,
      status: 'available',
    });

    await newArtwork.save();
    res.status(201).json({ message: 'Artwork created successfully!', artwork: newArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
