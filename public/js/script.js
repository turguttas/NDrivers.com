document.addEventListener('DOMContentLoaded', () => {
    const pickupInput = document.getElementById('pickup');
    const terminalContainer = document.createElement('div');
    const airlineContainer = document.createElement('div');
  
    terminalContainer.style.display = 'none';
    airlineContainer.style.display = 'none';
  
    // Create Terminal Dropdown
    const terminalLabel = document.createElement('label');
    terminalLabel.textContent = 'LAX Terminal (If applicable)';
    const terminalSelect = document.createElement('select');
    terminalSelect.id = 'terminalSelect';
    terminalSelect.innerHTML = `<option disabled selected>Loading terminals...</option>`;
    terminalContainer.appendChild(terminalLabel);
    terminalContainer.appendChild(terminalSelect);
  
    // Create Airline Dropdown
    const airlineLabel = document.createElement('label');
    airlineLabel.textContent = 'Airline (If applicable)';
    const airlineSelect = document.createElement('select');
    airlineSelect.id = 'airlineSelect';
    airlineContainer.appendChild(airlineLabel);
    airlineContainer.appendChild(airlineSelect);
  
    // Append to form
    const form = document.getElementById('rideForm');
    form.insertBefore(terminalContainer, form.querySelector('button'));
    form.insertBefore(airlineContainer, form.querySelector('button'));
  
    let terminalData = [];
  
    // Fetch terminal data
    fetch('/api/lax-terminals')
      .then(res => res.json())
      .then(data => {
        terminalData = data;
        terminalSelect.innerHTML = `<option disabled selected>Select a terminal</option>`;
        data.forEach(terminal => {
          const option = document.createElement('option');
          option.value = terminal.name;
          option.textContent = terminal.name;
          terminalSelect.appendChild(option);
        });
      });
  
    // Show terminal dropdown only when "LAX" is typed
    pickupInput.addEventListener('input', () => {
      if (pickupInput.value.trim().toUpperCase() === 'LAX') {
        terminalContainer.style.display = 'block';
      } else {
        terminalContainer.style.display = 'none';
        airlineContainer.style.display = 'none';
      }
    });
  
    // Show airline list when terminal is selected
    terminalSelect.addEventListener('change', () => {
      const selectedTerminal = terminalData.find(t => t.name === terminalSelect.value);
      if (selectedTerminal && selectedTerminal.airlines.length > 0) {
        airlineSelect.innerHTML = `<option disabled selected>Select an airline</option>`;
        selectedTerminal.airlines.forEach(airline => {
          const option = document.createElement('option');
          option.value = airline;
          option.textContent = airline;
          airlineSelect.appendChild(option);
        });
        airlineContainer.style.display = 'block';
      } else {
        airlineContainer.style.display = 'none';
      }
    });
  });  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  const rateResult = document.createElement('div');
  rateResult.style.marginTop = '10px';
  rateResult.style.fontWeight = 'bold';
  form.appendChild(rateResult);

  let zoneData = {};
  let flatRates = {};

  // Fetch zones and flat rates
  fetch('/api/service-zones')
    .then(res => res.json())
    .then(data => { zoneData = data; });

  fetch('/api/flat-rates')
    .then(res => res.json())
    .then(data => { flatRates = data; });

  // Try to extract city name from address string
  function extractCity(address) {
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim(); // e.g. "Santa Ana"
    }
    return '';
  }

  function getZoneByCity(cityName) {
    cityName = cityName.toLowerCase();
    for (const [zone, cities] of Object.entries(zoneData)) {
      if (cities.some(city => city.toLowerCase() === cityName)) {
        return zone;
      }
    }
    return null;
  }

  function updateRate() {
    const pickupAddress = pickupInput.value.trim();
    const dropoff = dropoffInput.value.trim().toLowerCase();

    if (!pickupAddress || !dropoff.includes('lax')) {
      rateResult.textContent = '';
      return;
    }

    const pickupCity = extractCity(pickupAddress);
    const pickupZone = getZoneByCity(pickupCity);

    if (pickupZone && flatRates[pickupZone]) {
      const price = flatRates[pickupZone];
      rateResult.textContent = `💰 Flat rate to LAX from ${pickupCity} (${pickupZone}): $${price}`;
    } else {
      rateResult.textContent = `❌ Couldn't match city to zone or no rate available`;
    }
  }

  // Trigger on both fields
  pickupInput.addEventListener('input', updateRate);
  dropoffInput.addEventListener('input', updateRate);

  async function getZones() {
  const res = await fetch('/api/service-zones');
  return await res.json();
}

