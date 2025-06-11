// index.js - your Node.js server

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For static assets if any

// Route for homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
