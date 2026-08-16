const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// GET /api/comments/:artworkId - Fetch all comments for a specific artwork
router.get('/:artworkId', async (req, res) => {
  try {
    const comments = await Comment.find({ artworkId: req.params.artworkId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/comments/:artworkId - Add a new comment
router.post('/:artworkId', async (req, res) => {
  try {
    const { userEmail, userName, userAvatar, commentText } = req.body;

    if (!userEmail || !userName || !commentText) {
      return res.status(400).json({ message: 'Comment text and user details are required' });
    }

    const newComment = new Comment({
      artworkId: req.params.artworkId,
      userEmail,
      userName,
      userAvatar,
      commentText,
    });

    await newComment.save();
    res.status(201).json({ message: 'Comment added successfully!', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
