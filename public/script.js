document.addEventListener('DOMContentLoaded', () => {
    const pickupInput = document.getElementById('pickup');
    const terminalContainer = document.createElement('div');
    const airlineContainer = document.createElement('div');
  
    terminalContainer.style.display = 'none';
    airlineContainer.style.display = 'none';
  
    const terminalLabel = document.createElement('label');
    terminalLabel.textContent = 'LAX Terminal (If applicable)';
    const terminalSelect = document.createElement('select');
    terminalSelect.id = 'terminalSelect';
    terminalSelect.innerHTML = `<option disabled selected>Loading terminals...</option>`;
    terminalContainer.appendChild(terminalLabel);
    terminalContainer.appendChild(terminalSelect);
  
    const airlineLabel = document.createElement('label');
    airlineLabel.textContent = 'Airline (If applicable)';
    const airlineSelect = document.createElement('select');
    airlineSelect.id = 'airlineSelect';
    airlineContainer.appendChild(airlineLabel);
    airlineContainer.appendChild(airlineSelect);
  
    const form = document.getElementById('rideForm');
    form.insertBefore(terminalContainer, form.querySelector('button'));
    form.insertBefore(airlineContainer, form.querySelector('button'));
  
    let terminalData = [];
  
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
      })
      .catch(err => {
        console.error('Failed to load terminals:', err);
      });
  
    pickupInput.addEventListener('input', () => {
      if (pickupInput.value.trim().toUpperCase() === 'LAX') {
        terminalContainer.style.display = 'block';
      } else {
        terminalContainer.style.display = 'none';
        airlineContainer.style.display = 'none';
      }
    });
  
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
  });
  