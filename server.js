// server.js - unified, fixed version
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Middleware ===
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// === Serve sitemap.xml and robots.txt ===
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// === Serve homepage ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === API endpoints ===
app.get('/api/airports', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load airport data' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Invalid JSON format in airport data' });
    }
  });
});

app.get('/api/service-zones', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'zones.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load service zones data' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Invalid JSON format in service zones data' });
    }
  });
});

app.get('/api/flat-rates', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'flatRates.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load flat rates data' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Invalid JSON format in flat rates data' });
    }
  });
});

// === Start server ===
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
