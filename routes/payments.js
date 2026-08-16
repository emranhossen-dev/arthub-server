const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

router.post('/create-artwork-checkout', async (req, res) => {
  try {
    const { artworkId, userEmail } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
    if (artwork.status === 'sold') return res.status(400).json({ message: 'Artwork is already sold out' });

    let user = await User.findOne({ email: userEmail });
    const userTier = user?.subscriptionTier || 'free';
    const userPurchases = user?.purchasesCount || 0;

    if (userTier === 'free' && userPurchases >= 3) {
      return res.status(403).json({
        message: 'Free tier purchase limit (3 items) reached. Upgrade to Pro or Premium!',
      });
    }
    if (userTier === 'pro' && userPurchases >= 9) {
      return res.status(403).json({
        message: 'Pro tier purchase limit (9 items) reached. Upgrade to Premium!',
      });
    }

    const mockSessionId = 'trx_' + Math.random().toString(36).substring(2, 11);

    res.json({
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/artworks/${artworkId}?payment=success&session_id=${mockSessionId}`,
      sessionId: mockSessionId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm-purchase', async (req, res) => {
  try {
    const { artworkId, userEmail, transactionId } = req.body;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) return res.status(404).json({ message: 'Artwork not found' });

    artwork.status = 'sold';
    await artwork.save();

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

router.post('/subscribe', async (req, res) => {
  try {
    const { userEmail, tier } = req.body;
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
