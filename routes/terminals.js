const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/lax-terminals', (req, res) => {
  const filePath = path.join(__dirname, '..', 'data', 'airport.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Internal Server Error' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Error parsing data' });
    }
  });
});

module.exports = router;