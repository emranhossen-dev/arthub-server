const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Artwork = require('./models/Artwork');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Root API Endpoint
app.get('/', (req, res) => {
  res.send('🎨 ArtHub API Server is Running!');
});

// Test Endpoint - Create Test Artwork in MongoDB
app.get('/test-artwork', async (req, res) => {
  try {
    const testArt = new Artwork({
      title: "The Café Terrace at Night",
      description: "Post-Impressionist masterpiece by Vincent van Gogh",
      price: 3900,
      category: "Painting",
      imageUrl: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&q=80&w=600",
      artistEmail: "artist@arthub.com",
      artistName: "Vincent van Gogh"
    });
    await testArt.save();
    res.json({ message: "Success! Artwork saved in DB", data: testArt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
