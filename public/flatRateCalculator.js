document.addEventListener('DOMContentLoaded', async () => {
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  const display = document.getElementById('flatRateDisplay');

  // Load zones.json dynamically
  let zonesData = null;
  try {
    const response = await fetch('zones.json');
    zonesData = await response.json();
  } catch (error) {
    console.error('Error loading zones.json:', error);
    return;
  }

  // --- Helper: find which zone a city/address belongs to ---
  function findZoneForAddress(address) {
    address = address.toLowerCase();
    for (const [zoneName, cityList] of Object.entries(zonesData.zones)) {
      for (const city of cityList) {
        if (address.includes(city.toLowerCase())) {
          return zoneName;
        }
      }
    }
    return null;
  }

  // --- Helper: get rate between two zones ---
  function getFlatRate(pickupZone, dropoffZone) {
    const rates = zonesData.flat_rates;
    if (rates[pickupZone] && rates[pickupZone][dropoffZone]) {
      return rates[pickupZone][dropoffZone];
    }
    return null;
  }

  function showRate() {
    const pickupAddress = pickupInput.value.trim();
    const dropoffAddress = dropoffInput.value.trim();

    if (!pickupAddress || !dropoffAddress) {
      display.textContent = '';
      return;
    }

    const pickupZone = findZoneForAddress(pickupAddress);
    const dropoffZone = findZoneForAddress(dropoffAddress);

    if (!pickupZone || !dropoffZone) {
      display.textContent = 'Zone not recognized.';
      return;
    }

    const rate = getFlatRate(pickupZone, dropoffZone);

    if (rate !== null) {
      display.textContent = `💰 Flat Rate: $${rate} (${pickupZone} → ${dropoffZone})`;
    } else {
      display.textContent = 'No flat rate defined for this route.';
    }
  }

  pickupInput.addEventListener('input', showRate);
  dropoffInput.addEventListener('input', showRate);
});
