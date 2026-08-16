const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['subscription', 'purchase'],
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    artistEmail: {
      type: String,
    },
    artworkTitle: {
      type: String,
    },
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
