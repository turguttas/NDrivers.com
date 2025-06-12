const select = document.getElementById('terminalSelect');

// Fetch LAX terminals
fetch('/api/lax-terminals')
  .then(res => res.json())
  .then(terminals => {
    select.disabled = false;
    select.style.display = 'block';
    select.innerHTML = '<option disabled selected>Select a terminal</option>';

    terminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.textContent = t.name;
      select.appendChild(option);
    });
  })
  .catch(err => {
    console.error('Error loading terminals:', err);
    select.style.display = 'block';
    select.innerHTML = '<option disabled selected>⚠️ Terminal list failed to load</option>';
    select.disabled = true;
  });
