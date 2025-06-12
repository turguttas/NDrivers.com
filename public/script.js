const select = document.getElementById('terminalSelect');

// Clear any initial option
select.innerHTML = ''; 

// Optionally disable select while loading
select.disabled = true;

// Fetch terminals data
fetch('/api/lax-terminals')
  .then(res => res.json())
  .then(terminals => {
    select.disabled = false; // enable when loaded
    select.innerHTML = '<option disabled selected>Select a terminal</option>';
    terminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.textContent = t.name;
      select.appendChild(option);
    });
  })
  .catch(err => {
    select.disabled = true;
    select.innerHTML = '<option disabled selected>Failed to load terminals</option>';
    console.error('Error loading terminals:', err);
  });
