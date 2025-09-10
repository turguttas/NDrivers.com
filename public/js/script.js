document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rideForm');
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');

  // Create Terminal and Airline containers
  const terminalContainer = document.createElement('div');
  const airlineContainer = document.createElement('div');

  terminalContainer.style.display = 'none';
  airlineContainer.style.display = 'none';

  // Terminal dropdown
  const terminalLabel = document.createElement('label');
  terminalLabel.textContent = 'Terminal (if applicable)';
  const terminalSelect = document.createElement('select');
  terminalSelect.id = 'terminalSelect';
  terminalSelect.innerHTML = `<option disabled selected>Loading terminals...</option>`;

  // Make terminal select styled like inputs
  terminalSelect.style.width = '100%';
  terminalSelect.style.padding = '8px';
  terminalSelect.style.boxSizing = 'border-box';

  terminalContainer.appendChild(terminalLabel);
  terminalContainer.appendChild(terminalSelect);

  // Airline dropdown
  const airlineLabel = document.createElement('label');
  airlineLabel.textContent = 'Airline (if applicable)';
  const airlineSelect = document.createElement('select');
  airlineSelect.id = 'airlineSelect';

  // Style like inputs
  airlineSelect.style.width = '100%';
  airlineSelect.style.padding = '8px';
  airlineSelect.style.boxSizing = 'border-box';

  airlineContainer.appendChild(airlineLabel);
  airlineContainer.appendChild(airlineSelect);

  // Insert before submit button
  form.insertBefore(terminalContainer, form.querySelector('button[type="submit"]'));
  form.insertBefore(airlineContainer, form.querySelector('button[type="submit"]'));

  let terminalData = [];

  // Fetch LAX terminals and airlines
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

  // Show terminal dropdown if pickup or dropoff includes 'LAX'
  function checkShowTerminal() {
    const pickupVal = pickupInput.value.toUpperCase();
    const dropoffVal = dropoffInput.value.toUpperCase();
    if (pickupVal.includes('LAX') || dropoffVal.includes('LAX')) {
      terminalContainer.style.display = 'block';
    } else {
      terminalContainer.style.display = 'none';
      airlineContainer.style.display = 'none';
      terminalSelect.value = '';
      airlineSelect.innerHTML = '';
    }
  }

  pickupInput.addEventListener('input', checkShowTerminal);
  dropoffInput.addEventListener('input', checkShowTerminal);

  // Show airlines based on terminal selected
  terminalSelect.addEventListener('change', () => {
    const selectedTerminal = terminalData.find(t => t.name === terminalSelect.value);
    if (selectedTerminal && selectedTerminal.airlines && selectedTerminal.airlines.length > 0) {
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
      airlineSelect.innerHTML = '';
    }
  });

  // ------- Flat Rate Calculation ---------
  const flatRateBox = document.createElement('div');
  flatRateBox.id = 'flatRateBox';
  flatRateBox.style.marginTop = '10px';
  flatRateBox.style.fontWeight = 'bold';
  form.appendChild(flatRateBox);

  async function getZones() {
    const res = await fetch('/api/service-zones');
    return await res.json();
  }

  async function getFlatRates() {
    const res = await fetch('/api/flat-rates');
    return await res.json();
  }

  function extractCity(address) {
    if (!address) return null;
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return address.trim();
  }

  function findZone(city, zonesData) {
    city = city.trim().toLowerCase();
    for (const [zone, cities] of Object.entries(zonesData)) {
      if (cities.some(c => c.toLowerCase() === city)) {
        return zone;
      }
    }
    return null;
  }

  // Extra mapping for airports
  const airportZoneMap = {
    'lax': 'Zone A',
    'los angeles international airport': 'Zone A',
    'los angeles': 'Zone A',
    'sna': 'Zone D',
    'john wayne airport': 'Zone D',
    'santa ana': 'Zone D'
  };

  async function showFlatRate() {
    const pickupAddress = pickupInput.value.trim();
    const dropoffAddress = dropoffInput.value.trim();

    if (!pickupAddress || !dropoffAddress) {
      flatRateBox.textContent = '';
      return;
    }

    const zonesData = await getZones();
    const flatRatesData = await getFlatRates();

    let pickupCity = extractCity(pickupAddress);
    let dropoffCity = extractCity(dropoffAddress);

    let pickupZone = findZone(pickupCity, zonesData);
    let dropoffZone = findZone(dropoffCity, zonesData);

    // If not found in zones, check airport map
    if (!pickupZone) {
      pickupZone = airportZoneMap[pickupCity.toLowerCase()] || null;
    }
    if (!dropoffZone) {
      dropoffZone = airportZoneMap[dropoffCity.toLowerCase()] || null;
    }

    if (!pickupZone || !dropoffZone) {
      flatRateBox.textContent = '';
      return;
    }

    const price = flatRatesData[pickupZone]?.[dropoffZone] || flatRatesData[dropoffZone]?.[pickupZone];
    if (price) {
      flatRateBox.textContent = `Flat Rate: $${price}`;
    } else {
      flatRateBox.textContent = '';
    }
  }

  pickupInput.addEventListener('input', showFlatRate);
  dropoffInput.addEventListener('input', showFlatRate);
});
