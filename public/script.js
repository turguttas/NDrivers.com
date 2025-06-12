fetch('/api/lax-terminals')
  .then(res => res.json())
  .then(terminals => {
    const select = document.getElementById('terminalSelect');
    const airlineContainer = document.getElementById('airlineContainer');
    const airlineList = document.getElementById('airlinesList');

    select.innerHTML = '<option disabled selected>Select a terminal</option>';

    terminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.textContent = t.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const selected = e.target.value;
      const terminal = terminals.find(t => t.name === selected);
      if (terminal && terminal.airlines && terminal.airlines.length > 0) {
        airlineList.innerHTML = '';
        terminal.airlines.forEach(airline => {
          const li = document.createElement('li');
          li.textContent = airline;
          airlineList.appendChild(li);
        });
        airlineContainer.style.display = 'block';
      } else {
        airlineContainer.style.display = 'none';
      }
    });
  })
  .catch(err => {
    console.error('Error loading terminals:', err);
  });
