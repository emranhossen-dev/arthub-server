const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

// GET /api/artworks - Advanced Search, Category/Price Filter, Sorting & Pagination
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 8 } = req.query;

    let query = { status: 'available' };

    // Search by Title or Artist Name
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } },
      ];
    }

    // Category Filter
    if (category) {
      query.category = category;
    }

    // Price Range Filter (Min & Max)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Sorting (Newest, Price Low to High, Price High to Low)
    let sortOptions = { createdAt: -1 };
    if (sort === 'price-low') sortOptions = { price: 1 };
    if (sort === 'price-high') sortOptions = { price: -1 };

    // Pagination Calculation
    const skip = (Number(page) - 1) * Number(limit);
    const totalArtworks = await Artwork.countDocuments(query);
    const artworks = await Artwork.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      artworks,
      totalPages: Math.ceil(totalArtworks / Number(limit)),
      currentPage: Number(page),
      totalArtworks,
    });
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
