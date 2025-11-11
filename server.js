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
app.use(express.static(path.join(__dirname, 'public'))); // CSS, JS, images
app.use('/data', express.static(path.join(__dirname, 'data'))); // JSON files

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// === API endpoint: All airports with terminals and airlines ===
app.get('/api/airports', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading airport.json:', err);
      return res.status(500).json({ error: 'Failed to load airport data' });
    }

    try {
      const airports = JSON.parse(data); // { "LAX": {...}, "SNA": {...}, ... }
      res.json(airports);
    } catch (parseErr) {
      console.error('Error parsing airport.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format in airport data' });
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
const express = require('express');
const path = require('path');
const app = express();

// ✅ Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// ✅ Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Your other routes...
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
