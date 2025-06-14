// === API endpoint: terminals by airport code ===
app.get('/api/terminals/:airportCode', (req, res) => {
  const { airportCode } = req.params;
  const filePath = path.join(__dirname, 'data', 'airport.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading airport.json:', err);
      return res.status(500).json({ error: 'Failed to load terminals data' });
    }

    try {
      const allAirports = JSON.parse(data);
      const airportData = allAirports[airportCode.toUpperCase()];

      if (!airportData) {
        return res.status(404).json({ error: `No data found for airport ${airportCode}` });
      }

      const terminalsArray = Object.entries(airportData).map(([name, airlines]) => ({
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
