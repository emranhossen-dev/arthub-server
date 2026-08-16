const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const artworkRoutes = require('./routes/artworks');
const commentRoutes = require('./routes/comments');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/artworks', artworkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('🎨 ArtHub API Server is Running!');
});

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB Database!');
    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });
