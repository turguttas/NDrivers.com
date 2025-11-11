// server.js - fully fixed for Render and Google Sitemap
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

// === Serve static files (CSS, JS, images) ===
app.use(express.static(path.join(__dirname, 'public')));

// === Serve sitemap.xml with correct Content-Type for Google ===
app.get('/sitemap.xml', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'sitemap.xml');
  res.sendFile(filePath, { headers: { 'Content-Type': 'application/xml' } }, (err) => {
    if (err) {
      console.error('Error sending sitemap.xml:', err);
      res.status(err.status || 500).end();
    }
  });
});

// === Serve robots.txt with correct Content-Type for Google ===
app.get('/robots.txt', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'robots.txt');
  res.sendFile(filePath, { headers: { 'Content-Type': 'text/plain' } }, (err) => {
    if (err) {
      console.error('Error sending robots.txt:', err);
      res.status(err.status || 500).end();
    }
  });
});

// === Serve homepage ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(err.status || 500).end();
    }
  });
});

// === API endpoints ===
app.get('/api/airports', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to load airport data' });
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error('Error parsing airport.json:', parseErr);
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
    } catch (parseErr) {
      console.error('Error parsing zones.json:', parseErr);
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
    } catch (parseErr) {
      console.error('Error parsing flatRates.json:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format in flat rates data' });
    }
  });
});

// === Start server ===
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
