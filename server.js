app.get('/api/lax-terminals', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airport.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading airport.json' });
    }

    try {
      const json = JSON.parse(data);
      const terminals = json[0]?.airlines?.terminals || [];
      res.json(terminals);
    } catch (parseError) {
      res.status(500).json({ error: 'Invalid JSON format in airport.json' });
    }
  });
});
