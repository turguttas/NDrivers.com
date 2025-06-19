// server.js - unified entry point
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Assuming 'public' for static files
app.use(express.json()); // Add this to parse JSON body for POST requests

// Ensure 'views' directory exists for index.html if you move it there
// If index.html is in the root, change 'views' to '.' or __dirname
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Changed from 'views' to root
});

// === API endpoint: LAX terminals ===
app.get('/api/lax-terminals', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'airport.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading airport.json:', err);
            return res.status(500).json({ error: 'Failed to load terminals data' });
        }
        try {
            const terminalsObj = JSON.parse(data);
            const terminalsArray = Object.entries(terminalsObj.LAX || {}).map(([name, airlines]) => ({ // Only LAX terminals for now
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

// --- NEW API endpoint for Flat Rate Calculation ---
app.post('/api/calculate-fare', async (req, res) => {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
        return res.status(400).json({ error: 'Pickup and dropoff locations are required.' });
    }

    try {
        const zones = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'zones.json'), 'utf8'));
        const flatRates = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'flatrates.json'), 'utf8'));
        const airports = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'airport.json'), 'utf8'));

        // Helper function to extract city from address
        const extractCityFromAddress = (address) => {
            const parts = address.split(',');
            // Prioritize finding a known city name or just return the trimmed address
            for (const zoneCities of Object.values(zones)) {
                for (const city of zoneCities) {
                    if (address.toLowerCase().includes(city.toLowerCase())) {
                        return city; // Found a direct match
                    }
                }
            }
            return parts[0].trim(); // Fallback to the first part
        };

        // Helper function to find zone for a given city
        const findZone = (cityName) => {
            cityName = cityName.toLowerCase().trim();
            for (const [zone, cities] of Object.entries(zones)) {
                if (cities.some(city => city.toLowerCase() === cityName)) {
                    return zone;
                }
            }
            return null;
        };

        // Normalize airport names (e.g., "John Wayne Airport", "SNA", "LAX")
        const normalizeAirportName = (input) => {
            const upperInput = input.toUpperCase();
            if (upperInput.includes("LAX")) return "LAX";
            if (upperInput.includes("JOHN WAYNE") || upperInput.includes("SNA")) return "John Wayne Airport (SNA)";
            if (upperInput.includes("BURBANK") || upperInput.includes("BUR")) return "BUR";
            if (upperInput.includes("SAN DIEGO") || upperInput.includes("SAN")) return "SAN";
            if (upperInput.includes("ONTARIO") || upperInput.includes("ONT")) return "ONT";
            return null;
        };

        const normalizedPickup = normalizeAirportName(pickup) || extractCityFromAddress(pickup);
        const normalizedDropoff = normalizeAirportName(dropoff) || extractCityFromAddress(dropoff);

        let calculatedRate = null;
        let rateDescription = "";

        // --- Airport to City / City to Airport Logic ---
        const pickupIsAirport = normalizeAirportName(pickup);
        const dropoffIsAirport = normalizeAirportName(dropoff);

        if (pickupIsAirport && !dropoffIsAirport) { // Airport to City
            const destinationCity = extractCityFromAddress(dropoff);
            const destinationZone = findZone(destinationCity);
            if (destinationZone && flatRates[pickupIsAirport] && flatRates[pickupIsAirport][destinationZone]) {
                calculatedRate = flatRates[pickupIsAirport][destinationZone];
                rateDescription = `Flat rate from ${pickupIsAirport} to <span class="math-inline">\{destinationCity\} \(</span>{destinationZone})`;
            }
        } else if (!pickupIsAirport && dropoffIsAirport) { // City to Airport
            const originCity = extractCityFromAddress(pickup);
            const originZone = findZone(originCity);
            if (originZone && flatRates[dropoffIsAirport] && flatRates[dropoffIsAirport][originZone]) {
                calculatedRate = flatRates[dropoffIsAirport][originZone];
                rateDescription = `Flat rate from <span class="math-inline">\{originCity\} \(</span>{originZone}) to ${dropoffIsAirport}`;
            }
        }
        // --- NEW: City to City Logic ---
        else if (!pickupIsAirport && !dropoffIsAirport) {
            const originCity = extractCityFromAddress(pickup);
            const destinationCity = extractCityFromAddress(dropoff);
            const originZone = findZone(originCity);
            const destinationZone = findZone(destinationCity);

            if (originZone && destinationZone) {
                // This is where you define your city-to-city rate logic.
                // For now, I'll use a placeholder. You'll need to define how Zone A to Zone B
                // calculates a specific flat rate.
                // Example: Maybe you have a separate city_flatrates.json?
                // Or a more complex calculation based on distance between zone centers?
                // For demonstration, let's just say a basic calculation:
                // This example just returns a dummy rate. You NEED to define this based on your pricing model.
                if (originZone === destinationZone) {
                    calculatedRate = 35; // Example: Same zone, cheaper
                    rateDescription = `Estimated rate within <span class="math-inline">\{originZone\} \(</span>{originCity} to ${destinationCity})`;
                } else {
                    // This is a simplified example. You might need a lookup table like:
                    // { "Zone A-Zone B": 60, "Zone A-Zone D": 75, etc. }
                    // For now, let's just assign a higher rate for different zones.
                    const zonePair = [originZone, destinationZone].sort().join('-'); // Ensures A-B is same as B-A
                    // You would need a `cityFlatRates.json` or similar for this.
                    // For this example, let's just make up a very basic cross-zone logic:
                    const crossZoneRate = {
                        "Zone A-Zone B": 60, "Zone A-Zone D": 70, "Zone A-Zone C": 80, "Zone A-Zone E": 90, "Zone A-Zone F": 100,
                        "Zone B-Zone D": 65, "Zone B-Zone C": 75, "Zone B-Zone E": 85, "Zone B-Zone F": 95,
                        "Zone C-Zone D": 80, "Zone C-Zone E": 90, "Zone C-Zone F": 100,
                        "Zone D-Zone E": 70, "Zone D-Zone F": 80,
                        "Zone E-Zone F": 75,
                    };
                    calculatedRate = crossZoneRate[zonePair];
                    if (calculatedRate) {
                         rateDescription = `Estimated rate from <span class="math-inline">\{originCity\} \(</span>{originZone}) to <span class="math-inline">\{destinationCity\} \(</span>{destinationZone})`;
                    }
                }
            }
        }


        if (calculatedRate !== null) {
            res.json({ rate: `$${calculatedRate}`, description: rateDescription });
        } else {
            res.json({ rate: null, description: "No flat rate found for this route." });
        }

    } catch (error) {
        console.error('Error calculating fare:', error);
        res.status(500).json({ error: 'Failed to calculate fare.' });
    }
});
// --- END NEW API endpoint for Flat Rate Calculation ---

// === Existing API endpoints (keep them if you have other uses) ===
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

app.get('/api/flat-rates', (req, res) => {
    const filePath = path.join(__dirname, 'data', 'flatrates.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading flatrates.json:', err);
            return res.status(500).json({ error: 'Failed to load flat rates data' });
        }
        try {
            const flatRatesData = JSON.parse(data);
            res.json(flatRatesData);
        } catch (parseErr) {
            console.error('Error parsing flatrates.json:', parseErr);
            res.status(500).json({ error: 'Invalid JSON format in flat rates data' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});