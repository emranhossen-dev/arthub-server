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

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// MongoDB connection middleware for serverless environment
let isConnected = false;
const connectDB = async (req, res, next) => {
  if (!isConnected) {
    try {
      const uri = process.env.MONGODB_URI;
      if (uri) {
        await mongoose.connect(uri, { dbName: 'ArtHub' });
        isConnected = true;
        console.log('Connected to MongoDB (ArtHub)');
      }
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }
  next();
};

app.use(connectDB);

app.use('/api/artworks', artworkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('🎨 ArtHub API Server is Running!');
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    mongoose.connect(uri, { dbName: 'ArtHub' }).then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    });
  }
}

module.exports = app;
