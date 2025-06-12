fetch('/api/lax-terminals')
  .then(res => res.json())
  .then(terminals => {
    const select = document.getElementById('terminalSelect');
    select.innerHTML = '<option disabled selected>Select a terminal</option>';
    terminals.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.textContent = `${t.name}`;
      select.appendChild(option);
    });
  })
  .catch(err => {
    console.error('Error loading terminals:', err);
  });
