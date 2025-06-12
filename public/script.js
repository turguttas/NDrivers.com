const terminalSection = document.getElementById('terminalSection');
const terminalSelect = document.getElementById('terminalSelect');
const pickupInput = document.getElementById('pickup');
const dropoffInput = document.getElementById('dropoff');
const datalist = document.getElementById('lax-terminals-list');

let laxTerminals = [];

fetch('/api/lax-terminals')
  .then(res => res.json())
  .then(data => {
    laxTerminals = data;

    // Fill datalist for autocomplete
    laxTerminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      datalist.appendChild(option);
    });
  })
  .catch(err => {
    console.error('Failed to fetch terminals', err);
  });

function updateTerminalSection() {
  const pickup = pickupInput.value.toLowerCase();
  const dropoff = dropoffInput.value.toLowerCase();

  if (pickup.includes('lax') || dropoff.includes('lax')) {
    terminalSection.style.display = 'block';
    terminalSelect.disabled = false;
    terminalSelect.innerHTML = '<option disabled selected>Select a terminal</option>';
    laxTerminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.textContent = t.name;
      terminalSelect.appendChild(option);
    });
  } else {
    terminalSection.style.display = 'none';
  }
}

pickupInput.addEventListener('input', updateTerminalSection);
dropoffInput.addEventListener('input', updateTerminalSection);
