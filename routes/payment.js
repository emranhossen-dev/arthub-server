const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// POST /api/payments/create-artwork-checkout - Validate Tier Limits & Create Checkout
router.post('/create-artwork-checkout', async (req, res) => {
  try {
    const { artworkId, userEmail } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    if (artwork.status === 'sold') return res.status(400).json({ message: 'Artwork is already sold out' });

    // Fetch user or create default free user
    let user = await User.findOne({ email: userEmail });
    const userTier = user?.subscriptionTier || 'free';
    const userPurchases = user?.purchasesCount || 0;

    // Check Purchase Limits based on Subscription Tier
    if (userTier === 'free' && userPurchases >= 3) {
      return res.status(403).json({
        message: 'Free tier purchase limit (3 items) reached. Please upgrade to Pro or Premium tier!',
      });
    }
    if (userTier === 'pro' && userPurchases >= 9) {
      return res.status(403).json({
        message: 'Pro tier purchase limit (9 items) reached. Please upgrade to Premium tier!',
      });
    }

    // Generate Transaction Confirmation Session
    const mockSessionId = 'trx_' + Math.random().toString(36).substring(2, 11);

    res.json({
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/artworks/${artworkId}?payment=success&session_id=${mockSessionId}`,
      sessionId: mockSessionId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/confirm-purchase - Confirm Purchase & Mark Artwork Sold
router.post('/confirm-purchase', async (req, res) => {
  try {
    const { artworkId, userEmail, transactionId } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });

    // Mark artwork as SOLD
    artwork.status = 'sold';
    await artwork.save();

    // Create Transaction Record
    const transaction = new Transaction({
      transactionId: transactionId || 'trx_' + Date.now(),
      type: 'purchase',
      userEmail,
      artistEmail: artwork.artistEmail,
      artworkTitle: artwork.title,
      artworkId: artwork._id,
      amount: artwork.price,
    });
    await transaction.save();

    // Increment user purchase count
    await User.findOneAndUpdate(
      { email: userEmail },
      { $inc: { purchasesCount: 1 } },
      { upsert: true }
    );

    res.json({ message: 'Purchase confirmed successfully!', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/payments/subscribe - Upgrade User Subscription Tier
router.post('/subscribe', async (req, res) => {
  try {
    const { userEmail, tier } = req.body; // tier: 'pro' or 'premium'
    const price = tier === 'pro' ? 9.99 : 19.99;

    await User.findOneAndUpdate(
      { email: userEmail },
      { subscriptionTier: tier },
      { upsert: true }
    );

    const transaction = new Transaction({
      transactionId: 'sub_' + Date.now(),
      type: 'subscription',
      userEmail,
      amount: price,
    });
    await transaction.save();

    res.json({ message: `Successfully upgraded to ${tier.toUpperCase()} tier!`, tier });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
