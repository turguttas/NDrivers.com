// server.js - unified entry point
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// === API endpoint: LAX terminals ===
app.get('/api/lax-terminals', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading airport.json:', err);
      return res.status(500).json({ error: 'Failed to load terminals data' });
    }

    try {
      const terminalsObj = JSON.parse(data);
      const terminalsArray = Object.entries(terminalsObj).map(([name, airlines]) => ({
        name,
        airlines,
      }));
      res.json(terminalsArray);
    } catch (parseErr) {
      console.error('Error parsing airport.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format in terminals data' });
    }
  });
});

// === API endpoint: Service zones ===
app.get('/api/service-zones', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'zones.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading zones.json:', err);
      return res.status(500).json({ error: 'Failed to load service zones data' });
    }

    try {
      const zonesData = JSON.parse(data);
      res.json(zonesData);
    } catch (parseErr) {
      console.error('Error parsing zones.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format in service zones data' });
    }
  });
});

// === API endpoint: Flat rates ===
app.get('/api/flat-rates', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'flatRates.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading flatRates.json:', err);
      return res.status(500).json({ error: 'Failed to load flat rates data' });
    }

    try {
      const flatRatesData = JSON.parse(data);
      res.json(flatRatesData);
    } catch (parseErr) {
      console.error('Error parsing flatRates.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format in flat rates data' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