async function getFlatRates() {
  const res = await fetch('/api/flat-rates');
  return await res.json();
}

// Example function to find zone of a city
function findZone(city, zonesData) {
  city = city.trim().toLowerCase();
  for (const [zone, cities] of Object.entries(zonesData)) {
    if (cities.some(c => c.toLowerCase() === city)) {
      return zone;
    }
  }
  return null;
}

// Example usage:
document.getElementById('calculateFareBtn').addEventListener('click', async () => {
  const pickupInput = document.getElementById('pickup').value;
  const dropoffInput = document.getElementById('dropoff').value;

  const zonesData = await getZones();
  const flatRatesData = await getFlatRates();

  // Extract city name from address (simple example, assumes city is second to last word)
  const pickupCity = pickupInput.split(',').slice(-2, -1)[0].trim();
  const dropoffCity = dropoffInput.split(',').slice(-2, -1)[0].trim();

  const pickupZone = findZone(pickupCity, zonesData);

  if (!pickupZone) {
    alert('Pickup city is outside service zones.');
    return;
  }

  // For demo: only support flat rates to LAX or SNA in flatRates.json
  const dropoffAirport = dropoffCity === 'LAX' ? 'LAX' : 
                         dropoffCity === 'Santa Ana' ? 'John Wayne Airport (SNA)' : null;

  if (!dropoffAirport) {
    alert('Dropoff location is not a supported airport.');
    return;
  }

  const price = flatRatesData[dropoffAirport][pickupZone];
  if (!price) {
    alert('No flat rate available for this zone and destination.');
    return;
  }

  alert(`Flat rate from ${pickupCity} (${pickupZone}) to ${dropoffAirport} is $${price}`);
});
async function getZones() {
  const res = await fetch('/api/service-zones');
  return await res.json();
}

async function getFlatRates() {
  const res = await fetch('/api/flat-rates');
  return await res.json();
}

// Find which zone a city belongs to
function findZone(city, zonesData) {
  city = city.trim().toLowerCase();
  for (const [zone, cities] of Object.entries(zonesData)) {
    if (cities.some(c => c.toLowerCase() === city)) {
      return zone;
    }
  }
  return null;
}

// Extract city from address string (simple heuristic)
function extractCity(address) {
  const parts = address.split(',');
  if (parts.length >= 2) {
    // Usually the second-to-last part is the city
    return parts[parts.length - 2].trim();
  }
  return null;
}

document.getElementById('calculateFareBtn').addEventListener('click', async () => {
  const pickupInput = document.getElementById('pickup').value;
  const dropoffInput = document.getElementById('dropoff').value;
  const resultDiv = document.getElementById('fareResult');

  if (!pickupInput || !dropoffInput) {
    alert('Please enter both pickup and dropoff addresses.');
    return;
  }

  const zonesData = await getZones();
  const flatRatesData = await getFlatRates();

  const pickupCity = extractCity(pickupInput);
  const dropoffCity = extractCity(dropoffInput);

  if (!pickupCity || !dropoffCity) {
    alert('Could not determine city from address. Please enter full addresses including city.');
    return;
  }

  const pickupZone = findZone(pickupCity, zonesData);
  if (!pickupZone) {
    resultDiv.textContent = `Sorry, we do not service the pickup city: ${pickupCity}`;
    return;
  }

  // Map dropoff city to supported flat rate airports/names exactly as in flatRates.json
  const airportMap = {
    'lax': 'LAX',
    'los angeles': 'LAX',
    'santa ana': 'John Wayne Airport (SNA)',
    'john wayne airport': 'John Wayne Airport (SNA)',
    'sna': 'John Wayne Airport (SNA)'
  };

  const dropoffKey = dropoffCity.toLowerCase();
  const dropoffAirport = airportMap[dropoffKey];

  if (!dropoffAirport) {
    resultDiv.textContent = `Sorry, flat rates are only available for LAX or John Wayne Airport. You entered: ${dropoffCity}`;
    return;
  }

  const price = flatRatesData[dropoffAirport][pickupZone];
  if (!price) {
    resultDiv.textContent = `No flat rate found for ${pickupZone} to ${dropoffAirport}. Please contact support.`;
    return;
  }

  resultDiv.textContent = `Flat rate fare from ${pickupCity} (${pickupZone}) to ${dropoffAirport} is $${price}`;
});
