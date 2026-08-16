const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// GET /api/admin/analytics - Overview stats & category breakdown
router.get('/analytics', async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments();
    const totalSales = await Artwork.countDocuments({ status: 'sold' });
    const totalUsers = await User.countDocuments();

    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const categories = ['Painting', 'Digital', 'Sculpture', 'Photography', 'Drawing'];
    const categoryCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Artwork.countDocuments({ category: { $regex: new RegExp(cat, 'i') } });
        return { category: cat, count };
      })
    );

    res.json({
      totalArtworks,
      totalSales,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2),
      categoryCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - All registered users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/artworks - All artworks for admin management
router.get('/artworks', async (req, res) => {
  try {
    const artworks = await Artwork.find().sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/transactions - All platform transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User role updated successfully!', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/artworks/:id - Admin force delete artwork
router.delete('/artworks/:id', async (req, res) => {
  try {
    const deletedArtwork = await Artwork.findByIdAndDelete(req.params.id);
    if (!deletedArtwork) return res.status(404).json({ message: 'Artwork not found' });
    res.json({ message: 'Artwork deleted by Admin successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
