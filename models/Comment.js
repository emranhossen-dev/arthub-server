const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artwork',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    commentText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
