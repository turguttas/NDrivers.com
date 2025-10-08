document.addEventListener('DOMContentLoaded', () => {
  const pickupInput = document.getElementById('pickup');
  const dropoffInput = document.getElementById('dropoff');
  const display = document.getElementById('flatRateDisplay');

  // ---------------- Example Flat Rates ----------------
  // Replace these with your real zones/rates
  const flatRates = {
    "Irvine-LAX": 90,
    "LAX-Irvine": 90,
    "Irvine-SAN": 150,
    "SAN-Irvine": 150
    // add more city-to-city rates here
  };

  function formatKey(pickup, dropoff) {
    return `${pickup}-${dropoff}`;
  }

  function getFlatRate(pickup, dropoff) {
    const key = formatKey(pickup, dropoff);
    return flatRates[key] || null;
  }

  function showRate() {
    const pickup = pickupInput.value.trim();
    const dropoff = dropoffInput.value.trim();

    if (!pickup || !dropoff) {
      display.textContent = '';
      return;
    }

    const rate = getFlatRate(pickup, dropoff);
    if (rate !== null) {
      display.textContent = `Flat rate: $${rate}`;
    } else {
      display.textContent = ''; // or show "Contact us for a quote"
    }
  }

  // Update flat rate as user types
  pickupInput.addEventListener('input', showRate);
  dropoffInput.addEventListener('input', showRate);
});
