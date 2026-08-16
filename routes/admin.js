const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

router.get('/analytics', async (req, res) => {
  try {
    const totalArtworks = await Artwork.countDocuments();
    const totalSales = await Artwork.countDocuments({ status: 'sold' });
    const totalUsers = await User.countDocuments();
    
    const transactions = await Transaction.find();
    const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    res.json({
      totalArtworks,
      totalSales,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

module.exports = router;
