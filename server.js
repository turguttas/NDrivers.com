const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Existing endpoint: LAX terminals
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

// ✅ New endpoint: Service zones
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
