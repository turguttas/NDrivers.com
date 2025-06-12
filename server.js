const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve LAX terminals JSON
app.get('/api/lax-terminals', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading airport.json:', err);
      return res.status(500).json({ error: 'Failed to load terminals data' });
    }

    try {
      const terminals = JSON.parse(data);
      // Convert your object keys to an array of terminal objects with name and airlines
      const terminalsArray = Object.entries(terminals).map(([name, airlines]) => ({
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
