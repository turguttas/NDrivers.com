// === server.js ===
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// ✅ API route must be BEFORE static middleware
app.get('/api/lax-terminals', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (data.LAX && data.LAX.terminals) {
      res.json(data.LAX.terminals);
    } else {
      res.status(500).json({ error: 'Invalid airport data structure' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error reading airport.json' });
  }
});

// ✅ Serve static files after defining API routes
app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
