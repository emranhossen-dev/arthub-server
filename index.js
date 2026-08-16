const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const artworkRoutes = require('./routes/artworks');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/artworks', artworkRoutes);

// Root API Endpoint
app.get('/', (req, res) => {
  res.send('🎨 ArtHub API Server is Running!');
});

// MongoDB Connection
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
