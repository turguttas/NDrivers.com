const express = require("express");
const app = express();
const fs = require("fs");

const cityToZone = require("./data/cityToZone.json");
const zonePricing = require("./data/zonePricing.json");

app.use(express.json());

app.get("/api/fare", (req, res) => {
  const { pickup, dropoff } = req.query;

  if (!pickup || !dropoff) {
    return res.status(400).json({ error: "pickup and dropoff parameters required" });
  }

  const pickupZone = cityToZone[pickup];
  const dropoffZone = cityToZone[dropoff];

  if (!pickupZone || !dropoffZone) {
    return res.status(404).json({ error: "City not found in zone map" });
  }

  const fare = zonePricing[pickupZone][dropoffZone];

  if (fare === undefined) {
    return res.status(404).json({ error: "Pricing not available for this route" });
  }

  res.json({
    pickup,
    dropoff,
    pickupZone,
    dropoffZone,
    fare
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ride pricing API running on port ${PORT}`);
});
