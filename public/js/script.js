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
  terminalLabel.textContent = 'LAX Terminal (If applicable)';
  const terminalSelect = document.createElement('select');
  terminalSelect.id = 'terminalSelect';
  terminalSelect.innerHTML = `<option disabled selected>Loading terminals...</option>`;
  terminalContainer.appendChild(terminalLabel);
  terminalContainer.appendChild(terminalSelect);

  // Airline dropdown
  const airlineLabel = document.createElement('label');
  airlineLabel.textContent = 'Airline (If applicable)';
  const airlineSelect = document.createElement('select');
  airlineSelect.id = 'airlineSelect';
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

  // ------- Fare calculation related logic ---------
  const fareResult = document.getElementById('fareResult');
  const calculateFareBtn = document.getElementById('calculateFareBtn');

  async function getZones() {
    const res = await fetch('/api/service-zones');
    return await res.json();
  }

  async function getFlatRates() {
    const res = await fetch('/api/flat-rates');
    return await res.json();
  }

  function extractCity(address) {
    const parts = address.split(',');
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return null;
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

  calculateFareBtn.addEventListener('click', async () => {
    const pickupAddress = pickupInput.value.trim();
    const dropoffAddress = dropoffInput.value.trim();

    if (!pickupAddress || !dropoffAddress) {
      alert('Please enter both pickup and dropoff addresses.');
      return;
    }

    const zonesData = await getZones();
    const flatRatesData = await getFlatRates();

    const pickupCity = extractCity(pickupAddress);
    const dropoffCity = extractCity(dropoffAddress);

    if (!pickupCity || !dropoffCity) {
      alert('Could not determine city from address. Please include full addresses with city.');
      return;
    }

    const pickupZone = findZone(pickupCity, zonesData);
    if (!pickupZone) {
      fareResult.textContent = `Sorry, we do not service the pickup city: ${pickupCity}`;
      return;
    }

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
      fareResult.textContent = `Sorry, flat rates are only available for LAX or John Wayne Airport. You entered: ${dropoffCity}`;
      return;
    }

    const price = flatRatesData[dropoffAirport]?.[pickupZone];
    if (!price) {
      fareResult.textContent = `No flat rate found for ${pickupZone} to ${dropoffAirport}. Please contact support.`;
      return;
    }

    fareResult.textContent = `Flat rate fare from ${pickupCity} (${pickupZone}) to ${dropoffAirport} is $${price}`;
  });
});
