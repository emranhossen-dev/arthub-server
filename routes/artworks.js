const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');

// Initial seed artworks if database collection is empty
const initialSeedArtworks = [
  {
    title: 'Cosmic Odyssey',
    description: 'A breathtaking digital artwork exploring infinite space and neon nebula colors.',
    price: 250,
    category: 'Digital',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'admin@arthub.com',
    artistName: 'Elena Rostova',
    status: 'available',
  },
  {
    title: 'Neon Horizon',
    description: 'Original acrylic on canvas with vibrant sunset gradient layers and textured strokes.',
    price: 180,
    category: 'Painting',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'artist@arthub.com',
    artistName: 'Marco Bellini',
    status: 'available',
  },
  {
    title: 'Ethereal Waves',
    description: 'Fine art long exposure photograph capturing ocean tide reflections at blue hour.',
    price: 320,
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'artist@arthub.com',
    artistName: 'Sophia Chen',
    status: 'available',
  },
];

// GET /api/artworks - Fetch all available artworks with Search, Filter & Pagination
router.get('/', async (req, res) => {
  try {
    // Auto-seed initial demo artworks if MongoDB collection is completely empty
    const totalInDb = await Artwork.countDocuments();
    if (totalInDb === 0) {
      await Artwork.insertMany(initialSeedArtworks);
      console.log('🌱 Auto-seeded initial artworks into ArtHub MongoDB database!');
    }

    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 8 } = req.query;

    let query = { status: { $ne: 'sold' } };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { artistName: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    if (category && category.trim() !== '') {
      query.category = { $regex: new RegExp(category.trim(), 'i') };
    }

    if (minPrice && minPrice.trim() !== '' && !isNaN(Number(minPrice))) {
      query.price = query.price || {};
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice && maxPrice.trim() !== '' && !isNaN(Number(maxPrice))) {
      query.price = query.price || {};
      query.price.$lte = Number(maxPrice);
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-low') sortOptions = { price: 1 };
    if (sort === 'price-high') sortOptions = { price: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 8, 1);
    const skip = (pageNum - 1) * limitNum;

    const totalArtworks = await Artwork.countDocuments(query);
    const artworks = await Artwork.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      artworks,
      totalPages: Math.ceil(totalArtworks / limitNum) || 1,
      currentPage: pageNum,
      totalArtworks,
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
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
    console.log(`[POST /api/artworks] Created artwork: ${title}`);
    res.status(201).json({ message: 'Artwork created successfully!', artwork: newArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/artworks/:id - Update existing artwork details
router.put('/:id', async (req, res) => {
  try {
    const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedArtwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork updated successfully!', artwork: updatedArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/artworks/:id - Delete artwork from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!deletedArtwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
