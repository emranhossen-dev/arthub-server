const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const User = require('../models/User');

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
  {
    title: 'Marble Serenity',
    description: 'Contemporary minimalist marble sculpture representing peace and balance.',
    price: 450,
    category: 'Sculpture',
    imageUrl: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'admin@arthub.com',
    artistName: 'Lucas Vance',
    status: 'available',
  },
  {
    title: 'Abstract Harmony',
    description: 'Modern abstract fluid art with golden leaf accents and deep indigo tones.',
    price: 290,
    category: 'Painting',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'artist@arthub.com',
    artistName: 'Aria Montgomery',
    status: 'available',
  },
  {
    title: 'Urban Reflection',
    description: 'Monochrome street photography capturing architecture after midnight rain.',
    price: 210,
    category: 'Photography',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1200',
    artistEmail: 'admin@arthub.com',
    artistName: 'David K.',
    status: 'available',
  },
];

router.get('/wishlist/:userEmail', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.userEmail });
    if (!user || !user.wishlist || user.wishlist.length === 0) {
      return res.json({ wishlist: [], artworks: [] });
    }
    const artworks = await Artwork.find({ _id: { $in: user.wishlist } });
    res.json({ wishlist: user.wishlist, artworks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/wishlist/toggle', async (req, res) => {
  try {
    const { userEmail, artworkId } = req.body;
    if (!userEmail || !artworkId) {
      return res.status(400).json({ message: 'User email and artwork ID required' });
    }
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({ name: 'User', email: userEmail, wishlist: [artworkId] });
      await user.save();
      return res.json({ message: 'Added to wishlist', wishlist: user.wishlist, isWishlisted: true });
    }

    const exists = user.wishlist.includes(artworkId);
    if (exists) {
      user.wishlist = user.wishlist.filter((id) => id !== artworkId);
    } else {
      user.wishlist.push(artworkId);
    }
    await user.save();
    res.json({
      message: exists ? 'Removed from wishlist' : 'Added to wishlist',
      wishlist: user.wishlist,
      isWishlisted: !exists,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const totalInDb = await Artwork.countDocuments();
    if (totalInDb === 0) {
      await Artwork.insertMany(initialSeedArtworks);
    }

    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 8 } = req.query;

    let query = {};

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

    let totalArtworks = await Artwork.countDocuments(query);
    let artworks = await Artwork.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Fallback if query returns no items
    if (artworks.length === 0 && Object.keys(query).length > 0) {
      totalArtworks = await Artwork.countDocuments();
      artworks = await Artwork.find().sort({ createdAt: -1 }).limit(limitNum);
    }

    res.json({
      artworks,
      totalPages: Math.ceil(totalArtworks / limitNum) || 1,
      currentPage: pageNum,
      totalArtworks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, artistEmail, artistName } = req.body;

    if (!title || !description || !price || !category || !imageUrl) {
      return res.status(400).json({ message: 'Missing required artwork fields.' });
    }

    const newArtwork = new Artwork({
      title,
      description,
      price: Number(price),
      category,
      imageUrl,
      artistEmail: artistEmail || 'artist@arthub.com',
      artistName: artistName || 'Featured Artist',
      status: 'available',
    });

    const savedArtwork = await newArtwork.save();
    res.status(201).json({ message: 'Artwork created successfully!', artwork: savedArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedArtwork = await Artwork.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedArtwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork updated successfully!', artwork: updatedArtwork });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
